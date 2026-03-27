import React, { useState, useEffect, type FormEvent } from 'react';
import {
  X, Lock, Loader2, User as UserIcon, Building2, Phone,
  Eye, EyeOff, KeyRound, ArrowLeft, Mail, ShieldCheck,
} from 'lucide-react';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'signup';
type ForgotStep = 'request' | 'verify' | 'newpassword';

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  switchMode: (mode: AuthMode) => void;
  onLogin: (responseData: any) => void;
}

// ── Helper components ────────────────────────────────────────────────

const ErrorBox = ({ message }: { message: string }) => (
  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-1">
    <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
    {message}
  </div>
);

const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: '8+ chars',  pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number',    pass: /[0-9]/.test(password) },
    { label: 'Symbol',    pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter(c => c.pass).length;
  const colors   = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
  const labels   = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? colors[strength - 1] : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-1.5 flex-wrap">
          {checks.map(c => (
            <span
              key={c.label}
              className={`text-xs px-1.5 py-0.5 rounded ${
                c.pass ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {c.pass ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        {strength > 0 && (
          <span className={`text-xs font-semibold ${colors[strength - 1].replace('bg-', 'text-')}`}>
            {labels[strength - 1]}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Forgot Password Sub-Flow ─────────────────────────────────────────

const ForgotPassword = ({ onBack }: { onBack: () => void }) => {
  const [step,             setStep]             = useState<ForgotStep>('request');
  const [isLoading,        setIsLoading]        = useState(false);
  const [error,            setError]            = useState('');
  const [maskedEmail,      setMaskedEmail]      = useState('');
  const [phone,            setPhone]            = useState('');
  const [instituteName,    setInstituteName]    = useState('');
  const [token,            setToken]            = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [showPassword,     setShowPassword]     = useState(false);

  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authService.requestPasswordReset({ phone, institute_name: instituteName });
      if (response.success) {
        setMaskedEmail(response.email || '');
        toast.success('Reset token sent! Check your email.');
        setStep('verify');
      } else {
        setError(response.message || 'Something went wrong.');
        toast.error(response.message || 'Something went wrong.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not send reset token. Check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) { setError('Please enter the token from your email.'); return; }
    setStep('newpassword');
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setIsLoading(true);
    try {
      const response = await authService.confirmPasswordReset({ phone, token, new_password: newPassword });
      if (response.success) {
        toast.success('Password reset! You can now log in.');
        onBack();
      } else {
        setError(response.message || 'Reset failed. Token may have expired.');
        toast.error(response.message || 'Reset failed.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Reset failed. The token may be invalid or expired.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const stepConfig = {
    request:     { icon: <KeyRound className="w-8 h-8" />,   title: 'Forgot Password',   subtitle: 'Verify your identity to reset', progress: 33 },
    verify:      { icon: <Mail className="w-8 h-8" />,       title: 'Check Your Email',  subtitle: maskedEmail ? `Token sent to ${maskedEmail}` : 'Enter the token from your email', progress: 66 },
    newpassword: { icon: <ShieldCheck className="w-8 h-8" />, title: 'New Password',      subtitle: 'Choose a strong new password', progress: 100 },
  };
  const current = stepConfig[step];

  return (
    <>
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 text-white text-center relative">
        <button onClick={onBack} className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
          {current.icon}
        </div>
        <h2 className="text-2xl font-bold">{current.title}</h2>
        <p className="text-indigo-200 text-sm mt-1">{current.subtitle}</p>
        <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${current.progress}%` }} />
        </div>
        <p className="text-xs text-white/50 mt-1">Step {step === 'request' ? 1 : step === 'verify' ? 2 : 3} of 3</p>
      </div>

      <div className="p-8">
        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-sm text-slate-500 -mt-2 mb-4">
              Enter your registered phone number and institute name. We'll send a reset token to your email.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  placeholder="1234567890" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Institute Name <span className="text-violet-500 text-xs">(security check)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={instituteName} onChange={e => { setInstituteName(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  placeholder="Your institute name" required />
              </div>
              <p className="text-xs text-slate-400 mt-1">Must match exactly what you registered with</p>
            </div>
            {error && <ErrorBox message={error} />}
            <button type="submit" disabled={isLoading}
              className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Reset Token'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyToken} className="space-y-4">
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-700 -mt-2 mb-2">
              📧 A reset token has been sent to your registered email. Check your inbox (and spam folder).
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reset Token</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={token} onChange={e => { setToken(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all font-mono text-sm tracking-wider"
                  placeholder="Paste token from email" required autoComplete="off" />
              </div>
            </div>
            {error && <ErrorBox message={error} />}
            <button type="submit" disabled={isLoading}
              className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 flex items-center justify-center gap-2 transition-all disabled:opacity-70">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify Token'}
            </button>
            <button type="button" onClick={() => setStep('request')}
              className="w-full text-sm text-slate-500 hover:text-violet-600 transition-colors py-1">
              Didn't receive it? Go back and try again
            </button>
          </form>
        )}

        {step === 'newpassword' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-slate-500 -mt-2 mb-2">Almost done! Set a new password for your account.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  placeholder="Min. 8 characters" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  placeholder="Repeat new password" required />
              </div>
              {confirmPassword && (
                <p className={`text-xs mt-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
            {newPassword && <PasswordStrength password={newPassword} />}
            {error && <ErrorBox message={error} />}
            <button type="submit" disabled={isLoading || newPassword !== confirmPassword}
              className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 flex items-center justify-center gap-2 transition-all disabled:opacity-70">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

// ── Main AuthModal ───────────────────────────────────────────────────

const AuthModal = ({ mode, onClose, switchMode, onLogin }: AuthModalProps) => {
  const [formData, setFormData] = useState({
    phone:         '',
    password:      '',
    name:          '',
    instituteName: '',
    email:         '',   // ← NEW
  });
  const [showPassword,      setShowPassword]      = useState(false);
  const [isLoading,         setIsLoading]         = useState(false);
  const [error,             setError]             = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Reset form when switching modes
  useEffect(() => {
    setFormData({ phone: '', password: '', name: '', instituteName: '', email: '' });
    setError('');
    setIsLoading(false);
    setShowForgotPassword(false);
  }, [mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;

      if (mode === 'login') {
        response = await authService.login({
          phone:    formData.phone,
          password: formData.password,
        });
      } else {
        // Signup — validate required fields
        if (!formData.name || !formData.instituteName) {
          throw new Error('Please fill in all required fields');
        }

        const payload: Record<string, string> = {
          phone:          formData.phone,
          password:       formData.password,
          name:           formData.name,
          institute_name: formData.instituteName,
        };

        // Email is optional — only include if provided
        if (formData.email.trim()) {
          payload.email = formData.email.trim();
        }

        response = await authService.register(payload);
      }

      if (response.success) {
        toast.success(mode === 'login' ? 'Login Successful' : 'Account Created Successfully!');
        onLogin(response);
        onClose();
      }
    } catch (err: any) {
      let msg = 'Authentication failed. Please try again.';
      if (err.message) msg = err.message;
      if (err.response?.data?.message) msg = err.response.data.message;
      if (err.response?.data?.errors) {
        const firstKey   = Object.keys(err.response.data.errors)[0];
        const firstError = err.response.data.errors[firstKey];
        msg = Array.isArray(firstError) ? `${firstKey}: ${firstError[0]}` : String(firstError);
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — max-h + overflow-y so it scrolls on short screens */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95dvh] overflow-y-auto">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* ── Forgot Password flow ── */}
        {showForgotPassword ? (
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">
                {mode === 'login' ? 'Welcome Back' : 'Start Free Trial'}
              </h2>
              <p className="text-indigo-200 text-sm mt-1">
                {mode === 'login' ? 'Login to manage your institute' : 'Create your account in seconds'}
              </p>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Phone ── */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                </div>

                {/* ── Signup-only fields ── */}
                {mode === 'signup' && (
                  <>
                    {/* Name + Institute in a 2-col grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Your Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Institute <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="instituteName"
                            value={formData.instituteName}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Academy name"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Email — full width, optional ── */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address
                        <span className="ml-1.5 text-xs text-slate-400 font-normal">(optional — needed for password reset)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </div>
                      {/* Nudge — shown only when email is empty */}
                      {!formData.email && (
                        <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                          Add your email so you can reset your password if you ever forget it.
                        </p>
                      )}
                      {/* Confirmation when filled */}
                      {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                        <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                          ✓ Password reset tokens will be sent here
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* ── Password ── */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Password <span className="text-red-400">*</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-indigo-600 hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                      required
                      minLength={mode === 'signup' ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password strength — signup only */}
                  {mode === 'signup' && formData.password && (
                    <div className="mt-2">
                      <PasswordStrength password={formData.password} />
                    </div>
                  )}
                </div>

                {error && <ErrorBox message={error} />}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2 shadow-lg shadow-indigo-100"
                >
                  {isLoading
                    ? <Loader2 className="animate-spin w-5 h-5" />
                    : mode === 'login' ? 'Login' : 'Create Account'}
                </button>

                {/* Terms — signup only */}
                {mode === 'signup' && (
                  <p className="text-xs text-slate-400 text-center leading-relaxed">
                    By creating an account you agree to our{' '}
                    <a href="#" className="text-indigo-500 hover:underline">Terms</a>{' '}
                    and{' '}
                    <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>.
                  </p>
                )}

                {/* Switch mode */}
                <p className="text-center text-sm text-slate-500 mt-2">
                  {mode === 'login' ? 'New to CoachingApp? ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    {mode === 'login' ? 'Create Account' : 'Login'}
                  </button>
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;