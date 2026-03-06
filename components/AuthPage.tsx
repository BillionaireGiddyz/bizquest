import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Sparkles, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';

type View = 'auth' | 'forgot' | 'forgot-sent' | 'signup-confirm';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [view, setView] = useState<View>('auth');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else if (!result.confirmed) {
        setView('signup-confirm');
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);

    const result = await resetPassword(email);
    if (result.error) {
      setError(result.error);
    } else {
      setView('forgot-sent');
    }

    setLoading(false);
  };

  const goBackToSignIn = () => {
    setView('auth');
    setIsSignUp(false);
    setError('');
    setPassword('');
  };

  // Success screens
  if (view === 'signup-confirm' || view === 'forgot-sent') {
    const isForgot = view === 'forgot-sent';
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center border border-slate-200"
        >
          <div className={`w-16 h-16 ${isForgot ? 'bg-indigo-100' : 'bg-emerald-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {isForgot
              ? <KeyRound className="w-8 h-8 text-indigo-600" />
              : <Mail className="w-8 h-8 text-emerald-600" />
            }
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isForgot ? 'Reset link sent' : 'Check your email'}
          </h2>
          <p className="text-slate-500 mb-6">
            {isForgot
              ? <>We sent a password reset link to <strong className="text-slate-700">{email}</strong>. Click it to set a new password.</>
              : <>We sent a confirmation link to <strong className="text-slate-700">{email}</strong>. Click it to activate your account.</>
            }
          </p>
          <button
            onClick={goBackToSignIn}
            className="text-indigo-600 font-medium hover:underline flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pattern-grid-lg opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 relative z-10"
      >
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white tracking-tight">BizQuest</h1>
          <p className="text-slate-400 text-sm mt-1">AI-Powered Market Intelligence</p>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Forgot Password View */}
          {view === 'forgot' ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={goBackToSignIn}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>

              <h2 className="text-lg font-bold text-slate-800 mb-1">Forgot your password?</h2>
              <p className="text-sm text-slate-500 mb-5">Enter your email and we'll send you a reset link.</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl mb-4 text-rose-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
                    required
                    autoFocus
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            /* Sign In / Sign Up View */
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => { setIsSignUp(false); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    !isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
                <button
                  onClick={() => { setIsSignUp(true); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    isSignUp ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <UserPlus className="w-4 h-4" /> Sign Up
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl mb-4 text-rose-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    {error}
                    {!isSignUp && error.toLowerCase().includes('invalid') && (
                      <button
                        onClick={() => { setView('forgot'); setError(''); }}
                        className="block text-indigo-600 font-medium hover:underline mt-1"
                      >
                        Reset your password
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1 mr-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setError(''); }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSignUp ? 'Min 6 characters' : 'Your password'}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </>
                  )}
                </motion.button>
              </form>

              {isSignUp && (
                <p className="text-center text-xs text-slate-400 mt-4">
                  You'll get <strong className="text-indigo-600">3 free analysis credits</strong> on sign up
                </p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
