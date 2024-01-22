import expressAsyncHandler from "express-async-handler";
import { chat } from '../models/chatModel.js'
import userModel from "../models/userModel.js";

export const chatCtrl = {

    // access chat of a particular user with logged in user
    accessChat: expressAsyncHandler(async (req, res) => {
        const { userId } = req.params;
        if (!userId) {
            res.send("UserId param not send with request");
            return res.sendStatus(400);
        }
        const user = await userModel.findById(userId);
        const isChat = await chat.findOne({
            group_chat: false, $and: [{ users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }]
        }).populate('users latest_message latest_message.sender', '-password')
        if (isChat) {
            res.send(isChat);
        } else {
            // create a new Chat and save it to the database
            var chatData = {
                chat_name: user.name,
                group_chat: false,
                users: [req.user._id, user._id],
            }
            try {
                const createdChat = await chat.create(chatData);
                const fullChat = await chat.findOne({ _id: createdChat._id }).populate('users latest_message latest_message.sender', '-password')
                res.send(fullChat);
            } catch (error) {
                throw new Error(error);
            }
        }
    }),


    // Fetch all the chat of logged in user
    fetchChats: expressAsyncHandler(async (req, res) => {
        try {
            const chats = await chat.find({ users: { $elemMatch: { $eq: req.user._id } } }).populate({ path: 'users latest_message group_admin latest_message.sender', select: '-password' });
            res.send(chats)
        } catch (error) {
            throw new Error(error);
        }
    }),

    renameChatName: expressAsyncHandler(async (req, res) => {
        const { id } = req.params;
        const { chat_name } = req.body;
        try {
            const update_chatname = await chat.findByIdAndUpdate(id, { chat_name }, { new: true }).populate('users', '-password')
            res.send(update_chatname)
        }
        catch (err) {
            throw new Error(err);
        }
    }),

    //GROUP CHAT FUNCTIONALITIES--------------------------------------------------------------------------------
    // create a group chat
    createGroupChat: expressAsyncHandler(async (req, res) => {
        console.log(req.body);
        const { users } = req.body;
        if (!req.body.users || !req.body.name) {
            return res.status(400).send({ message: 'Please fill all the fields' })
        }
        if (users.length <= 1) {
            return res.status(400).send("More than 2 users are required to form a group chat")
        }
        users.push(req.user._id);
        try {
            const groupChat = await chat.create({
                chat_name: req.body.name,
                users: users,
                group_chat: true,
                group_admin: req.user._id
            })
            const fullGroupChat = await chat.findOne({ _id: groupChat._id }).populate('users group_admin', '-password')
            res.send(fullGroupChat)
            // send notification to all the members that a new group has been created by the admin
        } catch (error) {
            throw new Error(err);
        }
    }),
    renameGroup: expressAsyncHandler(async (req, res) => {
        const { chat_id, chat_name } = req.body;
        const updateChat = await chat.findByIdAndUpdate(chat_id, { chat_name }, { new: true }).populate("users, group_admin", "-password")
        if (!updateChat) { res.status(404); throw new Error("Chat not found") }
        else { res.json(updateChat) }
    }),

    addToGroup: expressAsyncHandler(async (req, res) => {
        const { user_id, chat_id } = req.body;
        const group = await chat.findById(chat_id).populate('group_admin');
        if (String(group.group_admin._id) != String(req.user._id)) { return res.status(404).send("Only Admin can add or remove users") }
        const addUser = await chat.findByIdAndUpdate(chat_id, { $push: { users: user_id } }, { new: true }).populate("users group_admin", "-password")
        if (!addUser) { res.status(400); throw new Error("Chat not found") } else {
            res.send(addUser)
        }
    }),

    removeFromGroup: expressAsyncHandler(async (req, res) => {
        const { user_id, chat_id } = req.body;
        const group = await chat.findById(chat_id);
        console.log(group, chat_id);
        if (String(group.group_admin) !== String(req.user._id)) { return res.status(404).send("Only Admin can add or remove users") }
        const removeUser = await chat.findByIdAndUpdate(chat_id, { $pull: { users: user_id } }, { new: true }).populate("users group_admin", "-password")
        if (!removeUser) { res.status(400); throw new Error("Chat not found") } else {
            res.send(removeUser)
        }
    }),

    leaveGroup: expressAsyncHandler(async (req, res) => {
        const id = req.user._id;
        const { chat_id } = req.params;
        try {
            const group = await chat.findByIdAndUpdate(chat_id, { $pull: { users: id } }, { new: true });
            res.send('You have left the group');
        } catch (err) {
            throw new Error(err);
        }
    })
}