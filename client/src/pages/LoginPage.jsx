import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Shirt, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { login, demoLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setDemoLoading(true);
      await demoLogin();
      success('Logged in as Alex Morgan (Demo)');
      navigate('/dashboard');
    } catch (err) {
      error('Unable to sign into demo account.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-float">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 shadow-float">
            <Shirt className="w-6 h-6" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
            Personal Wardrobe
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sign in to access your curated digital closet
          </p>
        </div>

        {/* Demo Account Button */}
        <div className="mb-6">
          <button
            type="button"
            disabled={demoLoading || loading}
            onClick={handleDemoSignIn}
            className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-98 shadow-xs"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-500" />
            )}
            <span>Explore with Demo Account (Alex Morgan)</span>
          </button>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                Or sign in with email
              </span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-slate-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition active:scale-98 shadow-float flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign In</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span>Don't have an account yet? </span>
          <Link
            to="/register"
            className="font-semibold text-slate-900 hover:underline"
          >
            Create your wardrobe
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
