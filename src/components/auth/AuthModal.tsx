import React, { useState, useEffect, type FormEvent } from 'react';
import { X, Lock, Loader2, User as UserIcon, Building2, Phone, Eye, EyeOff } from 'lucide-react';
// import type { User } from '../../App';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  switchMode: (mode: AuthMode) => void;
  onLogin: (responseData: any) => void; // Accepts full API response (user + tokens)
}

const AuthModal = ({ mode, onClose, switchMode, onLogin }: AuthModalProps) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    instituteName: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when mode changes
  useEffect(() => {
    setFormData({ phone: '', password: '', name: '', instituteName: '' });
    setError('');
    setIsLoading(false);
  }, [mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on typing
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;

      if (mode === 'login') {
        // --- LOGIN ---
        response = await authService.login({
          phone: formData.phone,
          password: formData.password
        });
      } else {
        // --- SIGNUP ---
        // Validate required fields locally first
        if (!formData.name || !formData.instituteName) {
          throw new Error("Please fill in all fields");
        }

        response = await authService.register({
          phone: formData.phone,
          password: formData.password,
          name: formData.name,
          // Map camelCase to snake_case for Django
          institute_name: formData.instituteName 
        });
      }

      if (response.success) {
        toast.success(mode === 'login' ? 'Login Successful' : 'Account Created Successfully');
        onLogin(response); // Pass the full response data to App.tsx
        onClose();
      }

    } catch (err: any) {
      console.error(err);
      
      // Handle API Errors
      let msg = 'Authentication failed. Please try again.';
      
      if (err.message) {
        msg = err.message; // Local validation error
      }
      
      if (err.response?.data) {
        // Backend returned a specific error message
        if (err.response.data.message) {
          msg = err.response.data.message;
        }
        // Backend returned validation errors (e.g., { phone: ["User exists"] })
        if (err.response.data.errors) {
          const firstKey = Object.keys(err.response.data.errors)[0];
          const firstError = err.response.data.errors[firstKey];
          if (Array.isArray(firstError)) {
            msg = `${firstKey}: ${firstError[0]}`;
          } else {
            msg = String(firstError);
          }
        }
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Lock className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? "Welcome Back" : "Start Free Trial"}
          </h2>
          <p className="text-indigo-200 text-sm mt-1">
            {mode === 'login' ? "Login to manage your institute" : "Create your account in seconds"}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="1234567890"
                  required
                />
              </div>
            </div>

            {/* Signup Extra Fields */}
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Institute</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        name="instituteName"
                        value={formData.instituteName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Academy"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (mode === 'login' ? "Login" : "Create Account")}
            </button>

            {/* Hint for Demo (Optional - removed if not needed, or kept for dev) */}
            {/* {mode === 'login' && !error && (
              <div className="text-center text-xs text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
                <span className="font-semibold">Demo:</span> Phone: 1234567890 | Pass: demo123
              </div>
            )} 
            */}

            {/* Toggle Mode */}
            <p className="text-center text-sm text-slate-500 mt-4">
              {mode === 'login' ? "New to CoachingApp? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} 
                className="text-indigo-600 font-semibold hover:underline"
              >
                {mode === 'login' ? "Create Account" : "Login"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;