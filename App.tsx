import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Menu, X, Shield, LogOut, Sparkles, LineChart, ChevronRight, Moon, Sun, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { HistorySidebar } from './components/HistorySidebar';
import { DesktopHistoryMenu } from './components/DesktopHistoryMenu';
import { PaymentModal } from './components/PaymentModal';
import { AuthPage } from './components/AuthPage';
import { AdminPanel } from './components/AdminPanel';
import { AnalysisResult, ChatMessage, AnalysisHistoryItem } from './types';
import { analyzeMarketQuery } from './services/geminiService';
import { useAuth } from './lib/AuthContext';

function getHistoryKey(userId: string) {
  return `bizquest_history_${userId}`;
}

function loadHistory(userId: string): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(getHistoryKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt data
  }
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
  const [workspaceTheme, setWorkspaceTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = window.localStorage.getItem('bizquest_workspace_theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const credits = profile?.credits ?? 0;

  useEffect(() => {
    if (user?.id) {
      setHistory(loadHistory(user.id));
      setMessages([]);
      setCurrentAnalysis(null);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getHistoryKey(user.id), JSON.stringify(history));
    }
  }, [history, user?.id]);

  useEffect(() => {
    window.localStorage.setItem('bizquest_workspace_theme', workspaceTheme);
    document.documentElement.style.colorScheme = workspaceTheme;
  }, [workspaceTheme]);

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
              await refreshProfile();
            } else {
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
  }, [profile, addCredits, refreshProfile]);

  const handlePaymentSuccess = async (serverCredited?: boolean) => {
    if (serverCredited) {
      await refreshProfile();
    } else {
      await addCredits(5);
    }
    setIsPaymentOpen(false);
  };

  const handleSendMessage = async (rawText: string) => {
    const forceNew = rawText.startsWith('__NEW__');
    const text = forceNew ? rawText.slice(7) : rawText;
    const isFollowUp = !forceNew && currentAnalysis && followUpsLeft > 0;

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

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      if (isFollowUp && currentAnalysis) {
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

        setFollowUpsLeft((prev) => prev - 1);

        const assistantMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const result = await analyzeMarketQuery(text, user?.id);

        const deducted = await deductCredit();
        if (!deducted) {
          await refreshProfile();
        }

        setCurrentAnalysis(result);
        setFollowUpsLeft(MAX_FOLLOWUPS);

        const assistantMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: result.chatResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const historyItem: AnalysisHistoryItem = {
          ...result,
          id: uuidv4(),
          userQuestion: text,
          createdDate: new Date(),
        };
        setHistory((prev) => [historyItem, ...prev]);

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
      console.error('Error processing request', error);
      const message = error instanceof Error ? error.message : 'I encountered an error. Please try again.';
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `${message} No credit was deducted.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
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

  const startNewChat = () => {
    setMessages([]);
    setCurrentAnalysis(null);
    setFollowUpsLeft(0);
  };

  const toggleWorkspaceTheme = () => {
    setWorkspaceTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (loading) {
    return (
      <div className="workspace-page flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
          <p className="text-sm font-medium text-slate-400">Loading BizQuest...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  if (showAdmin && profile.is_admin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="workspace-page flex min-h-screen w-screen flex-col overflow-x-hidden lg:h-screen lg:overflow-hidden" data-workspace-theme={workspaceTheme}>
      <div className="workspace-grid" />
      <div className="workspace-noise" />
      <div className="workspace-orb workspace-orb-cyan" />
      <div className="workspace-orb workspace-orb-violet" />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      <div className="workspace-mobile-header flex lg:hidden">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="workspace-icon-button h-11 w-11 rounded-xl p-0"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="workspace-brand-mark h-10 w-10 rounded-[14px]">
              <LineChart className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-[-0.04em] text-white">BizQuest</div>
              <div className="font-data text-[10px] uppercase tracking-[0.24em] text-slate-500">Workspace</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsSidebarOpen(true)}
            className="workspace-icon-button h-11 w-11 rounded-xl p-0"
            title="View history"
          >
            <History className="h-5 w-5" />
          </motion.button>

          <button
            type="button"
            onClick={toggleWorkspaceTheme}
            className="workspace-theme-toggle h-11 px-3"
            title={workspaceTheme === 'dark' ? 'Switch to light mode' : 'Switch to night mode'}
          >
            {workspaceTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {profile.is_admin ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowAdmin(true)}
              className="workspace-icon-button h-11 w-11 rounded-xl p-0"
            >
              <Shield className="h-5 w-5" />
            </motion.button>
          ) : null}

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={signOut}
            className="workspace-icon-button h-11 w-11 rounded-xl p-0"
          >
            <LogOut className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      <div className="relative z-20 hidden px-6 pt-6 lg:block">
        <div className="workspace-topbar mx-auto flex w-full max-w-[1680px] items-center justify-between gap-4">
          <div className="workspace-topbar-main">
            <div className="workspace-brand-mark h-12 w-12 rounded-[16px]">
              <LineChart className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-[1.45rem] font-semibold tracking-[-0.05em] text-white">BizQuest</h1>
                <div className="workspace-section-pill">
                  <Sparkles className="h-3.5 w-3.5" />
                  Workspace
                </div>
              </div>
              <div className="workspace-topbar-subline">Operator workspace</div>
            </div>
          </div>

          <div className="workspace-topbar-actions">
            <div className="workspace-operator-inline">
              <div className="h-9 w-9 rounded-full bg-white/6 ring-1 ring-white/10" />
              <div className="min-w-0">
                <div className="font-data text-[10px] uppercase tracking-[0.22em] text-slate-500">Operator</div>
                <div className="truncate text-sm font-semibold text-white">{profile.email}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleWorkspaceTheme}
              className="workspace-theme-toggle"
              title={workspaceTheme === 'dark' ? 'Switch to light mode' : 'Switch to night mode'}
            >
              {workspaceTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden xl:inline">{workspaceTheme === 'dark' ? 'Light' : 'Night'}</span>
            </button>

            {profile.is_admin ? (
              <button onClick={() => setShowAdmin(true)} className="workspace-icon-button" title="Admin panel">
                <Shield className="h-4 w-4" />
              </button>
            ) : null}

            <button onClick={signOut} className="workspace-icon-button" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>

            <DesktopHistoryMenu history={history} onSelect={loadFromHistory} onClear={clearHistory} />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <HistorySidebar
          history={history}
          onSelect={loadFromHistory}
          onClear={clearHistory}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        <main className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4 pt-4 lg:flex-row lg:overflow-hidden lg:px-6 lg:pb-6 lg:pt-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex min-h-[52vh] w-full flex-shrink-0 flex-col lg:h-full lg:min-h-0 lg:w-[34%]"
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
              onNewChat={startNewChat}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="workspace-results-shell min-h-[60vh] w-full lg:h-full lg:min-h-0 lg:w-[66%]"
          >
            <div className="mb-4 flex items-center justify-between gap-4 lg:hidden">
              <div>
                <div className="workspace-section-pill">
                  <Sparkles className="h-3.5 w-3.5" />
                  Results
                </div>
                <h2 className="mt-3 font-display text-[1.75rem] font-semibold tracking-[-0.05em] text-white">
                  Market intelligence, organized
                </h2>
              </div>
              <button type="button" className="workspace-inline-history" onClick={() => setIsSidebarOpen(true)}>
                History
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Dashboard data={currentAnalysis} />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default App;
