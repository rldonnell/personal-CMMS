'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No reset token provided. Please request a new password reset link.');
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
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
            <div className="w-10 h-10 bg-fw-red rounded-lg flex items-center justify-center text-white font-bold text-lg">
              FW
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Four Winds</h1>
              <p className="text-xs text-blue-200 -mt-0.5">Home CMMS</p>
            </div>
          </Link>
          <a
            href="https://fourwindscmms.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-200 hover:text-white transition"
          >
            fourwindscmms.com →
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="bg-gradient-to-b from-fw-navy to-fw-navy-dark text-white py-16 px-6 min-h-[calc(100vh-200px)] flex items-center">
        <div className="max-w-md w-full mx-auto bg-white text-gray-800 rounded-2xl shadow-2xl p-8">
          {!token ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid Reset Link</h2>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <Link
                href="/forgot-password"
                className="block text-center bg-fw-navy text-white py-3 rounded-lg font-semibold hover:bg-fw-navy-dark transition"
              >
                Request New Reset Link
              </Link>
            </>
          ) : success ? (
            <>
              <h2 className="text-2xl font-bold mb-2 text-green-600">Password Reset!</h2>
              <p className="text-gray-600 text-sm mb-4">Your password has been reset successfully.</p>
              <p className="text-gray-500 text-sm">Redirecting to sign in...</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Create New Password</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter a new password for your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                    placeholder="6 characters minimum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fw-navy focus:border-transparent outline-none"
                    placeholder="Re-enter password"
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
                  {loading ? 'Please wait...' : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                <Link href="/" className="text-fw-navy font-medium hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-fw-navy text-blue-200 py-6 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} Four Winds CMMS · Home Edition · A free tool by{' '}
          <a href="https://p5marketing.com" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">
            P5 Marketing
          </a>
        </p>
      </footer>
    </div>
  );
}
