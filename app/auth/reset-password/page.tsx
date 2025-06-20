'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../modules/auth/AuthContext';
import { 
  EnvelopeIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

/**
 * Password Reset Page Component
 * 
 * Provides a form for users to request a password reset link
 * using Supabase authentication.
 */
export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
            HK
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-600 flex items-start">
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p>Password reset link sent!</p>
                <p className="mt-1">Check your email for instructions to reset your password.</p>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-600 flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || success}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (isLoading || success) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Sending...' : success ? 'Link sent' : 'Send reset link'}
              </button>
            </div>
          </form>

          {/* Back to login link */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

