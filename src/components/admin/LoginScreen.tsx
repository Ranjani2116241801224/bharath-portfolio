import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient } from '../../services/supabaseClient';
import { StorageService } from '../../services/storageService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Primary: Authenticate via Supabase Auth
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (!authError && data?.session && data.user) {
            // Check admin_profiles table to verify user holds the administrator role
            const { data: adminProfile } = await supabase
              .from('admin_profiles')
              .select('role')
              .eq('id', data.user.id)
              .maybeSingle();

            const isAuthorizedEmail = cleanEmail === 'sbarath1605@gmail.com' || cleanEmail === 'admin@bharaths.com';
            if (adminProfile?.role === 'admin' || adminProfile?.role === 'super_admin' || isAuthorizedEmail) {
              localStorage.setItem('bharath_admin_auth', 'true');
              localStorage.setItem('bharath_auth_token', data.session.access_token);
              setIsLoading(false);
              onLoginSuccess();
              return;
            } else {
              await supabase.auth.signOut();
              setError('Access denied: This Supabase account is not an authorized administrator.');
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // If Supabase Auth is offline or network error, proceed to secure verification
        }
      }

      // 2. Secondary: Secure verification for authorized administrator
      const isValid = await StorageService.verifyAdminCredentials(cleanEmail, password);
      if (isValid) {
        localStorage.setItem('bharath_admin_auth', 'true');
        setIsLoading(false);
        onLoginSuccess();
        return;
      }

      setError('Access denied. Invalid administrator credentials.');
      setIsLoading(false);
    } catch {
      setError('Authentication failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your administrator email above to request a reset link.');
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(email.trim());
      } catch {
        // Fallback
      }
    }

    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/90 backdrop-blur-2xl">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-panel border border-[#168BFF]/40 shadow-[0_25px_70px_rgba(2,4,10,0.98)] relative space-y-6 animate-fadeIn">
        
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Back to portfolio"
          aria-label="Back to portfolio"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Shield Icon Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#168BFF]/30 to-[#27DFFF]/20 border border-[#27DFFF]/40 flex items-center justify-center shadow-[0_0_30px_rgba(39,223,255,0.25)]">
            <Shield className="w-8 h-8 text-[#27DFFF]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            ADMINISTRATOR <span className="text-[#27DFFF]">PORTAL</span>
          </h2>
          <p className="text-xs text-slate-400">
            Private management console for Bharath S.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start space-x-2.5 animate-fadeIn">
            <Lock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Forgot Password Confirmation */}
        {forgotSent && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Password reset link sent to your registered email!</span>
          </div>
        )}

        {/* Secure Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter authorized administrator email"
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#27DFFF] transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-[#27DFFF] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#27DFFF] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-[#168BFF] to-[#27DFFF] hover:opacity-95 shadow-[0_0_25px_rgba(22,139,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center space-x-2 pt-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Protected with Supabase Authentication & PostgreSQL Row Level Security.
          </p>
        </div>

      </div>
    </div>
  );
};
