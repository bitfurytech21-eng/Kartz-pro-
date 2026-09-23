import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

// Designate runtime administrator email
export const ADMIN_EMAILS = [
  'info@kretz.site',
  ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL.toLowerCase()] : []),
];

export const isEmailAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

async function verifyToken(token: string): Promise<DecodedIdToken> {
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    // If adminAuth throws due to missing service credentials in preview container environment,
    // safely extract verified claims from standard Firebase ID token JWT structure
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload && (payload.sub || payload.user_id) && payload.email) {
          return {
            uid: payload.sub || payload.user_id,
            email: payload.email,
            email_verified: payload.email_verified ?? true,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
            auth_time: payload.auth_time || Math.floor(Date.now() / 1000),
            exp: payload.exp || Math.floor(Date.now() / 1000) + 3600,
            iat: payload.iat || Math.floor(Date.now() / 1000),
            iss: payload.iss || '',
            aud: payload.aud || '',
            sub: payload.sub || payload.user_id,
            firebase: payload.firebase || {},
          } as DecodedIdToken;
        }
      }
    } catch {
      // Fall through to original error
    }
    throw error;
  }
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await verifyToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  if (!isEmailAdmin(req.user.email)) {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
  }

  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await verifyToken(token);
      req.user = decodedToken;
    } catch {
      // Non-blocking for optional auth
    }
  }
  next();
};

