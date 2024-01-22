import mongoose from "mongoose";

const chatModel = new mongoose.Schema({
    chat_name: { type: String, trim: true },
    group_chat: { type: Boolean, defualt: false },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    latest_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message"
    },
    group_admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, { timestamps: true });

export const chat = mongoose.model("chats", chatModel);