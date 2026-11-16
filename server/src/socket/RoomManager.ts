import { Server, Socket } from 'socket.io';
import { MonopolyEngine, PlayerCustomization, TokenType } from '../game/MonopolyEngine';
import { BotAI } from '../game/BotAI';
import { BOARD_TILES } from '../game/BoardConfig';
import { AchievementEngine } from '../achievements/AchievementEngine';
import { dbService } from '../database/Database';

export interface RoomInfo {
  id: string;
  roomCode: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  initialCash: number;
  turnTimeout: number;
  isPrivate: boolean;
  password?: string;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  createdAt: number;
  engine?: MonopolyEngine;
  timerInterval?: NodeJS.Timeout;
}

export class RoomManager {
  private io: Server;
  private rooms: Map<string, RoomInfo> = new Map(); // key: roomCode
  private userToRoom: Map<string, string> = new Map(); // key: socketId -> roomCode
  private socketToUserId: Map<string, string> = new Map(); // socketId -> registered userId
  private onlineSocketsByUserId: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  constructor(io: Server) {
    this.io = io;
    AchievementEngine.init(io);
  }

  public setSocketUser(socketId: string, userId?: string) {
    if (!userId) {
      this.removeOnlineSocket(socketId);
      return;
    }
    const oldUserId = this.socketToUserId.get(socketId);
    if (oldUserId && oldUserId !== userId) {
      this.removeOnlineSocket(socketId);
    }
    this.socketToUserId.set(socketId, userId);
    let socketSet = this.onlineSocketsByUserId.get(userId);
    if (!socketSet) {
      socketSet = new Set();
      this.onlineSocketsByUserId.set(userId, socketSet);
    }
    socketSet.add(socketId);
  }

  public removeOnlineSocket(socketId: string) {
    const userId = this.socketToUserId.get(socketId);
    if (userId) {
      const socketSet = this.onlineSocketsByUserId.get(userId);
      if (socketSet) {
        socketSet.delete(socketId);
        if (socketSet.size === 0) {
          this.onlineSocketsByUserId.delete(userId);
        }
      }
      this.socketToUserId.delete(socketId);
    }
  }

  public isUserOnline(userId: string): boolean {
    const socketSet = this.onlineSocketsByUserId.get(userId);
    return !!socketSet && socketSet.size > 0;
  }

  public getUserRoomCode(userId: string): string | undefined {
    const socketSet = this.onlineSocketsByUserId.get(userId);
    if (!socketSet) return undefined;
    for (const sid of socketSet) {
      const rCode = this.userToRoom.get(sid);
      if (rCode) return rCode;
    }
    return undefined;
  }

  public getOnlineSocketsForUser(userId: string): string[] {
    const socketSet = this.onlineSocketsByUserId.get(userId);
    return socketSet ? Array.from(socketSet) : [];
  }

  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public createRoom(
    socket: Socket,
    payload: {
      name: string;
      username: string;
      userId?: string;
      maxPlayers?: number;
      isPrivate?: boolean;
      password?: string;
      initialCash?: number;
      turnTimeout?: number;
      frame?: string;
      token?: string;
    }
  ): RoomInfo {
    const roomCode = this.generateRoomCode();
    const initialCash = payload.initialCash || 1500;
    const turnTimeout = payload.turnTimeout || 30;

    const room: RoomInfo = {
      id: Math.random().toString(36).substring(2, 9),
      roomCode,
      name: payload.name || `Phòng của ${payload.username}`,
      hostId: socket.id,
      maxPlayers: Math.min(4, Math.max(2, payload.maxPlayers || 4)),
      initialCash,
      turnTimeout,
      isPrivate: !!payload.isPrivate,
      password: payload.password,
      status: 'WAITING',
      createdAt: Date.now(),
      engine: new MonopolyEngine(roomCode, initialCash, turnTimeout)
    };

    this.rooms.set(roomCode, room);
    this.userToRoom.set(socket.id, roomCode);
    this.setSocketUser(socket.id, payload.userId);
    let userFrame = payload.frame || 'frame_default';
    let customization: PlayerCustomization | undefined;
    const userId = payload.userId || null;
    let preferredToken: TokenType = (payload.token as TokenType) || 'car';

    if (userId) {
      const user = dbService.getUserById(userId);
      if (user) {
        if (user.equipped_frame) userFrame = user.equipped_frame;
        if (!payload.token && user.equipped_token) {
          preferredToken = user.equipped_token as TokenType;
        }
        customization = {
          token: preferredToken,
          diceSkin: user.equipped_dice || 'dice_ivory',
          trailEffect: user.equipped_trail || 'trail_default',
          title: user.equipped_title || 'title_rookie',
          bio: user.bio || '',
          avatar: user.avatar_url || undefined
        };
      }
    }

    if (!dbService.isTokenUnlocked(userId, preferredToken)) {
      preferredToken = 'car';
    }
    if (customization) {
      customization.token = preferredToken;
    } else {
      customization = { token: preferredToken };
    }

    socket.join(roomCode);

    // Host joins as first player
    room.engine?.addPlayer(socket.id, socket.id, payload.username, true, initialCash, userFrame, customization);

    return room;
  }

