'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://datazen-saas.onrender.com';

export interface User {
  id: string;
  email: string;
  fullName: string;
  plan: 'free' | 'pro' | 'premium';
  requestsUsed: number;
  requestsLimit: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || 'Login failed';
        } catch (e) {
          errorMessage = `Login failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!data.access_token) {
        throw new Error('No authentication token received');
      }

      localStorage.setItem('authToken', data.access_token);

      // Transform user data to match our User interface
      const userData: User = {
        id: data.user?.id || 'unknown',
        email: data.user?.email || email,
        fullName: data.user?.full_name || 'User',
        plan: (data.user?.plan_id || 'free') as 'free' | 'pro' | 'premium',
        requestsUsed: data.user?.quota_used || 0,
        requestsLimit: data.user?.quota_limit || 50,
        createdAt: data.user?.created_at || new Date().toISOString()
      };

      setUser(userData);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password })
      });

      if (!response.ok) {
        let errorMessage = 'Signup failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || 'Signup failed';
        } catch (e) {
          errorMessage = `Signup failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!data.access_token) {
        throw new Error('No authentication token received');
      }

      localStorage.setItem('authToken', data.access_token);

      // Transform user data to match our User interface
      const userData: User = {
        id: data.user?.id || 'unknown',
        email: data.user?.email || email,
        fullName: data.user?.full_name || fullName,
        plan: (data.user?.plan_id || 'free') as 'free' | 'pro' | 'premium',
        requestsUsed: data.user?.quota_used || 0,
        requestsLimit: data.user?.quota_limit || 50,
        createdAt: data.user?.created_at || new Date().toISOString()
      };

      setUser(userData);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use a mock Google login
      // In production, integrate with Google OAuth 2.0
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        let errorMessage = 'Google login failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || 'Google login failed';
        } catch (e) {
          errorMessage = `Google login failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!data.access_token) {
        throw new Error('No authentication token received');
      }

      localStorage.setItem('authToken', data.access_token);

      const userData: User = {
        id: data.user?.id || 'unknown',
        email: data.user?.email || 'user@google.com',
        fullName: data.user?.full_name || 'Google User',
        plan: (data.user?.plan_id || 'free') as 'free' | 'pro' | 'premium',
        requestsUsed: data.user?.quota_used || 0,
        requestsLimit: data.user?.quota_limit || 50,
        createdAt: data.user?.created_at || new Date().toISOString()
      };

      setUser(userData);
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

