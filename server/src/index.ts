import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './socket/RoomManager';
import { BOARD_TILES } from './game/BoardConfig';
import { AuthService } from './auth/AuthService';
import { authMiddleware, optionalAuthMiddleware, AuthenticatedRequest } from './auth/authMiddleware';
import { dbService } from './database/Database';

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

// ==================== REST API ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Business Chess 3D Game Server', timestamp: Date.now() });
});

app.get('/api/board', (req, res) => {
  res.json({ tiles: BOARD_TILES });
});

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: roomManager.getPublicRooms() });
});

// --- Authentication Endpoints ---

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, avatarUrl } = req.body;
  const result = AuthService.register({ username, email, password, avatarUrl });
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.status(201).json({
    message: 'Đăng ký tài khoản thành công',
    token: result.token,
    user: result.user
  });
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, username, email, password } = req.body;
  const loginIdentifier = identifier || username || email;
  const result = AuthService.login({ identifier: loginIdentifier, password });
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }
  return res.json({
    message: 'Đăng nhập thành công',
    token: result.token,
    user: result.user
  });
});

app.post('/api/auth/logout', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  let token = req.token;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }
  if (token) {
    AuthService.logout(token);
  }
  return res.json({ success: true, message: 'Đăng xuất thành công' });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user });
});

// --- Achievements Endpoints ---

app.get('/api/achievements', (req, res) => {
  const achievements = dbService.getAllAchievements();
  return res.json({ achievements });
});

app.get('/api/achievements/my', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập' });
  }
  const allAchievements = dbService.getAllAchievements();
  const userUnlocked = dbService.getUserAchievements(req.user.id);
  const unlockedMap = new Map(userUnlocked.map(u => [u.achievement_id, u]));

  const merged = allAchievements.map(ach => {
    const userAch = unlockedMap.get(ach.id);
    return {
      ...ach,
      isUnlocked: !!userAch,
      unlockedAt: userAch ? userAch.unlocked_at : null,
      progress: userAch ? userAch.progress : 0,
      isClaimed: userAch ? Boolean(userAch.is_claimed) : false
    };
  });

  return res.json({
    achievements: merged,
    totalUnlocked: userUnlocked.length,
    totalAvailable: allAchievements.length
  });
});

app.post('/api/achievements/claim', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập' });
  }
  const { achievementId } = req.body;
  if (!achievementId) {
    return res.status(400).json({ error: 'Thiếu mã thành tựu (achievementId)' });
  }

  const result = dbService.claimAchievementReward(req.user.id, achievementId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const updatedUser = dbService.getUserById(req.user.id);
  return res.json({
    success: true,
    message: `Nhận thưởng thành công +${result.rewardGold} vàng!`,
    rewardGold: result.rewardGold,
    currentGoldBalance: updatedUser?.gold_balance
  });
});

// ==================== Socket.io Handlers ====================

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Socket Authentication handshake
  socket.on('auth:authenticate', (data: { token: string }) => {
    if (data?.token) {
      const user = AuthService.authenticateToken(data.token);
      if (user) {
        socket.data.user = user;
        roomManager.setSocketUser(socket.id, user.id);
        socket.emit('auth:authenticated', { user });
        return;
      }
    }
    socket.emit('auth:error', { message: 'Xác thực không thành công' });
  });

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

  socket.on('game:mortgage_property', (data: { tileId: number }) => {
    roomManager.handleMortgageProperty(socket, data.tileId);
  });

  socket.on('game:unmortgage_property', (data: { tileId: number }) => {
    roomManager.handleUnmortgageProperty(socket, data.tileId);
  });

  socket.on('game:sell_building', (data: { tileId: number }) => {
    roomManager.handleSellBuilding(socket, data.tileId);
  });

  socket.on('game:use_jail_card', () => {
    roomManager.handleUseJailCard(socket);
  });

  socket.on('game:pay_jail_fine', () => {
    roomManager.handlePayJailFine(socket);
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

export { app, server };
