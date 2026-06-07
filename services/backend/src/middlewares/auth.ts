import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserById } from '../modules/users/users.service.js';

export interface AuthRequest extends Request {
  user?: any;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization?.slice(7) : null;
    if (!auth) return res.status(401).json({ message: 'Missing token' });

    const payload = jwt.verify(auth, env.jwtSecret) as any;
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = { id: user.id, email: user.email, userType: user.user_type };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
