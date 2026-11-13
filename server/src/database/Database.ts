import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  gold_balance: number;
  total_matches: number;
  total_wins: number;
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
    `);

    // Seed default achievements
    this.seedDefaultAchievements();
  }

  public seedDefaultAchievements() {
    const list = [
      {
        id: 'first_property',
        code: 'FIRST_PROPERTY',
        name: 'Nhà Đầu Tư Mới',
        description: 'Mua bất động sản đầu tiên trên bàn cờ Việt Nam',
        icon: '🏠',
        category: 'GAMEPLAY',
        reward_gold: 500
      },
      {
        id: 'monopolist',
        code: 'MONOPOLIST',
        name: 'Độc Quyền Khu Phố',
        description: 'Sở hữu toàn bộ các lô đất trong cùng một khu vực màu',
        icon: '👑',
        category: 'GAMEPLAY',
        reward_gold: 1200
      },
      {
        id: 'rent_baron',
        code: 'RENT_BARON',
        name: 'Ông Trùm Thu Tô',
        description: 'Thu về từ 500M tiền thuê nhà từ đối thủ trong một trận đấu',
        icon: '💰',
        category: 'WEALTH',
        reward_gold: 1500
      },
      {
        id: 'landlord_legend',
        code: 'LANDLORD_LEGEND',
        name: 'Huyền Thoại Khách Sạn',
        description: 'Xây dựng thành công Landmark / Khách Sạn 5 sao cao cấp',
        icon: '🏨',
        category: 'GAMEPLAY',
        reward_gold: 2000
      },
      {
        id: 'lucky_roller',
        code: 'LUCKY_ROLLER',
        name: 'Bàn Tay Vàng',
        description: 'Đổ được 2 lần xúc xắc đôi liên tiếp trong cùng một lượt',
        icon: '🎲',
        category: 'SPECIAL',
        reward_gold: 800
      },
      {
        id: 'comeback_king',
        code: 'COMEBACK_KING',
        name: 'Vua Lội Ngược Dòng',
        description: 'Tài sản từng tụt dưới 200M nhưng sau đó lội ngược dòng chiến thắng',
        icon: '⚡',
        category: 'SPECIAL',
        reward_gold: 2500
      },
      {
        id: 'clean_sheet',
        code: 'CLEAN_SHEET',
        name: 'Thoát Hiểm Ngoạn Mục',
        description: 'Hoàn thành trọn vẹn 1 vòng bàn cờ mà không mất đồng tiền thuê nào',
        icon: '🛡️',
        category: 'GAMEPLAY',
        reward_gold: 1000
      },
      {
        id: 'millionaire',
        code: 'MILLIONAIRE',
        name: 'Đại Phú Hào Triệu Đô',
        description: 'Đạt tổng tài sản ròng tích lũy từ 5,000M trở lên',
        icon: '💎',
        category: 'WEALTH',
        reward_gold: 3000
      }
    ];

    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO achievements (id, code, name, description, icon, category, reward_gold)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const a of list) {
      insertStmt.run(a.id, a.code, a.name, a.description, a.icon, a.category, a.reward_gold);
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
      SELECT ua.*, a.code, a.name, a.description, a.icon, a.category, a.reward_gold
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
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
}

export const dbService = new DatabaseService();
