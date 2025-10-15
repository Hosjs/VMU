<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Danh sách products
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $categoryId = $request->get('category_id');
        $isActive = $request->get('is_active');
        $isStockable = $request->get('is_stockable');
        $trackStock = $request->get('track_stock');

        $query = Product::with(['category', 'primaryWarehouse']);

        // Search
        if ($search) {
            $query->search($search);
        }

        // Filter by category
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        // Filter active
        if ($isActive !== null) {
            $query->where('is_active', $isActive == 1);
        }

        // Filter stockable
        if ($isStockable !== null) {
            $query->where('is_stockable', $isStockable == 1);
        }

        // Filter track stock
        if ($trackStock !== null) {
            $query->where('track_stock', $trackStock == 1);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $products = $query->paginate($perPage);

        // Return trực tiếp pagination response (không wrap)
        return response()->json($products);
    }

    /**
     * Tạo product mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:products,code',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'primary_warehouse_id' => 'nullable|exists:warehouses,id',
            'quote_price' => 'required|numeric|min:0',
            'settlement_price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'main_image' => 'nullable|string',
            'gallery_images' => 'nullable|string',
            'specifications' => 'nullable|string',
            'is_stockable' => 'nullable|boolean',
            'track_by_serial' => 'nullable|boolean',
            'track_by_batch' => 'nullable|boolean',
            'shelf_life_days' => 'nullable|integer|min:0',
            'auto_transfer_enabled' => 'nullable|boolean',
            'transfer_threshold' => 'nullable|integer|min:0',
            'track_stock' => 'nullable|boolean',
            'has_warranty' => 'nullable|boolean',
            'warranty_months' => 'nullable|integer|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'supplier_code' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $product = Product::create($request->all());
            $product->load(['category', 'primaryWarehouse']);

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết product
     */
    public function show($id)
    {
        $product = Product::with([
            'category',
            'primaryWarehouse',
            'warehouseStocks.warehouse'
        ])->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Cập nhật product
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:products,code,' . $id,
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $id,
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'primary_warehouse_id' => 'nullable|exists:warehouses,id',
            'quote_price' => 'required|numeric|min:0',
            'settlement_price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'main_image' => 'nullable|string',
            'gallery_images' => 'nullable|string',
            'specifications' => 'nullable|string',
            'is_stockable' => 'nullable|boolean',
            'track_by_serial' => 'nullable|boolean',
            'track_by_batch' => 'nullable|boolean',
            'shelf_life_days' => 'nullable|integer|min:0',
            'auto_transfer_enabled' => 'nullable|boolean',
            'transfer_threshold' => 'nullable|integer|min:0',
            'track_stock' => 'nullable|boolean',
            'has_warranty' => 'nullable|boolean',
            'warranty_months' => 'nullable|integer|min:0',
            'supplier_name' => 'nullable|string|max:255',
            'supplier_code' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $product->update($request->all());
            $product->load(['category', 'primaryWarehouse']);

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa product
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        try {
            // Deactivate instead of delete
            $product->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Product deactivated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê products
     */
    public function statistics()
    {
        $stats = [
            'total' => Product::count(),
            'active' => Product::where('is_active', true)->count(),
            'inactive' => Product::where('is_active', false)->count(),
            'stockable' => Product::where('is_stockable', true)->count(),
            'track_stock' => Product::where('track_stock', true)->count(),
            'low_stock' => Product::whereHas('warehouseStocks', function($q) {
                $q->whereRaw('available_quantity <= min_stock');
            })->count(),
            'out_of_stock' => Product::whereHas('warehouseStocks', function($q) {
                $q->where('available_quantity', '<=', 0);
            })->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Lấy sản phẩm sắp hết hàng
     */
    public function lowStock(Request $request)
    {
        $perPage = $request->get('per_page', 15);

        $products = Product::with(['category', 'warehouseStocks.warehouse'])
            ->whereHas('warehouseStocks', function($q) {
                $q->whereRaw('available_quantity <= reorder_point');
            })
            ->paginate($perPage);

        // Return trực tiếp pagination response (không wrap)
        return response()->json($products);
    }
}
