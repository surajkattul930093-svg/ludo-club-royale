import React, { useState, useEffect } from 'react';
import { User, X, Edit2, Save, Shuffle } from 'lucide-react';
import { authService, UserProfile } from '../../services/AuthService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Charlie', 'Luna', 'Max', 'Milo', 'Oscar', 'Pepper',
  'Sam', 'Simba', 'Lola', 'Buster', 'Cleo', 'Ginger', 'Oliver', 'Bella'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile>(authService.getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    if (isOpen) {
      const user = authService.getCurrentUser();
      setProfile(user);
      setEditName(user.displayName || user.username || '');
      setEditAvatar(user.avatar || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShuffleAvatar = () => {
    const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
    setEditAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=` + randomSeed);
  };

  const handleSave = async () => {
    await authService.updateProfile(editName, editAvatar);
    setProfile({ ...profile, displayName: editName, username: editName, avatar: editAvatar });
    setIsEditing(false);
  };

  const isUrl = editAvatar?.startsWith('http');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black uppercase tracking-wide">Player Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-4">
          {/* Avatar Area */}
          <div className="relative w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg">
            {isUrl ? (
              <img src={editAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">{editAvatar || '?' }</span>
            )}
            
            {isEditing && (
              <button
                onClick={handleShuffleAvatar}
                className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
              >
                <Shuffle className="w-6 h-6" />
              </button>
            )}
          </div>
          {isEditing && (
            <button onClick={handleShuffleAvatar} className="text-xs text-sky-400 font-bold flex items-center gap-1">
              <Shuffle className="w-3 h-3" /> Randomize Avatar
            </button>
          )}

          {/* Name Area */}
          <div className="w-full">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={12}
                className="w-full text-center text-xl font-bold bg-slate-800 border border-slate-600 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-amber-400"
                placeholder="Enter your name"
              />
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-black text-white tracking-tight">{profile.displayName || profile.username}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {profile.uid}</p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            <div className="bg-slate-800/80 rounded-2xl p-3 flex flex-col items-center border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Games Played</span>
              <span className="text-lg font-black text-slate-200">{profile.gamesPlayed || 0}</span>
            </div>
            <div className="bg-slate-800/80 rounded-2xl p-3 flex flex-col items-center border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Games Won</span>
              <span className="text-lg font-black text-amber-400">{profile.gamesWon || 0}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end">
          {isEditing ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bold text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-900/50"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-sm font-bold text-white transition-colors shadow-lg shadow-sky-900/50"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
