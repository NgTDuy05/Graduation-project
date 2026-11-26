import { api } from './api';

export type PlanType = 'FREE' | 'PRO';

export interface SubscriptionPlan {
  planType: PlanType;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
}

export interface UserSubscription {
  id: number;
  userId: number;
  planType: PlanType;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const res = await api.get<SubscriptionPlan[]>('/subscriptions/plans');
    return res.data;
  },

  async getMySubscription(): Promise<{
    current: UserSubscription;
    history: UserSubscription[];
  }> {
    const res = await api.get('/subscriptions/me');
    return res.data;
  },

  async upgrade(
    planType: PlanType,
    durationMonths = 1,
  ): Promise<{ message: string; subscription: UserSubscription }> {
    const res = await api.post('/subscriptions/upgrade', {
      planType,
      durationMonths,
    });
    return res.data;
  },

  async cancel(): Promise<{ message: string; subscription: UserSubscription }> {
    const res = await api.post('/subscriptions/cancel');
    return res.data;
  },
};

