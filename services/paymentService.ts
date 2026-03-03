export interface StkPushResult {
  success: boolean;
  checkoutRequestId?: string;
  message?: string;
  error?: string;
}

export interface PaymentStatusResult {
  paid: boolean;
  cancelled: boolean;
  resultCode?: string;
  resultDesc?: string;
}

export const initiateMpesaPayment = async (
  phone: string,
  amount: number
): Promise<StkPushResult> => {
  try {
    const res = await fetch('/api/mpesa-stk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount }),
    });

    const data = await res.json() as StkPushResult & { error?: string };

    if (!res.ok || data.error) {
      return { success: false, error: data.error || 'Payment initiation failed' };
    }

    return {
      success: true,
      checkoutRequestId: data.checkoutRequestId,
      message: data.message,
    };
  } catch (err) {
    console.error('STK Push error:', err);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

export const checkPaymentStatus = async (
  checkoutRequestId: string
): Promise<PaymentStatusResult> => {
  try {
    const res = await fetch('/api/mpesa-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutRequestId }),
    });

    const data = await res.json() as PaymentStatusResult;
    return data;
  } catch (err) {
    console.error('Payment query error:', err);
    return { paid: false, cancelled: false };
  }
};
