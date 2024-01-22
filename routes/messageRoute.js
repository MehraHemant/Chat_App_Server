import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { msgCtrl } from '../controllers/msgCtrl.js';

const router = express.Router();

router.post("/", authMiddleware, msgCtrl.sendMessage);
router.get("/:chat_id", authMiddleware, msgCtrl.allMessages)

export const messageRoute = router;