import expressAsyncHandler from "express-async-handler";
import messageModel from "../models/messageModel.js"
import userModel from "../models/userModel.js";
import { chat } from "../models/chatModel.js";

export const msgCtrl = {
    sendMessage: expressAsyncHandler(async (req, res) => {
        const { content, chat_id } = req.body;
        if (!content && !chat_id) {
            return res.sendStatus(400).send("Invalid Data passed into request");
        }
        var newMsg = {
            sender: req.user._id,
            content: content,
            chat: chat_id
        }
        try {
            var msg = await messageModel.create(newMsg);
            msg = await msg.populate("sender chat", 'name email users');
            await chat.findByIdAndUpdate(chat_id, { latestMessage: msg }, { new: true })
            res.send(msg);
        } catch (error) {
            throw new Error(error)
        }
    }),
    allMessages: expressAsyncHandler(async (req, res) => {
        try {
            const msg = await messageModel.find({ chat: req.params.chat_id }).populate('sender chat', 'name users')
            res.send(msg);
        } catch (error) {
            res.status(400)
            throw new Error(error);
        }
    })
}