<?php

namespace App\Http\Controllers\Api\Services;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Category Management Controller
 *
 * Quản lý danh mục sản phẩm/dịch vụ
 * Permissions: categories.*
 */
class CategoryController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('categories.view');

        $perPage = $request->get('per_page', 100);
        $search = $request->get('search');
        $type = $request->get('type');
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDirection = $request->input('sort_direction', 'asc');

        // ✅ 1 query duy nhất với aggregate
        $query = Category::query()
            ->withCount(['products', 'services']);

        // Search
        $query->when($search, fn($q) => $q->where('name', 'like', "%{$search}%")
            ->orWhere('code', 'like', "%{$search}%"));

        // Filter
        $query->when($type, fn($q) => $q->where('type', $type));

        // Sort
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Trả về trực tiếp Laravel pagination
        return $query->paginate($perPage);
    }

    public function show($id)
    {
        $this->authorizePermission('categories.view');

        $category = Category::with('products')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('categories.create');

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'code' => 'required|unique:categories,code'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $category = Category::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo danh mục thành công',
            'data' => $category
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('categories.edit');

        $category = Category::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'unique:categories,code,' . $id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('categories.delete');

        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa danh mục thành công'
        ]);
    }

    public function updateOrder(Request $request)
    {
        $this->authorizePermission('categories.edit');

        $orders = $request->input('orders', []);

        foreach ($orders as $order) {
            Category::where('id', $order['id'])->update(['sort_order' => $order['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thứ tự thành công'
        ]);
    }
}
