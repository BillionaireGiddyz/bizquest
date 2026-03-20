import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  LineChart,
  Lock,
  LogIn,
  Mail,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type PanelMode = 'signin' | 'signup' | 'forgot' | null;
type NoticeMode = 'signup-confirm' | 'forgot-sent' | null;

const HERO_WORDS = ['Read', 'the', 'signal', 'before', 'you', 'spend.'];
const SAMPLE_QUERY = 'Will a portable blender sell well in Nairobi West?';

const STATS = [
  { value: '3', label: 'Free credits', note: 'test one idea without spending first' },
  { value: '3', label: 'Follow-ups', note: 'push the answer before you commit' },
  { value: '<60s', label: 'First brief', note: 'from query to verdict in one pass' },
];

const FEATURE_CARDS = [
  {
    eyebrow: 'Demand scoring',
    title: 'See if demand can carry the move.',
    body: 'Search pull, pricing pressure, and timing collapse into one read you can act on.',
    accent: 'cyan',
    badge: 'Verified by live data',
    preview: 'score',
  },
  {
    eyebrow: 'Location-aware verdicts',
    title: 'Get the answer for one place, not the whole city.',
    body: 'Estate, town, and price band shift the verdict faster than most founders expect.',
    accent: 'violet',
    preview: 'location',
  },
  {
    eyebrow: 'Decision-grade summary',
    title: 'Leave with a verdict, not a dashboard.',
    body: 'Every brief ends with a recommendation, rationale, and the next move worth testing.',
    accent: 'emerald',
    preview: 'verdict',
  },
];

const SIGNALS = [
  { label: 'Demand pulse', value: '74 / 100', tone: 'text-emerald-300' },
  { label: 'Competition', value: 'Moderate', tone: 'text-amber-300' },
  { label: 'Timing', value: 'Early', tone: 'text-cyan-300' },
];

const PROOF_ROWS = [
  {
    title: 'One question in',
    body: 'Ask with a product and a place. The system reads one market, not a vague category.',
    icon: Search,
    tone: 'text-cyan-300',
  },
  {
    title: 'One verdict out',
    body: 'You get a clear move. GO, BE CAREFUL, or AVOID. No spreadsheet archaeology.',
    icon: ShieldCheck,
    tone: 'text-emerald-300',
  },
  {
    title: 'One next move',
    body: 'You see what to test, what to watch, and what not to waste cash on.',
    icon: TrendingUp,
    tone: 'text-violet-300',
  },
];

const TERMINAL_NOTES = [
  {
    eyebrow: 'What BizQuest reads',
    title: 'Demand, pricing pressure, and competitor density.',
    body: 'The brief collapses multiple signals into one decision surface.',
  },
  {
    eyebrow: 'What you walk away with',
    title: 'Verdict, rationale, and next move.',
    body: 'Enough clarity to move forward or walk away cleanly.',
  },
];

const MOTION = {
  hero: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  panel: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

function openMessage(mode: NoticeMode) {
  if (mode === 'signup-confirm') {
    return {
      title: 'Check your inbox',
      body: 'Your confirmation link is on its way. Verify the email, then return to BizQuest.',
      icon: <Mail className="h-7 w-7 text-emerald-200" />,
      action: 'Open sign in',
    };
  }

  return {
    title: 'Recovery link sent',
    body: 'A secure reset link is on its way so you can reopen your workspace without friction.',
    icon: <KeyRound className="h-7 w-7 text-cyan-200" />,
    action: 'Back to sign in',
  };
}

const LiveBadge: React.FC<{ label?: string }> = ({ label = 'Live data' }) => (
  <div className="phantom-badge-live">
    <span className="phantom-badge-dot" />
    {label}
  </div>
);

const BrandMark: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <div className={`phantom-brand-mark ${compact ? 'h-11 w-11 rounded-[14px]' : 'h-14 w-14 rounded-[18px]'}`}>
      <LineChart className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
    </div>
    <div>
      <div className={`font-display font-semibold tracking-[-0.04em] text-white ${compact ? 'text-xl' : 'text-[2rem]'}`}>BizQuest</div>
      <div className="font-data text-[10px] uppercase tracking-[0.34em] text-slate-500">AI market intelligence</div>
    </div>
  </div>
);

