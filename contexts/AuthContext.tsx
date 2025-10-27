
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserPlan, KycStatus } from '../types';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        const userData: User = {
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          cpf_hash: profile.cpf_hash || '',
          state: profile.state || '',
          plan: (profile.plan as UserPlan) || UserPlan.GRATUITO,
          xp: profile.xp || 0,
          saldo: profile.saldo || 0,
          device_id: profile.device_id || '',
          kyc_status: (profile.kyc_status as KycStatus) || KycStatus.NAO_INICIADO,
          createdAt: new Date(profile.created_at),
          avatarUrl: profile.avatar_url,
          phone: profile.phone,
          city: profile.city,
          birthDate: profile.birth_date,
          nickname: profile.nickname,
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setLoading(true);
    try {
      const loggedInUser = await api.loginWithGoogle(credential);
      setUser(loggedInUser);
    } catch (error) {
      console.error("Google login failed:", error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    try {
      const { error } = await supabase
        .from('users_profile')
        .update({
          name: updates.name,
          email: updates.email,
          state: updates.state,
          city: updates.city,
          phone: updates.phone,
          nickname: updates.nickname,
          birth_date: updates.birthDate,
          avatar_url: updates.avatarUrl,
          plan: updates.plan,
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Update user failed:", error);
    }
  };

  const value = { user, loading, login, loginWithGoogle, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
