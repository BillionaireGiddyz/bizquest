
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { HistorySidebar } from './components/HistorySidebar';
import { PaymentModal } from './components/PaymentModal';
import { AnalysisResult, ChatMessage, AnalysisHistoryItem, SubscriptionState } from './types';
import { analyzeMarketQuery } from './services/geminiService';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Subscription State
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    const saved = localStorage.getItem('bizquest_sub');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default start state: 0 credits (force paywall interaction per request)
    return { credits: 0, expiryDate: null, isPremium: false }; 
  });

  // Save subscription on change
  useEffect(() => {
    localStorage.setItem('bizquest_sub', JSON.stringify(subscription));
  }, [subscription]);

  // Check expiration logic
  const checkExpiry = () => {
    if (subscription.expiryDate) {
      const now = new Date();
      const expiry = new Date(subscription.expiryDate);
      if (now > expiry) {
        setSubscription({ credits: 0, expiryDate: null, isPremium: false });
        return true;
      }
    }
    return false;
  };

  // Check expiration on mount
  useEffect(() => {
    checkExpiry();
  }, []);

  const handlePaymentSuccess = () => {
    const now = new Date();
    const expiry = new Date(now.setDate(now.getDate() + 30)); // 30 Days from now
    
    setSubscription(prev => ({
      credits: prev.credits + 5,
      expiryDate: expiry.toISOString(),
      isPremium: true
    }));
    setIsPaymentOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    // Check expiry before processing
    if (checkExpiry()) {
        setIsPaymentOpen(true);
        return;
    }

    // Double check credits
    if (subscription.credits <= 0) {
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

    // Deduct Credit
    setSubscription(prev => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));

    try {
      // Call AI Service
      const result = await analyzeMarketQuery(text);
      
      // Update Current Dashboard
      setCurrentAnalysis(result);

      // Create Assistant Response
      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: result.chatResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Add to History
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
        content: "I'm sorry, I encountered an error analyzing that request. Please try again.",
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

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden text-slate-800 relative">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-grid-lg opacity-[0.03] pointer-events-none" />

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
