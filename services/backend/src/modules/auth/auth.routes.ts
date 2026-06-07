import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../users/users.service.js';
import { env } from '../../config/env.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, userType, clinicName } = req.body ?? {};

    if (!name || !email || !password || !userType) {
      res.status(400).json({ message: 'name, email, password and userType are required' });
      return;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = await createUser({
      name,
      email,
      password_hash,
      user_type: userType,
      clinic_name: clinicName ?? null,
    });

    const token = jwt.sign({ sub: id, email, userType }, env.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({ id, token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ sub: user.id, email: user.email, userType: user.user_type }, env.jwtSecret, { expiresIn: '7d' });
    res.json({ id: user.id, token });
  } catch (error) {
    next(error);
  }
});

export default router;
