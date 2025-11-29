import React, { useState } from 'react';
import { PlanTier } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: PlanTier) => Promise<void>;
  currentTier: PlanTier;
}

const PricingModal: React.FC<Props> = ({ isOpen, onClose, onUpgrade, currentTier }) => {
  const [processing, setProcessing] = useState<PlanTier | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (tier: PlanTier) => {
    setProcessing(tier);
    await onUpgrade(tier);
    setProcessing(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl p-6">
        <button 
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-400 hover:text-white z-10"
        >
          Close [ESC]
        </button>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-jersey text-white mb-2">UPGRADE YOUR <span className="text-[#FF3333]">MIND</span></h2>
          <p className="text-gray-400">Unlock AI Intelligence and Collaborative Power.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE TIER */}
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 flex flex-col opacity-70 hover:opacity-100 transition-opacity">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="text-3xl font-mono text-gray-400 mb-6">$0<span className="text-sm">/mo</span></div>
            <ul className="space-y-3 text-sm text-gray-400 flex-1 mb-8">
              <li>✓ 3 Local Boards</li>
              <li>✓ Basic Shapes</li>
              <li>✓ PNG Export</li>
              <li className="text-gray-600">✕ No AI Generation</li>
              <li className="text-gray-600">✕ No Team Library</li>
            </ul>
            <button 
              disabled={true}
              className="w-full py-2 rounded-lg bg-[#333] text-gray-500 text-sm font-bold cursor-not-allowed"
            >
              {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* BASIC TIER (Solo Pro) */}
          <div className="bg-[#1A1A1A] border border-[#FF3333] rounded-xl p-6 flex flex-col relative transform scale-105 shadow-[0_0_30px_rgba(255,51,51,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF3333] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
            <div className="text-3xl font-mono text-[#FF3333] mb-6">$8<span className="text-sm text-gray-400">/mo</span></div>
            <ul className="space-y-3 text-sm text-gray-300 flex-1 mb-8">
              <li>✓ Unlimited Boards</li>
              <li>✓ <span className="text-[#FF3333]">AI Text-to-Flow</span></li>
              <li>✓ <span className="text-[#FF3333]">AI Summarization</span></li>
              <li>✓ Advanced Shapes</li>
              <li>✓ PDF & SVG Export</li>
            </ul>
            <button 
              onClick={() => handleUpgrade('basic')}
              disabled={currentTier !== 'free'}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all
                ${currentTier === 'basic' 
                  ? 'bg-[#333] text-gray-500' 
                  : 'bg-[#FF3333] hover:bg-[#D92B2B] text-white shadow-lg'}
              `}
            >
              {processing === 'basic' ? 'Processing...' : currentTier === 'basic' ? 'Current Plan' : 'Upgrade to Basic'}
            </button>
          </div>

          {/* PRO TIER (Teams) */}
          <div className="bg-[#111] border border-[#FF7A33] rounded-xl p-6 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Pro Team</h3>
            <div className="text-3xl font-mono text-[#FF7A33] mb-6">$15<span className="text-sm text-gray-400">/user</span></div>
            <ul className="space-y-3 text-sm text-gray-300 flex-1 mb-8">
              <li>✓ Everything in Basic</li>
              <li>✓ Team Libraries</li>
              <li>✓ Real-time Collaboration</li>
              <li>✓ Admin Controls</li>
              <li>✓ Priority Support</li>
            </ul>
            <button 
              onClick={() => handleUpgrade('pro')}
              disabled={currentTier === 'pro'}
              className={`w-full py-2 rounded-lg border font-bold text-sm transition-all
                ${currentTier === 'pro' 
                  ? 'bg-[#333] border-transparent text-gray-500' 
                  : 'border-[#FF7A33] text-[#FF7A33] hover:bg-[#FF7A33] hover:text-black'}
              `}
            >
              {processing === 'pro' ? 'Processing...' : currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;