import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('@cavitak.com');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Access Denied. Only @cavitak.com email addresses are allowed.");
      return;
    }

    setIsLoading(true);

    // Simulate Network API Call for Sending Email
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      setCountdown(30); // 30 second cooldown
      // In a real app, the backend sends the email. 
      // Here we simulate it for the user to test.
      console.log(`[DEV MODE] OTP for ${email} is 123456`);
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate OTP Verification
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') {
        onLogin(email);
      } else {
        setError("Invalid OTP code. Please try again.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Branding */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
             </div>
             <h1 className="text-2xl font-bold text-white">StoreFlow Login</h1>
             <p className="text-indigo-100 text-sm mt-1">Authorized Personnel Only</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {step === 'EMAIL' ? (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 text-sm">Enter your corporate email to continue</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Corporate Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="username@cavitak.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP Code <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Two-Step Verification</h2>
                <p className="text-gray-500 text-sm">
                  We sent a code to <span className="font-medium text-gray-800">{email}</span>
                  <br/>
                  <span className="text-xs text-indigo-600 font-medium">(Dev Mode: Use 123456)</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Enter 6-Digit Code</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all tracking-widest text-lg font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Login <CheckCircle className="w-4 h-4" /></>}
              </button>

              <div className="text-center space-y-2">
                 <button 
                  type="button"
                  disabled={countdown > 0}
                  onClick={(e) => { handleSendOtp(e); }}
                  className={`text-sm font-medium ${countdown > 0 ? 'text-gray-400' : 'text-indigo-600 hover:underline'}`}
                 >
                   {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                 </button>
                 <div>
                   <button type="button" onClick={() => setStep('EMAIL')} className="text-xs text-gray-500 hover:text-gray-800">
                     Change Email Address
                   </button>
                 </div>
              </div>
            </form>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">© 2024 StoreFlow System • Cavitak</p>
        </div>
      </div>
    </div>
  );
};