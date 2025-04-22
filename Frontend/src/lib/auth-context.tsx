import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, productAPI } from './api';

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  registrationComplete: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (data: { email: string; password: string; name: string; role: 'buyer' | 'seller' }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeRegistration: (csvFile?: File) => Promise<void>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('token');
        console.log('Checking auth, token exists:', !!token);

        if (token) {
          try {
            // Try to get user profile from API
            console.log('Getting user profile from API');
            const { user } = await authAPI.getProfile();
            console.log('User profile retrieved:', user);
            setUser(user);
          } catch (error) {
            // If API call fails, clear token
            console.error('Failed to get user profile:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Signup function
  const signup = async (data: { email: string; password: string; name: string; role: 'buyer' | 'seller' }) => {
    try {
      console.log('Signing up user:', data);
      // Call the API to sign up
      const response = await authAPI.signup(data);
      console.log('Signup successful:', response);

      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      // Update state
      setUser(response.user);

      return Promise.resolve();
    } catch (error) {
      console.error('Signup failed:', error);
      return Promise.reject(error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('Logging in user:', email);
      // Call the API to log in
      const response = await authAPI.login(email, password);
      console.log('Login successful:', response);

      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      // Update state
      setUser(response.user);

      return Promise.resolve();
    } catch (error) {
      console.error('Login failed:', error);
      return Promise.reject(error);
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update state
    setUser(null);

    // Redirect to login page
    navigate('/login');
  };

  // Complete registration function
  const completeRegistration = async (csvFile?: File) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Completing registration for user:', user.id);

      if (csvFile) {
        // Upload CSV file
        const response = await productAPI.uploadCSV(csvFile, user.id);
        console.log('CSV upload successful:', response);
      } else {
        // Complete registration without CSV
        const response = await productAPI.completeRegistration(user.id);
        console.log('Registration completed:', response);
      }

      // Update user state to mark registration as complete
      setUser(prev => prev ? { ...prev, registrationComplete: true } : null);

      return Promise.resolve();
    } catch (error) {
      console.error('Registration completion failed:', error);
      return Promise.reject(error);
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    completeRegistration
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};