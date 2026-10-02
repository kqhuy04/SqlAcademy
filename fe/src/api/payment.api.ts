import { apiClient } from './client';

export type PaymentGateway = 'PAYOS' | 'VNPAY' | 'LEMON_SQUEEZY';

export interface CheckoutResponse {
  paymentUrl: string;
}

export interface OrderStatusResponse {
  orderCode: number;
  status: string;
  amount?: number;
}

export const paymentApi = {
  createCheckout: async (gateway: PaymentGateway = 'VNPAY'): Promise<CheckoutResponse> => {
    const res = await apiClient.post<CheckoutResponse>(`/payments/checkout?gateway=${gateway}`);
    return res.data;
  },

  getOrderStatus: async (orderCode: number): Promise<OrderStatusResponse> => {
    const res = await apiClient.get<OrderStatusResponse>(`/payments/orders/${orderCode}/status`);
    return res.data;
  },
};
