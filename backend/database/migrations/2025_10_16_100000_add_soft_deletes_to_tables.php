<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add soft deletes to users table
//        Schema::table('users', function (Blueprint $table) {
//            $table->softDeletes();
//        });

        // Add soft deletes to roles table
        Schema::table('roles', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to customers table
        Schema::table('customers', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to vehicles table
        Schema::table('vehicles', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to products table
        Schema::table('products', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to services table
        Schema::table('services', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to categories table
        Schema::table('categories', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to service_requests table
        Schema::table('service_requests', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to invoices table
        Schema::table('invoices', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to payments table
        Schema::table('payments', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to settlements table
        Schema::table('settlements', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to providers table
        Schema::table('providers', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to warehouses table
        Schema::table('warehouses', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to vehicle_brands table
        Schema::table('vehicle_brands', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to vehicle_models table
        Schema::table('vehicle_models', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('settlements', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('providers', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('vehicle_brands', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('vehicle_models', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};

