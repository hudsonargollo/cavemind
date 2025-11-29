import React from 'react';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  feature,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF3333]/20 flex items-center justify-center">
                <span className="text-[#FF3333] text-xl">⚡</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Upgrade to Pro</h3>
                <p className="text-gray-400 text-sm">Unlock premium features</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-4">
              {feature} is a Pro feature. Upgrade to unlock:
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-[#FF3333]">✓</span>
                <span>Customizable toolbar positioning</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF3333]">✓</span>
                <span>AI-powered diagram generation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF3333]">✓</span>
                <span>Advanced editing tools</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF3333]">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:border-[#444] transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 px-4 py-2 rounded-lg bg-[#FF3333] hover:bg-[#D92B2B] text-white font-bold transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
