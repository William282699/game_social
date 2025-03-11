const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// 托管 public 文件夹中的静态资源
app.use(express.static('public'));

// 处理玩家加入房间以及分配队伍
io.on('connection', (socket) => {
    console.log('新玩家连接: ' + socket.id);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        // 获取房间中所有连接的socket id
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        
        if (clients.length > 2) {
            // 超过2个玩家则通知房间已满
            socket.emit('roomFull', { message: "房间已满！" });
            return;
        }
        
        // 分配队伍：第一个进入的是红队，第二个进入的是蓝队
        let team = (clients.length === 1) ? 'red' : 'blue';
        socket.team = team;
        socket.emit('assignTeam', { 
            team: team, 
            message: team === 'red' ? "你是红队，请按 A 键发射飞刀" : "你是蓝队，请按 5 键发射飞刀" 
        });
        console.log(`玩家 ${socket.id} 加入房间 ${roomId}，分配队伍：${team}`);
        
        // 当房间内已有两个玩家后，通知所有人开始游戏
        if (clients.length === 2) {
            io.in(roomId).emit('startGame');
        }
    });

    // 处理发射飞刀的事件
    socket.on('fireKnife', () => {
        // 广播给房间内所有玩家，让大家同步执行发射动作
        let roomId = "room1"; // 这里默认使用 room1
        io.in(roomId).emit('fireKnife', { team: socket.team });
        console.log(`玩家 ${socket.id} (${socket.team}) 发射飞刀`);
    });

    socket.on('disconnect', () => {
        console.log('玩家断开连接: ' + socket.id);
    });
});

// 启动服务器
http.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

