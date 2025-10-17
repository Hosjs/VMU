<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Product Management Controller
 *
 * Quản lý sản phẩm - Nghiệp vụ kho
 * Permissions: products.*
 */
class ProductController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('products.view');

        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // ✅ 1 query duy nhất với eager loading và aggregate
        $query = Product::query()
            ->with(['category:id,name'])
            ->withSum('stocks', 'quantity');

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Filter
        $query->when($categoryId, fn($q) => $q->where('category_id', $categoryId));

        // Sort
        $query->orderBy($sortBy, $sortDirection);

        // ✅ Trả về trực tiếp Laravel pagination
        return $query->paginate($perPage);
    }

    public function show($id)
    {
        $this->authorizePermission('products.view');

        $product = Product::with(['category', 'stocks'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('products.create');

        $product = Product::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo sản phẩm thành công',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('products.edit');

        $product = Product::findOrFail($id);
        $product->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('products.delete');

        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công'
        ]);
    }

    public function lowStock()
    {
        $this->authorizePermission('products.view');

        $products = Product::whereRaw('stock_quantity <= min_stock_level')->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
}
