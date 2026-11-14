import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type AchievementTier = 'GRAY' | 'BLUE' | 'GOLD' | 'ORANGE' | 'RED';

export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  gold_balance: number;
  total_matches: number;
  total_wins: number;
  equipped_frame?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSessionRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  last_active_at: string;
}

export interface AchievementRow {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  reward_gold: number;
  tier: AchievementTier;
  level: number;
  frame_id: string;
  frame_name: string;
  created_at: string;
}

export interface UserAchievementRow {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_claimed: number | boolean;
  unlocked_at: string;
  // Joined fields
  code?: string;
  name?: string;
  description?: string;
  icon?: string;
  category?: string;
  reward_gold?: number;
  tier?: AchievementTier;
  level?: number;
  frame_id?: string;
  frame_name?: string;
}

// DatabaseSync dynamic loader for Node 22+
let DatabaseSyncClass: any;
try {
  // @ts-ignore
  const sqliteModule = require('node:sqlite');
  DatabaseSyncClass = sqliteModule.DatabaseSync;
} catch (e) {
  DatabaseSyncClass = null;
}

export class DatabaseService {
  private db: any = null;

  constructor(dbPath?: string) {
    this.initDatabase(dbPath);
  }

  private initDatabase(customPath?: string) {
    if (!DatabaseSyncClass) {
      console.warn('[DB] node:sqlite DatabaseSync not available, fallback to in-memory mock');
      return;
    }

    try {
      let resolvedPath = customPath || process.env.DB_PATH;
      if (!resolvedPath) {
        const dataDir = path.resolve(__dirname, '../../data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        resolvedPath = path.join(dataDir, 'business_chess.db');
      }

      this.db = new DatabaseSyncClass(resolvedPath);
      console.log(`[DB] Connected SQLite database at: ${resolvedPath}`);
      this.runMigrations();
    } catch (err) {
      console.error('[DB] Failed to initialize file SQLite, falling back to :memory:', err);
      this.db = new DatabaseSyncClass(':memory:');
      this.runMigrations();
    }
  }

  private runMigrations() {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        gold_balance INTEGER DEFAULT 10000,
        total_matches INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_active_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT DEFAULT '🏆',
        category TEXT DEFAULT 'GENERAL',
        reward_gold INTEGER DEFAULT 500,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(code);

      CREATE TABLE IF NOT EXISTS user_achievements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 100,
        is_claimed INTEGER DEFAULT 0,
        unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_id)
      );

      CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

      CREATE TABLE IF NOT EXISTS friendships (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'PENDING',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      );

      CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
    `);

    // Migration: ensure new columns exist in existing database tables
    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN equipped_frame TEXT DEFAULT 'frame_default'`);
    } catch (e) {}
    try {
      this.db.exec(`ALTER TABLE achievements ADD COLUMN tier TEXT DEFAULT 'GRAY'`);
    } catch (e) {}
    try {
      this.db.exec(`ALTER TABLE achievements ADD COLUMN level INTEGER DEFAULT 1`);
    } catch (e) {}
    try {
      this.db.exec(`ALTER TABLE achievements ADD COLUMN frame_id TEXT DEFAULT 'frame_default'`);
    } catch (e) {}
    try {
      this.db.exec(`ALTER TABLE achievements ADD COLUMN frame_name TEXT DEFAULT 'Khung Tân Thủ'`);
    } catch (e) {}

    // Seed default achievements with 5-tier Mastery System
    this.seedDefaultAchievements();
  }

  public seedDefaultAchievements() {
    const list = [
      // ==========================================
      // CẤP 1 - LEVEL 1 (TIER XÁM - SƠ CẤP)
      // ==========================================
      {
        id: 'first_property',
        code: 'FIRST_PROPERTY',
        name: 'Nhà Đầu Tư Mới',
        description: 'Mua bất động sản đầu tiên trên bàn cờ Việt Nam',
        icon: '🏠',
        category: 'GAMEPLAY',
        reward_gold: 500,
        tier: 'GRAY',
        level: 1,
        frame_id: 'frame_gray_starter',
        frame_name: 'Khung Sơ Cấp Khởi Nghiệp'
      },
      {
        id: 'clean_sheet',
        code: 'CLEAN_SHEET',
        name: 'Thoát Hiểm Ngoạn Mục',
        description: 'Hoàn thành trọn vẹn 1 vòng bàn cờ mà không mất đồng tiền thuê nào',
        icon: '🛡️',
        category: 'GAMEPLAY',
        reward_gold: 800,
        tier: 'GRAY',
        level: 1,
        frame_id: 'frame_gray_shield',
        frame_name: 'Khung Khiên Bạc Thoát Hiểm'
      },

      // ==========================================
      // CẤP 2 - LEVEL 2 (TIER XANH - THÀNH THẠO)
      // ==========================================
      {
        id: 'lucky_roller',
        code: 'LUCKY_ROLLER',
        name: 'Bàn Tay Vàng',
        description: 'Đổ được 2 lần xúc xắc đôi liên tiếp trong cùng một lượt',
        icon: '🎲',
        category: 'SPECIAL',
        reward_gold: 1200,
        tier: 'BLUE',
        level: 2,
        frame_id: 'frame_blue_dice',
        frame_name: 'Khung Xúc Xắc Lam Ngọc'
      },
      {
        id: 'railroad_tycoon',
        code: 'RAILROAD_TYCOON',
        name: 'Vua Đường Sắt',
        description: 'Sở hữu ít nhất 2 nhà ga xe lửa trên tuyến đường huyết mạch Bắc Nam',
        icon: '🚂',
        category: 'GAMEPLAY',
        reward_gold: 1400,
        tier: 'BLUE',
        level: 2,
        frame_id: 'frame_blue_railway',
        frame_name: 'Khung Tuyến Tàu Xanh Lam'
      },

      // ==========================================
      // CẤP 3 - LEVEL 3 (TIER VÀNG - TINH ANH)
      // ==========================================
      {
        id: 'monopolist',
        code: 'MONOPOLIST',
        name: 'Độc Quyền Khu Phố',
        description: 'Sở hữu toàn bộ các lô đất trong cùng một khu vực màu',
        icon: '👑',
        category: 'GAMEPLAY',
        reward_gold: 2000,
        tier: 'GOLD',
        level: 3,
        frame_id: 'frame_gold_monopoly',
        frame_name: 'Khung Hoàng Kim Độc Quyền'
      },
      {
        id: 'rent_baron',
        code: 'RENT_BARON',
        name: 'Ông Trùm Thu Tô',
        description: 'Thu về từ 500M tiền thuê nhà từ đối thủ trong một trận đấu',
        icon: '💰',
        category: 'WEALTH',
        reward_gold: 2200,
        tier: 'GOLD',
        level: 3,
        frame_id: 'frame_gold_baron',
        frame_name: 'Khung Phú Hào Kim Tiền'
      },

      // ==========================================
      // CẤP 4 - LEVEL 4 (TIER CAM - HUYỀN THOẠI)
      // ==========================================
      {
        id: 'landlord_legend',
        code: 'LANDLORD_LEGEND',
        name: 'Huyền Thoại Khách Sạn',
        description: 'Xây dựng thành công Landmark / Khách Sạn 5 sao cao cấp',
        icon: '🏨',
        category: 'GAMEPLAY',
        reward_gold: 3000,
        tier: 'ORANGE',
        level: 4,
        frame_id: 'frame_orange_landmark',
        frame_name: 'Khung Hổ Phách Khách Sạn 5 Sao'
      },
      {
        id: 'comeback_king',
        code: 'COMEBACK_KING',
        name: 'Vua Lội Ngược Dòng',
        description: 'Tài sản từng tụt dưới 200M nhưng sau đó lội ngược dòng chiến thắng',
        icon: '⚡',
        category: 'SPECIAL',
        reward_gold: 3200,
        tier: 'ORANGE',
        level: 4,
        frame_id: 'frame_orange_phoenix',
        frame_name: 'Khung Phượng Hoàng Lửa Bất Diệt'
      },

      // ==========================================
      // CẤP 5 - LEVEL 5 (TIER ĐỎ - TỐI THƯỢNG)
      // ==========================================
      {
        id: 'millionaire',
        code: 'MILLIONAIRE',
        name: 'Đại Phú Hào Triệu Đô',
        description: 'Đạt tổng tài sản ròng tích lũy từ 5,000M trở lên',
        icon: '💎',
        category: 'WEALTH',
        reward_gold: 5000,
        tier: 'RED',
        level: 5,
        frame_id: 'frame_red_millionaire',
        frame_name: 'Khung Đế Vương Triệu Đô Ruby'
      },
      {
        id: 'vietnam_conqueror',
        code: 'VIETNAM_CONQUEROR',
        name: 'Bá Chủ Bàn Cờ Việt Nam',
        description: 'Giành chiến thắng áp đảo trong các trận đấu cờ tỷ phú',
        icon: '🔥',
        category: 'SPECIAL',
        reward_gold: 5000,
        tier: 'RED',
        level: 5,
        frame_id: 'frame_red_dragon',
        frame_name: 'Khung Thần Thoại Rồng Đỏ'
      }
    ];

    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO achievements (id, code, name, description, icon, category, reward_gold, tier, level, frame_id, frame_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const a of list) {
      insertStmt.run(a.id, a.code, a.name, a.description, a.icon, a.category, a.reward_gold, a.tier, a.level, a.frame_id, a.frame_name);
    }
  }

  // --- User Operations ---

  public createUser(userData: {
    username: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string;
  }): UserRow {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, email, password_hash, avatar_url, gold_balance, total_matches, total_wins, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 10000, 0, 0, ?, ?)
    `);
    stmt.run(id, userData.username, userData.email, userData.passwordHash, userData.avatarUrl || null, now, now);
    return this.getUserById(id)!;
  }

  public getUserById(id: string): UserRow | null {
    const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ?`);
    return (stmt.get(id) as UserRow) || null;
  }

  public getUserByUsername(username: string): UserRow | null {
    const stmt = this.db.prepare(`SELECT * FROM users WHERE LOWER(username) = LOWER(?)`);
    return (stmt.get(username) as UserRow) || null;
  }

  public getUserByEmail(email: string): UserRow | null {
    const stmt = this.db.prepare(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`);
    return (stmt.get(email) as UserRow) || null;
  }

  public getUserByUsernameOrEmail(identifier: string): UserRow | null {
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
    `);
    return (stmt.get(identifier, identifier) as UserRow) || null;
  }

  public updateUserStats(userId: string, isWin: boolean, earnedGold: number = 0) {
    const user = this.getUserById(userId);
    if (!user) return;

    const winIncrement = isWin ? 1 : 0;
    const stmt = this.db.prepare(`
      UPDATE users 
      SET total_matches = total_matches + 1,
          total_wins = total_wins + ?,
          gold_balance = gold_balance + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(winIncrement, earnedGold, userId);
  }

  public updateUserGold(userId: string, deltaGold: number) {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET gold_balance = gold_balance + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(deltaGold, userId);
  }

  // --- Session Operations ---

  public createSession(userId: string, token: string, expiresInMs: number = 7 * 86400 * 1000): UserSessionRow {
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInMs).toISOString();
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_sessions (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, userId, token, expiresAt);
    return {
      id,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString()
    };
  }

  public getSessionByToken(token: string): UserSessionRow | null {
    const stmt = this.db.prepare(`
      SELECT * FROM user_sessions 
      WHERE token = ? AND datetime(expires_at) > datetime('now')
    `);
    return (stmt.get(token) as UserSessionRow) || null;
  }

  public deleteSession(token: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM user_sessions WHERE token = ?`);
    const res = stmt.run(token);
    return res.changes > 0;
  }

  public deleteUserSessions(userId: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM user_sessions WHERE user_id = ?`);
    const res = stmt.run(userId);
    return res.changes > 0;
  }

  // --- Achievements Operations ---

  public getAllAchievements(): AchievementRow[] {
    const stmt = this.db.prepare(`SELECT * FROM achievements ORDER BY reward_gold ASC`);
    return stmt.all() as AchievementRow[];
  }

  public getAchievementByCode(code: string): AchievementRow | null {
    const stmt = this.db.prepare(`SELECT * FROM achievements WHERE code = ? OR id = ?`);
    return (stmt.get(code, code) as AchievementRow) || null;
  }

  public getUserAchievements(userId: string): UserAchievementRow[] {
    const stmt = this.db.prepare(`
      SELECT ua.*, a.code, a.name, a.description, a.icon, a.category, a.reward_gold, a.tier, a.level, a.frame_id, a.frame_name
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY a.level ASC, ua.unlocked_at DESC
    `);
    const rows = stmt.all(userId) as any[];
    return rows.map(r => ({
      ...r,
      is_claimed: Boolean(r.is_claimed)
    }));
  }

  public unlockAchievement(userId: string, achievementCodeOrId: string, progress: number = 100): {
    unlocked: boolean;
    achievement?: AchievementRow;
  } {
    const achievement = this.getAchievementByCode(achievementCodeOrId);
    if (!achievement) return { unlocked: false };

    // If userId is not a registered user (e.g. guest or raw socket id), grant unlock without DB error
    const user = this.getUserById(userId);
    if (!user) {
      return { unlocked: true, achievement };
    }

    // Check if already unlocked
    const checkStmt = this.db.prepare(`
      SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?
    `);
    const existing = checkStmt.get(userId, achievement.id);
    if (existing) {
      return { unlocked: false, achievement };
    }

    const id = crypto.randomUUID();
    const insertStmt = this.db.prepare(`
      INSERT INTO user_achievements (id, user_id, achievement_id, progress, is_claimed, unlocked_at)
      VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);
    insertStmt.run(id, userId, achievement.id, progress);

    return { unlocked: true, achievement };
  }

  public claimAchievementReward(userId: string, achievementId: string): {
    success: boolean;
    rewardGold?: number;
    error?: string;
  } {
    const ach = this.getAchievementByCode(achievementId);
    if (!ach) return { success: false, error: 'Thành tựu không tồn tại' };

    const stmt = this.db.prepare(`
      SELECT * FROM user_achievements 
      WHERE user_id = ? AND achievement_id = ?
    `);
    const record = stmt.get(userId, ach.id) as any;
    if (!record) {
      return { success: false, error: 'Thành tựu chưa được mở khóa' };
    }
    if (record.is_claimed) {
      return { success: false, error: 'Phần thưởng đã được nhận trước đó' };
    }

    // Mark claimed and add gold
    const updateStmt = this.db.prepare(`
      UPDATE user_achievements SET is_claimed = 1 WHERE user_id = ? AND achievement_id = ?
    `);
    updateStmt.run(userId, ach.id);
    this.updateUserGold(userId, ach.reward_gold);

    return { success: true, rewardGold: ach.reward_gold };
  }

  public hasAchievement(userId: string, achievementCodeOrId: string): boolean {
    const ach = this.getAchievementByCode(achievementCodeOrId);
    if (!ach) return false;
    const stmt = this.db.prepare(`
      SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?
    `);
    return !!stmt.get(userId, ach.id);
  }

  // --- Nameplate Frames & Mastery Operations ---

  public getUnlockedFrames(userId: string): {
    frame_id: string;
    frame_name: string;
    tier: AchievementTier;
    level: number;
    achievement_code?: string;
    achievement_name?: string;
    is_equipped: boolean;
  }[] {
    const user = this.getUserById(userId);
    const equipped = user?.equipped_frame || 'frame_default';

    const defaultFrame = {
      frame_id: 'frame_default',
      frame_name: 'Khung Cơ Bản (Tân Thủ)',
      tier: 'GRAY' as AchievementTier,
      level: 1,
      achievement_code: 'DEFAULT',
      achievement_name: 'Mặc định',
      is_equipped: equipped === 'frame_default'
    };

    const stmt = this.db.prepare(`
      SELECT DISTINCT a.frame_id, a.frame_name, a.tier, a.level, a.code AS achievement_code, a.name AS achievement_name
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY a.level ASC
    `);
    const unlockedRows = stmt.all(userId) as any[];

    const frames = [defaultFrame];
    for (const row of unlockedRows) {
      if (row.frame_id && row.frame_id !== 'frame_default') {
        frames.push({
          frame_id: row.frame_id,
          frame_name: row.frame_name,
          tier: (row.tier || 'GRAY') as AchievementTier,
          level: row.level || 1,
          achievement_code: row.achievement_code,
          achievement_name: row.achievement_name,
          is_equipped: equipped === row.frame_id
        });
      }
    }
    return frames;
  }

  public getAllFrames(userId: string): {
    frameId: string;
    frameName: string;
    tier: AchievementTier;
    level: number;
    achievementName: string;
    achievementDesc: string;
    isUnlocked: boolean;
    isEquipped: boolean;
  }[] {
    const user = this.getUserById(userId);
    const equipped = user?.equipped_frame || 'frame_default';
    const unlocked = this.getUnlockedFrames(userId);
    const unlockedIds = new Set(unlocked.map(u => u.frame_id));
    const allAchievements = this.getAllAchievements();

    return [
      {
        frameId: 'frame_default',
        frameName: 'Khung Cơ Bản (Tân Thủ)',
        tier: 'GRAY' as AchievementTier,
        level: 1,
        achievementName: 'Mặc định',
        achievementDesc: 'Khung mặc định dành cho tất cả người chơi',
        isUnlocked: true,
        isEquipped: equipped === 'frame_default'
      },
      ...allAchievements.map(ach => ({
        frameId: ach.frame_id,
        frameName: ach.frame_name,
        tier: ach.tier,
        level: ach.level,
        achievementName: ach.name,
        achievementDesc: ach.description,
        isUnlocked: unlockedIds.has(ach.frame_id),
        isEquipped: equipped === ach.frame_id
      }))
    ];
  }

  public equipFrame(userId: string, frameId: string): { success: boolean; equippedFrame?: string; error?: string } {
    if (frameId === 'frame_default') {
      const stmt = this.db.prepare(`UPDATE users SET equipped_frame = 'frame_default' WHERE id = ?`);
      stmt.run(userId);
      return { success: true, equippedFrame: 'frame_default' };
    }

    // Verify user owns achievement with this frame
    const stmt = this.db.prepare(`
      SELECT a.frame_id
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ? AND a.frame_id = ?
    `);
    const row = stmt.get(userId, frameId);
    if (!row) {
      return { success: false, error: 'Bạn chưa mở khóa thành tựu của khung tên này!' };
    }

    const updateStmt = this.db.prepare(`UPDATE users SET equipped_frame = ? WHERE id = ?`);
    updateStmt.run(frameId, userId);
    return { success: true, equippedFrame: frameId };
  }

  // --- Friendship Operations ---

  public sendFriendRequest(userId: string, targetIdentifier: string): { success: boolean; error?: string; request?: any } {
    const targetUser = this.getUserByUsernameOrEmail(targetIdentifier);
    if (!targetUser) {
      return { success: false, error: 'Người dùng không tồn tại' };
    }

    if (targetUser.id === userId) {
      return { success: false, error: 'Không thể tự kết bạn với chính mình' };
    }

    // Check existing friendship between userId and targetUser.id in either direction
    const existingStmt = this.db.prepare(`
      SELECT * FROM friendships 
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `);
    const existing = existingStmt.get(userId, targetUser.id, targetUser.id, userId) as any;

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return { success: false, error: 'Hai người đã là bạn bè' };
      }
      if (existing.status === 'PENDING') {
        if (existing.user_id === userId) {
          return { success: false, error: 'Bạn đã gửi lời mời kết bạn trước đó' };
        } else {
          // The other user already sent a pending request -> auto accept it!
          const updateStmt = this.db.prepare(`
            UPDATE friendships SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?
          `);
          updateStmt.run(existing.id);
          return { success: true, request: { id: existing.id, status: 'ACCEPTED' } };
        }
      }
      // If was REJECTED previously, allow re-requesting by updating back to PENDING
      const reReqStmt = this.db.prepare(`
        UPDATE friendships 
        SET user_id = ?, friend_id = ?, status = 'PENDING', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      reReqStmt.run(userId, targetUser.id, existing.id);
      return { success: true, request: { id: existing.id, status: 'PENDING' } };
    }

    const id = crypto.randomUUID();
    const insertStmt = this.db.prepare(`
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES (?, ?, ?, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    insertStmt.run(id, userId, targetUser.id);

    return {
      success: true,
      request: {
        id,
        user_id: userId,
        friend_id: targetUser.id,
        status: 'PENDING'
      }
    };
  }

  public getFriends(userId: string): { friends: any[]; incomingRequests: any[]; outgoingRequests: any[] } {
    // 1. Accepted Friends
    const friendsStmt = this.db.prepare(`
      SELECT 
        f.id as friendship_id,
        f.created_at as became_friends_at,
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        u.gold_balance,
        u.total_matches,
        u.total_wins
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user_id = ? THEN f.friend_id = u.id
          ELSE f.user_id = u.id
        END
      )
      WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'ACCEPTED'
      ORDER BY u.username ASC
    `);
    const friends = friendsStmt.all(userId, userId, userId) as any[];

    // 2. Incoming Requests (others sent to userId)
    const incomingStmt = this.db.prepare(`
      SELECT 
        f.id as request_id,
        f.created_at,
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        u.gold_balance
      FROM friendships f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = ? AND f.status = 'PENDING'
      ORDER BY f.created_at DESC
    `);
    const incomingRequests = incomingStmt.all(userId) as any[];

    // 3. Outgoing Requests (userId sent to others)
    const outgoingStmt = this.db.prepare(`
      SELECT 
        f.id as request_id,
        f.created_at,
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        u.gold_balance
      FROM friendships f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ? AND f.status = 'PENDING'
      ORDER BY f.created_at DESC
    `);
    const outgoingRequests = outgoingStmt.all(userId) as any[];

    return { friends, incomingRequests, outgoingRequests };
  }

  public respondFriendRequest(userId: string, requestId: string, action: 'ACCEPT' | 'REJECT'): { success: boolean; error?: string } {
    const reqStmt = this.db.prepare(`
      SELECT * FROM friendships WHERE id = ? AND friend_id = ? AND status = 'PENDING'
    `);
    const req = reqStmt.get(requestId, userId) as any;
    if (!req) {
      return { success: false, error: 'Lời mời kết bạn không tồn tại hoặc đã được xử lý' };
    }

    if (action === 'ACCEPT') {
      const updateStmt = this.db.prepare(`
        UPDATE friendships SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `);
      updateStmt.run(requestId);
    } else {
      const updateStmt = this.db.prepare(`
        UPDATE friendships SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `);
      updateStmt.run(requestId);
    }

    return { success: true };
  }

  public removeFriend(userId: string, friendId: string): { success: boolean } {
    const stmt = this.db.prepare(`
      DELETE FROM friendships 
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `);
    stmt.run(userId, friendId, friendId, userId);
    return { success: true };
  }
}

export const dbService = new DatabaseService();
