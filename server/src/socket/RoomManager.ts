import { Server, Socket } from 'socket.io';
import { MonopolyEngine } from '../game/MonopolyEngine';
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

  constructor(io: Server) {
    this.io = io;
    AchievementEngine.init(io);
  }

  public setSocketUser(socketId: string, userId: string) {
    this.socketToUserId.set(socketId, userId);
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
    let userFrame = (payload as any).frame || 'frame_default';
    if (payload.userId) {
      this.socketToUserId.set(socket.id, payload.userId);
      const user = dbService.getUserById(payload.userId);
      if (user?.equipped_frame) userFrame = user.equipped_frame;
    }
    socket.join(roomCode);

    // Host joins as first player
    room.engine?.addPlayer(socket.id, socket.id, payload.username, true, initialCash, userFrame);

    return room;
  }

  public joinRoom(
    socket: Socket,
    payload: { roomCode: string; username: string; userId?: string; password?: string; frame?: string }
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
    let userFrame = payload.frame || 'frame_default';
    if (payload.userId) {
      this.socketToUserId.set(socket.id, payload.userId);
      const user = dbService.getUserById(payload.userId);
      if (user?.equipped_frame) userFrame = user.equipped_frame;
    }
    socket.join(room.roomCode);

    room.engine.addPlayer(socket.id, socket.id, payload.username, false, room.initialCash, userFrame);

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

    const player = room.engine.addPlayer(botId, botId, botName, false, room.initialCash, botFrame);
    player.isBot = true;

    this.broadcastRoomUpdate(room);
    return { success: true };
  }

  public startGame(socket: Socket): { success: boolean; error?: string } {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return { success: false, error: 'Không ở trong phòng' };

    const room = this.rooms.get(roomCode);
    if (!room || !room.engine) return { success: false, error: 'Phòng không tồn tại' };

    if (room.hostId !== socket.id) return { success: false, error: 'Chỉ chủ phòng mới được bắt đầu' };
    if (room.engine.players.length < 2) return { success: false, error: 'Cần ít nhất 2 người chơi để bắt đầu' };

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

  public handleBuyProperty(socket: Socket, tileId: number) {
    const roomCode = this.userToRoom.get(socket.id);
    if (!roomCode) return;
    const room = this.rooms.get(roomCode);
    if (!room || !room.engine || room.status !== 'PLAYING') return;

    const player = room.engine.players.find(p => p.id === socket.id);
    const result = room.engine.buyProperty(socket.id, tileId);
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
      this.checkTriggerBot(room);
    } else {
      socket.emit('error:message', { message: result.error });
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
      this.checkTriggerBot(room);
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

      const elapsed = Math.floor((Date.now() - room.engine.turnState.turnStartTime) / 1000);
      const remaining = Math.max(0, room.turnTimeout - elapsed);

      this.io.to(room.roomCode).emit('game:timer_tick', { remaining });

      if (remaining <= 0) {
        // Hết thời gian lượt: Tự động xử lý
        const curPlayer = room.engine.getCurrentPlayer();
        if (curPlayer) {
          if (room.engine.turnState.phase === 'ROLL_DICE') {
            try {
              const res = room.engine.rollDice(curPlayer.id);
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
          } else {
            // Tự động kết thúc lượt
            try {
              const res = room.engine.endTurn(curPlayer.id);
              if (res.isGameOver) {
                room.status = 'FINISHED';
                if (room.timerInterval) clearInterval(room.timerInterval);
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
            this.checkTriggerBot(room);
          } catch (e) {}
        } else if (action === 'BUY_PROPERTY') {
          const res = room.engine!.buyProperty(curPlayer.id, payload.tileId);
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
          this.checkTriggerBot(room);
        } else if (action === 'SKIP_BUY') {
          const res = room.engine!.skipBuyProperty(curPlayer.id);
          if (res.success) {
            this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine!.getSnapshot() });
          }
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
            room.hostId = room.engine.players[0].socketId;
            room.engine.players[0].isHost = true;
          }
          this.broadcastRoomUpdate(room);
        }
      } else if (room.status === 'PLAYING') {
        // Trong trận: Chuyển thành Bot điều khiển (AFK Bot)
        player.isBot = true;
        room.engine.addLog(`${player.username} mất kết nối, hệ thống tự động giao Bot điều khiển.`, 'ALERT', player.id, player.username);
        this.io.to(room.roomCode).emit('game:state_sync', { snapshot: room.engine.getSnapshot() });
        this.checkTriggerBot(room);
      }
    }
    this.userToRoom.delete(socket.id);
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
