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

    let data: StkPushResult & { error?: string };
    try {
      data = await res.json();
    } catch {
      return { success: false, error: `Server returned ${res.status}. Please try again.` };
    }

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
    return { success: false, error: 'Could not reach the payment server. Please check your connection and try again.' };
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

    let data: PaymentStatusResult;
    try {
      data = await res.json();
    } catch {
      // Non-JSON response (e.g. Vercel cold-start "upstream connect error")
      // Treat as "still pending" so polling continues
      return { paid: false, cancelled: false };
    }

    return data;
  } catch (err) {
    console.error('Payment query error:', err);
    return { paid: false, cancelled: false };
  }
};
