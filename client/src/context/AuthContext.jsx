import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import authApi from '../features/auth/api/authApi.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: authApi.getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(['authUser'], user);
      toast.success(`Welcome back, ${user?.name || 'User'}!`, 'Logged in');
    },
    onError: (err) => {
      const message = err.response?.data?.error?.message || 'Invalid email or password.';
      toast.error(message, 'Login Failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Registration successful! Please log in to continue.', 'Account Created');
    },
    onError: (err) => {
      const message = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      toast.error(message, 'Registration Error');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null);
      queryClient.clear();
      toast.info('You have been logged out.', 'Signed Out');
    },
    onError: () => {
      queryClient.setQueryData(['authUser'], null);
    },
  });

  const value = {
    user: user ?? null,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    isLoading: isUserLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
