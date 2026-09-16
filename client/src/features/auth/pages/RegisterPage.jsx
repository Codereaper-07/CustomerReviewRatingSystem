import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';

export function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setFormError('');
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate('/login');
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen neo-grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md neo-card bg-white p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block neo-badge bg-sky-300 font-black text-xs px-3 py-1">
            New Customer
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Create Account</h1>
          <p className="text-sm font-semibold text-slate-600">
            Sign up to rate products, write reviews and vote
          </p>
        </div>

        {formError && (
          <div className="p-3 bg-rose-100 border-2 border-black rounded-lg text-xs font-black text-rose-800">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Jane Doe"
            error={errors.name?.message}
            {...register('name', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />

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

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              isLoading={isRegistering}
              className="w-full text-base py-2.5"
            >
              Create Account <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t-2 border-black text-center text-sm font-bold text-slate-700">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-black font-black underline hover:text-amber-600 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
