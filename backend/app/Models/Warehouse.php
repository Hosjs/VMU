<?php

namespace App\Models;

use App\QueryScopes\WarehouseScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, WarehouseScopes, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'type',
        'address',
        'ward',
        'district',
        'province',
        'postal_code',
        'contact_person',
        'phone',
        'email',
        'provider_id',
        'is_main_warehouse',
        'can_receive_transfers',
        'can_send_transfers',
        'priority_order',
        'tax_exempt_transfers',
        'tax_registration',
        'is_active',
        'last_inventory_date',
        'manager_id',
        'notes',
        'operating_hours',
    ];

    protected $casts = [
        'is_main_warehouse' => 'boolean',
        'can_receive_transfers' => 'boolean',
        'can_send_transfers' => 'boolean',
        'priority_order' => 'integer',
        'tax_exempt_transfers' => 'boolean',
        'is_active' => 'boolean',
        'last_inventory_date' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function stocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'warehouse_stocks')
            ->withPivot(['quantity', 'available_quantity', 'reserved_quantity']);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function transfersFrom()
    {
        return $this->hasMany(StockTransfer::class, 'from_warehouse_id');
    }

    public function transfersTo()
    {
        return $this->hasMany(StockTransfer::class, 'to_warehouse_id');
    }

    public function directSales()
    {
        return $this->hasMany(DirectSale::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'issuing_warehouse_id');
    }

    // =====================
    // ACCESSORS
    // =====================

    public function getOperatingHoursArrayAttribute()
    {
        if (!$this->operating_hours) return [];

        $items = explode('|', $this->operating_hours);
        $result = [];
        foreach ($items as $item) {
            $parts = explode(':', $item, 2);
            if (count($parts) === 2) {
                $result[$parts[0]] = $parts[1];
            }
        }
        return $result;
    }
}
