
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, Sparkles, Database, Search, Globe, Share2, Activity, Lock, Coins, TrendingUp, MapPin, BarChart3, Smartphone, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  credits: number;
  expiryDate: string | null;
  onRecharge: () => void;
}

const DATA_SOURCES = [
  // Search & Web Trends
  "Real-time Google Search Trends",
  "SEO Keyword Volatility Index",
  "Web Traffic Heatmap Analytics",
  
  // Social Media Intelligence
  "Facebook Audience Psychographics",
  "Twitter/X Real-time Sentiment",
  "Instagram Visual Trend Analysis",
  "TikTok Viral Content Velocity",
  "Reddit Community Discussions",
  
  // Local & Geospatial
  "Google Maps Foot Traffic Density",
  "Local Competitor Pricing Scraper",
  "Regional Zoning & Permit Data",
  "Urban Population Shift Patterns",
  "Geospatial Demand Clustering",
  
  // Economic & Financial
  "Inflation-Adjusted Spending Power",
  "Mobile Money (M-Pesa) Transaction Volume",
  "Micro-Economic Saturation Index",
  "Consumer Price Index (CPI) Correlation",
  
  // Supply Chain & Retail
  "Jiji/Marketplace Inventory Levels",
  "Wholesale Supply Chain Telemetry",
  "Import/Export Trade Logistics",
  "Seasonal Consumer Behavior Models"
];

