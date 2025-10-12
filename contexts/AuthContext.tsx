
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserPlan, KycStatus } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    const checkSession = async () => {
      try {
        const loggedInUser = await api.checkSession();
        setUser(loggedInUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const loggedInUser = await api.login(email, pass);
      setUser(loggedInUser);
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await api.updateUser(updates);
      setUser(updatedUser);
    } catch (error) {
      console.error("Update user failed:", error);
      throw error;
    }
  };

  const value = { user, loading, login, logout, updateUser };

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
