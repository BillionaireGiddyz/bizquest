
import React, { useEffect, useRef, useState } from 'react';
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
  CircleDot,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type View = 'auth' | 'forgot' | 'forgot-sent' | 'signup-confirm';
type MobileStage = 'welcome' | 'form';
type DesktopStage = 'welcome' | 'form';

const VALUE_PILLARS = [
  {
    id: 'demand',
    title: 'Demand scoring in seconds',
    body: 'Pressure-test product ideas before you spend on stock, ads, or rent.',
    badge: 'Verified by live data',
  },
  {
    id: 'location',
    title: 'Location-aware verdicts',
    body: 'See how opportunity changes by town, estate, and customer profile.',
  },
  {
    id: 'summary',
    title: 'Decision-grade summaries',
    body: 'Clear GO, BE CAREFUL, and AVOID guidance with supporting context.',
  },
];

const TRUST_METRICS = [
  { label: 'Free credits', value: '3', note: 'on sign up', countTo: 3 },
  { label: 'Follow-ups', value: '3', note: 'per analysis', countTo: 3 },
  { label: 'Decision time', value: '<60s', note: 'to first brief', countTo: 60, prefix: '<', suffix: 's' },
];

const OPPORTUNITY_SIGNALS = [
  { label: 'Demand pulse', value: '74 / 100', tone: 'text-emerald-300' },
  { label: 'Competition', value: 'Moderate', tone: 'text-amber-300' },
  { label: 'Timing', value: 'Early', tone: 'text-cyan-300' },
];

const SAMPLE_QUESTION = 'Will a portable blender sell well in Nairobi West?';
const SAMPLE_TITLE = 'Portable blender in Nairobi West';
const SAMPLE_VERDICT = 'Analysis indicates a strong trend in Nairobi West';
const SAMPLE_HINT = 'Healthy signal density, manageable pressure, and more beneath the surface';

const HERO_WORDS = ['Enter', 'a', 'market', 'with', 'conviction.'];

function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return [ref, isVisible] as const;
}

const AnimatedCounter: React.FC<{
  active: boolean;
  countTo: number;
  prefix?: string;
  suffix?: string;
}> = ({ active, countTo, prefix = '', suffix = '' }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let current = 0;
    const duration = 1200;
    const frame = 1000 / 60;
    const step = Math.max(1, Math.ceil(countTo / (duration / frame)));

    const timer = window.setInterval(() => {
      current += step;
      if (current >= countTo) {
        setValue(countTo);
        window.clearInterval(timer);
      } else {
        setValue(current);
      }
    }, frame);

    return () => window.clearInterval(timer);
  }, [active, countTo]);

  return <>{`${prefix}${value}${suffix}`}</>;
};

const LiveSignalBadge: React.FC<{ label?: string; compact?: boolean }> = ({ label = 'Live', compact = false }) => (
  <div className={`terminal-live-pill inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${compact ? 'text-[10px] tracking-[0.26em]' : 'text-[11px] tracking-[0.3em]'} font-bold uppercase text-emerald-100`}>
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
    </span>
    {label}
  </div>
);

const AnimatedHeroHeadline: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <h1 className={`hero-glow font-display relative text-white ${compact ? 'mt-4 text-[2.35rem] leading-[0.96] tracking-[-0.04em]' : 'mt-7 max-w-[620px] text-[4.25rem] leading-[0.9] tracking-[-0.055em]'}`}>
    {HERO_WORDS.map((word, index) => (
      <motion.span
        key={word}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 + index * 0.08, duration: 0.45, ease: 'easeOut' }}
        className={`mr-[0.18em] inline-block ${word === 'conviction.' ? 'animated-gradient-text' : ''}`}
      >
        {word}
      </motion.span>
    ))}
  </h1>
);

const MetricStrip: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [ref, isVisible] = useInViewOnce<HTMLDivElement>();

  return (
    <div ref={ref} className={`terminal-metric-strip relative grid grid-cols-3 ${compact ? 'gap-2.5' : 'gap-3'}`}>
      <div className="pointer-events-none absolute inset-y-4 left-1/3 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent md:block" />
      <div className="pointer-events-none absolute inset-y-4 left-2/3 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent md:block" />
      {TRUST_METRICS.map((metric, index) => (
        <div
          key={metric.label}
          className={`terminal-metric-card rounded-[22px] border text-center ${compact ? 'px-3 py-3.5' : 'px-4 py-4.5'}`}
          style={{ transitionDelay: `${index * 120}ms` }}
        >
          <div className={`${compact ? 'text-base' : 'text-xl'} font-black text-white`}>
            {metric.countTo ? (
              <AnimatedCounter
                active={isVisible}
                countTo={metric.countTo}
                prefix={metric.prefix}
                suffix={metric.suffix}
              />
            ) : (
              metric.value
            )}
          </div>
          <div className={`font-data mt-1 uppercase text-slate-400 ${compact ? 'text-[10px] tracking-[0.24em]' : 'text-[10px] tracking-[0.22em]'}`}>
            {metric.label}
          </div>
          <div className={`mt-1 text-slate-500 ${compact ? 'text-[11px]' : 'text-xs'}`}>{metric.note}</div>
        </div>
      ))}
    </div>
  );
};

