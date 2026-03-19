import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Database,
  Globe,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  credits: number;
  expiryDate: string | null;
  onRecharge: () => void;
  userEmail?: string;
  isAdmin?: boolean;
  onAdmin?: () => void;
  onSignOut?: () => void;
  followUpsLeft?: number;
  hasAnalysis?: boolean;
  onNewChat?: () => void;
}

const DATA_SOURCES = [
  'Real-time Google Search Trends',
  'SEO Keyword Volatility Index',
  'Web Traffic Heatmap Analytics',
  'Facebook Audience Psychographics',
  'Twitter/X Real-time Sentiment',
  'Instagram Visual Trend Analysis',
  'TikTok Viral Content Velocity',
  'Reddit Community Discussions',
  'Google Maps Foot Traffic Density',
  'Local Competitor Pricing Scraper',
  'Regional Zoning & Permit Data',
  'Urban Population Shift Patterns',
  'Geospatial Demand Clustering',
  'Inflation-Adjusted Spending Power',
  'Mobile Money (M-Pesa) Transaction Volume',
  'Micro-Economic Saturation Index',
  'Consumer Price Index (CPI) Correlation',
  'Jiji/Marketplace Inventory Levels',
  'Wholesale Supply Chain Telemetry',
  'Import/Export Trade Logistics',
  'Seasonal Consumer Behavior Models',
];

const SUGGESTIONS = [
  'Will a 10,000 KES portable blender sell well in Nairobi West?',
  'Is there demand for vegan bakeries in Karen?',
  'Competition for hardware stores in Thika?',
  'Market saturation for mobile accessories in CBD?',
];

const CREDIT_CAPACITY = 20;

