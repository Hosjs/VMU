<?php

namespace App\Http\Controllers\Api\Financial;

use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Traits\HasPermissions;
use Illuminate\Http\Request;

/**
 * Settlement Management Controller
 *
 * Quản lý đối soát - Nghiệp vụ tài chính
 * Permissions: settlements.*
 */
class SettlementController extends Controller
{
    use HasPermissions;

    public function index(Request $request)
    {
        $this->authorizePermission('settlements.view');

        $perPage = $request->get('per_page', 20);
        $status = $request->get('status');

        $query = Settlement::with(['provider', 'createdBy', 'approvedBy']);

        if ($status) {
            $query->where('status', $status);
        }

        $settlements = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $settlements
        ]);
    }

    public function show($id)
    {
        $this->authorizePermission('settlements.view');

        $settlement = Settlement::with(['provider', 'payments'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $settlement
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('settlements.create');

        $settlement = Settlement::create(array_merge(
            $request->all(),
            ['created_by' => auth()->id()]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Tạo đối soát thành công',
            'data' => $settlement
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizePermission('settlements.edit');

        $settlement = Settlement::findOrFail($id);
        $settlement->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật đối soát thành công',
            'data' => $settlement
        ]);
    }

    public function destroy($id)
    {
        $this->authorizePermission('settlements.delete');

        $settlement = Settlement::findOrFail($id);
        $settlement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa đối soát thành công'
        ]);
    }

    public function approve(Request $request, $id)
    {
        $this->authorizePermission('settlements.approve');

        $settlement = Settlement::findOrFail($id);
        $settlement->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Phê duyệt đối soát thành công',
            'data' => $settlement
        ]);
    }
}
