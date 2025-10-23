// Dashboard types

export interface DashboardStats {
  total_users: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  low_stock_products: number;
}

export interface RecentActivity {
  id: number;
  type: 'order' | 'customer' | 'product' | 'user';
  title: string;
  description: string;
  created_at: string;
  user_name?: string;
}

export interface QuickStats {
  label: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface DashboardData {
  stats: DashboardStats;
  recent_activities: RecentActivity[];
  revenue_chart?: ChartData;
  orders_chart?: ChartData;
}
