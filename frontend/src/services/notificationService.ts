import axiosInstance from './axiosConfig';

export interface Notification {
  id: string;
  type: 'credit_due' | 'credit_overdue' | 'client_payment_due' | 'client_payment_overdue';
  title: string;
  message: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  priority: 'high' | 'medium' | 'low';
  entityId: number;
  entityName: string;
  actionLink: string;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private refreshInterval: NodeJS.Timeout | null = null;

  async fetchCreditNotifications(): Promise<Notification[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const response = await axiosInstance.get('credit-management/upcoming-dues', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const creditData = response.data?.data || [];

      return creditData.map((credit: any) => ({
        id: `credit_${credit.credit_entry_id}`,
        type: credit.is_overdue ? 'credit_overdue' : 'credit_due',
        title: credit.is_overdue ? '⚠️ Credit Payment Overdue' : '📅 Credit Payment Due',
        message: `${credit.vendor_name} - Bill #${credit.bill_number}`,
        amount: credit.credit_amount,
        dueDate: credit.due_date,
        daysUntilDue: credit.is_overdue ? -credit.days_overdue : credit.days_until_due,
        priority: credit.is_overdue ? 'high' : (credit.days_until_due <= 3 ? 'high' : 'medium'),
        entityId: credit.credit_entry_id,
        entityName: credit.vendor_name,
        actionLink: '/credit-management'
      }));
    } catch (error) {
      console.error('Error fetching credit notifications:', error);
      return [];
    }
  }

  async fetchClientPaymentNotifications(): Promise<Notification[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const response = await axiosInstance.get('client-portal/upcoming-dues?days=30', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const paymentData = response.data?.data || [];

      return paymentData.map((payment: any) => ({
        id: `client_${payment.payment_id}`,
        type: payment.days_until_due <= 0 ? 'client_payment_overdue' : 'client_payment_due',
        title: payment.days_until_due <= 0 ? '⚠️ Client Payment Overdue' : '📅 Client Payment Due',
        message: `${payment.client_name} - ${payment.project_name}`,
        amount: payment.amount,
        dueDate: payment.next_due_date,
        daysUntilDue: payment.days_until_due,
        priority: payment.days_until_due <= 0 ? 'high' : (payment.days_until_due <= 7 ? 'high' : 'medium'),
        entityId: payment.payment_id,
        entityName: payment.client_name,
        actionLink: '/client'
      }));
    } catch (error) {
      console.error('Error fetching client payment notifications:', error);
      return [];
    }
  }

  async fetchAllNotifications(): Promise<Notification[]> {
    const [creditNotifs, clientNotifs] = await Promise.all([
      this.fetchCreditNotifications(),
      this.fetchClientPaymentNotifications()
    ]);

    const allNotifs = [...creditNotifs, ...clientNotifs];

    // Sort by priority and days until due
    allNotifs.sort((a, b) => {
      // High priority first
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by days until due (negative = overdue first)
      return a.daysUntilDue - b.daysUntilDue;
    });

    this.notifications = allNotifs;
    this.notifyListeners();
    return allNotifs;
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getOverdueCount(): number {
    return this.notifications.filter(n => n.daysUntilDue <= 0).length;
  }

  getDueSoonCount(): number {
    return this.notifications.filter(n => n.daysUntilDue > 0 && n.daysUntilDue <= 7).length;
  }

  getTotalCount(): number {
    return this.notifications.length;
  }

  startAutoRefresh(intervalMinutes: number = 5) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {
      this.fetchAllNotifications();
    }, intervalMinutes * 60 * 1000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

export const notificationService = new NotificationService();