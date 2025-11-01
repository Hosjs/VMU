export interface Role {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    permissions?: PermissionMap;
    is_active: boolean;
    is_system: boolean;
    users_count?: number;
    users?: RoleUser[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface RoleUser {
    id: number;
    name: string;
    email: string;
    role_id: number;
    is_active: boolean;
}

export interface PermissionModule {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    icon?: string;
    actions: PermissionAction[];
}

export interface PermissionAction {
    id: number;
    action: string;
    display_name: string;
    description?: string;
}

export type PermissionMap = Record<string, string[]>;

export interface RoleFormData {
    name: string;
    display_name: string;
    description?: string;
    permissions?: PermissionMap;
    is_active: boolean;
}

export interface RoleListParams {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean;
}

// Response after apiService.get() unwraps { success: true, data: {...} }
// So we get the pagination object directly
export interface RoleListResponse {
    data: Role[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// RoleDetailResponse is also unwrapped by apiService
export interface RoleDetailResponse {
    data: Role;
}

// PermissionsResponse is also unwrapped by apiService
export interface PermissionsResponse {
    data: PermissionModule[];
}
