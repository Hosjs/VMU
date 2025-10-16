<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'gender' => $this->gender,
            'address' => $this->address,

            // Employee Info
            'employee_code' => $this->employee_code,
            'position' => $this->position,
            'department' => $this->department,
            'hire_date' => $this->hire_date?->format('Y-m-d'),
            'years_of_service' => $this->hire_date ?
                $this->hire_date->diffInYears(now()) : null,

            // Salary (Admin Only)
            'salary' => $this->when(
                $request->user()?->hasRole('admin'),
                (float) $this->salary
            ),

            // Role & Permissions
            'role_id' => $this->role_id, // ✅ Thêm role_id
            'role' => new RoleResource($this->whenLoaded('role')),
            'role_name' => $this->role?->name,
            'role_display_name' => $this->role?->display_name,

            // Custom Permissions (Admin Only)
            'custom_permissions' => $this->when(
                $request->user()?->hasRole('admin'),
                $this->custom_permissions
            ),

            // Status
            'is_active' => (bool) $this->is_active,
            'notes' => $this->notes,
            'email_verified_at' => $this->email_verified_at?->format('Y-m-d H:i:s'),

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
