import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const SOCKET_PORT = 3000;

const rooms = {}; // Stores room data

const server = createServer(app);
const io = new Server(server, { cors: { origin: '*', credentials: true } });

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', ({ roomId, role }) => {
        Object.keys(rooms).forEach(existingRoom => {
            if (rooms[existingRoom].interviewer === socket.id || rooms[existingRoom].interviewee === socket.id) {
                // Remove user from existing room
                if (rooms[existingRoom].interviewer === socket.id) rooms[existingRoom].interviewer = null;
                if (rooms[existingRoom].interviewee === socket.id) rooms[existingRoom].interviewee = null;
                socket.leave(existingRoom);
            }
        });
        
        if (!rooms[roomId]) {
            rooms[roomId] = { interviewer: null, interviewee: null };
        }
        // console.log("Data received in backend:", { roomId, role });
        // console.log(rooms[roomId]);

        if (role === 'Interviewer') {
            if (rooms[roomId].interviewer) {
                socket.emit("room-error", "Interviewer is already in the room.");
                return;
            }
            rooms[roomId].interviewer = socket.id;
        } else if (role === 'Interviewee') {
            if (!rooms[roomId].interviewer) {
                socket.emit("room-error", "Interviewer is not present, wait!");
                return;
            }
            if (rooms[roomId].interviewee) {
                socket.emit("room-error", "Interviewee is already in the room.");
                return;
            }
            rooms[roomId].interviewee = socket.id;
        }

        socket.join(roomId);
        // console.log(`${role} joined room ${roomId}`);

        // Notify the user that they successfully joined
        socket.emit("room-joined", { roomId });

    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const room in rooms) {
            if (rooms[room].interviewer === socket.id) rooms[room].interviewer = null;
            if (rooms[room].interviewee === socket.id) rooms[room].interviewee = null;
        }
    });
});

server.listen(SOCKET_PORT, () => {
    console.log(`Socket Server -> http://localhost:${SOCKET_PORT}`);
});
