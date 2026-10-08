import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { socketService } from '../../services/SocketService';
import { PlayerColor } from '../../types/player';

interface PrivateRoomModalProps {
  mode: 'create' | 'join';
  profile: any;
  preferredColor?: PlayerColor;
  onGameStart: (gameId: string, color: PlayerColor, activeColors: PlayerColor[], players: any[]) => void;
  onCancel: () => void;
}

export const PrivateRoomModal: React.FC<PrivateRoomModalProps> = ({ mode, profile, preferredColor, onGameStart, onCancel }) => {
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [playerMode, setPlayerMode] = useState<2 | 4>(4);
  const [isLobby, setIsLobby] = useState(false);

  useEffect(() => {
    socketService.onPrivateRoomCreated((data) => {
      setRoomCode(data.roomCode);
      setIsLobby(true);
    });

    socketService.onPrivateRoomUpdate((data) => {
      setPlayers(data.players || []);
      setIsLobby(true);
    });

    socketService.onPrivateRoomError((data) => {
      setError(data.message);
    });

    // We can reuse the 'match_found' event for starting the game!
    // Since backend emits 'match_found' when private room starts.
    const handleMatchFound = (data: any) => {
      if (data.gameId.includes('private')) {
        onGameStart(data.gameId, data.assignedColor, data.activeColors, data.players);
      }
    };
    
    // We actually need to listen to match_found in MatchmakingModal or here.
    // It's better if we listen here too.
    socketService.socket?.on('match_found', handleMatchFound);

    return () => {
      // Don't off everything, just our local handler
      socketService.socket?.off('match_found', handleMatchFound);
    };
  }, [onGameStart]);

  const handleCreate = () => {
    socketService.createPrivateRoom(playerMode, profile, preferredColor);
  };

  const handleJoin = () => {
    if (!joinInput.trim()) return;
    setError('');
    socketService.joinPrivateRoom(joinInput.trim(), profile, preferredColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in flex flex-col">
        {!isLobby ? (
          <>
            <h2 className="text-2xl font-black text-white mb-6 text-center">
              {mode === 'create' ? 'Create Private Room' : 'Join Private Room'}
            </h2>
            
            {mode === 'create' ? (
              <div className="flex flex-col gap-4">
                <div className="text-slate-400 text-sm text-center">Select Match Type</div>
                <div className="flex gap-2">
                  <Button variant={playerMode === 2 ? 'primary' : 'secondary'} fullWidth onClick={() => setPlayerMode(2)}>2 Players</Button>
                  <Button variant={playerMode === 4 ? 'primary' : 'secondary'} fullWidth onClick={() => setPlayerMode(4)}>4 Players</Button>
                </div>
                <Button variant="primary" fullWidth size="lg" className="mt-4" onClick={handleCreate}>
                  Create Room
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="text-slate-400 text-sm text-center">Enter Room Code</div>
                <input 
                  type="text" 
                  value={joinInput}
                  onChange={e => setJoinInput(e.target.value)}
                  className="bg-slate-800 border-2 border-slate-700 text-white font-mono font-bold text-center text-2xl rounded-xl py-3 focus:outline-none focus:border-blue-500 tracking-[0.2em]"
                  placeholder="000000"
                  maxLength={6}
                />
                {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}
                <Button variant="primary" fullWidth size="lg" className="mt-2" onClick={handleJoin}>
                  Join Room
                </Button>
              </div>
            )}

            <button className="mt-6 text-sm font-bold text-slate-400 hover:text-white transition-colors" onClick={onCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-white mb-2 text-center">Room Lobby</h2>
            {roomCode && (
              <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-4 mb-6 text-center">
                <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Room Code</div>
                <div className="text-4xl font-black text-blue-400 tracking-[0.2em]">{roomCode}</div>
                <div className="text-slate-500 text-[10px] mt-2">Share this code with your friends</div>
              </div>
            )}
            
            <div className="flex flex-col gap-2 mb-6">
              <div className="text-slate-400 text-xs font-bold uppercase mb-2">Players Joined ({players.length}/{playerMode})</div>
              {Array.from({ length: playerMode }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {players[i] ? (
                      <img src={players[i].avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-500 text-xs">?</span>
                    )}
                  </div>
                  <div className="flex-1 text-sm font-bold text-slate-300">
                    {players[i] ? players[i].name : 'Waiting...'}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-slate-400 text-xs animate-pulse mb-6">
              Waiting for players to join...
            </div>

            <button className="text-sm font-bold text-slate-400 hover:text-white transition-colors" onClick={onCancel}>
              Leave Room
            </button>
          </>
        )}
      </div>
    </div>
  );
};
