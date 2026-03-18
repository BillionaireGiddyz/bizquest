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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface DashboardProps {
  data: AnalysisResult | null;
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

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  if (!data) {
    const steps = [
      { icon: <Search className="w-6 h-6" />, gradient: 'from-indigo-500 to-blue-600', glow: 'shadow-indigo-500/25', ring: 'ring-indigo-100', num: '1', title: 'Ask Your Question', desc: 'Type any product + location to analyze' },
      { icon: <Activity className="w-6 h-6" />, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/25', ring: 'ring-violet-100', num: '2', title: 'AI Analyzes Market', desc: 'Real-time data from 20+ intelligence sources' },
      { icon: <Lightbulb className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/25', ring: 'ring-emerald-100', num: '3', title: 'Get Your Verdict', desc: 'GO / BE CAREFUL / AVOID with full breakdown' },
    ];

    return (
      <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-100/40 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-100/30 rounded-full blur-3xl"
          />
        </div>

        <div className="absolute inset-0 bg-slate-50/30 pattern-grid-lg opacity-[0.04]" />

        <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative mb-6"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-2xl"
            />
            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-300/40">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-2"
          >
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              How{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                BizQuest
              </span>
              {' '}Works
            </h3>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-500 mb-10"
          >
            Premium AI market intelligence in seconds
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 w-full mb-10 relative">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
              className="hidden sm:block absolute top-7 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-indigo-200 via-violet-200 to-emerald-200 origin-left z-0"
            />

            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 0.6 + idx * 0.2,
                }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
                className="relative z-10 flex-1 flex flex-row sm:flex-col items-center gap-3 sm:gap-0 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-slate-200/80 transition-all cursor-default group sm:mx-2"
              >
                <div className="relative shrink-0">
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg ring-4 ring-offset-2 transition-shadow group-hover:shadow-xl',
                      step.gradient,
                      step.glow,
                      step.ring,
                    )}
                  >
                    {step.icon}
                  </motion.div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.9 + idx * 0.2 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md"
                  >
                    {step.num}
                  </motion.span>
                </div>
                <div className="text-left sm:text-center sm:mt-4">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">{step.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 backdrop-blur-sm rounded-full border border-slate-100"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-indigo-500"
            />
            <span className="text-xs text-slate-500">
              Try: <span className="text-indigo-600 font-semibold">"Will vegan cookies sell well in Karen, Nairobi?"</span>
            </span>
          </motion.div>
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
            <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
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
            <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-500" />
                Target Demographic
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{data.targetDemographic}</p>
            </motion.div>
          )}

          {data.bestSellingChannels && data.bestSellingChannels.length > 0 && (
            <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
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

      <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          Market Interest Trend (6 Months)
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff', color: '#1e293b', padding: '12px' }}
                cursor={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="interestLevel"
                stroke="#f59e0b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorInterest)"
                dot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b', stroke: '#fff' }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Search Interest</span>
          </div>
          {data.googleTrendsAvg > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">Avg: {data.googleTrendsAvg}/100</span>
            </div>
          )}
          {data.trendDirection && data.trendDirection !== 'stable' && (
            <div className="flex items-center gap-2">
              <span className={data.trendDirection === 'rising' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {data.trendDirection === 'rising' ? '↑ Rising' : '↓ Declining'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
