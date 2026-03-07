import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Smartphone, ShieldCheck, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import { initiateMpesaPayment, checkPaymentStatus } from '../services/paymentService';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Status = 'choose' | 'mpesa-form' | 'processing' | 'polling' | 'success' | 'error' | 'cancelled';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Status>('choose');
  const [errorMsg, setErrorMsg] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const [stripeLoading, setStripeLoading] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStatus('choose');
      setPhone('');
      setErrorMsg('');
      setCheckoutRequestId('');
      setPollCount(0);
      setStripeLoading(false);
      stopPolling();
    }
    return () => stopPolling();
  }, [isOpen]);

  // Poll M-Pesa payment status — fast at first, then slows down
  useEffect(() => {
    if (status !== 'polling' || !checkoutRequestId) return;

    stopPolling();
    let polls = 0;

    const poll = async () => {
      polls++;
      setPollCount(polls);

      const result = await checkPaymentStatus(checkoutRequestId, user?.id);

      if (result.paid) {
        stopPolling();
        setStatus('success');
        setTimeout(() => onSuccess(), 2000);
        return;
      }

      if (result.cancelled) {
        stopPolling();
        setStatus('cancelled');
        const desc = result.resultDesc || '';
        if (desc.toLowerCase().includes('cancel')) {
          setErrorMsg('You cancelled the payment. Tap below to try again.');
        } else if (desc.toLowerCase().includes('insufficient')) {
          setErrorMsg('Insufficient M-Pesa balance. Please top up and try again.');
        } else if (desc.toLowerCase().includes('timeout') || desc.toLowerCase().includes('expired')) {
          setErrorMsg('The request timed out. Please try again.');
        } else {
          setErrorMsg(desc || 'Payment was not completed. Please try again.');
        }
        return;
      }

      if (polls >= 24) {
        stopPolling();
        setStatus('error');
        setErrorMsg('Payment timed out. Please try again.');
        return;
      }

      const nextDelay = polls < 10 ? 2000 : 5000;
      pollTimerRef.current = setTimeout(poll, nextDelay);
    };

    pollTimerRef.current = setTimeout(poll, 2000);
    return () => stopPolling();
  }, [status, checkoutRequestId]);

  const handleMpesaPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) return;

    setStatus('processing');
    setErrorMsg('');

    const result = await initiateMpesaPayment(phone, 1000);

    if (!result.success || !result.checkoutRequestId) {
      setStatus('error');
      setErrorMsg(result.error || 'Failed to send M-Pesa request. Please try again.');
      return;
    }

    setCheckoutRequestId(result.checkoutRequestId);
    setStatus('polling');
  };

  const handleStripePay = async () => {
    setStripeLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userEmail: profile?.email,
        }),
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setErrorMsg(data.error || 'Failed to start checkout. Please try again.');
        setStripeLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setErrorMsg('Could not connect to payment server. Please try again.');
      setStripeLoading(false);
    }
  };

  const handleRetry = () => {
    setStatus('choose');
    setErrorMsg('');
    setCheckoutRequestId('');
    setPollCount(0);
    setStripeLoading(false);
    stopPolling();
  };

  const canClose = status !== 'processing' && status !== 'polling';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={canClose ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
              />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />

              {canClose && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-emerald-100 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner border border-white/20"
              >
                <CreditCard className="w-8 h-8 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold tracking-tight">Premium Access</h3>
              <p className="text-emerald-100 text-sm mt-1 font-medium">5 Analysis Credits — 30 Days</p>
            </div>

            {/* Body */}
            <div className="p-8">
              <AnimatePresence mode="wait">

                {/* Success */}
                {status === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"
                    >
                      <CheckCircle className="w-10 h-10" />
                    </motion.div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Payment Confirmed!</h4>
                    <p className="text-slate-500">Your account has been credited with <strong>5 analyses</strong>. Let's get started!</p>
                  </motion.div>
                )}

                {/* Polling / waiting for M-Pesa PIN */}
                {status === 'polling' && (
                  <motion.div key="polling" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-10">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                      <Smartphone className="absolute inset-0 m-auto w-6 h-6 text-slate-400 animate-pulse" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Check your phone</h4>
                    <p className="text-slate-500 text-sm px-4 leading-relaxed">
                      M-Pesa request sent to <b className="text-slate-800">{phone}</b>.<br />
                      Enter your PIN to complete payment.
                    </p>
                    <p className="text-xs text-slate-400 mt-4">Waiting for confirmation...</p>
                  </motion.div>
                )}

                {/* Processing (sending request) */}
                {status === 'processing' && (
                  <motion.div key="processing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-10">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Sending request...</h4>
                    <p className="text-slate-500 text-sm">Connecting to M-Pesa</p>
                  </motion.div>
                )}

                {/* Error / Cancelled */}
                {(status === 'error' || status === 'cancelled') && (
                  <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Payment Failed</h4>
                    <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
                    <button
                      onClick={handleRetry}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}

                {/* Payment Method Chooser */}
                {status === 'choose' && (
                  <motion.div
                    key="choose"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    {/* Package info */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Package</span>
                        <span className="text-slate-900 font-bold">5 Analyses / 30 Days</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200/60">
                        <span className="text-slate-600 font-medium">Amount</span>
                        <div className="text-right">
                          <span className="text-emerald-600 font-bold text-xl">KES 1,000</span>
                          <span className="text-slate-400 text-xs ml-2">/ $10</span>
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorMsg}
                      </div>
                    )}

                    {/* M-Pesa Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStatus('mpesa-form')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-3"
                    >
                      <Smartphone className="w-5 h-5" />
                      <span>Pay with M-Pesa</span>
                    </motion.button>

                    {/* Stripe Card Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStripePay}
                      disabled={stripeLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-3"
                    >
                      {stripeLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>Pay with Card</span>
                        </>
                      )}
                    </motion.button>

                    <div className="text-center flex items-center justify-center gap-2 text-slate-400">
                      <ShieldCheck className="w-3 h-3" />
                      <p className="text-[10px] uppercase tracking-widest font-medium">Secure payment processing</p>
                    </div>
                  </motion.div>
                )}

                {/* M-Pesa Phone Form */}
                {status === 'mpesa-form' && (
                  <motion.form
                    key="mpesa-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleMpesaPay}
                    className="space-y-5"
                  >
                    <button
                      type="button"
                      onClick={() => setStatus('choose')}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">M-Pesa Phone Number</label>
                      <div className="relative group">
                        <Smartphone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="tel"
                          placeholder="07XX XXX XXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-lg text-slate-800 placeholder:text-slate-300 shadow-sm"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-slate-400 ml-1">Enter the M-Pesa registered number.</p>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Pay KES 1,000</span>
                      <Smartphone className="w-5 h-5" />
                    </motion.button>

                    <div className="text-center flex items-center justify-center gap-2 text-slate-400">
                      <ShieldCheck className="w-3 h-3" />
                      <p className="text-[10px] uppercase tracking-widest font-medium">Secured by Safaricom Daraja API</p>
                    </div>
                  </motion.form>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