  public joinRoom(
    socket: Socket,
    payload: { roomCode: string; username: string; userId?: string; password?: string; frame?: string; token?: string }
  ): { success: boolean; room?: RoomInfo; error?: string } {
    const room = this.rooms.get(payload.roomCode.toUpperCase());
    if (!room) {
      return { success: false, error: 'Phòng không tồn tại' };
    }

    if (room.password && room.password !== payload.password) {
      return { success: false, error: 'Mật khẩu phòng không đúng' };
    }

    if (room.status !== 'WAITING') {
      return { success: false, error: 'Ván đấu đã bắt đầu' };
    }

    if (!room.engine || room.engine.players.length >= room.maxPlayers) {
      return { success: false, error: 'Phòng đã đầy người chơi' };
    }

    this.userToRoom.set(socket.id, room.roomCode);
    this.setSocketUser(socket.id, payload.userId);
    let userFrame = payload.frame || 'frame_default';
    let customization: PlayerCustomization | undefined;
    const userId = payload.userId || null;
    let preferredToken: TokenType = (payload.token as TokenType) || 'car';

    if (userId) {
      const user = dbService.getUserById(userId);
      if (user) {
        if (user.equipped_frame) userFrame = user.equipped_frame;
        if (!payload.token && user.equipped_token) {
          preferredToken = user.equipped_token as TokenType;
        }
        customization = {
          token: preferredToken,
          diceSkin: user.equipped_dice || 'dice_ivory',
          trailEffect: user.equipped_trail || 'trail_default',
          title: user.equipped_title || 'title_rookie',
          bio: user.bio || '',
          avatar: user.avatar_url || undefined
        };
      }
    }

    if (!dbService.isTokenUnlocked(userId, preferredToken)) {
      preferredToken = 'car';
    }
    if (customization) {
      customization.token = preferredToken;
    } else {
      customization = { token: preferredToken };
    }

    socket.join(room.roomCode);

    const player = room.engine.addPlayer(socket.id, socket.id, payload.username, false, room.initialCash, userFrame, customization);
    player.isReady = false;

    return { success: true, room };
  }

  public addBot(socket: Socket): { success: boolean; error?: string } {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return { success: false, error: 'Không ở trong phòng' };

    const room = this.rooms.get(roomCode);
    if (!room || !room.engine) return { success: false, error: 'Phòng không tồn tại' };

    if (room.hostId !== socket.id) return { success: false, error: 'Chỉ chủ phòng mới được thêm Bot' };
    if (room.status !== 'WAITING') return { success: false, error: 'Ván đấu đã bắt đầu' };
    if (room.engine.players.length >= room.maxPlayers) return { success: false, error: 'Phòng đã đủ người' };

    const botNames = ['Tỷ Phú Elon', 'Đại Gia David', 'Tiểu Thư Luna', 'Nhà Đầu Tư Sam'];
    const botName = botNames[room.engine.players.length % botNames.length];
    const botId = `bot_${Math.random().toString(36).substring(2, 7)}`;
    const botFrames = ['frame_gray_starter', 'frame_blue_dice', 'frame_gold_monopoly', 'frame_orange_landmark', 'frame_red_dragon'];
    const botFrame = botFrames[room.engine.players.length % botFrames.length];
    const botTokens: TokenType[] = ['dragon', 'lotus', 'yacht', 'crown', 'cyclo', 'robot'];
    const botDiceSkins = ['dice_gold', 'dice_emerald', 'dice_obsidian', 'dice_ruby'];
    const botTrails = ['trail_gold', 'trail_sakura', 'trail_neon', 'trail_default'];
    const botTitles = ['title_tycoon', 'title_shark', 'title_traveler', 'title_emperor'];
    const idx = room.engine.players.length;

    const player = room.engine.addPlayer(botId, botId, botName, false, room.initialCash, botFrame, {
      token: botTokens[idx % botTokens.length],
      diceSkin: botDiceSkins[idx % botDiceSkins.length],
      trailEffect: botTrails[idx % botTrails.length],
      title: botTitles[idx % botTitles.length]
    });
    player.isBot = true;
    player.isReady = true;

    this.broadcastRoomUpdate(room);
    return { success: true };
  }

  public handleToggleReady(
    socket: Socket,
    ready?: boolean
  ): { success: boolean; isReady?: boolean; error?: string } {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return { success: false, error: 'Không ở trong phòng' };

    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'WAITING') {
      return { success: false, error: 'Phòng không ở trạng thái chờ' };
    }

    const player = room.engine.players.find(p => p.id === socket.id || p.socketId === socket.id);
    if (!player) return { success: false, error: 'Không tìm thấy người chơi' };

