import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  MapPinned,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
} from 'lucide-react';

type View = 'auth' | 'forgot' | 'forgot-sent' | 'signup-confirm';

const VALUE_POINTS = [
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Demand scoring in seconds',
    description: 'Turn vague business ideas into quantified market signals before you spend capital.',
  },
  {
    icon: <MapPinned className="h-5 w-5" />,
    title: 'Location-aware verdicts',
    description: 'See how product demand, competition, and timing shift across towns, estates, and cities.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Decision-grade summaries',
    description: 'Get structured recommendations you can act on, not generic AI chatter.',
  },
];

const INSIGHT_ROWS = [
  { label: 'Demand Signal', value: '74 / 100', tone: 'text-emerald-600' },
  { label: 'Competition', value: 'Medium', tone: 'text-amber-600' },
  { label: 'Timing Window', value: 'Early', tone: 'text-indigo-600' },
];

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

  if (view === 'signup-confirm' || view === 'forgot-sent') {
    const isForgot = view === 'forgot-sent';
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)]" />
        <div className="absolute inset-0 pattern-grid-lg opacity-[0.08]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-white/95 shadow-2xl shadow-slate-950/40"
          >
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-9 text-center text-white">
              <div className={`mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-3xl ${isForgot ? 'bg-indigo-500/20' : 'bg-emerald-500/20'} border border-white/10`}>
                {isForgot ? (
                  <KeyRound className="h-9 w-9 text-indigo-200" />
                ) : (
                  <Mail className="h-9 w-9 text-emerald-200" />
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isForgot ? 'Reset link sent' : 'Check your email'}
              </h1>
              <p className="mt-3 text-sm text-slate-300">
                {isForgot
                  ? 'We have prepared a secure password reset link for your inbox.'
                  : 'Your account confirmation link is on its way.'}
              </p>
            </div>

            <div className="px-8 py-8 text-center">
              <p className="text-slate-500">
                {isForgot ? (
                  <>
                    We sent a password reset link to <strong className="text-slate-800">{email}</strong>. Open it to choose a new password.
                  </>
                ) : (
                  <>
                    We sent a confirmation link to <strong className="text-slate-800">{email}</strong>. Activate your account, then return to BizQuest.
                  </>
                )}
              </p>

              <button
                onClick={goBackToSignIn}
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-5 lg:px-6 lg:py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(139,92,246,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(135deg,#020617,#0f172a_42%,#111827)]" />
      <div className="absolute inset-0 pattern-grid-lg opacity-[0.08]" />
      <div className="absolute left-[10%] top-[16%] h-44 w-44 rounded-full bg-indigo-500/12 blur-3xl" />
      <div className="absolute bottom-[12%] right-[12%] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1440px] items-center">
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between rounded-full border border-white/10 bg-white/8 px-4 py-3 text-white shadow-lg shadow-slate-950/20 backdrop-blur-md lg:hidden">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-200">
                BizQuest Access
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                Already have an account?
              </p>
            </div>
            <button
              onClick={() => {
                setView('auth');
                setIsSignUp(false);
                setError('');
              }}
              className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition-transform active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>

          <div className="mb-4 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] p-5 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-lg shadow-slate-950/20 ring-1 ring-white/10">
                <BarChart3 className="h-6 w-6 text-indigo-200" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">BizQuest</div>
                <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-300">
                  AI market intelligence
                </div>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-200">
              <Sparkles className="h-3 w-3" />
              Launch smarter
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
              Know what will sell
              <span className="block bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                before you invest.
              </span>
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Analyze demand, competition, and timing in one place built for founders who need clarity before spending money.
            </p>

            <div className="mt-5 space-y-3">
              {VALUE_POINTS.slice(0, 2).map((point) => (
                <div
                  key={point.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                >
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-indigo-200">
                    {point.icon}
                  </div>
                  <h2 className="text-sm font-semibold text-white">{point.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{point.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative hidden overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.06] p-6 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:block lg:min-h-[760px] lg:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.14),_transparent_26%)]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 shadow-lg shadow-slate-950/20 ring-1 ring-white/10 backdrop-blur-md">
                  <BarChart3 className="h-7 w-7 text-indigo-200" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">BizQuest</div>
                  <div className="text-xs font-medium uppercase tracking-[0.28em] text-slate-300">
                    AI market intelligence
                  </div>
                </div>
              </div>

              <div className="mt-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Launch smarter
                </div>
                <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Know what will sell
                  <span className="block bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                    before you invest.
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  BizQuest turns product ideas into location-specific market verdicts. Analyze demand, competition, and timing in one workspace built for founders who need clarity before spending money.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {VALUE_POINTS.map((point, index) => (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.08 }}
                    className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 shadow-lg shadow-slate-950/10"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-indigo-200">
                      {point.icon}
                    </div>
                    <h2 className="text-sm font-semibold text-white">{point.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{point.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 rounded-[30px] border border-white/10 bg-slate-950/45 p-5 shadow-2xl shadow-slate-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                      Example market brief
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      Portable blender in Nairobi West
                    </h3>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
                    GO
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {INSIGHT_ROWS.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        {item.label}
                      </p>
                      <p className={`mt-2 text-lg font-bold ${item.tone}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 px-4 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                  <p className="text-sm leading-6 text-slate-200">
                    Our market scan suggests healthy demand, manageable competition, and a favorable timing window for a value-positioned launch.
                  </p>
                </div>
              </div>

              <div className="mt-auto hidden items-center gap-6 pt-8 text-sm text-slate-400 lg:flex">
                <span className="font-medium text-slate-300">3 free credits on sign up</span>
                <span>Follow-up questions included</span>
                <span>Built for East African entrepreneurs</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-white/12 bg-white/95 shadow-2xl shadow-slate-950/40 lg:rounded-[34px]">
              <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/10 ring-1 ring-white/10 backdrop-blur-md">
                    <Sparkles className="h-8 w-8 text-indigo-200" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                      {view === 'forgot' ? 'Recover your access' : isSignUp ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      {view === 'forgot'
                        ? 'Secure your account and continue where you left off.'
                        : isSignUp
                        ? 'Start evaluating market opportunities with 3 free credits.'
                        : 'Sign in to continue analyzing your next market opportunity.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-6 sm:px-8 sm:py-8">
                {view === 'forgot' ? (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <button
                      onClick={goBackToSignIn}
                      className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </button>

                    <p className="mb-6 text-sm leading-6 text-slate-500">
                      Enter the email attached to your BizQuest account and we’ll send a secure reset link.
                    </p>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="ml-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-800 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 disabled:bg-slate-400"
                      >
                        {loading ? (
                          <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <>
                            <Mail className="h-4 w-4" />
                            Send Reset Link
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="auth"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                      <button
                        onClick={() => {
                          setIsSignUp(false);
                          setError('');
                        }}
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                          !isSignUp
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setIsSignUp(true);
                          setError('');
                        }}
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                          isSignUp
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Sign Up
                        </span>
                      </button>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <div className="flex-1">
                            {error}
                            {!isSignUp && error.toLowerCase().includes('invalid') && (
                              <button
                                onClick={() => {
                                  setView('forgot');
                                  setError('');
                                }}
                                className="mt-1 block font-medium text-indigo-600 hover:underline"
                              >
                                Reset your password
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="ml-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-800 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                            Password
                          </label>
                          {!isSignUp && (
                            <button
                              type="button"
                              onClick={() => {
                                setView('forgot');
                                setError('');
                              }}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isSignUp ? 'Minimum 6 characters' : 'Your password'}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-800 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                            required
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-200/70 disabled:from-indigo-400 disabled:to-violet-400"
                      >
                        {loading ? (
                          <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <>
                            {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                            {isSignUp ? 'Create Account' : 'Sign In'}
                          </>
                        )}
                      </motion.button>
                    </form>

                    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {isSignUp ? 'You start with 3 free analysis credits.' : 'Continue your saved market research instantly.'}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {isSignUp
                              ? 'Test your first product ideas before committing cash to inventory, ads, or rent.'
                              : 'Your account keeps your credits, history, and follow-up workflow in one place.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
};
