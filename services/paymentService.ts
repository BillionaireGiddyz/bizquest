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

// Resilient fetch that retries on Vercel cold-start / transient errors
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Vercel sometimes returns 502/503 with plain text on cold starts
      if (res.status >= 502 && res.status <= 504 && attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      // Check if response is actually JSON before returning
      const text = await res.text();
      if (!text.startsWith('{') && !text.startsWith('[')) {
        // Got a non-JSON response (e.g. "upstream connect error")
        if (attempt < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        // Final attempt — wrap in a synthetic response
        return new Response(JSON.stringify({ error: 'Server temporarily unavailable. Please try again.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Re-create response with the text we already consumed
      return new Response(text, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    } catch (err) {
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('All retries exhausted');
}

export const initiateMpesaPayment = async (
  phone: string,
  amount: number
): Promise<StkPushResult> => {
  try {
    const res = await fetchWithRetry('/api/mpesa-stk', {
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
    return { success: false, error: 'Could not reach the payment server. Please check your connection and try again.' };
  }
};

export const checkPaymentStatus = async (
  checkoutRequestId: string
): Promise<PaymentStatusResult> => {
  try {
    const res = await fetchWithRetry('/api/mpesa-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutRequestId }),
    }, 2); // Fewer retries for polling since it runs every 5s anyway

    const data = await res.json() as PaymentStatusResult;
    return data;
  } catch (err) {
    console.error('Payment query error:', err);
    return { paid: false, cancelled: false };
  }
};
