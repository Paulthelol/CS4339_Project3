import express from "express";
import { getPhotosOfUser, addComment, uploadPhoto, likePhoto } from "../controllers/photoController.js";
import isAuthenticated from "../middleware/auth.js";

const router = express.Router();

router.get("/photosOfUser/:id", isAuthenticated, getPhotosOfUser);
router.post("/commentsOfPhoto/:id", isAuthenticated, addComment);
router.post("/photos", isAuthenticated, uploadPhoto);
router.post("/photos/:id/like", isAuthenticated, likePhoto);

export default router;
