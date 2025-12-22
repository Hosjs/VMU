<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentRate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PaymentRateController extends Controller
{
    /**
     * Get list of payment rates
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = PaymentRate::with(['creator', 'updater']);

            // Filters
            if ($request->has('subject_type')) {
                $query->bySubjectType($request->subject_type);
            }

            if ($request->has('education_level')) {
                $query->byEducationLevel($request->education_level);
            }

            if ($request->has('semester_code')) {
                $query->bySemester($request->semester_code);
            }

            if ($request->has('is_active')) {
                if ($request->is_active === 'true' || $request->is_active === '1') {
                    $query->active();
                }
            }

            // Search
            if ($request->has('search')) {
                $query->search($request->search);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $rates = $query->paginate($perPage);

            return response()->json($rates);
        } catch (\Exception $e) {
            \Log::error('Error in PaymentRateController@index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment rates'
            ], 500);
        }
    }

    /**
     * Get a single payment rate
     */
    public function show(int $id): JsonResponse
    {
        try {
            $rate = PaymentRate::with(['creator', 'updater'])->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $rate
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment rate not found'
            ], 404);
        }
    }

    /**
     * Create a new payment rate
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'subject_type' => 'nullable|string|max:100',
            'education_level' => 'nullable|string|max:50',
            'theory_rate' => 'required|numeric|min:0',
            'practical_rate' => 'nullable|numeric|min:0',
            'insurance_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['created_by'] = $request->user()->id;

            $rate = PaymentRate::create($data);
            $rate->load(['creator']);

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn giá thành công',
                'data' => $rate
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating payment rate: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment rate'
            ], 500);
        }
    }

    /**
     * Update a payment rate
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $rate = PaymentRate::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'subject_type' => 'nullable|string|max:100',
                'education_level' => 'nullable|string|max:50',
                'theory_rate' => 'sometimes|required|numeric|min:0',
                'practical_rate' => 'nullable|numeric|min:0',
                'insurance_rate' => 'nullable|numeric|min:0|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['updated_by'] = $request->user()->id;

            $rate->update($data);
            $rate->load(['creator', 'updater']);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật đơn giá thành công',
                'data' => $rate
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating payment rate: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment rate'
            ], 500);
        }
    }

    /**
     * Delete a payment rate
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $rate = PaymentRate::findOrFail($id);
            $rate->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa đơn giá thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment rate'
            ], 500);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleActive(int $id): JsonResponse
    {
        try {
            $rate = PaymentRate::findOrFail($id);
            $rate->is_active = !$rate->is_active;
            $rate->save();

            return response()->json([
                'success' => true,
                'message' => $rate->is_active ? 'Đã kích hoạt' : 'Đã vô hiệu hóa',
                'data' => $rate
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle status'
            ], 500);
        }
    }

    /**
     * Get active rates for dropdown
     */
    public function getActiveRates(): JsonResponse
    {
        try {
            $rates = PaymentRate::active()
                ->orderBy('name')
                ->get(['id', 'name', 'subject_type', 'education_level', 'theory_rate', 'practical_rate', 'insurance_rate']);

            return response()->json([
                'success' => true,
                'data' => $rates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active rates'
            ], 500);
        }
    }
}

