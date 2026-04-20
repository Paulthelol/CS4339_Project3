import express from 'express';
import { createUser, listUsers, getUserById } from '../controllers/userController.js';
import isAuthenticated from '../middleware/auth.js';

const router = express.Router();

router.post('/user', createUser);
router.get('/user/list', isAuthenticated, listUsers);
router.get('/user/:id', isAuthenticated, getUserById);

export default router;
