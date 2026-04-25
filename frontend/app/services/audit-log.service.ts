import { apiService } from './api.service';
import type { PaginatedResponse, TableQueryParams } from '~/types/common';

export type AuditEvent = 'created' | 'updated' | 'deleted';

export interface AuditLog {
  id: number;
  user_id: number | null;
  auditable_type: string;
  auditable_id: number;
  event: AuditEvent;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
}

export interface AuditLogFilters extends Partial<TableQueryParams> {
  auditable_type?: string;
  user_id?: number;
  event?: AuditEvent;
}

class AuditLogService {
  list(filters: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLog>> {
    return apiService.getPaginated<AuditLog>('/audit-logs', {
      page: filters.page ?? 1,
      per_page: filters.per_page ?? 50,
      ...(filters.auditable_type ? { auditable_type: filters.auditable_type } : {}),
      ...(filters.user_id ? { user_id: filters.user_id } : {}),
      ...(filters.event ? { event: filters.event } : {}),
    });
  }

  forEntity(type: string, id: number): Promise<AuditLog[]> {
    return apiService.get<AuditLog[]>(`/audit-logs/${type}/${id}`);
  }
}

export const auditLogService = new AuditLogService();

export const AUDIT_EVENT_LABELS: Record<AuditEvent, string> = {
  created: 'Tạo mới',
  updated: 'Cập nhật',
  deleted: 'Xoá',
};
