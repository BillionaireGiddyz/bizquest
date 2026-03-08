
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { HistorySidebar } from './components/HistorySidebar';
import { PaymentModal } from './components/PaymentModal';
import { AuthPage } from './components/AuthPage';
import { AdminPanel } from './components/AdminPanel';
import { AnalysisResult, ChatMessage, AnalysisHistoryItem } from './types';
import { analyzeMarketQuery } from './services/geminiService';
import { useAuth } from './lib/AuthContext';
import { Menu, X, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

function getHistoryKey(userId: string) {
  return `bizquest_history_${userId}`;
}

function loadHistory(userId: string): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(getHistoryKey(userId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return [];
}

const MAX_FOLLOWUPS = 3;

const App: React.FC = () => {
  const { user, profile, loading, signOut, deductCredit, addCredits, refreshProfile } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [followUpsLeft, setFollowUpsLeft] = useState(0);

  const credits = profile?.credits ?? 0;

  // Load history for the current user and reset chat on user change
  useEffect(() => {
    if (user?.id) {
      setHistory(loadHistory(user.id));
      setMessages([]);
      setCurrentAnalysis(null);
    }
  }, [user?.id]);

  // Persist history scoped to user
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getHistoryKey(user.id), JSON.stringify(history));
    }
  }, [history, user?.id]);

  // Handle Stripe redirect — wait for profile to be loaded before crediting
  const stripeHandled = useRef(false);
  useEffect(() => {
    if (!profile || stripeHandled.current) return;

    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId) {
      stripeHandled.current = true;
      window.history.replaceState({}, '', window.location.pathname);

      (async () => {
        try {
          const res = await fetch('/api/stripe-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json() as { paid?: boolean; credits?: number; serverCredited?: boolean };
          if (data.paid) {
            if (data.serverCredited) {
              // Credits added server-side — just refresh the profile
              await refreshProfile();
            } else {
              // Fallback: server couldn't update, add client-side
              await addCredits(data.credits || 5);
            }
          }
        } catch (err) {
          console.error('Stripe verification failed:', err);
        }
      })();
    } else if (payment === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [profile]);

  const handlePaymentSuccess = async (serverCredited?: boolean) => {
    if (serverCredited) {
      await refreshProfile();
    } else {
      // Fallback: server couldn't update, add client-side
      await addCredits(5);
    }
    setIsPaymentOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    // Check if this is a follow-up or a new analysis
    const isFollowUp = currentAnalysis && followUpsLeft > 0;

    if (!isFollowUp && credits <= 0) {
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
      if (isFollowUp && currentAnalysis) {
        // ── Follow-up: cheap text-only Gemini call ──
        const res = await fetch('/api/followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text,
            analysisContext: {
              productName: currentAnalysis.productName,
              location: currentAnalysis.location,
              demandScore: currentAnalysis.demandScore,
              competitionLevel: currentAnalysis.competitionLevel,
              recommendation: currentAnalysis.recommendation,
              explanation: currentAnalysis.explanation,
            },
          }),
        });

        const data = await res.json() as { response?: string; error?: string };
        const reply = data.response || data.error || 'Could not process follow-up.';

        setFollowUpsLeft(prev => prev - 1);

        const assistantMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);

      } else {
        // ── New analysis: full pipeline ──
        // Deduct credit BEFORE the call so users can't bypass by closing the tab mid-request
        const deducted = await deductCredit();
        if (!deducted) {
          await refreshProfile();
        }

        let result;
        try {
          result = await analyzeMarketQuery(text);
        } catch (apiError) {
          // Refund the credit if analysis fails
          if (deducted) {
            await addCredits(1);
          }
          throw apiError;
        }

        setCurrentAnalysis(result);
        setFollowUpsLeft(MAX_FOLLOWUPS);

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

        // Log to trending (fire-and-forget)
        fetch('/api/trending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: result.productName,
            location: result.location,
            recommendation: result.recommendation,
            demandScore: result.demandScore,
          }),
        }).catch(() => {});
      }

    } catch (error) {
      console.error("Error processing request", error);
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again — if a credit was used, it has been refunded.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: AnalysisHistoryItem) => {
    setCurrentAnalysis(item);
    setFollowUpsLeft(MAX_FOLLOWUPS);
  };

  const clearHistory = () => {
    setHistory([]);
    if (user?.id) localStorage.removeItem(getHistoryKey(user.id));
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading BizQuest...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user || !profile) {
    return <AuthPage />;
  }

  // Admin panel
  if (showAdmin && profile.is_admin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

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
        <div className="flex items-center gap-2">
          {profile.is_admin && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAdmin(true)}
              className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Shield className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={signOut}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
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
              credits={credits}
              expiryDate={profile.credits_expire_at}
              onRecharge={() => setIsPaymentOpen(true)}
              userEmail={profile.email}
              isAdmin={profile.is_admin}
              onAdmin={() => setShowAdmin(true)}
              onSignOut={signOut}
              followUpsLeft={followUpsLeft}
              hasAnalysis={!!currentAnalysis}
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
