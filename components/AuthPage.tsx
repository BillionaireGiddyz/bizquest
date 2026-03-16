
import React, { useEffect, useState } from 'react';
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

const SAMPLE_QUESTION = 'Will a portable blender sell well in Nairobi West?';
const SAMPLE_TITLE = 'Portable blender in Nairobi West';
const SAMPLE_SUMMARY = 'Strong interest, manageable competition, and favorable timing for a focused launch.';

function useTypewriter(text: string, speedMs: number, resetKey: number) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let frame: ReturnType<typeof setTimeout> | null = null;
    let index = 0;

    setDisplayed('');

    const step = () => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        frame = setTimeout(step, speedMs);
      }
    };

    frame = setTimeout(step, speedMs);

    return () => {
      if (frame) clearTimeout(frame);
    };
  }, [text, speedMs, resetKey]);

  return displayed;
}

const SampleVerdictDemo: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'analyzing' | 'answer' | 'signals'>('typing');
  const typedQuestion = useTypewriter(SAMPLE_QUESTION, compact ? 26 : 22, cycle);
  const isQuestionComplete = typedQuestion.length === SAMPLE_QUESTION.length;

  useEffect(() => {
    let analyzingTimer: ReturnType<typeof setTimeout> | null = null;
    let answerTimer: ReturnType<typeof setTimeout> | null = null;
    let signalsTimer: ReturnType<typeof setTimeout> | null = null;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;

    setPhase('typing');

    if (isQuestionComplete) {
      analyzingTimer = setTimeout(() => setPhase('analyzing'), 220);
      answerTimer = setTimeout(() => setPhase('answer'), 1220);
      signalsTimer = setTimeout(() => setPhase('signals'), 1860);
      restartTimer = setTimeout(() => setCycle((value) => value + 1), 6200);
    }

    return () => {
      if (analyzingTimer) clearTimeout(analyzingTimer);
      if (answerTimer) clearTimeout(answerTimer);
      if (signalsTimer) clearTimeout(signalsTimer);
      if (restartTimer) clearTimeout(restartTimer);
    };
  }, [isQuestionComplete, cycle]);

  return (
    <>
      <div className={`rounded-[22px] border border-white/10 bg-slate-950/24 ${compact ? 'px-3 py-3' : 'px-4 py-4'}`}>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          <div className="h-2 w-2 rounded-full bg-cyan-300/80" />
          Input question
        </div>
        <div className={`mt-2 font-medium text-white ${compact ? 'min-h-[52px] text-sm leading-6' : 'min-h-[64px] text-[1rem] leading-7'}`}>
          {typedQuestion}
          <span className="ml-0.5 inline-block h-[1.1em] w-[1px] translate-y-0.5 animate-pulse bg-cyan-200/80 align-middle" />
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: phase === 'analyzing' ? 1 : 0,
          height: phase === 'analyzing' ? 'auto' : 0,
          marginTop: phase === 'analyzing' ? (compact ? 12 : 14) : 0,
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className={`rounded-[20px] border border-cyan-400/12 bg-cyan-400/[0.07] ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">Analyzing live data</div>
              <div className={`mt-1 text-slate-300 ${compact ? 'text-xs' : 'text-sm'}`}>
                Checking demand, competition, and timing signals.
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.12, ease: 'easeInOut' }}
                  className="h-2 w-2 rounded-full bg-cyan-300/90"
                />
              ))}
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <motion.div
              animate={{ x: ['-105%', '105%'] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
              className="h-full w-1/2 rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0),rgba(34,211,238,0.92),rgba(59,130,246,0))]"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          opacity: phase === 'typing' || phase === 'analyzing' ? 0.28 : 1,
          y: phase === 'typing' || phase === 'analyzing' ? 8 : 0,
          scale: phase === 'typing' || phase === 'analyzing' ? 0.985 : 1,
        }}
        transition={{ duration: 0.42, ease: 'easeOut' }}
      >
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">
              <LineChart className="h-4 w-4" />
              Sample verdict
            </div>
            <div className={`mt-2 font-semibold text-white ${compact ? 'text-base' : 'text-[2rem] leading-tight'}`}>{SAMPLE_TITLE}</div>
            <p className={`mt-1 text-slate-300 ${compact ? 'text-sm leading-6' : 'text-sm leading-7'}`}>
              {SAMPLE_SUMMARY}
            </p>
          </div>
          <div className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
            GO
          </div>
        </div>
      </motion.div>

      <div className="gradient-divider my-4" />

      <motion.div
        initial={false}
        animate={{
          opacity: phase === 'signals' ? 1 : 0.36,
          y: phase === 'signals' ? 0 : 10,
        }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-3'}`}
      >
        {OPPORTUNITY_SIGNALS.map((signal, index) => (
          <motion.div
            key={signal.label}
            initial={false}
            animate={{
              opacity: phase === 'signals' ? 1 : 0.42,
              y: phase === 'signals' ? 0 : 12,
              scale: phase === 'signals' ? 1 : 0.985,
            }}
            transition={{ duration: 0.34, delay: phase === 'signals' ? index * 0.09 : 0, ease: 'easeOut' }}
            className={`rounded-[22px] border border-white/8 bg-white/[0.05] ${compact ? 'px-3 py-3' : 'px-4 py-4'}`}
          >
            <div className={`font-bold uppercase text-slate-400 ${compact ? 'text-[10px] tracking-[0.18em]' : 'text-[10px] tracking-[0.2em]'}`}>
              {signal.label}
            </div>
            <div className={`mt-2 font-bold ${signal.tone} ${compact ? 'text-sm' : 'text-lg'}`}>{signal.value}</div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

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

  const closeDesktopOverlay = () => {
    setView('auth');
    setError('');
    setPassword('');
    setDesktopStage('welcome');
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
                      <motion.div
                        animate={{ y: [0, -1, 0], scale: [1, 1.012, 1] }}
                        transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
                        className="glass-tab flex h-13 w-13 items-center justify-center rounded-[22px] border border-white/12"
                      >
                        <BarChart3 className="h-6 w-6 text-indigo-200" />
                      </motion.div>
                      <div>
                        <div className="text-2xl font-black tracking-tight">BizQuest</div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-300">
                          AI market intelligence
                        </div>
                      </div>
                    </div>
                    <div className="live-data-pill rounded-full border border-cyan-300/18 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-100">
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                      Live data
                    </div>
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-200">
                    <Sparkles className="h-3 w-3" />
                    Market clarity, faster
                  </div>

                  <h1 className="hero-glow relative mt-4 text-[2.1rem] font-black leading-[1.02] tracking-tight">
                    Launch with signal,
                    <span className="animated-gradient-text mt-1 block">
                      not guesswork.
                    </span>
                  </h1>

                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                    BizQuest helps founders assess demand, competition, and timing before they commit money to a market.
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {TRUST_METRICS.map((metric, index) => (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + index * 0.06 }}
                        className={`calm-surface rounded-[22px] border border-white/10 px-3 py-3 text-center ${index === 1 ? 'floating-panel-delayed' : 'floating-panel'}`}
                      >
                        <div className="text-base font-black text-white">{metric.value}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">{metric.label}</div>
                        <div className="mt-1 text-[11px] text-slate-400">{metric.note}</div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="floating-panel-delayed calm-surface mt-5 rounded-[26px] border border-white/10 p-4"
                  >
                    <SampleVerdictDemo compact />
                  </motion.div>

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
                      <motion.div
                        animate={{ y: [0, -1, 0], scale: [1, 1.01, 1] }}
                        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="glass-tab flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/12"
                      >
                        <BarChart3 className="h-8 w-8 text-indigo-200" />
                      </motion.div>
                      <div>
                        <div className="text-4xl font-black tracking-tight">BizQuest</div>
                        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-300">
                          AI market intelligence
                        </div>
                      </div>
                    </div>

                    <div className="glass-tab rounded-full border border-white/10 p-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={openDesktopSignIn}
                          className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={openDesktopSignUp}
                          className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900 shadow-[0_8px_20px_rgba(255,255,255,0.12)] transition-colors hover:bg-slate-100"
                        >
                          Sign Up
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,0.86fr)_minmax(420px,1.04fr)]">
                    <div className="flex flex-col justify-between">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        Market clarity, faster
                      </div>

                      <h1 className="hero-glow mt-6 max-w-[470px] text-[3.8rem] font-black leading-[0.92] tracking-[-0.05em] text-white">
                        Launch with signal,
                        <span className="animated-gradient-text mt-2 block">
                          not guesswork.
                        </span>
                      </h1>

                      <p className="mt-5 max-w-[470px] text-lg leading-8 text-slate-300">
                        BizQuest helps founders assess demand, competition, and timing before they commit money to a market.
                      </p>

                      <div className="mt-7 grid grid-cols-3 gap-3">
                        {TRUST_METRICS.map((metric, index) => (
                          <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 + index * 0.07 }}
                            className={`calm-surface rounded-[22px] border border-white/8 px-4 py-4 text-center ${index === 1 ? 'floating-panel-delayed' : 'floating-panel'}`}
                          >
                            <div className="text-xl font-black text-white">{metric.value}</div>
                            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">{metric.label}</div>
                            <div className="mt-1 text-xs text-slate-500">{metric.note}</div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-7 grid gap-3">
                        {VALUE_PILLARS.slice(0, 2).map((card, index) => (
                          <motion.div
                            key={card.title}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.18 + index * 0.08 }}
                            className={`calm-surface flex items-start gap-4 rounded-[24px] border border-white/10 px-5 py-4 ${index === 0 ? 'floating-panel' : 'floating-panel-delayed'}`}
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-indigo-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                              {card.icon}
                            </div>
                            <div>
                              <div className="text-base font-semibold text-white">{card.title}</div>
                              <p className="mt-1 text-sm leading-6 text-slate-300">{card.body}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                        <div className="mt-4 rounded-[26px] border border-cyan-400/12 bg-cyan-400/8 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                            <div>
                              <div className="text-sm font-semibold text-white">Start with a quick sign in</div>
                              <p className="mt-1 text-sm leading-6 text-slate-200">
                                Create an account or sign in to unlock your first market brief and keep everything in one workspace.
                              </p>
                            </div>
                          </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="floating-panel-delayed calm-surface w-full rounded-[36px] border border-white/10 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-200">Sample verdict</div>
                          </div>
                          <div className="live-data-pill rounded-full border border-cyan-300/18 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-100">
                            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                            Live data
                          </div>
                        </div>

                        <div className="mt-4">
                          <SampleVerdictDemo />
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

                      <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
                        <div className="floating-panel calm-surface rounded-[28px] border border-white/10 p-5">
                          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Why it feels premium</div>
                          <p className="mt-3 text-sm leading-7 text-slate-300">
                            Saved analysis history, clean verdict framing, and location-aware demand signals in one calm interface.
                          </p>
                        </div>

                        <div className="floating-panel-delayed calm-surface rounded-[28px] border border-white/10 p-5">
                          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Operator note</div>
                          <div className="mt-3 text-lg font-semibold text-white">Move early when timing is favorable.</div>
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
                <button
                  onClick={closeDesktopOverlay}
                  className="absolute right-5 top-5 z-20 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-700"
                >
                  Back
                </button>
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
