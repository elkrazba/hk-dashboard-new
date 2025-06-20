'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../services/supabase';

/**
 * Email Verification Page
 * 
 * This page is displayed after a user signs up, prompting them to verify their email.
 * It also handles the verification token from the email link.
 */
export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Please check your email for a verification link.');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const token = searchParams?.get('token');
    const type = searchParams?.get('type');
    
    // If token is present, verify the user's email
    if (token && type === 'signup') {
      handleEmailVerification(token);
    }
  }, [searchParams]);

  const handleEmailVerification = async (token: string) => {
    setIsProcessing(true);
    
    try {
      // Use Supabase to verify the token
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });
      
      if (error) {
        throw error;
      }
      
      setVerificationStatus('success');
      setMessage('Your email has been successfully verified! You can now sign in to your account.');
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setMessage(error.message || 'Failed to verify email. The link may have expired or is invalid.');
    } finally {
      setIsProcessing(false);
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
          {verificationStatus === 'pending' ? 'Verify your email' : 
           verificationStatus === 'success' ? 'Email verified!' :
           'Verification failed'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center space-y-6">
            {verificationStatus === 'pending' && isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            ) : verificationStatus === 'success' ? (
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            ) : verificationStatus === 'error' ? (
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
            ) : (
              <div className="p-4 bg-blue-50 rounded-full">
                <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm text-gray-600">{message}</p>
              
              {verificationStatus === 'pending' && !isProcessing && (
                <p className="mt-4 text-sm text-gray-500">
                  Didn't receive an email? Check your spam folder or
                  <button 
                    className="ml-1 text-blue-600 hover:text-blue-500 focus:outline-none"
                    onClick={() => {/* Implement resend logic */}}
                  >
                    click here to resend
                  </button>.
                </p>
              )}
            </div>
            
            <div className="mt-6">
              {verificationStatus === 'success' ? (
                <Link 
                  href="/auth/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign in
                </Link>
              ) : verificationStatus === 'error' ? (
                <div className="space-y-3">
                  <Link
                    href="/auth/signup"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try signing up again
                  </Link>
                  <Link
                    href="/auth/login"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to sign in
                  </Link>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

