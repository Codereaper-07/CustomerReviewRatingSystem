import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';

export function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/products';

  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setFormError('');
    try {
      const user = await login(data);
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen neo-grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md neo-card bg-white p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block neo-badge bg-amber-300 font-black text-xs px-3 py-1">
            Welcome Back
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Sign In</h1>
          <p className="text-sm font-semibold text-slate-600">
            Enter your credentials to access your account
          </p>
        </div>

        {formError && (
          <div className="p-3 bg-rose-100 border-2 border-black rounded-lg text-xs font-black text-rose-800">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address',
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoggingIn}
              className="w-full text-base py-2.5"
            >
              Sign In <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t-2 border-black text-center text-sm font-bold text-slate-700">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-black font-black underline hover:text-amber-600 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
