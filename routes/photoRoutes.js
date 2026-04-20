import express from 'express';
import getPhotosOfUser from '../controllers/photoController.js';
import isAuthenticated from '../middleware/auth.js';

const router = express.Router();

router.get('/photosOfUser/:id', isAuthenticated, getPhotosOfUser);

export default router;
