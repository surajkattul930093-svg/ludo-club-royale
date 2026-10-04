import React from 'react';
import { Volume2, VolumeX, Zap, Info, X } from 'lucide-react';
import { Button } from '../common/Button';

interface SettingsModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  animationSpeed: number;
  onToggleSound: () => void;
  onChangeAnimationSpeed: (speedMs: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  soundEnabled,
  animationSpeed,
  onToggleSound,
  onChangeAnimationSpeed,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 select-none">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="font-extrabold text-base tracking-wide text-amber-400">
            Game Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <div className="font-bold text-sm">Sound Effects</div>
                <div className="text-[11px] text-slate-400">Synthesized audio cues</div>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Animation Speed Selector */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-bold text-sm">Token Hop Speed</div>
                <div className="text-[11px] text-slate-400">Movement pacing</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: 'Fast', speed: 90 },
                { label: 'Normal', speed: 140 },
                { label: 'Smooth', speed: 200 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => onChangeAnimationSpeed(item.speed)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    animationSpeed === item.speed
                      ? 'bg-amber-500 text-slate-950 border-amber-300'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Board Heritage Info */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300">Faithful Board Layout</span>: 
              Exact color coordinates, safe star cells, corner flourishes and track arrows designed after the reference board.
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="primary" fullWidth size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
