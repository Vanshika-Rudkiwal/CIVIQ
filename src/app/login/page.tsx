'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#fffde7] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#2d52c8] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="font-black text-[#2d52c8] text-2xl">CIVIQ</span>
          </Link>
          <h1 className="text-2xl font-black text-[#1a1a3a]">Welcome back</h1>
          <p className="text-gray-500 mt-1">Log in to see your schemes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleLogin} noValidate>
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2d52c8] focus:outline-none transition-colors text-gray-900"
                placeholder="you@college.edu"
                aria-required="true"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#2d52c8] focus:outline-none transition-colors text-gray-900"
                placeholder="••••••••"
                aria-required="true"
              />
            </div>

            {error && (
              <div role="alert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#2d52c8] text-white font-bold rounded-xl hover:bg-[#1a3399] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              aria-busy={loading}
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to CIVIQ?{' '}
            <Link href="/register" className="text-[#2d52c8] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
