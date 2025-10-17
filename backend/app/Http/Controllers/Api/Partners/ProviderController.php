<?php

namespace App\Http\Controllers\Api\Partners;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Provider Management Controller
 *
 * Quản lý nhà cung cấp/đối tác
 * Permissions: providers.*
 */
class ProviderController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('providers.view');

        $perPage = $request->get('per_page', 20);
        $search = $request->get('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // ✅ 1 query duy nhất với aggregate functions
        $query = Provider::query()
            ->withCount(['orders', 'settlements']);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Trả về trực tiếp Laravel pagination
        return $query->paginate($perPage);
    }

    public function show($id)
    {
        $this->authorizePermission('providers.view');

        $provider = Provider::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $provider
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('providers.create');

        $provider = Provider::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo nhà cung cấp thành công',
            'data' => $provider
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('providers.edit');

        $provider = Provider::findOrFail($id);
        $provider->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật nhà cung cấp thành công',
            'data' => $provider
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('providers.delete');

        $provider = Provider::findOrFail($id);
        $provider->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa nhà cung cấp thành công'
        ]);
    }

    public function updateRating(Request $request, $id)
    {
        $this->authorizePermission('providers.edit');

        $provider = Provider::findOrFail($id);
        $provider->update(['rating' => $request->rating]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật đánh giá thành công',
            'data' => $provider
        ]);
    }

    public function statistics()
    {
        $this->authorizePermission('providers.view');

        $total = Provider::count();

        return response()->json([
            'success' => true,
            'data' => ['total' => $total]
        ]);
    }
}
