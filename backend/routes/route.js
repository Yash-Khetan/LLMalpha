import express from "express";
import { uploadController } from "../controllers/uploadController.js";
import { queryController } from "../controllers/queryController.js";
import { historyController } from "../controllers/historyController.js";
import { verifyToken } from "../middlewares/authmiddleware.js";
import multer from "multer";
import rateLimit from "express-rate-limit";

// Use memory storage — file lives as a Buffer, no disk writes
const upload = multer({ storage: multer.memoryStorage() });

// Rate limit: 2 LLM query calls per user per hour
const queryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2,
    keyGenerator: (req) => req.user?.uid || req.ip, // per-user (set by verifyToken)
    message: { message: "Rate limit exceeded. You can make 2 queries per hour." },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

router.get("/history", verifyToken, historyController);
router.post("/upload", verifyToken, upload.single('file'), uploadController);
router.post("/query", verifyToken, queryLimiter, queryController);

export default router;
