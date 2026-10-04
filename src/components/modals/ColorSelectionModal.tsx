import React, { useState } from 'react';
import { PlayerColor } from '../../types/player';
import { GameMode } from '../../types/game';
import { Button } from '../common/Button';

interface ColorSelectionModalProps {
  mode: GameMode;
  onConfirm: (colors: PlayerColor[]) => void;
  onCancel: () => void;
}

export const ColorSelectionModal: React.FC<ColorSelectionModalProps> = ({ mode, onConfirm, onCancel }) => {
  const [selectedColors, setSelectedColors] = useState<PlayerColor[]>([]);

  const requiredCount = mode === 'vs_computer' ? 1 : mode === '2_player' ? 2 : 4;
  const currentPlayer = selectedColors.length + 1;

  const handleSelect = (color: PlayerColor) => {
    if (selectedColors.includes(color)) return;
    
    const next = [...selectedColors, color];
    setSelectedColors(next);
    
    if (next.length === requiredCount) {
      setTimeout(() => onConfirm(next), 300);
    }
  };

  const getTitle = () => {
    if (mode === 'vs_computer') return 'Select Your Color';
    return `Player ${currentPlayer}: Select Your Color`;
  };

  const colors: { id: PlayerColor; bg: string; border: string; name: string }[] = [
    { id: 'blue', bg: 'bg-[#0878E8]', border: 'border-[#3ba2ff]', name: 'Blue' },
    { id: 'yellow', bg: 'bg-[#FFD21C]', border: 'border-[#fff070]', name: 'Yellow' },
    { id: 'green', bg: 'bg-[#08B83F]', border: 'border-[#4ee87f]', name: 'Green' },
    { id: 'red', bg: 'bg-[#F01818]', border: 'border-[#ff6b6b]', name: 'Red' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-white mb-2">{getTitle()}</h2>
          <p className="text-xs text-slate-400">
            {mode === 'vs_computer' 
              ? 'Choose the color you want to play as'
              : `${requiredCount - selectedColors.length} more color${requiredCount - selectedColors.length > 1 ? 's' : ''} to select`
            }
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {colors.map((c) => {
            const isSelected = selectedColors.includes(c.id);
            const playerNum = selectedColors.indexOf(c.id) + 1;
            
            return (
              <button
                key={c.id}
                disabled={isSelected}
                onClick={() => handleSelect(c.id)}
                className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? `${c.bg} border-transparent opacity-50 cursor-not-allowed scale-95` 
                    : `bg-slate-800 border-slate-700 hover:${c.border} hover:bg-slate-800 active:scale-95`
                }`}
              >
                <div className={`w-12 h-12 rounded-full border-2 ${c.bg} ${c.border} shadow-lg`} />
                <span className="text-sm font-bold text-white">{c.name}</span>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md text-white border border-slate-800">
                    P{playerNum}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button variant="secondary" fullWidth onClick={onCancel} className="text-sm">
          Cancel
        </Button>
      </div>
    </div>
  );
};

