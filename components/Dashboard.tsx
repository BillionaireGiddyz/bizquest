import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../types';
import { MetricCard } from './MetricCard';
import { RecommendationBlock } from './RecommendationBlock';
import {
  RadialBarChart,
  RadialBar,
  Legend,
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Search,
  ArrowRight,
  Lightbulb,
  Users,
  ShoppingBag,
  MapPin,
  Globe,
  Store,
  ShieldCheck,
  Zap,
  Package,
  CreditCard,
  Rocket,
  Megaphone,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface DashboardProps {
  data: AnalysisResult | null;
  onExamplePromptSelect?: (text: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getActionIcon(bullet: string) {
  const content = bullet.toLowerCase();

  if (/(inventory|product|stock|stationery)/.test(content)) {
    return { icon: <Package className="h-4 w-4" />, color: 'text-blue-400' };
  }
  if (/(m-pesa|payment|till|cash|mobile money)/.test(content)) {
    return { icon: <CreditCard className="h-4 w-4" />, color: 'text-emerald-400' };
  }
  if (/(pilot|launch|scale|rollout|start)/.test(content)) {
    return { icon: <Rocket className="h-4 w-4" />, color: 'text-violet-400' };
  }
  if (/(marketing|instagram|social|ads)/.test(content)) {
    return { icon: <Megaphone className="h-4 w-4" />, color: 'text-amber-400' };
  }
  if (/(location|estate|area|town)/.test(content)) {
    return { icon: <MapPin className="h-4 w-4" />, color: 'text-blue-400' };
  }

  return { icon: <ArrowRight className="h-4 w-4" />, color: 'text-blue-400' };
}

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-white/10 bg-[#1e2433] px-3 py-2 text-white shadow-xl">
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      <div className="mt-1 text-sm font-bold">Interest: {payload[0].value}</div>
    </div>
  );
};

const TrendDot = ({ cx, cy }: any) => {
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#f59e0b"
      stroke="#1f2937"
      strokeWidth={1.5}
      style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' }}
    />
  );
};

const ActiveTrendDot = ({ cx, cy }: any) => {
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill="#f59e0b"
      stroke="#0f172a"
      strokeWidth={2}
      style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.72))' }}
    />
  );
};

function getRecommendationSummary(data: AnalysisResult) {
  if (data.recommendation === 'GO') {
    return `Signal supports moving forward in ${data.location}, but with a focused offer and disciplined launch instead of a broad rollout.`;
  }

  if (data.recommendation === 'BE CAREFUL') {
    return 'The opportunity is real, but the market setup asks for a smaller validation move before you scale budget or inventory.';
  }

  return 'The current setup is too risky relative to the upside, so the best next move is to reposition or narrow the idea before committing.';
}

