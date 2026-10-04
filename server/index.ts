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

// Connect to MongoDB
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

// API Routes
app.post('/api/auth/login', async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'Device ID required' });
  try {
    let user = await User.findOne({ deviceId });
    if (!user) {
      // Create new guest user
      const randomId = Math.floor(1000 + Math.random() * 9000);
      user = new User({
        deviceId,
        username: 'Guest_' + randomId,
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error(err);
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
    origin: '*', // In production, restrict to your frontend domain
    methods: ['GET', 'POST'],
  },
});

// Simple Matchmaking Queue
// In memory: Array of socket ids waiting for a match
let waitingPlayers: { socketId: string; }[] = [];

// Room Data
const activeRooms: Record<string, { players: string[] }> = {};

io.on('connection', (socket: Socket) => {
  console.log(`[+] User connected: ${socket.id}`);

  // When a player clicks "Online Matchmaking"
  socket.on('join_random_match', () => {
    console.log(`[Queue] Player joined: ${socket.id}`);
    
    // Prevent double joining
    if (!waitingPlayers.find(p => p.socketId === socket.id)) {
      waitingPlayers.push({ socketId: socket.id });
    }

    // Broadcast queue size to everyone waiting (for UI)
    io.emit('queue_update', { count: waitingPlayers.length });

    // Check if we have 4 players for a full match
    // (For MVP testing, you can change this to 2 to test with 2 tabs)
    const REQUIRED_PLAYERS = 2; 

    if (waitingPlayers.length >= REQUIRED_PLAYERS) {
      console.log(`[Matchmaking] Found enough players! Starting game...`);
      
      const matchPlayers = waitingPlayers.splice(0, REQUIRED_PLAYERS);
      const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      activeRooms[gameId] = {
        players: matchPlayers.map(p => p.socketId)
      };

      // Assign colors and join room
      const colors = ['blue', 'yellow', 'green', 'red'];
      
      matchPlayers.forEach((p, index) => {
        const playerSocket = io.sockets.sockets.get(p.socketId);
        if (playerSocket) {
          playerSocket.join(gameId);
          playerSocket.emit('match_found', {
            gameId,
            assignedColor: colors[index],
            players: matchPlayers.map((mp, i) => ({
              id: mp.socketId,
              color: colors[i]
            }))
          });
        }
      });

      // Update queue for remaining players
      io.emit('queue_update', { count: waitingPlayers.length });
    }
  });

  socket.on('leave_queue', () => {
    waitingPlayers = waitingPlayers.filter(p => p.socketId !== socket.id);
    io.emit('queue_update', { count: waitingPlayers.length });
    console.log(`[Queue] Player left: ${socket.id}`);
  });

  socket.on('game_action', (data) => {
    // Broadcast to the room the socket is currently in (except itself)
    const rooms = Array.from(socket.rooms);
    const gameRoom = rooms.find(r => r.startsWith('game_'));
    if (gameRoom) {
      socket.to(gameRoom).emit('game_action', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[-] User disconnected: ${socket.id}`);
    // Remove from queue if they disconnect while waiting
    waitingPlayers = waitingPlayers.filter(p => p.socketId !== socket.id);
    io.emit('queue_update', { count: waitingPlayers.length });
    
    // TODO: Handle disconnection during an active match (replace with bot)
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Multiplayer Server running on http://localhost:${PORT}`);
});


