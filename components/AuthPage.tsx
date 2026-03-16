
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  KeyRound,
  LineChart,
  Lock,
  LogIn,
  Mail,
  MapPinned,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type View = 'auth' | 'forgot' | 'forgot-sent' | 'signup-confirm';
type MobileStage = 'welcome' | 'form';
type DesktopStage = 'welcome' | 'form';

const VALUE_PILLARS = [
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Demand scoring in seconds',
    body: 'Pressure-test product ideas before you spend on stock, ads, or rent.',
  },
  {
    icon: <MapPinned className="h-5 w-5" />,
    title: 'Location-aware verdicts',
    body: 'See how opportunity changes by town, estate, and customer profile.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Decision-grade summaries',
    body: 'Clear GO, BE CAREFUL, and AVOID guidance with supporting context.',
  },
];

const TRUST_METRICS = [
  { label: 'Free credits', value: '3', note: 'on sign up' },
  { label: 'Follow-ups', value: '3', note: 'per analysis' },
  { label: 'Decision time', value: '<60s', note: 'to first brief' },
];

const OPPORTUNITY_SIGNALS = [
  { label: 'Demand pulse', value: '74 / 100', tone: 'text-emerald-300' },
  { label: 'Competition', value: 'Moderate', tone: 'text-amber-300' },
  { label: 'Timing', value: 'Early', tone: 'text-cyan-300' },
];

function openMobileAuth(
  mode: 'signin' | 'signup',
  setView: (view: View) => void,
  setIsSignUp: (value: boolean) => void,
  setError: (value: string) => void,
  setMobileStage: (value: MobileStage) => void,
) {
  setView('auth');
  setIsSignUp(mode === 'signup');
  setError('');
  setMobileStage('form');
}