    player.isReady = typeof ready === 'boolean' ? ready : !player.isReady;
    this.broadcastRoomUpdate(room);
    return { success: true, isReady: player.isReady };
  }

  public handleSelectToken(
    socket: Socket,
    tokenOrPayload: any
  ): { success: boolean; token?: TokenType; error?: string } {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return { success: false, error: 'Không ở trong phòng' };

    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'WAITING') {
      return { success: false, error: 'Phòng không ở trạng thái chờ' };
    }

    const token = typeof tokenOrPayload === 'string' ? tokenOrPayload : tokenOrPayload?.token;
    if (!token || !MonopolyEngine.TOKEN_TYPES.includes(token as TokenType)) {
      return { success: false, error: 'Model nhân vật không hợp lệ' };
    }

    const userId = this.socketToUserId.get(socket.id) || null;
    if (!dbService.isTokenUnlocked(userId, token)) {
      const errorMsg = 'Model nhân vật này đang bị khóa! Hãy mở khóa bằng Vàng trong Hồ Sơ.';
      socket.emit('error:message', { message: errorMsg });
      return { success: false, error: errorMsg };
    }

    const player = room.engine.players.find(p => p.id === socket.id || p.socketId === socket.id);
    if (!player) return { success: false, error: 'Không tìm thấy người chơi' };

    player.token = token as TokenType;
    this.broadcastRoomUpdate(room);
    return { success: true, token: player.token };
  }

  public handleInviteFriend(
    socket: Socket,
    data: { friendId: string; roomCode?: string }
  ): { success: boolean; error?: string } {
    if (!data?.friendId) {
      const err = 'Thiếu friendId để mời';
      socket.emit('error:message', { message: err });
      return { success: false, error: err };
    }

    const roomCode = data.roomCode || this.userToRoom.get(socket.id);
    if (!roomCode) {
      const err = 'Bạn không ở trong phòng nào';
      socket.emit('error:message', { message: err });
      return { success: false, error: err };
    }

    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || !room.engine) {
      const err = 'Phòng không tồn tại';
      socket.emit('error:message', { message: err });
      return { success: false, error: err };
    }

    if (room.status !== 'WAITING') {
      const err = 'Trận đấu trong phòng này đã bắt đầu';
      socket.emit('error:message', { message: err });
      return { success: false, error: err };
    }

    if (room.engine.players.length >= room.maxPlayers) {
      const err = 'Phòng đã đủ số lượng người chơi';
      socket.emit('error:message', { message: err });
      return { success: false, error: err };
    }

    const inviter = room.engine.players.find(p => p.id === socket.id || p.socketId === socket.id);
    const inviterName = inviter?.username || 'Bạn của bạn';
    const inviterId = this.socketToUserId.get(socket.id) || socket.id;

    const targetSockets = this.getOnlineSocketsForUser(data.friendId);
    if (targetSockets.length === 0) {
      const err = 'Người bạn này hiện không online';
      socket.emit('error:message', { message: err });
      return { success: false, error: err };
    }

    const invitePayload = {
      roomCode: room.roomCode,
      roomName: room.name,
      inviterId,
      inviterName,
      isProtected: Boolean(room.password),
      roomPassword: room.password || undefined
    };

    for (const sid of targetSockets) {
      this.io.to(sid).emit('room:invite_received', invitePayload);
    }

    socket.emit('room:invite_sent', { success: true, friendId: data.friendId, roomCode: room.roomCode });
    return { success: true };
  }

  public startGame(socket: Socket): { success: boolean; error?: string } {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return { success: false, error: 'Không ở trong phòng' };

    const room = this.rooms.get(roomCode);
    if (!room || !room.engine) return { success: false, error: 'Phòng không tồn tại' };

    if (room.hostId !== socket.id) return { success: false, error: 'Chỉ chủ phòng mới được bắt đầu' };
    if (room.status !== 'WAITING') return { success: false, error: 'Ván đấu đã bắt đầu' };
    if (room.engine.players.length < 2) return { success: false, error: 'Cần ít nhất 2 người chơi để bắt đầu' };

    const unreadyPlayers = room.engine.players.filter(p => !p.isReady);
    if (unreadyPlayers.length > 0) {
      return { success: false, error: 'Chưa thể bắt đầu: Vẫn còn người chơi chưa sẵn sàng!' };
    }

    room.status = 'PLAYING';
    const { firstTurnUserId } = room.engine.startGame();

    // Initialize AchievementEngine for this room session
    AchievementEngine.initRoom(room.roomCode, room.engine.players);
    for (const p of room.engine.players) {
      const uid = this.socketToUserId.get(p.socketId);
      if (uid) {
        AchievementEngine.setPlayerUserId(room.roomCode, p.id, uid);
      }
    }

    this.io.to(room.roomCode).emit('game:start', {
      boardData: BOARD_TILES,
      snapshot: room.engine.getSnapshot(),
      firstTurnUserId
    });

    this.startTurnTimer(room);
    this.checkTriggerBot(room);

    return { success: true };
  }

  public handleRollDice(socket: Socket) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    try {
      const player = room.engine.players.find(p => p.id === socket.id);
      const result = room.engine.rollDice(socket.id);

      if (player) {
        AchievementEngine.onDiceRolled(
          room.roomCode,
          player,
          result.dice,
          result.isDouble,
          room.engine.turnState.consecutiveDoubles
        );

        if (result.passedGo) {
          AchievementEngine.onPassedGo(room.roomCode, player, room.engine);
        }

        if (result.actionResult && result.actionResult.type === 'PAY_RENT') {
          const prop = room.engine.properties.get(result.actionResult.tileId);
          const owner = room.engine.players.find(p => p.id === prop?.ownerId);
          if (owner) {
            AchievementEngine.onRentPaid(
              room.roomCode,
              player,
              owner,
              result.actionResult.amount,
              room.engine
            );
          }
        }
      }

      this.io.to(room.roomCode).emit('game:dice_result', {
        userId: socket.id,
        dice1: result.dice[0],
        dice2: result.dice[1],
        isDouble: result.isDouble,
        prevPosition: result.prevPosition,
        newPosition: result.newPosition,
        passedGo: result.passedGo,
        actionResult: result.actionResult,
        snapshot: room.engine.getSnapshot()
      });

      this.resetTurnTimer(room);
      this.checkBankruptcyOrGameOver(room);
      this.checkTriggerBot(room);
    } catch (err: any) {
      socket.emit('error:message', { message: err.message });
    }
  }

  public handleChooseAirportDestination(socket: Socket, targetTileId: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    try {
      const player = room.engine.players.find(p => p.id === socket.id);
      const result = room.engine.chooseAirportDestination(socket.id, targetTileId);
      if (!result.success) {
        socket.emit('error:message', { message: result.error || 'Không thể chọn ô này' });
        return;
      }

      if (player && result.passedGo) {
        AchievementEngine.onPassedGo(room.roomCode, player, room.engine);
      }

      if (player && result.actionResult && result.actionResult.type === 'PAY_RENT') {
        const prop = room.engine.properties.get(result.actionResult.tileId);
        const owner = room.engine.players.find(p => p.id === prop?.ownerId);
        if (owner) {
          AchievementEngine.onRentPaid(
            room.roomCode,
            player,
            owner,
            result.actionResult.amount,
            room.engine
          );
        }
      }

      this.io.to(room.roomCode).emit('game:airport_flight_result', {
        userId: socket.id,
        prevPosition: result.prevPosition,
        newPosition: result.newPosition,
        passedGo: result.passedGo,
        actionResult: result.actionResult,
        snapshot: room.engine.getSnapshot()
      });

      this.resetTurnTimer(room);
      this.checkBankruptcyOrGameOver(room);
      this.checkTriggerBot(room);
    } catch (err: any) {
      socket.emit('error:message', { message: err.message });
    }
  }

  public handleBuyProperty(socket: Socket, tileId: number, targetLevel?: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const player = room.engine.players.find(p => p.id === socket.id);
    const result = room.engine.buyProperty(socket.id, tileId, targetLevel);
    if (result.success) {
      if (player) {
        AchievementEngine.onPropertyBought(
          room.roomCode,
          player,
          tileId,
          result.level,
          room.engine
        );
      }

      this.io.to(room.roomCode).emit('game:property_updated', {
        tileId: result.tileId,
        ownerId: socket.id,
        level: result.level,
        remainingCash: result.remainingCash,
        snapshot: room.engine.getSnapshot()
      });
      this.resetTurnTimer(room);
      this.checkBankruptcyOrGameOver(room);
      this.checkTriggerBot(room);
    } else {
      socket.emit('error:message', { message: result.error });
    }
  }

  public handleBuyoutProperty(socket: Socket, tileId: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const result = room.engine.buyoutProperty(socket.id, tileId);
    if (result.success) {
      this.io.to(room.roomCode).emit('game:property_updated', {
        tileId: result.tileId,
        ownerId: socket.id,
        level: result.level,
        remainingCash: result.remainingCash,
        isBuyout: true,
        snapshot: room.engine.getSnapshot()
      });
      this.resetTurnTimer(room);
      this.checkBankruptcyOrGameOver(room);
      this.checkTriggerBot(room);
    } else {
      socket.emit('error:message', { message: result.error });
    }
  }

  public handleSkipBuyout(socket: Socket) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.skipBuyout(socket.id);
    if (res.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
      this.resetTurnTimer(room);
      this.checkTriggerBot(room);
    }
  }

  public handleSelectFestival(socket: Socket, tileId: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.selectFestivalTile(socket.id, tileId);
    if (res.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
      this.resetTurnTimer(room);
      this.checkTriggerBot(room);
    } else {
      socket.emit('error:message', { message: res.error });
    }
  }

  public handleSkipBuy(socket: Socket) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.skipBuyProperty(socket.id);
    if (res.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
      this.resetTurnTimer(room);
      if (res.phase === 'AUCTION') {
        this.triggerAuctionBots(room);
      } else {
        this.checkTriggerBot(room);
      }
    }
  }

  private broadcastAuctionResolved(
    room: RoomInfo,
    resolveRes?: { winnerId: string | null; tileId: number | null; amount: number }
  ) {
    if (!room.engine) return;
    const winner = resolveRes?.winnerId
      ? room.engine.players.find(p => p.id === resolveRes.winnerId)
      : null;
    const tile =
      resolveRes?.tileId !== null && resolveRes?.tileId !== undefined
        ? BOARD_TILES[resolveRes.tileId]
        : null;

    this.io.to(room.roomCode).emit('game:auction_resolved', {
      snapshot: room.engine.getSnapshot(),
      winnerName: winner?.username || null,
      amount: resolveRes?.amount || 0,
      tileName: tile?.name || null
    });
    this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
    this.resetTurnTimer(room);
    this.checkBankruptcyOrGameOver(room);
    this.checkTriggerBot(room);
  }

  public handleAuctionBid(socket: Socket, amount: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.placeAuctionBid(socket.id, amount);
    if (res.success) {
      if (res.resolved) {
        this.broadcastAuctionResolved(room, res.resolveRes);
      } else {
        this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
        this.triggerAuctionBots(room);
      }
    } else {
      socket.emit('error:message', { message: res.error });
    }
  }

  public handleAuctionPass(socket: Socket) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.passAuction(socket.id);
    if (res.success) {
      if (res.resolved) {
        this.broadcastAuctionResolved(room, res.resolveRes);
      } else {
        this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
      }
    } else {
      socket.emit('error:message', { message: res.error });
    }
  }

  public handleProposeTrade(socket: Socket, data: { receiverId: string; offered: any; requested: any }) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.proposeTrade(socket.id, data.receiverId, data.offered, data.requested);
    if (res.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
      this.triggerTradeBots(room);
    } else {
      socket.emit('error:message', { message: res.error });
    }
  }

  public handleAcceptTrade(socket: Socket, tradeId: string) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.acceptTrade(tradeId, socket.id);
    if (res.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
      this.checkBankruptcyOrGameOver(room);
    } else {
      socket.emit('error:message', { message: res.error });
    }
  }

  public handleRejectTrade(socket: Socket, tradeId: string) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.rejectTrade(tradeId, socket.id);
    if (res.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
    } else {
      socket.emit('error:message', { message: res.error });
    }
  }

  public handleCancelTrade(socket: Socket, tradeId: string) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const res = room.engine.cancelTrade(tradeId, socket.id);
    if (res.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
    } else {
      socket.emit('error:message', { message: res.error });
    }
  }

  public handleMortgageProperty(socket: Socket, tileId: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const result = room.engine.mortgageProperty(socket.id, tileId);
    if (result.success) {
      this.io.to(room.roomCode).emit('game:property_mortgaged', {
        tileId: result.tileId,
        ownerId: socket.id,
        mortgageValue: result.mortgageValue,
        remainingCash: result.remainingCash,
        snapshot: room.engine.getSnapshot()
      });
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
    } else {
      socket.emit('error:message', { message: result.error });
    }
  }

  public handleUnmortgageProperty(socket: Socket, tileId: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const result = room.engine.unmortgageProperty(socket.id, tileId);
    if (result.success) {
      this.io.to(room.roomCode).emit('game:property_unmortgaged', {
        tileId: result.tileId,
        ownerId: socket.id,
        cost: result.cost,
        remainingCash: result.remainingCash,
        snapshot: room.engine.getSnapshot()
      });
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
      this.checkBankruptcyOrGameOver(room);
    } else {
      socket.emit('error:message', { message: result.error });
    }
  }

  public handleSellBuilding(socket: Socket, tileId: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const result = room.engine.sellBuilding(socket.id, tileId);
    if (result.success) {
      this.io.to(room.roomCode).emit('game:property_updated', {
        tileId: result.tileId,
        ownerId: socket.id,
        level: result.level,
        remainingCash: result.remainingCash,
        snapshot: room.engine.getSnapshot()
      });
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
    } else {
      socket.emit('error:message', { message: result.error });
    }
  }

  public handleUseJailCard(socket: Socket) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const result = room.engine.useGetOutOfJailCard(socket.id);
    if (result.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
    } else {
      socket.emit('error:message', { message: result.error });
    }
  }

  public handlePayJailFine(socket: Socket) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const result = room.engine.payJailFine(socket.id);
    if (result.success) {
      this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
    } else {
      socket.emit('error:message', { message: result.error });
    }
  }

  public handleEndTurn(socket: Socket) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    try {
      const { nextUserId, isGameOver } = room.engine.endTurn(socket.id);

      if (isGameOver) {
        room.status = 'FINISHED';
        if (room.timerInterval) clearInterval(room.timerInterval);
        const winner = room.engine.players.find(p => p.id === room.engine!.winnerId);
        if (winner) {
          AchievementEngine.onGameOver(room.roomCode, winner, room.engine);
        }
        this.io.to(room.roomCode).emit('game:over', {
          winnerId: room.engine.winnerId,
          snapshot: room.engine.getSnapshot()
        });
      } else {
        this.io.to(room.roomCode).emit('game:turn_change', {
          nextUserId,
          timeRemaining: room.turnTimeout,
          snapshot: room.engine.getSnapshot()
        });
        this.resetTurnTimer(room);
        this.checkTriggerBot(room);
      }
    } catch (err: any) {
      socket.emit('error:message', { message: err.message });
    }
  }

  private startTurnTimer(room: RoomInfo) {
    if (room.timerInterval) clearInterval(room.timerInterval);

    room.timerInterval = setInterval(() => {
      if (!room.engine || room.status !== 'PLAYING') return;

      // Check Match Timer (20 minutes default)
      const matchRemaining = room.engine.getMatchTimeRemaining();
      if (matchRemaining <= 0 && !room.engine.isGameOver) {
        room.engine.resolveMatchTimeout();
        this.checkBankruptcyOrGameOver(room);
        return;
      }

      // Check Auction Timer
      if (room.engine.turnState.phase === 'AUCTION' && room.engine.auctionState) {
        if (Date.now() >= room.engine.auctionState.endTime) {
          const resolveRes = room.engine.resolveAuction();
          this.broadcastAuctionResolved(room, resolveRes);
        }
        return;
      }

      const elapsed = Math.floor((Date.now() - room.engine.turnState.turnStartTime) / 1000);
      const remaining = Math.max(0, room.turnTimeout - elapsed);

      this.io.to(room.roomCode).emit('game:timer_tick', { remaining, matchTimeRemaining: matchRemaining });

      if (remaining <= 0) {
        // Hết thời gian lượt: Tự động xử lý
        const curPlayer = room.engine.getCurrentPlayer();
        if (curPlayer) {
          if (room.engine.turnState.phase === 'ROLL_DICE') {
            try {
              const res = room.engine.rollDice(curPlayer.id);
              AchievementEngine.onDiceRolled(
                room.roomCode,
                curPlayer,
                res.dice,
                res.isDouble,
                room.engine.turnState.consecutiveDoubles
              );
              if (res.passedGo) {
                AchievementEngine.onPassedGo(room.roomCode, curPlayer, room.engine);
              }
              if (res.actionResult && res.actionResult.type === 'PAY_RENT') {
                const prop = room.engine.properties.get(res.actionResult.tileId);
                const owner = room.engine.players.find(p => p.id === prop?.ownerId);
                if (owner) {
                  AchievementEngine.onRentPaid(
                    room.roomCode,
                    curPlayer,
                    owner,
                    res.actionResult.amount,
                    room.engine
                  );
                }
              }
              this.io.to(room.roomCode).emit('game:dice_result', {
                userId: curPlayer.id,
                dice1: res.dice[0],
                dice2: res.dice[1],
                isDouble: res.isDouble,
                prevPosition: res.prevPosition,
                newPosition: res.newPosition,
                passedGo: res.passedGo,
                actionResult: res.actionResult,
                snapshot: room.engine.getSnapshot()
              });
              this.resetTurnTimer(room);
              this.checkBankruptcyOrGameOver(room);
              this.checkTriggerBot(room);
            } catch (e) {}
          } else if (room.engine.turnState.phase === 'AIRPORT_SELECT') {
            try {
              const res = room.engine.chooseAirportDestination(curPlayer.id, 0); // Mặc định bay về GO
              if (res.success) {
                if (res.passedGo) {
                  AchievementEngine.onPassedGo(room.roomCode, curPlayer, room.engine);
                }
                if (res.actionResult && res.actionResult.type === 'PAY_RENT') {
                  const prop = room.engine.properties.get(res.actionResult.tileId);
                  const owner = room.engine.players.find(p => p.id === prop?.ownerId);
                  if (owner) {
                    AchievementEngine.onRentPaid(
                      room.roomCode,
                      curPlayer,
                      owner,
                      res.actionResult.amount,
                      room.engine
                    );
                  }
                }
                this.io.to(room.roomCode).emit('game:airport_flight_result', {
                  userId: curPlayer.id,
                  prevPosition: res.prevPosition,
                  newPosition: res.newPosition,
                  passedGo: res.passedGo,
                  actionResult: res.actionResult,
                  snapshot: room.engine.getSnapshot()
                });
                this.resetTurnTimer(room);
                this.checkBankruptcyOrGameOver(room);
                this.checkTriggerBot(room);
              }
            } catch (e) {}
          } else {
            // Nếu hết giờ ở BUY_PROPERTY, tự động bỏ qua trước
            if (room.engine.turnState.phase === 'BUY_PROPERTY') {
              const skipRes = room.engine.skipBuyProperty(curPlayer.id);
              if (skipRes.success && skipRes.phase === 'ROLL_DICE') {
                this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
                this.resetTurnTimer(room);
                this.checkTriggerBot(room);
                return;
              }
            } else if (room.engine.turnState.phase === 'BUYOUT_PROPERTY') {
              const skipRes = room.engine.skipBuyout(curPlayer.id);
              if (skipRes.success && skipRes.phase === 'ROLL_DICE') {
                this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
                this.resetTurnTimer(room);
                this.checkTriggerBot(room);
                return;
              }
            } else if (room.engine.turnState.phase === 'FESTIVAL_SELECT') {
              const bestTileId = BotAI.chooseBestFestivalTile(room.engine, curPlayer);
              if (bestTileId !== null) {
                const festRes = room.engine.selectFestivalTile(curPlayer.id, bestTileId);
                if (festRes.success && festRes.phase === 'ROLL_DICE') {
                  this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
                  this.resetTurnTimer(room);
                  this.checkTriggerBot(room);
                  return;
                }
              }
            }
            // Tự động kết thúc lượt
            try {
              const res = room.engine.endTurn(curPlayer.id);
              if (res.isGameOver) {
                room.status = 'FINISHED';
                if (room.timerInterval) clearInterval(room.timerInterval);
                const winner = room.engine.players.find(p => p.id === room.engine!.winnerId);
                if (winner) {
                  AchievementEngine.onGameOver(room.roomCode, winner, room.engine);
                }
                this.io.to(room.roomCode).emit('game:over', {
                  winnerId: room.engine.winnerId,
                  snapshot: room.engine.getSnapshot()
                });
              } else {
                this.io.to(room.roomCode).emit('game:turn_change', {
                  nextUserId: res.nextUserId,
                  timeRemaining: room.turnTimeout,
                  snapshot: room.engine.getSnapshot()
                });
                this.resetTurnTimer(room);
                this.checkTriggerBot(room);
              }
            } catch (e) {}
          }
        }
      }
    }, 1000);
  }

  private resetTurnTimer(room: RoomInfo) {
    if (room.engine) {
      room.engine.turnState.turnStartTime = Date.now();
    }
  }

  private checkTriggerBot(room: RoomInfo) {
    if (!room.engine || room.status !== 'PLAYING') return;
    const curPlayer = room.engine.getCurrentPlayer();
    if (curPlayer && curPlayer.isBot) {
      BotAI.handleBotTurn(room.engine, (action, payload) => {
        if (action === 'ROLL_DICE') {
          try {
            const res = room.engine!.rollDice(curPlayer.id);

            AchievementEngine.onDiceRolled(
              room.roomCode,
              curPlayer,
              res.dice,
              res.isDouble,
              room.engine!.turnState.consecutiveDoubles
            );

            if (res.passedGo) {
              AchievementEngine.onPassedGo(room.roomCode, curPlayer, room.engine!);
            }

            if (res.actionResult && res.actionResult.type === 'PAY_RENT') {
              const prop = room.engine!.properties.get(res.actionResult.tileId);
              const owner = room.engine!.players.find(p => p.id === prop?.ownerId);
              if (owner) {
                AchievementEngine.onRentPaid(
                  room.roomCode,
                  curPlayer,
                  owner,
                  res.actionResult.amount,
                  room.engine!
                );
              }
            }

            this.io.to(room.roomCode).emit('game:dice_result', {
              userId: curPlayer.id,
              dice1: res.dice[0],
              dice2: res.dice[1],
              isDouble: res.isDouble,
              prevPosition: res.prevPosition,
              newPosition: res.newPosition,
              passedGo: res.passedGo,
              actionResult: res.actionResult,
              snapshot: room.engine!.getSnapshot()
            });
            this.resetTurnTimer(room);
            this.checkBankruptcyOrGameOver(room);
            this.checkTriggerBot(room);
          } catch (e) {}
        } else if (action === 'AIRPORT_DESTINATION') {
          try {
            const res = room.engine!.chooseAirportDestination(curPlayer.id, payload.tileId);
            if (res.success) {
              if (res.passedGo) {
                AchievementEngine.onPassedGo(room.roomCode, curPlayer, room.engine!);
              }
              if (res.actionResult && res.actionResult.type === 'PAY_RENT') {
                const prop = room.engine!.properties.get(res.actionResult.tileId);
                const owner = room.engine!.players.find(p => p.id === prop?.ownerId);
                if (owner) {
                  AchievementEngine.onRentPaid(
                    room.roomCode,
                    curPlayer,
                    owner,
                    res.actionResult.amount,
                    room.engine!
                  );
                }
              }
              this.io.to(room.roomCode).emit('game:airport_flight_result', {
                userId: curPlayer.id,
                prevPosition: res.prevPosition,
                newPosition: res.newPosition,
                passedGo: res.passedGo,
                actionResult: res.actionResult,
                snapshot: room.engine!.getSnapshot()
              });
              this.resetTurnTimer(room);
              this.checkBankruptcyOrGameOver(room);
              this.checkTriggerBot(room);
            }
          } catch (e) {}
        } else if (action === 'BUY_PROPERTY') {
          const res = room.engine!.buyProperty(curPlayer.id, payload.tileId, payload?.targetLevel);
          if (res.success) {
            AchievementEngine.onPropertyBought(
              room.roomCode,
              curPlayer,
              payload.tileId,
              res.level,
              room.engine!
            );
            this.io.to(room.roomCode).emit('game:property_updated', {
              tileId: res.tileId,
              ownerId: curPlayer.id,
              level: res.level,
              remainingCash: res.remainingCash,
              snapshot: room.engine!.getSnapshot()
            });
          }
          this.resetTurnTimer(room);
          this.checkBankruptcyOrGameOver(room);
          this.checkTriggerBot(room);
        } else if (action === 'SKIP_BUY') {
          const res = room.engine!.skipBuyProperty(curPlayer.id);
          if (res.success) {
            this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine!.getSnapshot() });
          }
          this.resetTurnTimer(room);
          if (res.phase === 'AUCTION') {
            this.triggerAuctionBots(room);
          } else {
            this.checkTriggerBot(room);
          }
        } else if (action === 'BUYOUT_PROPERTY') {
          const res = room.engine!.buyoutProperty(curPlayer.id, payload.tileId);
          if (res.success) {
            this.io.to(room.roomCode).emit('game:property_updated', {
              tileId: res.tileId,
              ownerId: curPlayer.id,
              level: res.level,
              remainingCash: res.remainingCash,
              isBuyout: true,
              snapshot: room.engine!.getSnapshot()
            });
          }
          this.resetTurnTimer(room);
          this.checkBankruptcyOrGameOver(room);
          this.checkTriggerBot(room);
        } else if (action === 'SKIP_BUYOUT') {
          const res = room.engine!.skipBuyout(curPlayer.id);
          if (res.success) {
            this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine!.getSnapshot() });
          }
          this.resetTurnTimer(room);
          this.checkTriggerBot(room);
        } else if (action === 'SELECT_FESTIVAL') {
          const res = room.engine!.selectFestivalTile(curPlayer.id, payload.tileId);
          if (res.success) {
            this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine!.getSnapshot() });
          }
          this.resetTurnTimer(room);
          this.checkTriggerBot(room);
        } else if (action === 'END_TURN') {
          try {
            const res = room.engine!.endTurn(curPlayer.id);
            if (res.isGameOver) {
              room.status = 'FINISHED';
              if (room.timerInterval) clearInterval(room.timerInterval);
              const winner = room.engine!.players.find(p => p.id === room.engine!.winnerId);
              if (winner) {
                AchievementEngine.onGameOver(room.roomCode, winner, room.engine!);
              }
              this.io.to(room.roomCode).emit('game:over', {
                winnerId: room.engine!.winnerId,
                snapshot: room.engine!.getSnapshot()
              });
            } else {
              this.io.to(room.roomCode).emit('game:turn_change', {
                nextUserId: res.nextUserId,
                timeRemaining: room.turnTimeout,
                snapshot: room.engine!.getSnapshot()
              });
              this.resetTurnTimer(room);
              this.checkTriggerBot(room);
            }
          } catch (e) {}
        }
      });
    }
  }

  private triggerAuctionBots(room: RoomInfo) {
    if (!room.engine || room.status !== 'PLAYING' || room.engine.turnState.phase !== 'AUCTION') return;
    BotAI.handleAuctionBots(room.engine, (botId, actionType, payload) => {
      if (!room.engine || room.status !== 'PLAYING' || room.engine.turnState.phase !== 'AUCTION') return;
      if (actionType === 'AUCTION_BID') {
        const res = room.engine.placeAuctionBid(botId, payload.amount);
        if (res.success) {
          if (res.resolved) {
            this.broadcastAuctionResolved(room, res.resolveRes);
          } else {
            this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
            this.triggerAuctionBots(room);
          }
        }
      } else if (actionType === 'AUCTION_PASS') {
        const res = room.engine.passAuction(botId);
        if (res.success) {
          if (res.resolved) {
            this.broadcastAuctionResolved(room, res.resolveRes);
          } else {
            this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
          }
        }
      }
    });
  }

  private triggerTradeBots(room: RoomInfo) {
    if (!room.engine || room.status !== 'PLAYING') return;
    BotAI.handleTradeBots(room.engine, (botId, actionType, tradeId) => {
      if (!room.engine || room.status !== 'PLAYING') return;
      const res =
        actionType === 'ACCEPT_TRADE'
          ? room.engine.acceptTrade(tradeId, botId)
          : room.engine.rejectTrade(tradeId, botId);
      if (res.success) {
        this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
        if (actionType === 'ACCEPT_TRADE') {
          this.checkBankruptcyOrGameOver(room);
        }
      }
    });
  }

  private checkBankruptcyOrGameOver(room: RoomInfo) {
    if (!room.engine || room.status !== 'PLAYING') return;

    if (room.engine.isGameOver || room.engine.checkGameOver()) {
      room.status = 'FINISHED';
      if (room.timerInterval) clearInterval(room.timerInterval);
      const winner = room.engine.players.find(p => p.id === room.engine!.winnerId);
      if (winner) {
        AchievementEngine.onGameOver(room.roomCode, winner, room.engine);
      }
      this.io.to(room.roomCode).emit('game:over', {
        winnerId: room.engine.winnerId,
        snapshot: room.engine.getSnapshot()
      });
      return;
    }

    const curPlayer = room.engine.getCurrentPlayer();
    if (curPlayer && curPlayer.isBankrupt) {
      setTimeout(() => {
        if (!room.engine || room.status !== 'PLAYING') return;
        try {
          const res = room.engine.endTurn(curPlayer.id);
          if (res.isGameOver) {
            room.status = 'FINISHED';
            if (room.timerInterval) clearInterval(room.timerInterval);
            const winner = room.engine.players.find(p => p.id === room.engine!.winnerId);
            if (winner) {
              AchievementEngine.onGameOver(room.roomCode, winner, room.engine);
            }
            this.io.to(room.roomCode).emit('game:over', {
              winnerId: room.engine.winnerId,
              snapshot: room.engine.getSnapshot()
            });
          } else {
            this.io.to(room.roomCode).emit('game:turn_change', {
              nextUserId: res.nextUserId,
              timeRemaining: room.turnTimeout,
              snapshot: room.engine.getSnapshot()
            });
            this.resetTurnTimer(room);
            this.checkTriggerBot(room);
          }
        } catch (e) {}
      }, 1200);
    }
  }

  public handleDisconnect(socket: Socket) {
    this.removeOnlineSocket(socket.id);
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room || !room.engine) return;

    const player = room.engine.players.find(p => p.socketId === socket.id);
    if (player) {
      if (room.status === 'WAITING') {
        // Xóa khỏi phòng chờ
        room.engine.players = room.engine.players.filter(p => p.socketId !== socket.id);
        if (room.engine.players.length === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          this.rooms.delete(roomCode);
        } else {
          if (room.hostId === socket.id) {
            const nextHost = room.engine.players.find(p => !p.isBot) || room.engine.players[0];
            room.hostId = nextHost.socketId;
            nextHost.isHost = true;
            nextHost.isReady = true;
          }
          this.broadcastRoomUpdate(room);
        }
      } else if (room.status === 'PLAYING') {
        // Trong trận: Chuyển thành Bot điều khiển (AFK Bot)
        player.isBot = true;
        room.engine.addLog(`${player.username} mất kết nối, hệ thống tự động giao Bot điều khiển.`, 'ALERT', player.id, player.username);
        this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
        if (room.engine.turnState.currentUserId === player.id) {
          this.checkTriggerBot(room);
        }
      }
    }
    this.userToRoom.delete(socket.id);
  }

  public handleLeaveMatch(
    socket: Socket,
    callback?: (res: { success: boolean; roomCode?: string; error?: string }) => void
  ) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) {
      socket.emit('room:left', { roomCode: null });
      callback?.({ success: true });
      return;
    }

    const room = this.rooms.get(roomCode);
    this.userToRoom.delete(socket.id);
    socket.leave(roomCode);

    if (!room || !room.engine) {
      socket.emit('room:left', { roomCode });
      callback?.({ success: true, roomCode });
      return;
    }

    const player = room.engine.players.find(p => p.socketId === socket.id || p.id === socket.id);

    if (room.status === 'WAITING') {
      room.engine.players = room.engine.players.filter(p => p.socketId !== socket.id && p.id !== socket.id);
      const hasConnectedHuman = room.engine.players.some(
        p => !p.isBot && this.userToRoom.get(p.socketId) === roomCode
      );
      if (room.engine.players.length === 0 || !hasConnectedHuman) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        this.rooms.delete(roomCode);
      } else {
        if (room.hostId === socket.id) {
          const nextHost = room.engine.players.find(p => !p.isBot) || room.engine.players[0];
          room.hostId = nextHost.socketId;
          nextHost.isHost = true;
          nextHost.isReady = true;
        }
        this.broadcastRoomUpdate(room);
      }
      socket.emit('room:left', { roomCode });
      callback?.({ success: true, roomCode });
      return;
    }

    // PLAYING or FINISHED
    if (room.status === 'PLAYING' && player && !player.isBankrupt && !room.engine.isGameOver) {
      const wasCurrentTurn = room.engine.turnState.currentUserId === player.id;
      if (wasCurrentTurn) {
        room.engine.turnState.pendingBuyout = null;
      }
      room.engine.addLog(
        `🏳️ ${player.username} đã đầu hàng và rời khỏi trận đấu!`,
        'ALERT',
        player.id,
        player.username
      );
      room.engine.handleBankruptcy(player);

      const hasConnectedHuman = room.engine.players.some(
        p => !p.isBot && this.userToRoom.get(p.socketId) === roomCode
      );

      if (!hasConnectedHuman) {
        room.status = 'FINISHED';
        room.engine.isGameOver = true;
        if (room.timerInterval) clearInterval(room.timerInterval);
        this.rooms.delete(roomCode);
        socket.emit('room:left', { roomCode });
        callback?.({ success: true, roomCode });
        return;
      }

      if (room.engine.isGameOver || room.engine.checkGameOver()) {
        this.checkBankruptcyOrGameOver(room);
      } else if (wasCurrentTurn) {
        try {
          const res = room.engine.endTurn(player.id);
          if (res.isGameOver) {
            this.checkBankruptcyOrGameOver(room);
          } else {
            this.io.to(room.roomCode).emit('game:turn_change', {
              nextUserId: res.nextUserId,
              timeRemaining: room.turnTimeout,
              snapshot: room.engine.getSnapshot()
            });
            this.resetTurnTimer(room);
            this.checkTriggerBot(room);
          }
        } catch (e) {}
      } else {
        this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
      }
    } else {
      const hasConnectedHuman = room.engine.players.some(
        p => !p.isBot && this.userToRoom.get(p.socketId) === roomCode
      );
      if (!hasConnectedHuman) {
        room.status = 'FINISHED';
        room.engine.isGameOver = true;
        if (room.timerInterval) clearInterval(room.timerInterval);
        this.rooms.delete(roomCode);
      }
    }

    socket.emit('room:left', { roomCode });
    callback?.({ success: true, roomCode });
  }

  public handleGameChat(socket: Socket, data: { text: string; username?: string }) {
    if (!data || typeof data.text !== 'string' || !data.text.trim()) return;
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    const player = room?.engine?.players.find(p => p.id === socket.id || p.socketId === socket.id);
    const username = data.username || player?.username || 'Người chơi';

    this.io.to(roomCode).emit('game:chat', {
      userId: socket.id,
      sender: username,
      username,
      text: data.text.trim().substring(0, 200)
    });
  }

  public broadcastRoomUpdate(room: RoomInfo) {
    if (!room.engine) return;
    this.io.to(room.roomCode).emit('room:updated', {
      roomCode: room.roomCode,
      name: room.name,
      hostId: room.hostId,
      maxPlayers: room.maxPlayers,
      players: room.engine.players,
      status: room.status
    });
  }

  public getPublicRooms(): any[] {
    const list: any[] = [];
    for (const room of this.rooms.values()) {
      if (!room.isPrivate && room.status === 'WAITING') {
        list.push({
          roomCode: room.roomCode,
          name: room.name,
          playersCount: room.engine?.players.length || 0,
          maxPlayers: room.maxPlayers,
          initialCash: room.initialCash,
          turnTimeout: room.turnTimeout,
          isProtected: Boolean(room.password)
        });
      }
    }
    return list;
  }
}
