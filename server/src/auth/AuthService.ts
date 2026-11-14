import crypto from 'crypto';
import { dbService, UserRow } from '../database/Database';

const JWT_SECRET = process.env.JWT_SECRET || 'business_chess_secret_key_vietnam_diorama_2026';
const TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600; // 7 days

export interface AuthUserDTO {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  goldBalance: number;
  totalMatches: number;
  totalWins: number;
  equippedFrame?: string;
  createdAt: string;
  unlockedAchievementsCount?: number;
}

export class AuthService {
  /**
   * Secure password hashing using Node crypto scrypt with unique salt
   */
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * Constant-time password verification preventing timing attacks
   */
  public static verifyPassword(password: string, combinedHash: string): boolean {
    try {
      const parts = combinedHash.split(':');
      if (parts.length !== 2) return false;
      const [salt, hash] = parts;
      const expectedBuffer = Buffer.from(hash, 'hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(expectedBuffer, derivedKey);
    } catch {
      return false;
    }
  }

  /**
   * RFC 7519 HMAC-SHA256 JWT Token Generation
   */
  public static signJwt(payload: Record<string, any>, expiresInSeconds: number = TOKEN_EXPIRY_SECONDS): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + expiresInSeconds
    };

    const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${b64Header}.${b64Payload}`)
      .digest('base64url');

    return `${b64Header}.${b64Payload}.${signature}`;
  }

  /**
   * JWT verification and payload extraction
   */
  public static verifyJwt<T = any>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [b64Header, b64Payload, signature] = parts;

      const expectedSig = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${b64Header}.${b64Payload}`)
        .digest('base64url');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload as T;
    } catch {
      return null;
    }
  }

  public static sanitizeUser(user: UserRow, unlockedCount: number = 0): AuthUserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url,
      goldBalance: user.gold_balance,
      totalMatches: user.total_matches,
      totalWins: user.total_wins,
      equippedFrame: user.equipped_frame || 'frame_default',
      createdAt: user.created_at,
      unlockedAchievementsCount: unlockedCount
    };
  }

  /**
   * User Registration
   */
  public static register(params: {
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
  }): { success: boolean; token?: string; user?: AuthUserDTO; error?: string } {
    const { username, email, password, avatarUrl } = params;

    // Validations
    if (!username || username.trim().length < 3 || username.trim().length > 30) {
      return { success: false, error: 'Tên người chơi phải từ 3 đến 30 ký tự' };
    }
    const cleanUsername = username.trim();
    if (!/^[a-zA-Z0-9_À-ỹ\s]+$/u.test(cleanUsername)) {
      return { success: false, error: 'Tên người chơi chứa ký tự không hợp lệ' };
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { success: false, error: 'Địa chỉ email không hợp lệ' };
    }
    const cleanEmail = email.trim().toLowerCase();

    if (!password || password.length < 6) {
      return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }

    // Check existing
    if (dbService.getUserByUsername(cleanUsername)) {
      return { success: false, error: 'Tên người chơi này đã có người sử dụng' };
    }
    if (dbService.getUserByEmail(cleanEmail)) {
      return { success: false, error: 'Email này đã được đăng ký tài khoản' };
    }

    const passwordHash = this.hashPassword(password);
    const user = dbService.createUser({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      avatarUrl
    });

    const token = this.signJwt({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    dbService.createSession(user.id, token);

    return {
      success: true,
      token,
      user: this.sanitizeUser(user, 0)
    };
  }

  /**
   * User Login
   */
  public static login(params: {
    identifier: string; // username or email
    password: string;
  }): { success: boolean; token?: string; user?: AuthUserDTO; error?: string } {
    const { identifier, password } = params;
    if (!identifier || !password) {
      return { success: false, error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' };
    }

    const user = dbService.getUserByUsernameOrEmail(identifier.trim());
    if (!user) {
      return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác' };
    }

    const isMatch = this.verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác' };
    }

    const token = this.signJwt({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    dbService.createSession(user.id, token);
    const userAchs = dbService.getUserAchievements(user.id);

    return {
      success: true,
      token,
      user: this.sanitizeUser(user, userAchs.length)
    };
  }

  /**
   * User Logout
   */
  public static logout(token: string): boolean {
    return dbService.deleteSession(token);
  }

  /**
   * Verify session / token and retrieve user
   */
  public static authenticateToken(token: string): AuthUserDTO | null {
    const payload = this.verifyJwt<{ userId: string }>(token);
    if (!payload || !payload.userId) return null;

    const session = dbService.getSessionByToken(token);
    if (!session) return null;

    const user = dbService.getUserById(payload.userId);
    if (!user) return null;

    const userAchs = dbService.getUserAchievements(user.id);
    return this.sanitizeUser(user, userAchs.length);
  }
}
