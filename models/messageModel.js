import mongoose from "mongoose";

const messageModel = mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: { type: String, trim: true },
    chat: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:"chats"
    }
}, { timestamps: true });

export default mongoose.model("Message", messageModel);