const TerminalDemo: React.FC = () => (
  <div className="phantom-demo-shell">
    <div className="phantom-demo-header">
      <div className="font-data text-[10px] uppercase tracking-[0.28em] text-slate-400">Intelligence terminal</div>
      <LiveBadge label="Live" />
    </div>

    <div className="phantom-command-strip mt-5">
      <span className="phantom-tag">Nairobi West</span>
      <span className="phantom-tag phantom-tag-secondary">Portable blender</span>
      <span className="phantom-mini-badge">Decision-grade brief</span>
    </div>

    <div className="mt-6 rounded-[24px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-4">
      <div className="font-data flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
        Query
      </div>
      <div className="mt-3 min-h-[56px] text-base font-medium leading-7 text-white">
        <span className="demo-type-line">{SAMPLE_QUERY}</span>
      </div>
      <div className="demo-analyze-stage">
        <div className="font-data text-[10px] uppercase tracking-[0.22em] text-slate-400">Reading live signals</div>
        <div className="mt-2 text-sm text-slate-300">Scanning demand, price tolerance, and competitor pressure.</div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="demo-progress-fill h-full rounded-full" />
        </div>
      </div>
    </div>

    <div className="demo-answer-stage mt-4 rounded-[24px] border border-white/8 bg-[rgba(255,255,255,0.04)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-data text-[10px] uppercase tracking-[0.24em] text-cyan-200">Sample verdict</div>
          <div className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.04em] text-white">
            Portable blender in Nairobi West
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-300">
            <span className="font-semibold text-emerald-200">Analysis indicates a strong trend in Nairobi West</span>
            <span className="demo-ellipsis ml-1 inline-flex">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
            <div className="mt-1 text-slate-400">Enough signal to move, with more detail waiting in the full brief.</div>
          </div>
        </div>

        <div className="rounded-full bg-emerald-500/14 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">
          GO
        </div>
      </div>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {SIGNALS.map((signal, index) => (
        <div
          key={signal.label}
          className={`demo-signal-stage ${index === 1 ? 'demo-signal-stage-2' : index === 2 ? 'demo-signal-stage-3' : ''} rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.04)] p-4`}
        >
          <div className="font-data text-[10px] uppercase tracking-[0.22em] text-slate-400">{signal.label}</div>
          <div className={`mt-2 text-lg font-bold ${signal.tone}`}>{signal.value}</div>
        </div>
      ))}
    </div>
  </div>
);

const FeatureCard: React.FC<{
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  preview: string;
  badge?: string;
  index: number;
}> = ({ eyebrow, title, body, accent, preview, badge, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...MOTION.panel, delay: 0.18 + index * 0.08 }}
    className="phantom-feature-card"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-data text-[10px] uppercase tracking-[0.26em] text-slate-400">{eyebrow}</div>
        <h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{title}</h3>
      </div>
      {badge ? <div className="phantom-mini-badge">{badge}</div> : null}
    </div>
    <p className="mt-4 max-w-[38ch] text-sm leading-6 text-slate-400">{body}</p>

    <div className={`phantom-feature-preview phantom-feature-preview-${accent}`}>
      {preview === 'score' ? (
        <div className="flex items-center gap-4">
          <div className="phantom-score-ring">
            <div className="phantom-score-ring-inner">78</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Demand score</span>
              <span className="text-emerald-300">Rising</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/8">
              <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,0.55),rgba(16,185,129,1))]" />
            </div>
          </div>
        </div>
      ) : null}

      {preview === 'location' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="phantom-tag">Karen, Nairobi</span>
            <span className="phantom-tag phantom-tag-secondary">KES 450-7,500</span>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-slate-300">
            Location shifts the verdict by estate, price band, and foot traffic density.
          </div>
        </div>
      ) : null}

      {preview === 'verdict' ? (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/14 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            GO
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded-full bg-white/10" />
            <div className="h-3 w-4/5 rounded-full bg-white/7" />
          </div>
        </div>
      ) : null}
    </div>
  </motion.article>
);

