import express from "express";
import { getPhotosOfUser, addComment, uploadPhoto } from "../controllers/photoController.js";
import isAuthenticated from "../middleware/auth.js";

const router = express.Router();

router.get("/photosOfUser/:id", isAuthenticated, getPhotosOfUser);
router.post("/commentsOfPhoto/:id", isAuthenticated, addComment);
router.post("/photos", isAuthenticated, uploadPhoto);

export default router;
