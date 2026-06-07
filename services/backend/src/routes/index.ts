import { Router } from 'express';
import { healthRouter } from './health.js';
import { petsRouter } from '../modules/pets/pets.routes.js';
import authRouter from '../modules/auth/auth.routes.js';
import usersRouter from '../modules/users/users.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/pets', petsRouter);