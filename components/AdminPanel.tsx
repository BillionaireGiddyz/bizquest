import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, Profile } from '../lib/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Search, Plus, Minus, Users, ArrowLeft, Coins } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creditAmount, setCreditAmount] = useState<Record<string, number>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data as Profile[]);
    }
    setLoading(false);
  };

  const updateCredits = async (userId: string, delta: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newCredits = Math.max(0, user.credits + delta);
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: newCredits } : u));
    }
  };

  const setCredits = async (userId: string) => {
    const amount = creditAmount[userId];
    if (amount === undefined || amount < 0) return;

    const { error } = await supabase
      .from('profiles')
      .update({ credits: amount })
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: amount } : u));
      setCreditAmount(prev => ({ ...prev, [userId]: 0 }));
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!profile?.is_admin) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>You don't have admin access.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-500" />
                Admin Panel
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage users and credits</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Users className="w-4 h-4" />
            {users.length} users
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading users...</div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 truncate">{user.email}</span>
                      {user.is_admin && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full">Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Credits Control */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <Coins className="w-4 h-4 text-indigo-500" />
                      <span className="font-bold text-slate-800 text-lg min-w-[2ch] text-center">{user.credits}</span>
                    </div>

                    {/* Quick +/- buttons */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateCredits(user.id, -1)}
                      className="p-2 bg-rose-50 border border-rose-100 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
                      title="Remove 1 credit"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateCredits(user.id, 1)}
                      className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-lg hover:bg-emerald-100 transition-colors"
                      title="Add 1 credit"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>

                    {/* Set exact credits */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={creditAmount[user.id] ?? ''}
                        onChange={(e) => setCreditAmount(prev => ({ ...prev, [user.id]: parseInt(e.target.value) || 0 }))}
                        placeholder="Set"
                        className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCredits(user.id)}
                        className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Set
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No users found matching "{search}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