const SUGGESTIONS = [
  "Will a 10,000 KES portable blender sell well in Nairobi West?",
  "Is there demand for vegan bakeries in Karen?",
  "Competition for hardware stores in Thika?",
  "Market saturation for mobile accessories in CBD?"
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, credits, expiryDate, onRecharge }) => {
  const [inputText, setInputText] = useState('');
  const [loadingSource, setLoadingSource] = useState(DATA_SOURCES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Dynamic loading source animation
  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    // Start with a random index to vary the starting point
    index = Math.floor(Math.random() * DATA_SOURCES.length);
    setLoadingSource(DATA_SOURCES[index]);

    const interval = setInterval(() => {
      index = (index + 1) % DATA_SOURCES.length;
      setLoadingSource(DATA_SOURCES[index]);
    }, 700); // 700ms per source for a snappy feel

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading && credits > 0) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleSuggestionClick = (text: string) => {
    if (!isLoading && credits > 0) {
      onSendMessage(text);
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes("Facebook") || source.includes("Twitter") || source.includes("TikTok") || source.includes("Instagram") || source.includes("Reddit")) {
        return <Share2 className="w-4 h-4 text-blue-500" />;
    }
    if (source.includes("Competitor") || source.includes("Logistics") || source.includes("Inventory") || source.includes("Supply") || source.includes("Scraper")) {
        return <Database className="w-4 h-4 text-emerald-500" />;
    }
    if (source.includes("Search") || source.includes("Trends") || source.includes("SEO") || source.includes("Traffic") || source.includes("Velocity")) {
        return <TrendingUp className="w-4 h-4 text-amber-500" />;
    }
    if (source.includes("Maps") || source.includes("Local") || source.includes("Regional") || source.includes("Geospatial") || source.includes("Urban")) {
        return <MapPin className="w-4 h-4 text-rose-500" />;
    }
    if (source.includes("Economic") || source.includes("Money") || source.includes("Spending") || source.includes("Price") || source.includes("Index")) {
        return <BarChart3 className="w-4 h-4 text-indigo-500" />;
    }
    if (source.includes("Mobile") || source.includes("M-Pesa")) {
        return <Smartphone className="w-4 h-4 text-green-600" />;
    }
    return <Globe className="w-4 h-4 text-slate-500" />;
  };

  const getDaysLeft = () => {
    if (!expiryDate) return 0;
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group/chat">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-100 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 cursor-pointer"
            >
              <span className="text-white font-black text-lg tracking-tight bg-gradient-to-tr from-indigo-400 to-white bg-clip-text text-transparent">BQ</span>
            </motion.div>
            <div>
              <h1 className="text-slate-800 font-bold text-xl leading-tight tracking-tight">BizQuest</h1>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">AI Online</span>
              </div>
            </div>
        </div>
        
        {/* Credits Display */}
        <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRecharge}
            className="flex flex-col items-end cursor-pointer group"
        >
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm",
              credits > 0 
                ? "bg-indigo-50 border-indigo-100 text-indigo-700 group-hover:bg-indigo-100 group-hover:shadow-indigo-100" 
                : "bg-rose-50 border-rose-100 text-rose-600 group-hover:bg-rose-100 animate-pulse"
            )}>
                <Coins className="w-4 h-4" />
                <span className="font-bold text-sm">{credits} Credits</span>
            </div>
            {expiryDate && credits > 0 && (
                <span className="text-[10px] text-slate-400 font-medium mr-2 mt-0.5">
                    {getDaysLeft()} days left
                </span>
            )}
        </motion.div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-6"
             >
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                 className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 border border-slate-200 shadow-lg shadow-indigo-500/5 relative overflow-hidden group"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <Sparkles className="w-8 h-8 text-indigo-500 relative z-10" />
               </motion.div>
               
               <h2 className="text-2xl font-bold text-slate-800 mb-3">Market Demand Assistant</h2>
               <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed mb-8">
                 Ask about any product and location to get instant market insights powered by real-time data.
               </p>

               <div className="grid gap-2 w-full max-w-sm">
                 {SUGGESTIONS.map((suggestion, idx) => (
                   <motion.button
                     key={idx}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2 + idx * 0.1 }}
                     whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => handleSuggestionClick(suggestion)}
                     className="text-left p-3 text-xs md:text-sm text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all flex items-center justify-between group"
                   >
                     <span className="truncate mr-2">{suggestion}</span>
                     <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                   </motion.button>
                 ))}
               </div>
             </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={cn(
                  "flex max-w-[90%] md:max-w-[85%] rounded-2xl p-4 shadow-sm relative group",
                  msg.role === 'user'
                    ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100"
                    : "bg-white text-slate-700 border border-slate-200 rounded-bl-none hover:shadow-md transition-shadow"
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="absolute -left-10 top-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-start w-full pl-10 relative"
            >
              <div className="absolute left-0 top-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 animate-pulse">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-5 shadow-sm flex flex-col gap-4 min-w-[280px] max-w-sm">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-slate-700">Analyzing Market Data</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">AI AGENT</span>
                </div>

                {/* Dynamic Loading Step */}
                <motion.div 
                  key={loadingSource}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100"
                >
                  <div className="animate-spin text-indigo-600">
                    {getSourceIcon(loadingSource)}
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-medium">
                    Scanning {loadingSource}...
                  </span>
                </motion.div>
                
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-indigo-500 rounded-full"
                     initial={{ width: "0%", x: "-100%" }}
                     animate={{ width: "50%", x: "100%" }}
                     transition={{ 
                       repeat: Infinity, 
                       duration: 1.5, 
                       ease: "easeInOut",
                       repeatType: "reverse"
                     }}
                   />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 relative z-20">
        {credits > 0 ? (
            <form onSubmit={handleSubmit} className="flex gap-3 relative">
            <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about product demand..."
                className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 text-sm shadow-sm hover:border-slate-300"
                disabled={isLoading}
            />
            <motion.button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:cursor-not-allowed text-white p-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center min-w-[52px]"
            >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
            </motion.button>
            </form>
        ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-4 p-3 bg-rose-50 border border-rose-100 rounded-xl shadow-sm"
            >
                <div className="flex items-center gap-3 pl-2">
                    <div className="p-2 bg-rose-100 rounded-full text-rose-500 animate-pulse">
                        <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-rose-700">Daily limit reached</span>
                      <span className="text-xs text-rose-600/80">Unlock unlimited searches instantly.</span>
                    </div>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRecharge}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-rose-200"
                >
                    Recharge
                </motion.button>
            </motion.div>
        )}
      </div>
    </div>
  );
};
