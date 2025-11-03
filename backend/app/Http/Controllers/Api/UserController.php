<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $query = User::with(['role']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Filter by department
        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        return $query->paginate($request->per_page ?? 20);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'address' => 'nullable|string',
            'employee_code' => 'nullable|string|max:50|unique:users',
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'role_id' => 'nullable|exists:roles,id',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
            'custom_permissions' => 'nullable|array',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'data' => $user->load('role'),
            'message' => 'User created successfully'
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show($id)
    {
        $user = User::with(['role', 'roleHistory'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => ['string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'address' => 'nullable|string',
            'employee_code' => ['nullable', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'position' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'role_id' => 'nullable|exists:roles,id',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
            'custom_permissions' => 'nullable|array',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'data' => $user->load('role'),
            'message' => 'User updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete yourself'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get user profile
     */
    public function profile($id)
    {
        $user = User::with(['role'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }
}
