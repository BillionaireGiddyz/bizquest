import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  credits: number;
  credits_expire_at: string | null;
  is_admin: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deductCredit: () => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
    return data as Profile;
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) setProfile(p);
  };

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user);
      let p = await fetchProfile(session.user.id);

      // Auto-create profile if it doesn't exist (e.g. signup before table existed)
      if (!p) {
        await supabase.from('profiles').insert({
          id: session.user.id,
          email: (session.user.email || '').toLowerCase(),
          credits: 3,
          is_admin: false,
        });
        p = await fetchProfile(session.user.id);
      }

      // Check and expire credits on login
      if (p) {
        p = await checkAndExpireCredits(p);
      }

      setProfile(p);
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string): Promise<{ error: string | null; confirmed?: boolean }> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    // Create profile with 3 free credits
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email.toLowerCase(),
          credits: 3,
          is_admin: false,
        });

      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('Profile creation error:', profileError);
      }
    }

    // If session exists, user was auto-confirmed (email confirmation disabled)
    const confirmed = !!data.session;
    return { error: null, confirmed };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Check if credits have expired and zero them out if so
  const checkAndExpireCredits = async (p: Profile): Promise<Profile> => {
    if (p.credits_expire_at && p.credits > 0) {
      const now = new Date();
      const expiry = new Date(p.credits_expire_at);
      if (now > expiry) {
        // Credits expired — zero them out server-side
        const { data } = await supabase
          .from('profiles')
          .update({ credits: 0, credits_expire_at: null })
          .eq('id', p.id)
          .select()
          .single();
        if (data) return data as Profile;
      }
    }
    return p;
  };

  const deductCredit = async (): Promise<boolean> => {
    if (!profile || profile.credits <= 0) return false;

    // Check expiry first
    if (profile.credits_expire_at) {
      const now = new Date();
      const expiry = new Date(profile.credits_expire_at);
      if (now > expiry) {
        const expired = await checkAndExpireCredits(profile);
        setProfile(expired);
        return false;
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', profile.id)
      .eq('credits', profile.credits) // Optimistic lock
      .select()
      .single();

    if (error || !data) return false;

    setProfile(data as Profile);
    return true;
  };

  const addCredits = async (amount: number) => {
    if (!profile) return;

    // Set expiry to 30 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        credits: profile.credits + amount,
        credits_expire_at: expiry.toISOString(),
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      deductCredit,
      addCredits,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
