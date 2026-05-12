'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import Card from '@/app/components/Card';
import { AuthService } from '@/app/lib/authService';
import { validateEmail } from '@/app/lib/validators';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const response = await AuthService.login({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (response.success) {
      router.push('/dashboard');
    } else {
      setServerError(response.error || response.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e2218] px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#dfbe6c] mb-2">
            Welcome Back
          </h1>
          <p className="text-[#ffffff] text-opacity-70">
            Sign in to your account to continue
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-500 border-opacity-50 rounded-lg">
            <p className="text-red-300 text-sm font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            icon={<span>✉️</span>}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#dfbe6c]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#dfbe6c] hover:text-[#e5c878] transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={errors.password}
                icon={<span>🔒</span>}
                fullWidth={false}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-[#dfbe6c] hover:text-[#e5c878]"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#ffffff] text-opacity-70 text-sm">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-[#dfbe6c] hover:text-[#e5c878] font-semibold transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 pt-6 border-t border-[#dfbe6c] border-opacity-20">
          <p className="text-xs text-[#ffffff] text-opacity-50 text-center">
            Protected by enterprise-grade security
          </p>
        </div>
      </Card>
    </div>
  );
}