const CreditArc: React.FC<{ credits: number; expiryDate: string | null; onClick: () => void }> = ({ credits, expiryDate, onClick }) => {
  const normalizedCredits = Math.max(0, credits);
  const maxCredits = Math.max(CREDIT_CAPACITY, normalizedCredits || CREDIT_CAPACITY);
  const progress = Math.min(normalizedCredits / maxCredits, 1);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const isLow = normalizedCredits <= 3;
  const strokeColor = isLow ? '#ef4444' : '#22d3ee';
  const days = expiryDate ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group flex flex-col items-center"
      title={`${normalizedCredits} of ${maxCredits} credits remaining`}
    >
      <div className="relative">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <div className={cn('absolute inset-0 flex items-center justify-center text-sm font-bold text-white', isLow && 'animate-[lowCredit_2s_ease-in-out_infinite]')}>
          {normalizedCredits}
        </div>
        <div className="workspace-tooltip pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] z-20 hidden -translate-x-1/2 whitespace-nowrap group-hover:block">
          {normalizedCredits} of {maxCredits} credits remaining
        </div>
      </div>
      {days && days > 0 ? <span className="mt-1 text-[10px] font-medium text-slate-500">{days}d left</span> : null}
    </motion.button>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  credits,
  expiryDate,
  onRecharge,
  userEmail,
  isAdmin,
  onAdmin,
  onSignOut,
  followUpsLeft = 0,
  hasAnalysis = false,
  onNewChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [loadingSource, setLoadingSource] = useState(DATA_SOURCES[0]);
  const [mode, setMode] = useState<'followup' | 'new'>('followup');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasAnalysis && followUpsLeft > 0) setMode('followup');
  }, [hasAnalysis, followUpsLeft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    let index = Math.floor(Math.random() * DATA_SOURCES.length);
    setLoadingSource(DATA_SOURCES[index]);

    const interval = window.setInterval(() => {
      index = (index + 1) % DATA_SOURCES.length;
      setLoadingSource(DATA_SOURCES[index]);
    }, 700);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  const isFollowUpMode = hasAnalysis && followUpsLeft > 0 && mode === 'followup';
  const canSend = credits > 0 || isFollowUpMode;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim() || isLoading || !canSend) return;

    const payload = mode === 'new' || !hasAnalysis || followUpsLeft <= 0 ? `__NEW__${inputText}` : inputText;
    onSendMessage(payload);
    setInputText('');
  };

  const handleSuggestionClick = (text: string) => {
    if (isLoading) return;
    setInputText(text);
    if (hasAnalysis && followUpsLeft > 0) setMode('followup');
    inputRef.current?.focus();
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('Facebook') || source.includes('Twitter') || source.includes('TikTok') || source.includes('Instagram') || source.includes('Reddit')) {
      return <Share2 className="h-4 w-4 text-cyan-300" />;
    }
    if (source.includes('Competitor') || source.includes('Logistics') || source.includes('Inventory') || source.includes('Supply') || source.includes('Scraper')) {
      return <Database className="h-4 w-4 text-emerald-300" />;
    }
    if (source.includes('Search') || source.includes('Trends') || source.includes('SEO') || source.includes('Traffic') || source.includes('Velocity')) {
      return <TrendingUp className="h-4 w-4 text-amber-300" />;
    }
    if (source.includes('Maps') || source.includes('Local') || source.includes('Regional') || source.includes('Geospatial') || source.includes('Urban')) {
      return <MapPin className="h-4 w-4 text-violet-300" />;
    }
    if (source.includes('Economic') || source.includes('Money') || source.includes('Spending') || source.includes('Price') || source.includes('Index')) {
      return <BarChart3 className="h-4 w-4 text-blue-300" />;
    }
    if (source.includes('Mobile') || source.includes('M-Pesa')) {
      return <Smartphone className="h-4 w-4 text-emerald-300" />;
    }
    return <Globe className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="workspace-chat-card">
      <div className="workspace-chat-header">
        <div className="flex items-center gap-3">
          <div className="workspace-brand-mark h-11 w-11 rounded-[14px]">
            <LineChartIcon />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-[-0.04em] text-white">BizQuest</h1>
            <div className="font-data flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              <span className="workspace-live-dot" />
              AI online
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(hasAnalysis || messages.length > 0) && onNewChat ? (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewChat}
              className="workspace-gradient-button"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              New chat
            </motion.button>
          ) : null}

          <CreditArc credits={credits} expiryDate={expiryDate} onClick={onRecharge} />

          <div className="hidden items-center gap-2 lg:flex">
            {isAdmin && onAdmin ? (
              <button onClick={onAdmin} className="workspace-icon-button" title="Admin panel">
                <Shield className="h-4 w-4" />
              </button>
            ) : null}
            {onSignOut ? (
              <button onClick={onSignOut} className="workspace-icon-button" title={userEmail || 'Sign out'}>
                <LogOut className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="workspace-chat-body">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="workspace-empty-state"
            >
              <div className="workspace-empty-icon">
                <Sparkles className="h-8 w-8 text-cyan-300" />
              </div>

              <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-white">Market command rail</h2>
              <p className="mt-3 max-w-[30ch] text-sm leading-7 text-slate-400">
                Ask one product and one location. BizQuest returns a clear read on whether the market deserves your attention.
              </p>

              <div className="mt-8 grid w-full max-w-md gap-2.5">
                {SUGGESTIONS.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + index * 0.08 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="workspace-suggestion-pill"
                  >
                    <span className="truncate">{suggestion}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-cyan-300 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : null}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn('workspace-message', msg.role === 'user' ? 'workspace-message-user' : 'workspace-message-assistant')}>
                {msg.role === 'assistant' ? (
                  <div className="workspace-assistant-badge">
                    <Bot className="h-4 w-4" />
                  </div>
                ) : null}

                <div
                  className={cn(
                    'max-w-none text-sm leading-7 md:text-[15px]',
                    msg.role === 'assistant'
                      ? 'prose prose-sm prose-invert prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-white'
                      : 'whitespace-pre-wrap text-white',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown disallowedElements={['script', 'iframe', 'object', 'embed', 'form']} unwrapDisallowed>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start">
              <div className="workspace-loading-card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="workspace-assistant-badge relative">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Analyzing market data</div>
                      <div className="font-data text-[10px] uppercase tracking-[0.22em] text-slate-500">AI agent</div>
                    </div>
                  </div>
                  <span className="workspace-live-chip">Live</span>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <div className="animate-spin">{getSourceIcon(loadingSource)}</div>
                  <span>Scanning {loadingSource}...</span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.45),rgba(16,185,129,0.95))]"
                    initial={{ width: '0%', x: '-100%' }}
                    animate={{ width: '50%', x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', repeatType: 'reverse' }}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <div className="workspace-input-bar">
        {hasAnalysis && followUpsLeft > 0 && credits > 0 ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
            <div className="workspace-mode-switch">
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={cn('workspace-mode-switch-track', mode === 'followup' ? 'left-[4px]' : 'left-[calc(50%)]')}
                style={{ width: 'calc(50% - 4px)' }}
              />

              <button type="button" onClick={() => setMode('followup')} className="workspace-mode-option">
                <MessageCircle className={cn('h-3.5 w-3.5', mode === 'followup' ? 'text-white' : 'text-slate-400')} />
                <span className={cn(mode === 'followup' ? 'text-white' : 'text-slate-400')}>Follow-up</span>
                <span className={cn('workspace-mode-chip', mode === 'followup' ? 'workspace-mode-chip-active' : '')}>{followUpsLeft} free</span>
              </button>

              <button type="button" onClick={() => setMode('new')} className="workspace-mode-option">
                <Plus className={cn('h-3.5 w-3.5', mode === 'new' ? 'text-white' : 'text-slate-400')} />
                <span className={cn(mode === 'new' ? 'text-white' : 'text-slate-400')}>New analysis</span>
                <span className={cn('workspace-mode-chip', mode === 'new' ? 'workspace-mode-chip-active' : '')}>1 credit</span>
              </button>
            </div>
          </motion.div>
        ) : null}

        {hasAnalysis && followUpsLeft > 0 && credits <= 0 ? (
          <div className="mb-3 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            <Zap className="h-3 w-3" />
            {followUpsLeft} free follow-up{followUpsLeft !== 1 ? 's' : ''} left
          </div>
        ) : null}

        {canSend ? (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="workspace-input-shell">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(event) => setInputText(event.target.value.slice(0, 500))}
                placeholder={isFollowUpMode ? 'Ask a follow-up about this analysis...' : 'Ask about any product & market...'}
                className="workspace-input"
                disabled={isLoading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="workspace-send-button"
            >
              {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Send className="h-5 w-5" />}
            </motion.button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="workspace-recharge-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Credits used up</div>
                <div className="text-xs text-slate-400">Recharge to run another full market analysis.</div>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onRecharge} className="workspace-recharge-button">
              Recharge
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

function LineChartIcon() {
  return <TrendingUp className="h-5 w-5" />;
}
