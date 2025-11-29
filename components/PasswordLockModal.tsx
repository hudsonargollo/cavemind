import React, { useState } from 'react';

interface PasswordLockModalProps {
  isOpen: boolean;
  mode: 'set' | 'unlock';
  onClose: () => void;
  onSubmit: (password: string) => void;
}

const PasswordLockModal: React.FC<PasswordLockModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'set') {
      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    onSubmit(password);
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1A1A1A] border-2 border-[#333] rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <h2 className="text-xl font-jersey text-[#E5E5E5] tracking-wider">
            {mode === 'set' ? '🔒 LOCK DOCUMENT' : '🔓 UNLOCK DOCUMENT'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-jersey text-gray-400 mb-2">
              {mode === 'set' ? 'Set Password' : 'Enter Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#333] text-[#E5E5E5] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF3333] focus:ring-2 focus:ring-[#FF3333]/50 font-jersey transition-all duration-200"
              placeholder="Enter password..."
              autoFocus
            />
          </div>

          {mode === 'set' && (
            <div>
              <label className="block text-sm font-jersey text-gray-400 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] text-[#E5E5E5] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF3333] focus:ring-2 focus:ring-[#FF3333]/50 font-jersey transition-all duration-200"
                placeholder="Confirm password..."
              />
            </div>
          )}

          {error && (
            <div className="text-[#FF3333] text-sm font-jersey bg-[#FF3333]/10 border border-[#FF3333]/30 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="text-xs font-jersey text-gray-500">
            {mode === 'set' 
              ? '⚠️ Remember this password. It cannot be recovered.'
              : '🔑 Enter the password to unlock and edit this document.'}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-[#333] hover:bg-[#444] text-white rounded-lg px-4 py-3 font-jersey transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#FF3333] hover:bg-[#D92B2B] text-white rounded-lg px-4 py-3 font-jersey transition-all duration-200"
            >
              {mode === 'set' ? '🔒 Lock' : '🔓 Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordLockModal;