function getHeaderCopy(view: View, isSignUp: boolean) {
  if (view === 'forgot') {
    return {
      title: 'Recover your access',
      body: 'Secure your workspace and continue your market research without friction.',
    };
  }

  if (isSignUp) {
    return {
      title: 'Create your operator account',
      body: 'Start with free credits and turn product ideas into location-specific verdicts.',
    };
  }

  return {
    title: 'Welcome back',
    body: 'Open your workspace and continue evaluating your next opportunity.',
  };
}

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [view, setView] = useState<View>('auth');
  const [isSignUp, setIsSignUp] = useState(false);
  const [mobileStage, setMobileStage] = useState<MobileStage>('welcome');
  const [desktopStage, setDesktopStage] = useState<DesktopStage>('welcome');
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

  const goBackToAuth = () => {
    setView('auth');
    setIsSignUp(false);
    setError('');
    setPassword('');
    setMobileStage('form');
    setDesktopStage('form');
  };

  const openDesktopSignIn = () => {
    setView('auth');
    setIsSignUp(false);
    setError('');
    setDesktopStage('form');
  };

  const openDesktopSignUp = () => {
    setView('auth');
    setIsSignUp(true);
    setError('');
    setDesktopStage('form');
  };

  const headerCopy = getHeaderCopy(view, isSignUp);

  if (view === 'signup-confirm' || view === 'forgot-sent') {
    const isForgot = view === 'forgot-sent';

    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_86%_18%,_rgba(16,185,129,0.18),_transparent_22%),linear-gradient(140deg,#020617,#0f172a_50%,#111827)]" />
        <div className="pointer-events-none absolute inset-0 pattern-grid-lg opacity-[0.05]" />
        <div className="pointer-events-none noise-surface absolute inset-0 opacity-35" />

        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="premium-shadow w-full max-w-xl overflow-hidden rounded-[34px] border border-white/10 bg-white/95"
          >
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#020617,#111827_55%,#312e81)] px-8 py-9 text-center text-white">
              <div className="pointer-events-none noise-surface absolute inset-0 opacity-25" />
              <div className={`relative mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-[28px] border border-white/10 ${isForgot ? 'bg-indigo-500/18' : 'bg-emerald-500/18'}`}>
                {isForgot ? <KeyRound className="h-9 w-9 text-indigo-100" /> : <Mail className="h-9 w-9 text-emerald-100" />}
              </div>
              <h1 className="relative text-3xl font-black tracking-tight">
                {isForgot ? 'Reset link sent' : 'Check your email'}
              </h1>
              <p className="relative mt-3 text-sm leading-6 text-slate-300">
                {isForgot
                  ? 'A secure recovery link is on its way so you can get back into your workspace.'
                  : 'Your confirmation link is on its way. Verify your email, then return to BizQuest.'}
              </p>
            </div>

            <div className="px-8 py-8 text-center">
              <p className="text-slate-500">
                {isForgot ? (
                  <>We sent a password reset link to <strong className="text-slate-800">{email}</strong>.</>
                ) : (
                  <>We sent a confirmation link to <strong className="text-slate-800">{email}</strong>.</>
                )}
              </p>
              <button
                onClick={goBackToAuth}
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
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

  const showMobileWelcome = mobileStage === 'welcome';
  const showDesktopOverlay = view === 'forgot' || (view === 'auth' && desktopStage === 'form');

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-5 lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(34,211,238,0.12),_transparent_24%),radial-gradient(circle_at_88%_10%,_rgba(129,140,248,0.14),_transparent_22%),radial-gradient(circle_at_68%_78%,_rgba(16,185,129,0.12),_transparent_20%),linear-gradient(135deg,#020617_0%,#0f172a_42%,#111827_100%)]" />
      <div className="pointer-events-none absolute inset-0 pattern-grid-lg opacity-[0.05]" />
      <div className="pointer-events-none noise-surface absolute inset-0 opacity-35" />
      <div className="pointer-events-none absolute left-[8%] top-[14%] h-56 w-56 rounded-full bg-indigo-500/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[9%] top-[18%] h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] right-[24%] h-44 w-44 rounded-full bg-emerald-400/8 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1480px] items-center">
        <div className="w-full">
          <div className="lg:hidden">
            {showMobileWelcome ? (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-shadow overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.07] text-white backdrop-blur-2xl"
              >
                <div className="relative overflow-hidden px-5 pb-5 pt-6">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(99,102,241,0.16),transparent_38%)]" />
                  <div className="pointer-events-none noise-surface absolute inset-0 opacity-35" />

                  <div className="relative mb-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openMobileAuth('signin', setView, setIsSignUp, setError, setMobileStage)}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-[0_10px_28px_rgba(255,255,255,0.16)] transition-transform active:scale-[0.98]"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => openMobileAuth('signup', setView, setIsSignUp, setError, setMobileStage)}
                      className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform active:scale-[0.98]"
                    >
                      Sign Up
                    </button>
                  </div>

                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-13 w-13 items-center justify-center rounded-[22px] border border-white/12 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                        <BarChart3 className="h-6 w-6 text-indigo-200" />
                      </div>
                      <div>
                        <div className="text-2xl font-black tracking-tight">BizQuest</div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-300">
                          AI market intelligence
                        </div>
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
                      Live brief
                    </div>
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-200">
                    <Sparkles className="h-3 w-3" />
                    Market clarity, faster
                  </div>

                  <h1 className="relative mt-4 text-[2.1rem] font-black leading-[1.02] tracking-tight">
                    Launch with signal,
                    <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                      not guesswork.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                    BizQuest helps founders assess demand, competition, and timing before they commit money to a market.
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {TRUST_METRICS.map((metric) => (
                      <div key={metric.label} className="rounded-[22px] border border-white/10 bg-white/[0.06] px-3 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <div className="text-base font-black text-white">{metric.value}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">{metric.label}</div>
                        <div className="mt-1 text-[11px] text-slate-400">{metric.note}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[26px] border border-white/10 bg-slate-950/38 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                          <LineChart className="h-4 w-4" />
                          Sample verdict
                        </div>
                        <div className="mt-2 text-base font-semibold text-white">Portable blender in Nairobi West</div>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          Strong interest, manageable competition, and favorable timing for a focused launch.
                        </p>
                      </div>
                      <div className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                        GO
                      </div>
                    </div>

                    <div className="gradient-divider my-4" />

                    <div className="grid grid-cols-3 gap-2">
                      {OPPORTUNITY_SIGNALS.map((signal) => (
                        <div key={signal.label} className="rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{signal.label}</div>
                          <div className={`mt-2 text-sm font-bold ${signal.tone}`}>{signal.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-cyan-400/10 bg-cyan-400/8 px-4 py-3 text-sm leading-6 text-slate-200">
                    Start with a quick sign in or create an account to unlock your first market brief.
                  </div>
                </div>
              </motion.section>
            ) : (
              <div className="mb-4 flex items-center justify-between rounded-[28px] border border-white/12 bg-white/[0.07] p-4 text-white premium-shadow backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/12 bg-white/10">
                    <BarChart3 className="h-5 w-5 text-indigo-200" />
                  </div>
                  <div>
                    <div className="text-xl font-black tracking-tight">BizQuest</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-300">
                      Access workspace
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileStage('welcome');
                    setView('auth');
                    setError('');
                  }}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                >
                  Back
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="relative min-h-[760px]">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className={`relative overflow-hidden rounded-[42px] border border-white/10 bg-white/[0.06] p-9 text-white premium-shadow backdrop-blur-xl transition-all duration-300 ${showDesktopOverlay ? 'scale-[0.985] blur-[3px] opacity-45' : 'scale-100 opacity-100'}`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_28%),radial-gradient(circle_at_80%_18%,_rgba(34,211,238,0.1),_transparent_22%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(23,37,84,0.88)_48%,rgba(15,23,42,0.98))]" />
                <div className="pointer-events-none absolute inset-0 pattern-grid-lg opacity-[0.04]" />
                <div className="pointer-events-none noise-surface absolute inset-0 opacity-30" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/12 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                        <BarChart3 className="h-8 w-8 text-indigo-200" />
                      </div>
                      <div>
                        <div className="text-4xl font-black tracking-tight">BizQuest</div>
                        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-300">
                          AI market intelligence
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={openDesktopSignIn}
                        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/14"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={openDesktopSignUp}
                        className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900 shadow-[0_16px_40px_rgba(255,255,255,0.16)] transition-transform hover:-translate-y-0.5"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.88fr)]">
                    <div className="flex flex-col">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        Welcome to smarter launches
                      </div>

                      <h1 className="mt-6 max-w-[500px] text-[4.2rem] font-black leading-[0.92] tracking-[-0.05em] text-white">
                        Launch with signal,
                        <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                          not guesswork.
                        </span>
                      </h1>

                      <p className="mt-5 max-w-[470px] text-lg leading-8 text-slate-300">
                        Explore demand, competition, and timing in one polished workspace designed for decisive founders and operators.
                      </p>

                      <div className="mt-7 grid grid-cols-3 gap-3">
                        {TRUST_METRICS.map((metric) => (
                          <div key={metric.label} className="rounded-[22px] border border-white/8 bg-white/[0.06] px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                            <div className="text-xl font-black text-white">{metric.value}</div>
                            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">{metric.label}</div>
                            <div className="mt-1 text-xs text-slate-500">{metric.note}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-7 space-y-3">
                        {VALUE_PILLARS.map((card) => (
                          <div
                            key={card.title}
                            className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_18px_40px_rgba(2,6,23,0.12)]"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-indigo-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                              {card.icon}
                            </div>
                            <div>
                              <div className="text-base font-semibold text-white">{card.title}</div>
                              <p className="mt-1 text-sm leading-6 text-slate-300">{card.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-end">
                      <div className="w-full rounded-[36px] border border-white/10 bg-slate-950/44 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_28px_80px_rgba(2,6,23,0.24)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Sample verdict</div>
                            <div className="mt-2 text-[2rem] font-semibold leading-tight text-white">Portable blender in Nairobi West</div>
                          </div>
                          <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
                            GO
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-slate-300">
                          Strong interest, manageable competition, and favorable timing for a focused launch with healthy upside.
                        </p>

                        <div className="gradient-divider my-5" />

                        <div className="grid grid-cols-3 gap-3">
                          {OPPORTUNITY_SIGNALS.map((signal) => (
                            <div key={signal.label} className="rounded-[22px] border border-white/8 bg-white/[0.05] px-4 py-4">
                              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{signal.label}</div>
                              <div className={`mt-2 text-lg font-bold ${signal.tone}`}>{signal.value}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 rounded-[24px] border border-cyan-400/12 bg-cyan-400/8 px-4 py-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                            <p className="text-sm leading-6 text-slate-200">
                              Clear recommendation, supporting data points, and a workspace built to help you act faster.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {showDesktopOverlay && (
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 z-20 flex items-start justify-end px-8 pt-1"
                >
                  <div className="w-full max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="flex items-start justify-center"
              >
              <div className="premium-shadow relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/12 bg-white/95 lg:rounded-[38px]">
                <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(99,102,241,0.1),transparent)]" />
                <div className="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(135deg,#020617,#111827_55%,#312e81)] px-5 py-6 text-white sm:px-8 sm:py-8">
                  <div className="noise-surface absolute inset-0 opacity-25" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/10">
                      <Sparkles className="h-8 w-8 text-indigo-200" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight sm:text-2xl">{headerCopy.title}</h2>
                      <p className="mt-1 text-sm text-slate-300">{headerCopy.body}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-6 sm:px-8 sm:py-8">
                  {view === 'forgot' ? (
                    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                      <button
                        onClick={goBackToAuth}
                        className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to sign in
                      </button>

                      <p className="mb-6 text-sm leading-6 text-slate-500">
                        Enter the email attached to your BizQuest account and we&apos;ll send a secure reset link.
                      </p>

                      {error && (
                        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleForgotPassword} className="space-y-5">
                        <div className="space-y-2">
                          <label className="ml-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email address</label>
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
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                      <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                        <button
                          onClick={() => {
                            setIsSignUp(false);
                            setError('');
                          }}
                          className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                          className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Sign Up
                          </span>
                        </button>
                      </div>

                      {error && (
                        <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
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
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                          <label className="ml-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email address</label>
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
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Password</label>
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
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <>
                              {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                              {isSignUp ? 'Create Account' : 'Sign In'}
                            </>
                          )}
                        </motion.button>
                      </form>

                      <div className="mt-6 rounded-[24px] border border-indigo-100 bg-[linear-gradient(135deg,rgba(238,242,255,0.92),rgba(250,245,255,0.88))] px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                              {isSignUp ? 'You start with 3 free analysis credits.' : 'Continue your saved market research instantly.'}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {isSignUp
                                ? 'Test your first product ideas before committing cash to inventory, ads, or rent.'
                                : 'Your account keeps your credits, history, and follow-up workflow in one place.'}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 text-indigo-400" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={`${showMobileWelcome ? 'hidden lg:hidden' : 'flex lg:hidden'} items-start justify-center pt-1`}
          >
            <div className="premium-shadow relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/12 bg-white/95 lg:rounded-[38px]">
              <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(99,102,241,0.1),transparent)]" />
              <div className="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(135deg,#020617,#111827_55%,#312e81)] px-5 py-6 text-white sm:px-8 sm:py-8">
                <div className="noise-surface absolute inset-0 opacity-25" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/10">
                    <Sparkles className="h-8 w-8 text-indigo-200" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight sm:text-2xl">{headerCopy.title}</h2>
                    <p className="mt-1 text-sm text-slate-300">{headerCopy.body}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-6 sm:px-8 sm:py-8">
                {view === 'forgot' ? (
                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                    <button
                      onClick={goBackToAuth}
                      className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </button>

                    <p className="mb-6 text-sm leading-6 text-slate-500">
                      Enter the email attached to your BizQuest account and we&apos;ll send a secure reset link.
                    </p>

                    {error && (
                      <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="ml-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email address</label>
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
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
                  <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                      <button
                        onClick={() => {
                          setIsSignUp(false);
                          setError('');
                        }}
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Sign Up
                        </span>
                      </button>
                    </div>

                    {error && (
                      <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
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
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="ml-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email address</label>
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
                          <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Password</label>
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
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                            {isSignUp ? 'Create Account' : 'Sign In'}
                          </>
                        )}
                      </motion.button>
                    </form>

                    <div className="mt-6 rounded-[24px] border border-indigo-100 bg-[linear-gradient(135deg,rgba(238,242,255,0.92),rgba(250,245,255,0.88))] px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {isSignUp ? 'You start with 3 free analysis credits.' : 'Continue your saved market research instantly.'}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {isSignUp
                              ? 'Test your first product ideas before committing cash to inventory, ads, or rent.'
                              : 'Your account keeps your credits, history, and follow-up workflow in one place.'}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 text-indigo-400" />
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
  );
};
