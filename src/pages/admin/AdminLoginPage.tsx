import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-[13px] text-[#6B6B6B] hover:text-[#111111] mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Portfolio</span>
        </Link>

        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white mx-auto mb-4">
          <Lock size={20} />
        </div>
        <h2 className="text-center text-[26px] font-bold text-[#111111] tracking-tight uppercase">
          PORTFOLIO CMS
        </h2>
        <p className="mt-1 text-center text-[14px] text-[#6B6B6B]">
          Sign in to manage projects, content blocks, and media
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E5E5] rounded-[12px] sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[6px]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium text-[#111111] mb-1">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Sanjay or sanjay@portfolio.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded-[8px] text-[14px] text-[#111111] focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#111111] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#E5E5E5] rounded-[8px] text-[14px] text-[#111111] focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#111111] transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2.5 px-4 rounded-[8px] text-[14px] font-medium text-white bg-black hover:bg-black/90 focus:outline-none transition-colors disabled:opacity-50"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
