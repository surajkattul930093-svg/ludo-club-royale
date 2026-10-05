import React from 'react';
import { X, Smile, MessageSquare } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string, isEmoji: boolean) => void;
}

const EMOJIS = [
  { id: '1f602', char: '\u{1F602}' },
  { id: '1f621', char: '\u{1F621}' },
  { id: '1f62d', char: '\u{1F62D}' },
  { id: '1f929', char: '\u{1F929}' },
  { id: '1f44d', char: '\u{1F44D}' },
  { id: '1f44e', char: '\u{1F44E}' },
  { id: '1f973', char: '\u{1F973}' },
  { id: '1f631', char: '\u{1F631}' },
  { id: '1f92b', char: '\u{1F92B}' },
  { id: '1f60e', char: '\u{1F60E}' },
  { id: '1f61c', char: '\u{1F61C}' },
  { id: '1f92c', char: '\u{1F92C}' }
];
const MESSAGES = [
  'Well played!',
  'Oops!',
  'Hurry up!',
  'Thanks!',
  'Nice move!',
  'Good luck!',
  'Gotcha!',
  'Nooooo!'
];

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, onSend }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in sm:p-4">
      <div className="relative w-full h-[60vh] sm:h-auto sm:max-w-sm bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-t sm:border-2 border-slate-700 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" /> Quick Chat
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          
          {/* Emojis Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" /> Animated Emojis
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji.id}
                  onClick={() => { onSend(emoji.id, true); onClose(); }}
                  className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl p-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                  <img src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${emoji.id}/512.gif`} alt={emoji.char} className="w-12 h-12" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Messages Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Text Messages
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {MESSAGES.map(msg => (
                <button
                  key={msg}
                  onClick={() => { onSend(msg, false); onClose(); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 rounded-lg py-2 px-3 transition-colors active:scale-95 text-left"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
