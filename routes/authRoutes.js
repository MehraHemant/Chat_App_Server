import express from 'express';
import { authCtrl } from "../controllers/authCtrl.js";
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/login", authCtrl.login);
router.post("/register", authCtrl.register);
router.route("/").get(authMiddleware, authCtrl.allUsers);
router.route("/auth").get(authMiddleware, authCtrl.getAdmin);


export default router;