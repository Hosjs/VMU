<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'birth_date',
        'gender',
        'address',
        'employee_code',
        'position',
        'department',
        'hire_date',
        'salary',
        'is_active',
        'notes',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'hire_date' => 'date',
            'salary' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    // =====================
    // ROLE RELATIONSHIPS
    // =====================

    public function userRole()
    {
        return $this->hasOne(UserRole::class);
    }

    public function role()
    {
        return $this->hasOneThrough(
            Role::class,
            UserRole::class,
            'user_id',
            'id',
            'id',
            'role_id'
        );
    }

    // =====================
    // CUSTOMER RELATIONSHIPS
    // =====================

    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    // =====================
    // SERVICE REQUEST RELATIONSHIPS
    // =====================

    public function assignedServiceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'assigned_to');
    }

    public function handledServiceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'admin_handler');
    }

    // =====================
    // ORDER RELATIONSHIPS
    // =====================

    public function salesOrders()
    {
        return $this->hasMany(Order::class, 'salesperson_id');
    }

    public function technicianOrders()
    {
        return $this->hasMany(Order::class, 'technician_id');
    }

    public function accountantOrders()
    {
        return $this->hasMany(Order::class, 'accountant_id');
    }

    public function coordinatorOrders()
    {
        return $this->hasMany(Order::class, 'partner_coordinator_id');
    }

    // =====================
    // ORDER ITEM RELATIONSHIPS
    // =====================

    public function assignedOrderItems()
    {
        return $this->hasMany(OrderItem::class, 'assigned_technician');
    }

    public function partnerOrderItems()
    {
        return $this->hasMany(OrderItem::class, 'partner_technician_id');
    }

    // =====================
    // INSPECTION RELATIONSHIPS
    // =====================

    public function conductedInspections()
    {
        return $this->hasMany(VehicleInspection::class, 'inspector_id');
    }

    public function representedInspections()
    {
        return $this->hasMany(VehicleInspection::class, 'customer_representative_id');
    }

    // =====================
    // INVOICE & PAYMENT RELATIONSHIPS
    // =====================

    public function createdInvoices()
    {
        return $this->hasMany(Invoice::class, 'created_by');
    }

    public function approvedInvoices()
    {
        return $this->hasMany(Invoice::class, 'approved_by');
    }

    public function receivedPayments()
    {
        return $this->hasMany(Payment::class, 'received_by');
    }

    public function verifiedPayments()
    {
        return $this->hasMany(Payment::class, 'verified_by');
    }

    // =====================
    // SETTLEMENT RELATIONSHIPS
    // =====================

    public function createdSettlements()
    {
        return $this->hasMany(Settlement::class, 'created_by');
    }

    public function approvedSettlements()
    {
        return $this->hasMany(Settlement::class, 'approved_by');
    }

    public function accountantSettlements()
    {
        return $this->hasMany(Settlement::class, 'accountant_id');
    }

    public function createdSettlementPayments()
    {
        return $this->hasMany(SettlementPayment::class, 'created_by');
    }

    public function approvedSettlementPayments()
    {
        return $this->hasMany(SettlementPayment::class, 'approved_by');
    }

    public function processedSettlementPayments()
    {
        return $this->hasMany(SettlementPayment::class, 'processed_by');
    }

    // =====================
    // PROVIDER RELATIONSHIPS
    // =====================

    public function managedProviders()
    {
        return $this->hasMany(Provider::class, 'managed_by');
    }

    // =====================
    // HANDOVER RELATIONSHIPS
    // =====================

    public function deliveredHandovers()
    {
        return $this->hasMany(PartnerVehicleHandover::class, 'delivered_by');
    }

    public function receivedHandovers()
    {
        return $this->hasMany(PartnerVehicleHandover::class, 'received_by_technician');
    }

    // =====================
    // WAREHOUSE RELATIONSHIPS
    // =====================

    public function managedWarehouses()
    {
        return $this->hasMany(Warehouse::class, 'manager_id');
    }

    public function createdTransfers()
    {
        return $this->hasMany(StockTransfer::class, 'created_by');
    }

    public function approvedTransfers()
    {
        return $this->hasMany(StockTransfer::class, 'approved_by');
    }

    public function sentTransfers()
    {
        return $this->hasMany(StockTransfer::class, 'sent_by');
    }

    public function receivedTransfers()
    {
        return $this->hasMany(StockTransfer::class, 'received_by');
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'created_by');
    }

    // =====================
    // DIRECT SALES RELATIONSHIPS
    // =====================

    public function salesPersonDirectSales()
    {
        return $this->hasMany(DirectSale::class, 'salesperson_id');
    }

    public function createdDirectSales()
    {
        return $this->hasMany(DirectSale::class, 'created_by');
    }

    public function approvedDirectSales()
    {
        return $this->hasMany(DirectSale::class, 'approved_by');
    }

    // =====================
    // NOTIFICATION RELATIONSHIPS
    // =====================

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function sentNotifications()
    {
        return $this->hasMany(Notification::class, 'sender_id');
    }

    // =====================
    // HELPER METHODS
    // =====================

    public function hasRole($roleName)
    {
        return $this->role && $this->role->name === $roleName;
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isManager()
    {
        return $this->hasRole('manager');
    }

    public function isAccountant()
    {
        return $this->hasRole('accountant');
    }

    public function isMechanic()
    {
        return $this->hasRole('mechanic');
    }

    public function isEmployee()
    {
        return $this->hasRole('employee');
    }
}
