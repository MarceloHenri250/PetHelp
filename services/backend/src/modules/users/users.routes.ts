import { Router } from 'express';
import { findUserById, findUserByEmail } from './users.service.js';

const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.get('/by-email/:email', async (req, res, next) => {
  try {
    const user = await findUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
