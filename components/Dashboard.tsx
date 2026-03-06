import React from 'react';
import { AnalysisResult } from '../types';
import { MetricCard } from './MetricCard';
import { 
  RadialBarChart, RadialBar, Legend, AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Activity, Search, ArrowRight, Lightbulb, Users, ShoppingBag, Database, MapPin, Globe, Store } from 'lucide-react';
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
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/50 pattern-grid-lg opacity-20" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-full mb-6 shadow-xl shadow-indigo-100 relative z-10"
        >
            <Activity className="w-10 h-10 text-indigo-500" />
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Ready to Analyze</h3>
        <p className="max-w-md mt-2 text-slate-500 leading-relaxed relative z-10">
          Ask a question like <span className="text-indigo-600 font-medium">"Will vegan cookies sell well in downtown?"</span> to see a comprehensive market breakdown here.
        </p>
        
        <div className="mt-8 flex gap-2 relative z-10">
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
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

  // Prepare chart data
  const comparisonData = [
    { name: 'Demand', value: data.demandScore, fullMark: 100 },
    { name: 'Saturation', value: data.saturationLevel === 'High' ? 80 : data.saturationLevel === 'Medium' ? 50 : 20, fullMark: 100 },
    { name: 'Competition', value: data.competitionLevel === 'High' ? 85 : data.competitionLevel === 'Medium' ? 55 : 25, fullMark: 100 },
  ];

  const saturationValue = data.saturationLevel === 'High' ? 85 : data.saturationLevel === 'Medium' ? 55 : 20;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-10 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
    >
      
      {/* Header Info */}
      <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between group hover:shadow-md transition-shadow">
        <div>
           <div className="flex items-center gap-2 mb-2 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
            <span className="bg-slate-100 px-2 py-1 rounded-md">{data.location === 'General' ? 'Global Analysis' : data.location}</span>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{data.priceRange}</span>
           </div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
            {data.productName}
          </h2>
          {data.dataSources && data.dataSources.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Database className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verified by:</span>
              {data.dataSources.map((src, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200">
                  {src}
                </span>
              ))}
            </div>
          )}
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1",
            recColors.bg, recColors.text, recColors.shadow, recColors.border
          )}
        >
          {getRecIcon(data.recommendation)}
          {data.recommendation}
        </motion.div>
      </motion.div>

      {/* Metric Cards Grid */}
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

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[24rem]">
        
        {/* Demand vs Saturation Linear Bars */}
        <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center gap-8 hover:shadow-md transition-shadow">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Demand vs Saturation</h4>
          
          {/* Demand Bar */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-700">Demand Intensity</span>
              <span className="text-sm font-bold text-emerald-600">{data.demandScore}%</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${data.demandScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-500 rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite_linear]" style={{ transform: 'skewX(-20deg)' }} />
              </motion.div>
            </div>
          </div>

          {/* Saturation Bar */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-700">Market Saturation</span>
              <span className="text-sm font-bold text-amber-600">{saturationValue}%</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${saturationValue}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-amber-500 rounded-full relative overflow-hidden"
              >
                 <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite_linear]" style={{ transform: 'skewX(-20deg)' }} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Radial: Demand Strength */}
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
                  wrapperStyle={{right: 0, color: '#64748b', fontSize: '12px', fontWeight: 500}} 
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Summary Box */}
      <motion.div variants={item} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 transition-all group-hover:w-2"></div>
        <h4 className="text-indigo-900 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
          <Search className="w-4 h-4" />
          Analyst Summary
        </h4>
        <p className="text-slate-600 leading-relaxed font-medium">
          {data.explanation}
        </p>
      </motion.div>

      {/* Key Insights, Target Demographic & Selling Channels */}
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

      {/* Competitors & Related Searches */}
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
                Related Searches in Kenya
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

      {/* Trend Graph */}
      <motion.div variants={item} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          {data.dataSources?.includes('Google Trends') ? 'Google Trends — Real Search Interest' : 'Interest Trend Forecast (6 Months)'}
          {data.dataSources?.includes('Google Trends') && (
            <span className="ml-2 text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold border border-emerald-200">LIVE DATA</span>
          )}
        </h4>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
               <defs>
                 <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                   <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis 
                  dataKey="period" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dy={10} 
               />
               <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  domain={[0, 100]} 
               />
               <Tooltip 
                 contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff', color: '#1e293b', padding: '12px'}}
                 cursor={{stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '3 3'}}
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
             <span>{data.dataSources?.includes('Google Trends') ? 'Real Search Volume (Kenya)' : 'Historical Data'}</span>
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
