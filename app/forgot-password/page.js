'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmitted(true);
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-fw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <h1 className="text-xl font-bold leading-tight">Home CMMS</h1>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="bg-gradient-to-b from-fw-navy to-fw-navy-dark text-white py-16 px-6 min-h-[calc(100vh-200px)] flex items-center">
        <div className="max-w-md w-full mx-auto bg-white text-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
          <p className="text-gray-500 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {submitted ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-medium">Success!</p>
                <p className="text-green-700 text-sm mt-1">
                  If an account with that email exists, we've sent a password reset link.
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Check your email for the reset link. It expires in 1 hour.
              </p>
              <Link
                href="/"
                className="block text-center bg-fw-navy text-white py-3 rounded-lg font-semibold hover:bg-fw-navy-dark transition"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                  placeholder="you@company.com"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-fw-navy text-white py-3 rounded-lg font-semibold hover:bg-fw-navy-dark transition disabled:opacity-50"
              >
                {loading ? 'Please wait...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link href="/" className="text-fw-navy font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-fw-navy text-blue-200 py-6 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} Home CMMS · A free tool by{' '}
          <a href="https://p5marketing.com" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">
            P5 Marketing
          </a>
        </p>
      </footer>
    </div>
  );
}
