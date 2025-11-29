import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: 'google' | 'apple') => void;
}

const LoginModal: React.FC<Props> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-[#333] rounded-xl p-8 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-jersey text-white mb-2">ENTER THE <span className="text-[#FF3333]">CAVE</span></h2>
          <p className="text-gray-400 text-sm font-jersey">Sign in to save your workflows and access AI features.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onLogin('google')}
            className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            onClick={() => onLogin('apple')}
            className="w-full bg-black border border-[#333] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-[#1A1A1A] transition-colors"
          >
            <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5 invert" />
            Continue with Apple
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;