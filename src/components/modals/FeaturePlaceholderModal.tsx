import React from 'react';
import { Sparkles, X, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

interface FeaturePlaceholderModalProps {
  isOpen: boolean;
  featureTitle: string;
  featureDescription: string;
  onClose: () => void;
}

export const FeaturePlaceholderModal: React.FC<FeaturePlaceholderModalProps> = ({
  isOpen,
  featureTitle,
  featureDescription,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 select-none text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-4">
          <Sparkles className="w-7 h-7" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
          Phase 2 Feature
        </span>

        <h3 className="text-xl font-extrabold text-white mt-2">
          {featureTitle}
        </h3>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          {featureDescription}
        </p>

        <div className="my-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5 text-left text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Architecture ready! Multiplayer & Firebase services prepared for seamless rollout.</span>
        </div>

        <Button variant="primary" fullWidth size="md" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>
  );
};
