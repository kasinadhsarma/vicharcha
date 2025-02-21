import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      // Add your auth status check logic here
      setLoading(false);
    } catch (error) {
      console.error('Auth status check failed:', error);
      setLoading(false);
    }
  }

  async function login(credentials: any) {
    try {
      // Add your login logic here
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: '/placeholder-user.jpg',
        avatar: '/placeholder-user.jpg',
        phoneNumber: '+1234567890'
      };
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      // Add your logout logic here
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
