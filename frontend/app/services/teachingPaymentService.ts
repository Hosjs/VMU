import { apiService } from '~/services/api.service';
import type {
  TeachingPayment,
  GeneratePaymentRequest,
  BulkSavePaymentRequest,
  UpdatePaymentStatusRequest,
  BulkUpdatePaymentStatusRequest,
  PaymentSummary,
} from '~/types/teaching-payment';

/**
 * Get teaching payments by filters
 */
export async function getTeachingPayments(params: {
  major_id?: number;
  khoa_hoc_id?: number;
  semester_code?: string;
  trang_thai_thanh_toan?: 'chua_thanh_toan' | 'da_thanh_toan';
}): Promise<TeachingPayment[]> {
  return await apiService.get<TeachingPayment[]>('/teaching-payments', params);
}

/**
 * Generate payment records from teaching schedules
 */
export async function generatePaymentRecords(
  data: GeneratePaymentRequest
): Promise<TeachingPayment[]> {
  return await apiService.post<TeachingPayment[]>('/teaching-payments/generate', data);
}

/**
 * Bulk save/update payment records
 */
export async function bulkSavePayments(
  data: BulkSavePaymentRequest
): Promise<TeachingPayment[]> {
  return await apiService.post<TeachingPayment[]>('/teaching-payments/bulk-save', data);
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  id: number,
  data: UpdatePaymentStatusRequest
): Promise<TeachingPayment> {
  return await apiService.put<TeachingPayment>(`/teaching-payments/${id}/status`, data);
}

/**
 * Bulk update payment status
 */
export async function bulkUpdatePaymentStatus(
  data: BulkUpdatePaymentStatusRequest
): Promise<TeachingPayment[]> {
  return await apiService.post<TeachingPayment[]>('/teaching-payments/bulk-update-status', data);
}

/**
 * Delete a payment record
 */
export async function deletePayment(id: number): Promise<void> {
  await apiService.delete<void>(`/teaching-payments/${id}`);
}

/**
 * Get payment summary statistics
 */
export async function getPaymentSummary(params: {
  major_id?: number;
  khoa_hoc_id?: number;
  semester_code?: string;
}): Promise<PaymentSummary> {
  return await apiService.get<PaymentSummary>('/teaching-payments/summary', params);
}

