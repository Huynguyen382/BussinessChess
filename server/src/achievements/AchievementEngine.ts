import { Server } from 'socket.io';
import { dbService, AchievementRow } from '../database/Database';
import { MonopolyEngine, PlayerState } from '../game/MonopolyEngine';
import { BOARD_TILES, BoardTile } from '../game/BoardConfig';

export interface PlayerGameTracker {
  userId?: string;
  socketId: string;
  username: string;
  lowestBalance: number;
  totalRentCollected: number;
  totalRentPaid: number;
  totalLaps: number;
  lastPosition: number;
  propertiesBought: number;
  hotelsBuilt: number;
  maxConsecutiveDoubles: number;
  rentPaidThisLap: number;
}

export class AchievementEngine {
  private static io: Server | null = null;
  // roomId -> Map<socketId, PlayerGameTracker>
  private static roomTrackers: Map<string, Map<string, PlayerGameTracker>> = new Map();

  public static init(io: Server) {
    this.io = io;
  }

  public static initRoom(roomId: string, players: PlayerState[]) {
    const trackers = new Map<string, PlayerGameTracker>();
    for (const p of players) {
      trackers.set(p.id, {
        userId: p.id.startsWith('bot_') ? undefined : p.id,
        socketId: p.socketId,
        username: p.username,
        lowestBalance: p.balance,
        totalRentCollected: 0,
        totalRentPaid: 0,
        totalLaps: 0,
        lastPosition: p.position,
        propertiesBought: 0,
        hotelsBuilt: 0,
        maxConsecutiveDoubles: 0,
        rentPaidThisLap: 0
      });
    }
    this.roomTrackers.set(roomId, trackers);
  }

  public static getTracker(roomId: string, playerId: string): PlayerGameTracker | undefined {
    return this.roomTrackers.get(roomId)?.get(playerId);
  }

  public static setPlayerUserId(roomId: string, playerId: string, userId: string) {
    const tracker = this.getTracker(roomId, playerId);
    if (tracker) {
      tracker.userId = userId;
    }
  }

  /**
   * Helper to trigger and record achievement unlock
   */
  public static triggerUnlock(
    roomId: string,
    player: PlayerState,
    achievementCode: string
  ): { unlocked: boolean; achievement?: AchievementRow } {
    const tracker = this.getTracker(roomId, player.id);
    const userId = tracker?.userId || (player.id.startsWith('bot_') ? undefined : player.id);

    const ach = dbService.getAchievementByCode(achievementCode);
    if (!ach) return { unlocked: false };

    let unlocked = false;
    if (userId) {
      const res = dbService.unlockAchievement(userId, achievementCode);
      unlocked = res.unlocked;
    } else {
      // Guest or bot unlock notification for in-game fun
      unlocked = true;
    }

    if (unlocked && this.io) {
      this.io.to(roomId).emit('achievement:unlocked', {
        userId: player.id,
        username: player.username,
        achievement: {
          id: ach.id,
          code: ach.code,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          rewardGold: ach.reward_gold
        }
      });
    }

    return { unlocked, achievement: ach };
  }

  /**
   * Trigger on Property Purchase / Upgrade
   */
  public static onPropertyBought(
    roomId: string,
    player: PlayerState,
    tileId: number,
    level: number,
    engine: MonopolyEngine
  ) {
    const tracker = this.getTracker(roomId, player.id);
    if (tracker) {
      if (level === 0) {
        tracker.propertiesBought++;
      } else if (level === 4) {
        tracker.hotelsBuilt++;
      }
    }

    // 1. FIRST_PROPERTY: First property purchase
    if (level === 0) {
      this.triggerUnlock(roomId, player, 'FIRST_PROPERTY');
    }

    // 2. LANDLORD_LEGEND: Built 5-star hotel / landmark
    if (level === 4) {
      this.triggerUnlock(roomId, player, 'LANDLORD_LEGEND');
    }

    // 3. MONOPOLIST: Own all properties in a district
    const tile = BOARD_TILES[tileId];
    if (tile && tile.district) {
      const districtTiles = BOARD_TILES.filter(t => t.district === tile.district);
      const ownsAll = districtTiles.length > 0 && districtTiles.every(t => {
        const prop = engine.properties.get(t.id);
        return prop && prop.ownerId === player.id;
      });
      if (ownsAll) {
        this.triggerUnlock(roomId, player, 'MONOPOLIST');
      }
    }

    // 4. RAILROAD_TYCOON: Own at least 2 railroads
    if (tile && tile.type === 'RAILROAD') {
      const ownedRailroads = [5, 15, 25, 35].filter(rId => {
        const prop = engine.properties.get(rId);
        return prop && prop.ownerId === player.id;
      });
      if (ownedRailroads.length >= 2) {
        this.triggerUnlock(roomId, player, 'RAILROAD_TYCOON');
      }
    }

    // Check Millionaire
    this.checkWealthAchievements(roomId, player, engine);
  }