const ProofRow: React.FC<{
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  index: number;
}> = ({ title, body, icon: Icon, tone, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...MOTION.panel, delay: 0.18 + index * 0.08 }}
    className="phantom-proof-row"
  >
    <div className={`phantom-proof-icon ${tone}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-400">{body}</div>
    </div>
  </motion.div>
);

const AuthModal: React.FC<{
  mode: Exclude<PanelMode, null>;
  loading: boolean;
  email: string;
  password: string;
  error: string;
  onClose: () => void;
  onModeChange: (mode: Exclude<PanelMode, null>) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}> = ({ mode, loading, email, password, error, onClose, onModeChange, onEmailChange, onPasswordChange, onSubmit }) => {
  const isForgot = mode === 'forgot';
  const isSignUp = mode === 'signup';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="phantom-modal-backdrop"
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={MOTION.panel}
        className="phantom-modal-card"
      >
        <button type="button" onClick={onClose} className="phantom-close-button" aria-label="Close authentication panel">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-data text-[10px] uppercase tracking-[0.28em] text-slate-400">Secure access</div>
            <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-white">
              {isForgot ? 'Recover access' : isSignUp ? 'Create your operator account' : 'Open your workspace'}
            </h2>
            <p className="mt-3 max-w-[36ch] text-sm leading-6 text-slate-400">
              {isForgot
                ? 'Enter the email tied to BizQuest and we will send a secure reset link.'
                : isSignUp
                  ? 'Start with free credits and read the market before you spend on stock, ads, or rent.'
                  : 'Continue your saved analyses, verdicts, and live market reads in one place.'}
            </p>
          </div>

          <LiveBadge label="AI online" />
        </div>

        {!isForgot ? (
          <div className="mt-8 inline-grid w-full grid-cols-2 rounded-full border border-white/8 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => onModeChange('signin')}
              className={`phantom-tab ${mode === 'signin' ? 'phantom-tab-active' : ''}`}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onModeChange('signup')}
              className={`phantom-tab ${mode === 'signup' ? 'phantom-tab-active' : ''}`}
            >
              <UserPlus className="h-4 w-4" />
              Sign up
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => onModeChange('signin')} className="mt-8 phantom-text-link">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to sign in
          </button>
        )}

        {error ? (
          <div className="mt-6 rounded-[18px] border border-rose-500/18 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>{error}</div>
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className="phantom-field-label">Email address</span>
            <span className="phantom-field">
              <Mail className="h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="you@example.com"
                className="phantom-input"
                required
                autoFocus
              />
            </span>
          </label>

          {!isForgot ? (
            <label className="block">
              <div className="flex items-center justify-between">
                <span className="phantom-field-label">Password</span>
                {!isSignUp ? (
                  <button type="button" onClick={() => onModeChange('forgot')} className="phantom-field-link">
                    Forgot password?
                  </button>
                ) : null}
              </div>
              <span className="phantom-field">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder={isSignUp ? 'Minimum 6 characters' : 'Your password'}
                  className="phantom-input"
                  required
                />
              </span>
            </label>
          ) : null}

          <button type="submit" disabled={loading} className="phantom-button-primary phantom-button-shine w-full">
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : (
              <>
                {isForgot ? <Mail className="h-4 w-4" /> : isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {isForgot ? 'Send reset link' : isSignUp ? 'Create account' : 'Sign in'}
              </>
            )}
          </button>
        </form>

        <div className="phantom-note-card mt-6">
          <div className="flex items-start gap-3">
            <div className="phantom-note-icon">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                {isSignUp ? 'You start with 3 free analysis credits.' : 'Your research stays in one workspace.'}
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-400">
                {isSignUp
                  ? 'Use them to pressure-test product ideas before cash leaves your pocket.'
                  : 'Credits, saved verdicts, and follow-up reads are kept in one calm operator view.'}
              </div>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 text-slate-500" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NoticeOverlay: React.FC<{ mode: NoticeMode; onContinue: () => void }> = ({ mode, onContinue }) => {
  const content = useMemo(() => openMessage(mode), [mode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="phantom-modal-backdrop"
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={MOTION.panel}
        className="phantom-notice-card"
      >
        <div className="phantom-notice-icon">{content.icon}</div>
        <h2 className="mt-6 text-[2rem] font-semibold tracking-[-0.04em] text-white">{content.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">{content.body}</p>
        <button type="button" onClick={onContinue} className="phantom-button-primary mt-8">
          {content.action}
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [noticeMode, setNoticeMode] = useState<NoticeMode>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openPanel = (mode: Exclude<PanelMode, null>) => {
    setPanelMode(mode);
    setError('');
    if (mode !== 'forgot') {
      setPassword('');
    }
  };

  const closePanel = () => {
    if (loading) return;
    setPanelMode(null);
    setError('');
    setPassword('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!panelMode) return;

    setError('');
    setLoading(true);

    if (panelMode === 'forgot') {
      const result = await resetPassword(email);
      if (result.error) {
        setError(result.error);
      } else {
        setNoticeMode('forgot-sent');
        setPanelMode(null);
      }
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (panelMode === 'signup') {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else if (!result.confirmed) {
        setNoticeMode('signup-confirm');
        setPanelMode(null);
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="phantom-page font-body">
      <div className="phantom-grid" />
      <div className="phantom-noise" />
      <div className="phantom-orb phantom-orb-cyan" />
      <div className="phantom-orb phantom-orb-violet" />

      <header className="phantom-nav-wrap">
        <div className="phantom-nav">
          <BrandMark compact />

          <div className="hidden items-center gap-3 md:flex">
            <LiveBadge />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="phantom-button-ghost" onClick={() => openPanel('signin')}>
              Sign in
            </button>
            <button type="button" className="phantom-button-primary phantom-button-shine" onClick={() => openPanel('signup')}>
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:gap-10 lg:pt-10">
        <section className="grid items-start gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={MOTION.hero}
            className="phantom-hero-shell"
          >
            <div className="phantom-hero-copy">
              <div className="phantom-section-label">
                <span className="phantom-section-label-dot" />
                Operator intelligence
              </div>

              <div className="mt-8">
                <h1 className="font-display text-[3.15rem] leading-[0.92] tracking-[-0.065em] text-white sm:text-[4.3rem] lg:max-w-[9ch] lg:text-[5.3rem]">
                  {HERO_WORDS.map((word, index) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.12 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className={`mr-[0.18em] inline-block ${word === 'spend.' ? 'animated-gradient-text' : ''}`}
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>
              </div>

              <p className="mt-8 max-w-[35rem] text-base leading-8 text-slate-300 sm:text-lg">
                BizQuest reads demand, timing, and pressure before cash leaves your pocket. You ask once. You get a move worth trusting.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" className="phantom-button-primary phantom-button-shine" onClick={() => openPanel('signup')}>
                  Start with 3 free credits
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" className="phantom-button-ghost" onClick={() => openPanel('signin')}>
                  Open your workspace
                </button>
              </div>
            </div>

            <div className="phantom-hero-brief">
              <div className="font-data text-[10px] uppercase tracking-[0.26em] text-slate-400">What the brief tells you</div>
              <div className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
                Enough signal to move forward. Enough pressure to stay disciplined.
              </div>
              <div className="mt-3 text-sm leading-7 text-slate-400">
                BizQuest makes the decision readable before you buy stock, rent space, or burn ad budget.
              </div>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...MOTION.panel, delay: 0.32 + index * 0.08 }}
                  className="phantom-stat-tile"
                >
                  <div className="text-[1.7rem] font-semibold tracking-[-0.04em] text-white">{stat.value}</div>
                  <div className="font-data mt-2 text-[10px] uppercase tracking-[0.24em] text-slate-400">{stat.label}</div>
                  <div className="mt-2 text-sm text-slate-500">{stat.note}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              {PROOF_ROWS.map((row, index) => (
                <ProofRow key={row.title} {...row} index={index} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...MOTION.hero, delay: 0.12 }}
            className="phantom-terminal-panel"
          >
            <div className="flex items-center justify-between gap-4">
              <BrandMark compact />
              <LiveBadge />
            </div>

            <TerminalDemo />

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {TERMINAL_NOTES.map((note) => (
                <div key={note.eyebrow} className="phantom-support-card">
                  <div className="font-data text-[10px] uppercase tracking-[0.24em] text-slate-400">{note.eyebrow}</div>
                  <div className="mt-3 text-base font-semibold leading-7 text-white">{note.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">{note.body}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...MOTION.panel, delay: 0.4 }}
            className="phantom-editorial-panel"
          >
            <div className="phantom-section-label">
              <span className="phantom-section-label-dot" />
              Why founders keep it open
            </div>
            <h2 className="mt-6 font-display text-[2.25rem] leading-[0.98] tracking-[-0.05em] text-white lg:max-w-[10ch]">
              One command rail. One market brief. One clean decision.
            </h2>
            <p className="mt-5 max-w-[42ch] text-sm leading-7 text-slate-300">
              You do not need another dashboard. You need to know if the move deserves time, attention, and cash. BizQuest gives you that answer fast.
            </p>

            <div className="phantom-editorial-grid mt-8">
              <div className="phantom-utility-panel">
                <TrendingUp className="h-5 w-5 text-cyan-300" />
                <div className="mt-5 text-sm font-semibold text-white">Read momentum early</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">Spot the difference between genuine pull and noisy curiosity.</p>
              </div>
              <div className="phantom-utility-panel">
                <MapPinned className="h-5 w-5 text-violet-300" />
                <div className="mt-5 text-sm font-semibold text-white">Respect geography</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">Estate, town, and price band can change the answer fast.</p>
              </div>
              <div className="phantom-utility-panel">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <div className="mt-5 text-sm font-semibold text-white">Move with evidence</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">Walk away with the verdict and the next move worth testing.</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-3">
            {FEATURE_CARDS.map((card, index) => (
              <FeatureCard key={card.eyebrow} {...card} index={index} />
            ))}
          </div>
        </section>

        <section className="phantom-bottom-cta">
          <div>
            <div className="font-data text-[10px] uppercase tracking-[0.26em] text-slate-400">Start clean</div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Open one brief. Read the signal. Move with a straight back.</div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" className="phantom-button-primary phantom-button-shine" onClick={() => openPanel('signup')}>
              Create account
            </button>
            <button type="button" className="phantom-button-ghost" onClick={() => openPanel('signin')}>
              Sign in
            </button>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {panelMode ? (
          <AuthModal
            mode={panelMode}
            loading={loading}
            email={email}
            password={password}
            error={error}
            onClose={closePanel}
            onModeChange={openPanel}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {noticeMode ? (
          <NoticeOverlay
            mode={noticeMode}
            onContinue={() => {
              setNoticeMode(null);
              openPanel('signin');
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
};
