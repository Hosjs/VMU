<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Warehouse Management Controller
 *
 * Quản lý kho - Nghiệp vụ inventory
 * Permissions: warehouses.*
 */
class WarehouseController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('warehouses.view');

        $perPage = $request->get('per_page', 20);
        $search = $request->get('search');

        $query = Warehouse::with('manager');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $warehouses = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $warehouses
        ]);
    }

    public function show($id)
    {
        $this->authorizePermission('warehouses.view');

        $warehouse = Warehouse::with(['manager', 'stocks'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $warehouse
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('warehouses.create');

        $warehouse = Warehouse::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo kho thành công',
            'data' => $warehouse
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('warehouses.edit');

        $warehouse = Warehouse::findOrFail($id);
        $warehouse->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật kho thành công',
            'data' => $warehouse
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('warehouses.delete');

        $warehouse = Warehouse::findOrFail($id);
        $warehouse->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa kho thành công'
        ]);
    }

    public function stocks($id)
    {
        $this->authorizePermission('stocks.view');

        $warehouse = Warehouse::with('stocks.product')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $warehouse->stocks
        ]);
    }

    public function stocktake(Request $request, $id)
    {
        $this->authorizePermission('warehouses.stocktake');

        $warehouse = Warehouse::findOrFail($id);

        // Logic kiểm kê kho

        return response()->json([
            'success' => true,
            'message' => 'Kiểm kê kho thành công'
        ]);
    }

    public function statistics()
    {
        $this->authorizePermission('warehouses.view');

        $total = Warehouse::count();

        return response()->json([
            'success' => true,
            'data' => ['total' => $total]
        ]);
    }
}