  /**
   * Trigger on Dice Roll
   */
  public static onDiceRolled(
    roomId: string,
    player: PlayerState,
    dice: [number, number],
    isDouble: boolean,
    consecutiveDoubles: number
  ) {
    const tracker = this.getTracker(roomId, player.id);
    if (tracker) {
      if (consecutiveDoubles > tracker.maxConsecutiveDoubles) {
        tracker.maxConsecutiveDoubles = consecutiveDoubles;
      }
    }

    // LUCKY_ROLLER: 2 consecutive doubles
    if (consecutiveDoubles >= 2) {
      this.triggerUnlock(roomId, player, 'LUCKY_ROLLER');
    }
  }

  /**
   * Trigger on Rent Transaction
   */
  public static onRentPaid(
    roomId: string,
    payer: PlayerState,
    receiver: PlayerState,
    amount: number,
    engine: MonopolyEngine
  ) {
    const payerTracker = this.getTracker(roomId, payer.id);
    if (payerTracker) {
      payerTracker.totalRentPaid += amount;
      payerTracker.rentPaidThisLap += amount;
      if (payer.balance < payerTracker.lowestBalance) {
        payerTracker.lowestBalance = payer.balance;
      }
    }

    const receiverTracker = this.getTracker(roomId, receiver.id);
    if (receiverTracker) {
      receiverTracker.totalRentCollected += amount;

      // RENT_BARON: Total rent collected >= 500M
      if (receiverTracker.totalRentCollected >= 500) {
        this.triggerUnlock(roomId, receiver, 'RENT_BARON');
      }
    }

    this.checkWealthAchievements(roomId, receiver, engine);
  }

  /**
   * Trigger on Passing GO / Lap completion
   */
  public static onPassedGo(roomId: string, player: PlayerState, engine: MonopolyEngine) {
    const tracker = this.getTracker(roomId, player.id);
    if (tracker) {
      tracker.totalLaps++;
      // CLEAN_SHEET: Completed a lap without paying any rent
      if (tracker.totalLaps >= 1 && tracker.rentPaidThisLap === 0) {
        this.triggerUnlock(roomId, player, 'CLEAN_SHEET');
      }
      // Reset lap counter for next round
      tracker.rentPaidThisLap = 0;
    }

    this.checkWealthAchievements(roomId, player, engine);
  }

  /**
   * Check Wealth / Net Worth milestones
   */
  public static checkWealthAchievements(roomId: string, player: PlayerState, engine: MonopolyEngine) {
    const tracker = this.getTracker(roomId, player.id);
    if (tracker && player.balance < tracker.lowestBalance) {
      tracker.lowestBalance = player.balance;
    }

    // MILLIONAIRE: Net worth or balance >= 5,000M
    if (player.netWorth >= 5000 || player.balance >= 5000) {
      this.triggerUnlock(roomId, player, 'MILLIONAIRE');
    }

    // COMEBACK_KING: Ever dropped below 200M but now netWorth >= 2000M
    if (tracker && tracker.lowestBalance < 200 && (player.netWorth >= 2000 || player.balance >= 2000)) {
      this.triggerUnlock(roomId, player, 'COMEBACK_KING');
    }
  }

  /**
   * Trigger on Game Over
   */
  public static onGameOver(roomId: string, winner: PlayerState, engine: MonopolyEngine) {
    const tracker = this.getTracker(roomId, winner.id);
    if (tracker && tracker.lowestBalance < 200) {
      this.triggerUnlock(roomId, winner, 'COMEBACK_KING');
    }

    this.checkWealthAchievements(roomId, winner, engine);

    // Update match stats in database for all registered human players
    for (const p of engine.players) {
      const trk = this.getTracker(roomId, p.id);
      const uid = trk?.userId || (p.id.startsWith('bot_') ? undefined : p.id);
      if (uid) {
        const isWin = p.id === winner.id;
        const prizeGold = isWin ? 2000 : 500;
        dbService.updateUserStats(uid, isWin, prizeGold);
        if (isWin) {
          const u = dbService.getUserById(uid);
          if (u && u.total_wins >= 10) {
            this.triggerUnlock(roomId, winner, 'VIETNAM_CONQUEROR');
          }
        }
      }
    }
  }

  public static cleanupRoom(roomId: string) {
    this.roomTrackers.delete(roomId);
  }
}
