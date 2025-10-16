/**
 * ============================================
 * FINANCIAL MODULE - INDEX/DASHBOARD
 * ============================================
 * Trang tổng quan module tài chính
 * Role: admin, manager, accountant
 * Permissions: invoices.view, payments.view, settlements.view
 */

import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { usePermissions } from '~/hooks/usePermissions';
import { invoiceService, paymentService } from '~/services';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

export default function FinancialIndex() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const promises = [];

      if (hasPermission('invoices.view')) {
        promises.push(invoiceService.getStatistics());
      }
      if (hasPermission('payments.view')) {
        promises.push(paymentService.getStatistics());
      }

      const results = await Promise.all(promises);
      if (hasPermission('invoices.view')) setInvoiceStats(results[0]);
      if (hasPermission('payments.view')) setPaymentStats(results[1] || results[0]);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('invoices.view') && !hasPermission('payments.view') && !hasPermission('settlements.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bạn không có quyền truy cập module này</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài chính</h1>
          <p className="text-gray-600 mt-1">Quản lý hóa đơn, thanh toán và quyết toán</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hasPermission('invoices.view') && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng hóa đơn</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : invoiceStats?.total || 0}
                  </p>
                </div>
                <DocumentTextIcon className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chờ xử lý</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {loading ? '...' : invoiceStats?.pending || 0}
                  </p>
                </div>
                <DocumentTextIcon className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </>
        )}

        {hasPermission('payments.view') && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Thanh toán</p>
                  <p className="text-3xl font-bold text-green-600">
                    {loading ? '...' : paymentStats?.total || 0}
                  </p>
                </div>
                <CurrencyDollarIcon className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chờ xác nhận</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {loading ? '...' : paymentStats?.pending || 0}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Revenue Summary */}
      {hasPermission('invoices.view') && invoiceStats && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Tổng doanh thu</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatCurrency(invoiceStats?.total_amount || 0)}
              </p>
            </div>
            <CurrencyDollarIcon className="w-16 h-16 text-green-200" />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hasPermission('invoices.view') && (
          <div
            onClick={() => navigate('/financial/invoices')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <DocumentTextIcon className="w-12 h-12 text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hóa đơn</h3>
                <p className="text-gray-600 text-sm">Quản lý hóa đơn</p>
              </div>
            </div>
          </div>
        )}

        {hasPermission('payments.view') && (
          <div
            onClick={() => navigate('/financial/payments')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-12 h-12 text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thanh toán</h3>
                <p className="text-gray-600 text-sm">Quản lý thanh toán</p>
              </div>
            </div>
          </div>
        )}

        {hasPermission('settlements.view') && (
          <div
            onClick={() => navigate('/financial/settlements')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <ClipboardDocumentCheckIcon className="w-12 h-12 text-purple-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quyết toán</h3>
                <p className="text-gray-600 text-sm">Quản lý quyết toán</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
