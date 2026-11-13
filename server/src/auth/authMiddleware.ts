import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthUserDTO } from './AuthService';

export interface AuthenticatedRequest extends Request {
  user?: AuthUserDTO;
  token?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để truy cập tính năng này' });
  }

  const user = AuthService.authenticateToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
  }

  req.user = user;
  req.token = token;
  next();
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (token) {
    const user = AuthService.authenticateToken(token);
    if (user) {
      req.user = user;
      req.token = token;
    }
  }

  next();
}
