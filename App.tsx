
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { HistorySidebar } from './components/HistorySidebar';
import { PaymentModal } from './components/PaymentModal';
import { AnalysisResult, ChatMessage, AnalysisHistoryItem, SubscriptionState } from './types';
import { analyzeMarketQuery } from './services/geminiService';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const HISTORY_KEY = 'bizquest_history';
const SUB_KEY = 'bizquest_sub';

function loadHistory(): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return [];
}

function loadSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { credits: 3, expiryDate: null, isPremium: false };
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(loadHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionState>(loadSubscription);

  const subscriptionRef = useRef(subscription);
  subscriptionRef.current = subscription;

  // Persist subscription
  useEffect(() => {
    localStorage.setItem(SUB_KEY, JSON.stringify(subscription));
  }, [subscription]);

  // Persist history
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Check expiration — uses ref to avoid stale closure
  const checkExpiry = useCallback(() => {
    const sub = subscriptionRef.current;
    if (sub.expiryDate) {
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      if (now > expiry) {
        setSubscription({ credits: 0, expiryDate: null, isPremium: false });
        return true;
      }
    }
    return false;
  }, []);

  // Check expiration on mount
  useEffect(() => {
    checkExpiry();
  }, [checkExpiry]);

  const handlePaymentSuccess = () => {
    const now = new Date();
    const expiry = new Date(now.setDate(now.getDate() + 30));

    setSubscription(prev => ({
      credits: prev.credits + 5,
      expiryDate: expiry.toISOString(),
      isPremium: true
    }));
    setIsPaymentOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    if (checkExpiry()) {
      setIsPaymentOpen(true);
      return;
    }

    if (subscriptionRef.current.credits <= 0) {
      setIsPaymentOpen(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await analyzeMarketQuery(text);

      // Deduct credit AFTER successful response (fixes race condition)
      setSubscription(prev => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));

      setCurrentAnalysis(result);

      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: result.chatResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      const historyItem: AnalysisHistoryItem = {
        ...result,
        id: uuidv4(),
        userQuestion: text,
        createdDate: new Date(),
      };
      setHistory(prev => [historyItem, ...prev]);

    } catch (error) {
      console.error("Error processing request", error);
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error analyzing that request. Please try again — your credit has not been deducted.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: AnalysisHistoryItem) => {
    setCurrentAnalysis(item);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden text-slate-800 relative">

      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-grid-lg opacity-[0.03] pointer-events-none" />

      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 z-50" />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-md p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
          <span className="font-bold text-slate-800 text-lg tracking-tight">BizQuest</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar (History) */}
        <HistorySidebar
          history={history}
          onSelect={loadFromHistory}
          onClear={clearHistory}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-6 w-full max-w-[1600px] mx-auto overflow-hidden">

          {/* Left Panel: Chat */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-[35%] flex-shrink-0 h-[45vh] lg:h-full flex flex-col"
          >
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              credits={subscription.credits}
              expiryDate={subscription.expiryDate}
              onRecharge={() => setIsPaymentOpen(true)}
            />
          </motion.div>

          {/* Right Panel: Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-[65%] h-[55vh] lg:h-full bg-transparent p-1"
          >
            <Dashboard data={currentAnalysis} />
          </motion.div>

        </main>
      </div>
    </div>
  );
};

export default App;
