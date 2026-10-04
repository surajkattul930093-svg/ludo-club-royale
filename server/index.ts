import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || '';
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI).then(() => {
    console.log('[+] Connected to MongoDB');
  }).catch((err) => {
    console.error('[-] MongoDB connection error:', err);
  });
} else {
  console.warn('[!] No MONGODB_URI found in .env. Running without database.');
}

app.post('/api/auth/login', async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'Device ID required' });
  try {
    let user = await User.findOne({ deviceId });
    if (!user) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      user = new User({ deviceId, username: 'Guest_' + randomId });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/user/update', async (req, res) => {
  const { deviceId, coins, won } = req.body;
  try {
    const user = await User.findOne({ deviceId });
    if (user) {
      if (coins !== undefined) user.coins = coins;
      if (won) user.gamesWon += 1;
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let waitingPlayers2: { socketId: string; }[] = [];
let waitingPlayers4: { socketId: string; }[] = [];
const activeRooms: Record<string, { players: string[] }> = {};
const socketGameMap: Record<string, { roomId: string, color: string }> = {};
const activePlayerSockets = new Map<string, string>(); // roomId_color -> socket.id
const disconnectTimers = new Map<string, NodeJS.Timeout>();

io.on('connection', (socket: Socket) => {
  console.log(`[+] User connected: ${socket.id}`);

  socket.on('join_random_match', (data?: { mode: number }) => {
    const mode = data?.mode === 4 ? 4 : 2;
    console.log(`[Queue] Player joined ${mode}-player queue: ${socket.id}`);
    
    const queue = mode === 4 ? waitingPlayers4 : waitingPlayers2;

    if (!queue.find(p => p.socketId === socket.id)) {
      queue.push({ socketId: socket.id });
    }

    io.emit(`queue_update_${mode}`, { count: queue.length });

    if (queue.length >= mode) {
      console.log(`[Matchmaking] Found enough players for ${mode}p game!`);
      const matchPlayers = queue.splice(0, mode);
      const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      activeRooms[gameId] = { players: matchPlayers.map(p => p.socketId) };
      const colors = ['blue', 'yellow', 'green', 'red'];
      
      matchPlayers.forEach((p, index) => {
        socketGameMap[p.socketId] = { roomId: gameId, color: colors[index] };
        activePlayerSockets.set(`${gameId}_${colors[index]}`, p.socketId);

        const playerSocket = io.sockets.sockets.get(p.socketId);
        if (playerSocket) {
          playerSocket.join(gameId);
          playerSocket.emit('match_found', {
            gameId: gameId,
            assignedColor: colors[index],
            players: matchPlayers.map((mp, i) => ({ id: mp.socketId, color: colors[i] }))
          });
        }
      });
      io.emit(`queue_update_${mode}`, { count: queue.length });
    }
  });

  socket.on('leave_queue', () => {
    waitingPlayers2 = waitingPlayers2.filter(p => p.socketId !== socket.id);
    waitingPlayers4 = waitingPlayers4.filter(p => p.socketId !== socket.id);
    io.emit('queue_update_2', { count: waitingPlayers2.length });
    io.emit('queue_update_4', { count: waitingPlayers4.length });
    console.log(`[Queue] Player left: ${socket.id}`);
  });

  socket.on('rejoin_game', (data: { gameId: string, color: string }) => {
    if (data.gameId && data.color) {
      socket.join(data.gameId);
      socketGameMap[socket.id] = { roomId: data.gameId, color: data.color };
      
      const playerKey = `${data.gameId}_${data.color}`;
      activePlayerSockets.set(playerKey, socket.id); // Update active socket!

      if (disconnectTimers.has(playerKey)) {
        clearTimeout(disconnectTimers.get(playerKey));
        disconnectTimers.delete(playerKey);
        console.log(`[+] Player reconnected in time and cleared timer: ${data.color}`);
      }
    }
  });

  socket.on('game_action', (data) => {
    let gameRoom = data.gameId;
    if (!gameRoom) {
      const rooms = Array.from(socket.rooms);
      gameRoom = rooms.find(r => r.startsWith('game_'));
    }

    if (gameRoom) {
      if (!socket.rooms.has(gameRoom)) {
        socket.join(gameRoom);
      }
      socket.to(gameRoom).emit('game_action', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[-] User disconnected: ${socket.id}`);
    
    // Handle player leaving mid-game with grace period
    const gameInfo = socketGameMap[socket.id];
    if (gameInfo) {
      const playerKey = `${gameInfo.roomId}_${gameInfo.color}`;
      
      // CRITICAL: Only start the disconnect timer if this socket is STILL the active socket for this player.
      // If they already reconnected on a new socket, activePlayerSockets[playerKey] will be different.
      if (activePlayerSockets.get(playerKey) === socket.id) {
        console.log(`[!] Starting 45s disconnect timer for ${playerKey}`);
        const timer = setTimeout(() => {
          // Double check they didn't reconnect during the 45 seconds
          if (activePlayerSockets.get(playerKey) === socket.id || !activePlayerSockets.has(playerKey)) {
            io.to(gameInfo.roomId).emit('game_action', { type: 'PLAYER_LEFT', color: gameInfo.color });
          }
          disconnectTimers.delete(playerKey);
        }, 45000);
        
        disconnectTimers.set(playerKey, timer);
      } else {
        console.log(`[!] Ignoring disconnect for ${playerKey} because they already reconnected on a new socket.`);
      }
      
      delete socketGameMap[socket.id];
    }

    waitingPlayers2 = waitingPlayers2.filter(p => p.socketId !== socket.id);
    waitingPlayers4 = waitingPlayers4.filter(p => p.socketId !== socket.id);
    io.emit('queue_update_2', { count: waitingPlayers2.length });
    io.emit('queue_update_4', { count: waitingPlayers4.length });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Multiplayer Server running on port ${PORT}`);
});
