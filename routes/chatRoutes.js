import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { chatCtrl } from '../controllers/chatCtrl.js';

const router = express.Router();

router.route("/all").get(authMiddleware, chatCtrl.fetchChats)
router.route("/:userId").get(authMiddleware, chatCtrl.accessChat)
router.route("/create_group").post(authMiddleware, chatCtrl.createGroupChat)
router.route("/rename").put(authMiddleware, chatCtrl.renameGroup)
router.route("/add_member").put(authMiddleware, chatCtrl.addToGroup)
router.route("/rm_member").put(authMiddleware, chatCtrl.removeFromGroup)

export default router;