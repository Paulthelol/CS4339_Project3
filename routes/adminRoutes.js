import express from 'express';
import { login, logout, me } from '../controllers/adminController.js';
import isAuthenticated from '../middleware/auth.js';

const router = express.Router();

router.post('/admin/login', login);
router.post('/admin/logout', isAuthenticated, logout);
router.get('/admin/me', isAuthenticated, me);

export default router;
