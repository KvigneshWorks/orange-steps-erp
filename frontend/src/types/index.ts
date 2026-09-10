export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet';
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'product' | 'customer' | 'payment' | 'report';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
  user: string;
  avatar: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}
