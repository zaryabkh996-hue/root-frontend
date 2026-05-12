'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import Card from '@/app/components/Card';
import { AuthService } from '@/app/lib/authService';
import { validateEmail, validatePassword, validateName } from '@/app/lib/validators';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
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

    const response = await AuthService.signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    });

    setLoading(false);

    if (response.success) {
      router.push('/dashboard');
    } else {
      setServerError(response.error || response.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e2218] px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#dfbe6c] mb-2">
            Join OurRoots
          </h1>
          <p className="text-[#ffffff] text-opacity-70">
            Create an account and start your journey
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-500 border-opacity-50 rounded-lg">
            <p className="text-red-300 text-sm font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            icon={<span>👤</span>}
          />

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
            <label className="text-sm font-semibold text-[#dfbe6c] block mb-2">
              Password
            </label>
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
            <p className="text-xs text-[#ffffff] text-opacity-50 mt-2">
              At least 8 characters with uppercase, number, and special character
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#dfbe6c] block mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
                error={errors.password_confirmation}
                icon={<span>🔒</span>}
                fullWidth={false}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-10 text-[#dfbe6c] hover:text-[#e5c878]"
              >
                {showConfirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[#dfbe6c]"
            />
            <label htmlFor="terms" className="text-sm text-[#ffffff] text-opacity-70">
              I agree to the{' '}
              <Link
                href="/terms"
                className="text-[#dfbe6c] hover:underline"
              >
                Terms and Conditions
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-400">{errors.terms}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#ffffff] text-opacity-70 text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#dfbe6c] hover:text-[#e5c878] font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 pt-6 border-t border-[#dfbe6c] border-opacity-20">
          <p className="text-xs text-[#ffffff] text-opacity-50 text-center">
            Your data is encrypted and secure
          </p>
        </div>
      </Card>
    </div>
  );
}
