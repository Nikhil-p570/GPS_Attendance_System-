import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

export type UserRole = 'student' | 'orgMember' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  class?: string;
  institution?: string;
  adminId?: string;
  adminIds?: string[];
  token?: string; // Added token to user interface
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organization?: string;
  class?: string;
  institution?: string;
  adminId?: string;
  adminIds?: string[];
}

interface Admin {
  id: string;
  name: string;
  institution: string;
  geofence?: {
    center: { latitude: number; longitude: number };
    radius: number;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  admins: Admin[];
}

const API_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://your-deployed-api-url.com/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Initialize axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verify token with backend if needed
          // await axios.get(`${API_URL}/validate-token`);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }

      await fetchAdmins();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/admins`);
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchGeofence = async (adminId: string) => {
    try {
      const response = await axios.get(`${API_URL}/admin/${adminId}/geofence`);
      console.log("Geofence data:", response.data);
    } catch (error) {
      console.error('Error fetching geofence:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to fetch geofence',
        description: 'Could not retrieve geofence info.',
      });
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user: userData } = response.data;
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set axios defaults and user state
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ ...userData, token });

      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.name}!`,
      });

      // Fetch geofence if needed
      if ((userData.role === 'student' || userData.role === 'orgMember') && userData.adminIds?.length) {
        for (const id of userData.adminIds) {
          await fetchGeofence(id);
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          errorMessage = 'Server connection failed';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        }
      }

      toast({
        variant: 'destructive',
        title: errorMessage,
        description: error.response?.data?.message || 'Please try again',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      const { token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser({ ...userData, token });

      toast({
        title: 'Registration successful',
        description: 'You can now log in with your credentials',
      });

      if (userData.role === 'admin') {
        fetchAdmins();
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          errorMessage = 'Server connection failed';
        } else if (error.response.status === 400) {
          errorMessage = 'Email may already be in use';
        }
      }

      toast({
        variant: 'destructive',
        title: errorMessage,
        description: error.response?.data?.message || 'Please try again',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        admins,
      }}
    >
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