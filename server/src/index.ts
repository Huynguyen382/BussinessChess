import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './socket/RoomManager';
import { BOARD_TILES } from './game/BoardConfig';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager(io);

// REST API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Business Chess 3D Game Server', timestamp: Date.now() });
});

app.get('/api/board', (req, res) => {
  res.json({ tiles: BOARD_TILES });
});

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: roomManager.getPublicRooms() });
});

// Socket.io Handlers
io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('room:list', () => {
    socket.emit('room:list_response', { rooms: roomManager.getPublicRooms() });
  });

  socket.on('room:create', (payload) => {
    try {
      const room = roomManager.createRoom(socket, payload);
      socket.emit('room:created', {
        roomCode: room.roomCode,
        name: room.name,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
        players: room.engine?.players || []
      });
      roomManager.broadcastRoomUpdate(room);
    } catch (err: any) {
      socket.emit('error:message', { message: err.message });
    }
  });

  socket.on('room:join', (payload) => {
    const res = roomManager.joinRoom(socket, payload);
    if (res.success && res.room) {
      socket.emit('room:joined', {
        roomCode: res.room.roomCode,
        name: res.room.name,
        hostId: res.room.hostId,
        maxPlayers: res.room.maxPlayers,
        players: res.room.engine?.players || []
      });
      roomManager.broadcastRoomUpdate(res.room);
    } else {
      socket.emit('error:message', { message: res.error || 'Không thể tham gia phòng' });
    }
  });

  socket.on('room:add_bot', () => {
    roomManager.addBot(socket);
  });

  socket.on('room:start', () => {
    const res = roomManager.startGame(socket);
    if (!res.success) {
      socket.emit('error:message', { message: res.error });
    }
  });

  socket.on('game:roll_dice', () => {
    roomManager.handleRollDice(socket);
  });

  socket.on('game:buy_property', (data: { tileId: number }) => {
    roomManager.handleBuyProperty(socket, data.tileId);
  });

  socket.on('game:skip_buy', () => {
    roomManager.handleSkipBuy(socket);
  });

  socket.on('game:end_turn', () => {
    roomManager.handleEndTurn(socket);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    roomManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Business Chess 3D Game Server listening on http://localhost:${PORT}`);
});
