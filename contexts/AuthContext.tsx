import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PlanTier } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => void;
  upgradePlan: (tier: PlanTier) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'user_123',
  name: 'Cave Explorer',
  email: 'explorer@modocaverna.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CaveMind',
  planTier: 'free',
  authProvider: 'google'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cavemind_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser = { ...MOCK_USER, authProvider: provider };
    setUser(newUser);
    localStorage.setItem('cavemind_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cavemind_user');
  };

  const upgradePlan = async (tier: PlanTier) => {
    if (!user) return;
    setIsLoading(true);
    // Simulate Stripe processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedUser = { ...user, planTier: tier };
    setUser(updatedUser);
    localStorage.setItem('cavemind_user', JSON.stringify(updatedUser));
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, upgradePlan }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};