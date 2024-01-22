import jwt from 'jsonwebtoken';
import user from '../models/userModel.js';
import expressAsyncHandler from 'express-async-handler';

export const authMiddleware = expressAsyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        {
            try {
                token = req.headers.authorization.split(" ")[1];
                const decode = jwt.verify(token, process.env.ACCESSTOKENSECRET);
                req.user = await user.findById(decode.id).select('-password');
                next();
            } catch (error) {
                res.status(401);
                console.log(req.headers.authorization)
                throw new Error("Not authorized, token failed");
            }
        }
    } else {
        res.send(401);
        throw new Error("Not authorized, token failed");
    }
})