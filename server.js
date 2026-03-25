const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const rooms = new Map();

io.on('connection', (socket) => {
    socket.on('create-room', (playerName) => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = {
            code,
            players: [{ id: socket.id, name: playerName, isHost: true }],
            chains: new Map(),
            currentRound: 0,
            turnQueue: []
        };
        rooms.set(code, room);
        socket.join(code);
        socket.emit('room-created', { code, players: room.players });
    });

    socket.on('join-room', ({ code, name }) => {
        const room = rooms.get(code);
        if (!room) return socket.emit('error', { message: 'Rummet finns inte' });
        
        room.players.push({ id: socket.id, name, isHost: false });
        socket.join(code);
        socket.emit('joined-room', { code, players: room.players });
        socket.to(code).emit('player-joined', { player: { id: socket.id, name, isHost: false }, players: room.players });
    });

    socket.on('start-game', () => {
        // Implementera spellogik här
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server på port ${PORT}`));