function getRecommendationBullets(data: AnalysisResult) {
  const bullets = [
    data.keyInsights?.[0] || 'Start with one clear offer instead of trying to serve every segment at once.',
    data.bestSellingChannels?.[0]
      ? `Use ${data.bestSellingChannels[0]} as the first traction channel and keep the message tightly focused.`
      : 'Choose one primary acquisition channel first so the signal stays easy to read.',
    data.trendDirection === 'rising'
      ? 'Launch while demand momentum is working for you, but keep the first test deliberately small.'
      : data.trendDirection === 'declining'
        ? 'Lower initial risk and validate the offer before spending aggressively.'
        : 'Run a short pilot first, then scale only if repeat demand appears.',
  ];

  return bullets.slice(0, 3);
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onExamplePromptSelect }) => {
  if (!data) {
    const examplePrompt = 'Will vegan cookies sell well in Karen, Nairobi?';
    const steps = [
      {
        icon: <Search className="h-6 w-6" />,
        accent: 'empty-step-card-indigo',
        iconShell: 'from-indigo-500 to-blue-600',
        badge: 'bg-indigo-500/18 text-indigo-100 ring-1 ring-indigo-400/30',
        num: '1',
        title: 'Ask Your Question',
        desc: 'Type any product + location to analyze',
      },
      {
        icon: <Activity className="h-6 w-6" />,
        accent: 'empty-step-card-purple',
        iconShell: 'from-violet-500 to-purple-600',
        badge: 'bg-violet-500/18 text-violet-100 ring-1 ring-violet-400/30',
        num: '2',
        title: 'AI Analyzes Market',
        desc: 'Real-time data from 20+ intelligence sources',
      },
      {
        icon: <Lightbulb className="h-6 w-6" />,
        accent: 'empty-step-card-green',
        iconShell: 'from-emerald-500 to-teal-600',
        badge: 'bg-emerald-500/18 text-emerald-100 ring-1 ring-emerald-400/30',
        num: '3',
        title: 'Get Your Verdict',
        desc: 'GO / BE CAREFUL / AVOID with full breakdown',
      },
    ];

    return (
      <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-[28px] border border-white/6 bg-[#0a0d14] px-5 py-8 text-center text-white shadow-[0_28px_70px_rgba(2,6,23,0.28)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 terminal-dot-grid opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-0 noise-surface opacity-70" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-y-20 left-0 w-40 bg-[radial-gradient(circle,_rgba(99,102,241,0.1),_transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 bg-[radial-gradient(circle,_rgba(16,185,129,0.12),_transparent_70%)] blur-3xl" />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">
          <div className="empty-state-icon-wrap mb-6">
            <div className="empty-state-icon-shell flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_18px_42px_rgba(109,40,217,0.38)]">
              <Zap className="h-8 w-8" />
            </div>
          </div>

          <div className="empty-state-title mb-2">
            <h3 className="text-[2rem] font-extrabold tracking-tight text-white sm:text-[2.25rem]">
              How{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                BizQuest
              </span>{' '}
              Works
            </h3>
          </div>

          <p className="empty-state-subtitle mb-10 max-w-xl text-sm leading-6 text-white/70 sm:text-[15px]">
            Premium AI market intelligence in seconds
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-3 lg:flex-row lg:gap-4">
            {steps.map((step, idx) => (
              <div key={step.num} className="empty-flow-group flex w-full max-w-[21rem] flex-col items-center gap-3 lg:flex-1 lg:flex-row lg:gap-4">
                <div className="flex w-full flex-col items-center lg:flex-1">
                  <div className={cn('empty-step-card relative w-full rounded-[24px] border p-5 text-left', step.accent, `step-card-${step.num}`)}>
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className={cn('relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]', step.iconShell)}>
                        {step.icon}
                        <span className={cn('empty-step-badge absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold backdrop-blur-md transition-transform duration-[250ms]', step.badge)}>
                          {step.num}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-base font-semibold tracking-tight text-white">{step.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{step.desc}</p>
                  </div>
                </div>

                {idx < steps.length - 1 ? (
                  <div className="flex items-center justify-center lg:self-center">
                    <svg className="empty-flow-connector hidden lg:block" width="44" height="12" viewBox="0 0 44 12" fill="none" aria-hidden="true">
                      <line className="empty-flow-line" x1="2" y1="6" x2="34" y2="6" />
                      <polygon className="empty-flow-arrow" points="34,2 42,6 34,10" />
                    </svg>
                    <svg className="empty-flow-connector lg:hidden" width="12" height="34" viewBox="0 0 12 34" fill="none" aria-hidden="true">
                      <line className="empty-flow-line" x1="6" y1="2" x2="6" y2="24" />
                      <polygon className="empty-flow-arrow" points="2,24 6,32 10,24" />
                    </svg>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onExamplePromptSelect?.(examplePrompt)}
            className="example-prompt-pill mt-10 inline-flex max-w-full items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-slate-300 transition-all duration-200 hover:bg-[rgba(59,130,246,0.08)] hover:text-white"
          >
            <span className="example-prompt-dot h-2 w-2 rounded-full bg-blue-400" />
            <span className="truncate">
              Try: <span className="font-semibold text-blue-300">{examplePrompt}</span>
            </span>
            <ArrowRight className="example-prompt-arrow h-4 w-4 shrink-0 text-blue-400" />
          </button>
        </div>
      </div>
    );
  }

  const getRecIcon = (rec: string) => {
    if (rec === 'GO') return <CheckCircle className="w-5 h-5" />;
    if (rec === 'AVOID') return <XCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getRecColorInfo = (rec: string) => {
    if (rec === 'GO') return { bg: 'bg-emerald-600', text: 'text-white', shadow: 'shadow-emerald-200', border: 'border-emerald-500' };
    if (rec === 'AVOID') return { bg: 'bg-rose-600', text: 'text-white', shadow: 'shadow-rose-200', border: 'border-rose-500' };
    return { bg: 'bg-amber-500', text: 'text-white', shadow: 'shadow-amber-200', border: 'border-amber-400' };
  };

  const recColors = getRecColorInfo(data.recommendation);

  const comparisonData = [
    { name: 'Demand', value: data.demandScore, fullMark: 100 },
    { name: 'Saturation', value: data.saturationLevel === 'High' ? 80 : data.saturationLevel === 'Medium' ? 50 : 20, fullMark: 100 },
    { name: 'Competition', value: data.competitionLevel === 'High' ? 85 : data.competitionLevel === 'Medium' ? 55 : 25, fullMark: 100 },
  ];

  const saturationValue = data.saturationLevel === 'High' ? 85 : data.saturationLevel === 'Medium' ? 55 : 20;

  const processedTrendData = React.useMemo(() => {
    if (!data.trendData || data.trendData.length === 0) return [];
    const periods = data.trendData.map((d) => d.period);
    if (new Set(periods).size === periods.length) return data.trendData;
    const counts: Record<string, number> = {};
    return data.trendData.map((point) => {
      counts[point.period] = (counts[point.period] || 0) + 1;
      return { ...point, period: `${point.period} W${counts[point.period]}` };
    });
  }, [data.trendData]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-10 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
    >
      <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
              <span className="bg-slate-100 px-2 py-1 rounded-md">{data.location === 'General' ? 'Global Analysis' : data.location}</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <span className="text-violet-600 bg-violet-50 px-2 py-1 rounded-md">{data.priceRange}</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
              {data.productName}
            </h2>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1',
              recColors.bg,
              recColors.text,
              recColors.shadow,
              recColors.border,
            )}
          >
            {getRecIcon(data.recommendation)}
            {data.recommendation}
          </motion.div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-[1.5px]">
          <div className="rounded-[10px] bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-25" />
                <div className="relative w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Verified by Live Data
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Real-time market intelligence powered by BizQuest AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Demand Score"
          value={data.demandScore}
          color={data.demandScore > 70 ? 'success' : data.demandScore < 40 ? 'danger' : 'warning'}
          delay={0.1}
        />
        <MetricCard
          label="Saturation"
          value={data.saturationLevel}
          color={data.saturationLevel === 'Low' ? 'success' : data.saturationLevel === 'High' ? 'danger' : 'warning'}
          delay={0.2}
        />
        <MetricCard
          label={data.competitorCount > 0 ? `Competition (${data.competitorCount} nearby)` : 'Competition'}
          value={data.competitionLevel}
          color={data.competitionLevel === 'Low' ? 'success' : data.competitionLevel === 'High' ? 'danger' : 'warning'}
          delay={0.3}
        />
        <MetricCard
          label="Market Timing"
          value={data.timingStatus}
          icon={<TrendingUp className="w-4 h-4" />}
          color={data.timingStatus === 'Early' ? 'success' : 'warning'}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[24rem]">
        <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center gap-8 hover:shadow-md transition-shadow">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Demand vs Saturation</h4>

          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-700">Demand Intensity</span>
              <span className="text-sm font-bold text-emerald-600">{data.demandScore}%</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.demandScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-emerald-500 rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite_linear]" style={{ transform: 'skewX(-20deg)' }} />
              </motion.div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-700">Market Saturation</span>
              <span className="text-sm font-bold text-amber-600">{saturationValue}%</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${saturationValue}%` }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                className="h-full bg-amber-500 rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite_linear]" style={{ transform: 'skewX(-20deg)' }} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <h4 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">Market Force Analysis</h4>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" barSize={20} data={comparisonData} startAngle={90} endAngle={-270}>
                <RadialBar
                  label={{ position: 'insideStart', fill: '#1e293b', fontSize: 10, fontWeight: 'bold' }}
                  background={{ fill: '#f1f5f9' }}
                  dataKey="value"
                  cornerRadius={12}
                >
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#f43f5e'} />
                  ))}
                </RadialBar>
                <Legend
                  iconSize={8}
                  layout="vertical"
                  verticalAlign="middle"
                  wrapperStyle={{ right: 0, color: '#64748b', fontSize: '12px', fontWeight: 500 }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <RecommendationBlock
        heading={data.recommendation === 'GO' ? 'What to do next' : data.recommendation === 'BE CAREFUL' ? 'Proceed carefully' : 'Before you move'}
        summary={getRecommendationSummary(data)}
        bullets={getRecommendationBullets(data)}
        getIcon={getActionIcon}
      />

      <motion.div variants={item} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-violet-500 transition-all group-hover:w-2"></div>
        <h4 className="text-indigo-900 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
          <Search className="w-4 h-4" />
          Analyst Summary
        </h4>
        <div className="prose prose-sm prose-slate prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-strong:font-bold prose-strong:text-slate-900 text-slate-600 leading-relaxed font-medium max-w-none">
          <ReactMarkdown disallowedElements={['script', 'iframe', 'object', 'embed', 'form']} unwrapDisallowed>
            {data.explanation}
          </ReactMarkdown>
        </div>
      </motion.div>

      {(data.keyInsights || data.targetDemographic || data.bestSellingChannels) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.keyInsights && data.keyInsights.length > 0 && (
            <motion.div variants={item} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.45)]" />
                Key Insights
              </h4>
              <ul className="space-y-2.5">
                {data.keyInsights.map((insight, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {data.targetDemographic && (
            <motion.div variants={item} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-500 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.45)]" />
                Target Demographic
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{data.targetDemographic}</p>
            </motion.div>
          )}

          {data.bestSellingChannels && data.bestSellingChannels.length > 0 && (
            <motion.div variants={item} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-500 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]" />
                Best Selling Channels
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.bestSellingChannels.map((channel, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                    {channel}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {((data.nearbyCompetitors && data.nearbyCompetitors.length > 0) || (data.relatedSearches && data.relatedSearches.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.nearbyCompetitors && data.nearbyCompetitors.length > 0 && (
            <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Store className="w-4 h-4 text-rose-500" />
                Nearby Competitors
                <span className="ml-auto text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold border border-rose-200">
                  {data.competitorCount} found within 3km
                </span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.nearbyCompetitors.map((name, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {data.relatedSearches && data.relatedSearches.length > 0 && (
            <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                Related Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.relatedSearches.map((q, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                    {q}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      <motion.div variants={item} className="bg-[#111827] p-6 rounded-2xl border border-white/6 shadow-[0_18px_48px_-24px_rgba(2,6,23,0.65)] hover:shadow-[0_20px_52px_-24px_rgba(2,6,23,0.72)] transition-shadow">
        <h4 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          Market Interest Trend (6 Months)
        </h4>
        <div className="h-64 w-full rounded-2xl border border-white/6 bg-[#0d1117] px-3 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                domain={[0, 100]}
              />
              <Tooltip
                content={<TrendTooltip />}
                cursor={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="interestLevel"
                stroke="#f59e0b"
                strokeWidth={3}
                style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.4))' }}
                fillOpacity={1}
                fill="url(#colorInterest)"
                dot={<TrendDot />}
                activeDot={<ActiveTrendDot />}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Search Interest</span>
          </div>
          {data.googleTrendsAvg > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-bold text-amber-300">Avg: {data.googleTrendsAvg}/100</span>
            </div>
          )}
          {data.trendDirection && data.trendDirection !== 'stable' && (
            <div className="flex items-center gap-2">
              <span className={data.trendDirection === 'rising' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {data.trendDirection === 'rising' ? '↑ Rising' : '↓ Declining'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
