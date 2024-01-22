import dotenv from 'dotenv';
import http from "http";
import express from 'express'
import cors from 'cors';
import { Server } from "socket.io"
import mongoose from 'mongoose';
import colors from 'colors';
import authRouter from './routes/authRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { messageRoute } from './routes/messageRoute.js';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); //for body parsing

app.use('/api/user', authRouter)
app.use('/api/chat', chatRouter)
app.use('/api/msg', messageRoute)
app.use(notFound);
app.use(errorHandler);

const port = 8080;
const server = http.createServer(app);
const io = new Server(server, { pingTimeout: 60000, cors: { origin: 'http://localhost:5173' } });
//socket io
io.on('connection', socket => {
    console.log('A new user has connected', socket.id)
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit("connected")
    });
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User joined room: ' + room)
    });

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) return console.log("chat.users not defined");
        chat.users.forEach((user) => {
            if (user == newMessageRecieved.sender._id) return;
            socket.in(user).emit("message recieved", newMessageRecieved);
        });
    });
});
server.listen(port, () => {
    mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true }).then(res => {
        console.log("MongoDB Connected : " + `${res.connection.host}`.cyan.underline.italic)
        console.log("listening on port : " + `http://localhost:${port}`.blue.italic.underline)
    });
});