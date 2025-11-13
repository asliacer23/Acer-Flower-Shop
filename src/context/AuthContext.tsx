import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('flower-shop-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simple authentication - use email as stable ID
    const mockUser: User = {
      id: email, // Use email as stable identifier
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'buyer',
      wishlist: [],
    };
    
    localStorage.setItem('flower-shop-user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Simple registration - use email as stable ID
    const mockUser: User = {
      id: email, // Use email as stable identifier
      email,
      name,
      role: 'buyer',
      wishlist: [],
    };
    
    localStorage.setItem('flower-shop-user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signOut = () => {
    localStorage.removeItem('flower-shop-user');
    setUser(null);
  };

  const hasRole = (role: UserRole) => {
    if (!user) return role === 'guest';
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, hasRole }}>
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