const FeaturePreviewCard: React.FC<{
  id: string;
  title: string;
  body: string;
  compact?: boolean;
  badge?: string;
  index: number;
  visible: boolean;
}> = ({ id, title, body, compact = false, badge, index, visible }) => {
  return (
    <div
      className={`terminal-feature-card group rounded-[24px] border border-white/10 ${compact ? 'px-4 py-4' : 'px-5 py-4.5'} transition-all duration-500`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transitionDelay: `${index * 120}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`font-data text-slate-400 uppercase ${compact ? 'text-[10px] tracking-[0.24em]' : 'text-[10px] tracking-[0.26em]'}`}>
            {title}
          </div>
          <div className={`mt-2 font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>{body}</div>
        </div>
        {badge && <div className="terminal-verified-badge rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100">{badge}</div>}
      </div>

      <div className={`mt-4 ${compact ? 'min-h-[74px]' : 'min-h-[88px]'}`}>
        {id === 'demand' && (
          <div className="flex items-center gap-4">
            <div className={`terminal-ring relative flex items-center justify-center rounded-full ${compact ? 'h-14 w-14' : 'h-16 w-16'}`}>
              <div className="terminal-ring-inner flex h-[calc(100%-8px)] w-[calc(100%-8px)] items-center justify-center rounded-full bg-slate-950/75 font-black text-emerald-200">
                78
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span>Demand score</span>
                <span className="text-emerald-300">Rising</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/8">
                <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,0.5),rgba(16,185,129,1))]" />
              </div>
            </div>
          </div>
        )}

        {id === 'location' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="terminal-tag rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100">
                Karen, Nairobi
              </span>
              <span className="terminal-tag rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100">
                KES 450-7,500
              </span>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 text-sm text-slate-300">
              Location shifts the verdict by estate, price band, and customer density.
            </div>
          </div>
        )}

        {id === 'summary' && (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/14 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              GO
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded-full bg-white/10" />
              <div className="h-3 w-4/5 rounded-full bg-white/7 blur-[0.5px]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ValueRail: React.FC<{ compact?: boolean; limit?: number }> = ({ compact = false, limit = VALUE_PILLARS.length }) => {
  const [ref, isVisible] = useInViewOnce<HTMLDivElement>();

  return (
    <div ref={ref} className={`grid ${compact ? 'gap-2.5' : 'gap-3'}`}>
      {VALUE_PILLARS.slice(0, limit).map((card, index) => (
        <FeaturePreviewCard
          key={card.title}
          id={card.id}
          title={card.title}
          body={card.body}
          compact={compact}
          badge={card.badge}
          index={index}
          visible={isVisible}
        />
      ))}
    </div>
  );
};

const SampleVerdictDemo: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <>
      <div className={`rounded-[22px] border border-white/10 bg-slate-950/24 ${compact ? 'px-3 py-3' : 'px-4 py-4'}`}>
        <div className="demo-question-shell">
          <div className="flex items-center justify-between gap-3">
            <div className="font-data flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              <CircleDot className="h-3.5 w-3.5 text-cyan-300/80" />
              Market query
            </div>
            <div className="font-data rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
              Live scan
            </div>
          </div>
          <div className={`mt-2 font-medium text-white ${compact ? 'min-h-[52px] text-sm leading-6' : 'min-h-[64px] text-[1rem] leading-7'}`}>
            <span className={compact ? 'demo-type-line-compact' : 'demo-type-line'}>
              {SAMPLE_QUESTION}
            </span>
          </div>
          <div className="demo-analyze-stage">
            <div className="font-data text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Checking live signals</div>
            <div className="mt-2 text-[11px] text-slate-300">Checking demand, competition, and timing signals.</div>
            <div className="demo-progress-track mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div className="demo-progress-fill h-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="demo-answer-stage mt-4">
        <div className="flex items-start justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4">
          <div>
            <div className="font-data flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">
              <LineChart className="h-4 w-4" />
              Sample verdict
            </div>
            <div className={`mt-2 font-semibold text-white ${compact ? 'text-base' : 'text-[2rem] leading-tight'}`}>{SAMPLE_TITLE}</div>
            <div className={`mt-1 text-slate-300 ${compact ? 'text-sm leading-6' : 'text-sm leading-7'}`}>
              <span className="font-medium text-emerald-200">{SAMPLE_VERDICT}</span>
              <span className="demo-ellipsis ml-1 inline-flex">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
              <div className="mt-1 text-slate-400/90">{SAMPLE_HINT}</div>
            </div>
          </div>
          <div className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
            GO
          </div>
        </div>
      </div>

      <div className="gradient-divider my-4" />

      <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-3'}`}>
        {OPPORTUNITY_SIGNALS.map((signal, index) => (
          <div
            key={signal.label}
            className={`demo-signal-stage rounded-[22px] border border-white/8 bg-white/[0.05] ${index === 1 ? 'demo-signal-stage-2' : index === 2 ? 'demo-signal-stage-3' : ''} ${compact ? 'px-3 py-3' : 'px-4 py-4'}`}
          >
            <div className={`font-data font-bold uppercase text-slate-400 ${compact ? 'text-[10px] tracking-[0.18em]' : 'text-[10px] tracking-[0.2em]'}`}>
              {signal.label}
            </div>
            <div className={`mt-2 font-bold ${signal.tone} ${compact ? 'text-sm' : 'text-lg'}`}>{signal.value}</div>
          </div>
        ))}
      </div>
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
      <div className="font-body relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6">
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
    <div className="font-body relative min-h-screen overflow-hidden bg-slate-950 px-4 py-5 lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,_rgba(99,102,241,0.18),_transparent_24%),radial-gradient(circle_at_82%_14%,_rgba(34,211,238,0.12),_transparent_20%),linear-gradient(145deg,#020617_0%,#0b1120_42%,#111827_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.09),_transparent_58%)]" />
      <div className="pointer-events-none absolute left-[10%] top-[16%] h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[12%] top-[20%] h-44 w-44 rounded-full bg-cyan-400/8 blur-3xl" />
      <div className="terminal-dot-grid pointer-events-none absolute inset-0 opacity-[0.04]" />
      <div className="pointer-events-none noise-surface absolute inset-0 opacity-35" />

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1480px] items-center">
        <div className="w-full">
          <div className="lg:hidden">
            {showMobileWelcome ? (
              <section className="auth-stage-panel premium-shadow overflow-hidden rounded-[32px] border border-white/10 text-white">
                <div className="relative overflow-hidden px-5 pb-5 pt-6">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

                  <div className="relative mb-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openMobileAuth('signin', setView, setIsSignUp, setError, setMobileStage)}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-[0_10px_26px_rgba(255,255,255,0.16)] transition-transform active:scale-[0.98]"
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
                      <div className="glass-tab flex h-13 w-13 items-center justify-center rounded-[22px] border border-white/12">
                        <BarChart3 className="h-6 w-6 text-indigo-200" />
                      </div>
                      <div>
                        <div className="font-display text-2xl font-black tracking-tight">BizQuest</div>
                        <div className="font-data text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-300">
                          AI market intelligence
                        </div>
                      </div>
                    </div>
                    <LiveSignalBadge compact />
                  </div>

                  <div className="font-data mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-200">
                    <Sparkles className="h-3 w-3" />
                    Intelligence terminal
                  </div>

                  <AnimatedHeroHeadline compact />

                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                    The faster way to read demand, timing, and competitive pressure before money leaves the account.
                  </p>

                  <div className="mt-5">
                    <MetricStrip compact />
                  </div>

                  <div className="terminal-preview-panel mt-5 rounded-[28px] border border-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="font-data text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">Live analyst preview</div>
                      <LiveSignalBadge compact label="Live" />
                    </div>
                    <SampleVerdictDemo compact />
                  </div>

                  <div className="mt-5">
                    <ValueRail compact />
                  </div>

                  <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-slate-200">
                    Start with a quick sign in or create an account to unlock your first market brief and save every read in one place.
                  </div>
                </div>
              </section>
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
              <div
                className={`auth-stage-panel relative overflow-hidden rounded-[40px] border border-white/10 p-10 text-white premium-shadow transition-all duration-300 ${showDesktopOverlay ? 'scale-[0.985] opacity-45' : 'scale-100 opacity-100'}`}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
                <div className="terminal-dot-grid pointer-events-none absolute inset-0 opacity-[0.04]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.9),transparent)]" />

                <div className="relative">
                  <div className="terminal-nav sticky top-0 z-10 -mx-10 mb-8 flex items-center justify-between gap-6 px-10 py-4">
                    <div className="flex items-center gap-4">
                      <div className="glass-tab flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/12">
                        <BarChart3 className="h-8 w-8 text-indigo-200" />
                      </div>
                      <div>
                        <div className="font-display text-4xl font-black tracking-tight">BizQuest</div>
                        <div className="font-data mt-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-300">
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
                          className="terminal-signup-button rounded-full px-5 py-2 text-sm font-bold text-white shadow-[0_10px_26px_rgba(124,58,237,0.36)] transition-all"
                        >
                          Sign Up
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 grid items-start gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(470px,0.96fr)]">
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-3">
                        <LiveSignalBadge label="Live" />
                        <div className="font-data inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-200">
                          <Sparkles className="h-3.5 w-3.5" />
                          Intelligence terminal
                        </div>
                      </div>

                      <AnimatedHeroHeadline />

                      <p className="mt-5 max-w-[560px] text-lg leading-8 text-slate-300">
                        BizQuest reads a market like a premium analyst desk: one typed question, one live signal pass, one decisive answer.
                      </p>

                      <div className="mt-8">
                        <MetricStrip />
                      </div>

                      <div className="mt-8">
                        <ValueRail />
                      </div>

                      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.05] px-5 py-5">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                          <div>
                            <div className="text-sm font-semibold text-white">Start with a quick sign in</div>
                            <p className="mt-1 max-w-[520px] text-sm leading-6 text-slate-200">
                              Open the workspace, run a brief, inspect the verdict, and keep every read ready for your next move.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5">
                      <div className="terminal-preview-panel rounded-[34px] border border-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="terminal-tag rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-cyan-100">
                              Nairobi West, Kenya
                            </div>
                            <div className="terminal-tag rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-emerald-100">
                              Portable blender
                            </div>
                          </div>
                          <LiveSignalBadge label="Live" />
                        </div>

                        <div className="mt-5 max-w-[420px]">
                          <div className="font-data text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-200">Live analyst preview</div>
                          <h2 className="font-display mt-2 text-[2.15rem] font-semibold leading-tight text-white">Watch the read build itself in stages.</h2>
                          <p className="mt-3 text-sm leading-7 text-slate-300">
                            Type, scan, then surface a verdict with pressure, demand, and timing already framed.
                          </p>
                        </div>

                        <div className="mt-6">
                          <SampleVerdictDemo />
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                          <div className="terminal-mini-panel rounded-[22px] px-4 py-4">
                            <div className="font-data text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Decision style</div>
                            <div className="mt-2 text-sm font-semibold text-white">Calm, direct, signal-first</div>
                          </div>
                          <div className="terminal-mini-panel rounded-[22px] px-4 py-4">
                            <div className="font-data text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Output</div>
                            <div className="mt-2 text-sm font-semibold text-white">One brief, one verdict, zero clutter</div>
                          </div>
                          <div className="terminal-mini-panel rounded-[22px] px-4 py-4">
                            <div className="font-data text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Workspace value</div>
                            <div className="mt-2 text-sm font-semibold text-white">History, follow-ups, and live reads</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
                        <div className="calm-surface rounded-[28px] border border-white/10 p-5">
                          <div className="font-data text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Why this feels expensive</div>
                          <p className="mt-3 text-sm leading-7 text-slate-300">
                            The interface stays quiet while the important signals stay obvious: demand, competition, timing, and the final recommendation.
                          </p>
                        </div>

                        <div className="calm-surface rounded-[28px] border border-white/10 p-5">
                          <div className="font-data text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Operator note</div>
                          <div className="mt-3 text-lg font-semibold text-white">Confidence should arrive before spend.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {showDesktopOverlay && (
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 z-20 flex items-start justify-end bg-slate-950/40 px-8 pt-1 backdrop-blur-[20px]"
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
                      <div className="mt-3">
                        <LiveSignalBadge label="AI Online" compact />
                      </div>
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
                          className="terminal-cta-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-200/70 disabled:from-indigo-400 disabled:to-violet-400"
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
                        className="terminal-cta-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-200/70 disabled:from-indigo-400 disabled:to-violet-400"
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
