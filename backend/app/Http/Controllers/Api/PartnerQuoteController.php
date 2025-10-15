<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerQuoteResource;
use App\Models\PartnerQuote;
use Illuminate\Http\Request;

class PartnerQuoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PartnerQuote::with(['provider', 'serviceRequest', 'items']);

        // Filter by provider
        if ($request->has('provider_id')) {
            $query->byProvider($request->provider_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Quick filters
        if ($request->boolean('pending_only')) {
            $query->pending();
        }

        if ($request->boolean('quoted_only')) {
            $query->quoted();
        }

        if ($request->boolean('accepted_only')) {
            $query->accepted();
        }

        if ($request->boolean('expiring_soon')) {
            $query->expiringSoon($request->input('days', 7));
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $quotes = $query->paginate($request->input('per_page', 15));

        return PartnerQuoteResource::collection($quotes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_request_id' => 'required|exists:service_requests,id',
            'provider_id' => 'required|exists:providers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'work_description' => 'required|string',
            'special_requirements' => 'nullable|string',
            'estimated_duration_hours' => 'nullable|integer|min:0',
            'priority' => 'nullable|in:low,normal,high,urgent',
        ]);

        // Generate quote number
        $validated['quote_number'] = 'PQ-' . date('Ymd') . '-' . str_pad(PartnerQuote::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

        // Get provider info
        $provider = \App\Models\Provider::find($validated['provider_id']);
        $validated['provider_name'] = $provider->name;
        $validated['provider_code'] = $provider->code;
        $validated['provider_contact_person'] = $provider->contact_person;
        $validated['provider_phone'] = $provider->phone;
        $validated['provider_email'] = $provider->email;

        // Set dates
        $validated['request_date'] = now();
        $validated['requested_by'] = auth()->id();
        $validated['status'] = 'pending';

        $quote = PartnerQuote::create($validated);

        return new PartnerQuoteResource($quote->load(['provider', 'serviceRequest']));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $quote = PartnerQuote::with(['provider', 'serviceRequest', 'vehicle', 'items.service', 'items.product', 'requestedBy'])
            ->findOrFail($id);

        return new PartnerQuoteResource($quote);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $quote = PartnerQuote::findOrFail($id);

        $validated = $request->validate([
            'work_description' => 'sometimes|string',
            'special_requirements' => 'nullable|string',
            'estimated_duration_hours' => 'nullable|integer|min:0',
            'quote_date' => 'nullable|date',
            'quote_valid_until' => 'nullable|date',
            'customer_quote_date' => 'nullable|date',
            'status' => 'sometimes|in:pending,quoted,customer_quoted,accepted,rejected,expired,cancelled',
            'priority' => 'sometimes|in:low,normal,high,urgent',
        ]);

        $quote->update($validated);

        return new PartnerQuoteResource($quote->load(['provider', 'serviceRequest', 'items']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $quote = PartnerQuote::findOrFail($id);

        // Only allow deletion if status is pending or cancelled
        if (!in_array($quote->status, ['pending', 'cancelled'])) {
            return response()->json(['message' => 'Cannot delete quote with status: ' . $quote->status], 422);
        }

        $quote->delete();

        return response()->json(['message' => 'Partner quote deleted successfully'], 200);
    }

    /**
     * Accept partner quote
     */
    public function accept(string $id)
    {
        $quote = PartnerQuote::findOrFail($id);
        $quote->update(['status' => 'accepted']);

        return new PartnerQuoteResource($quote->load(['provider', 'items']));
    }

    /**
     * Reject partner quote
     */
    public function reject(Request $request, string $id)
    {
        $quote = PartnerQuote::findOrFail($id);

        $validated = $request->validate([
            'rejection_reason' => 'nullable|string',
        ]);

        $quote->update([
            'status' => 'rejected',
            'notes' => $validated['rejection_reason'] ?? null,
        ]);

        return new PartnerQuoteResource($quote);
    }

    /**
     * Get quotes by provider
     */
    public function byProvider(string $providerId)
    {
        $quotes = PartnerQuote::with(['serviceRequest', 'items'])
            ->byProvider($providerId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return PartnerQuoteResource::collection($quotes);
    }

    /**
     * Get expiring quotes
     */
    public function expiring(Request $request)
    {
        $days = $request->input('days', 7);

        $quotes = PartnerQuote::with(['provider', 'serviceRequest'])
            ->expiringSoon($days)
            ->orderBy('quote_valid_until')
            ->get();

        return PartnerQuoteResource::collection($quotes);
    }
}
