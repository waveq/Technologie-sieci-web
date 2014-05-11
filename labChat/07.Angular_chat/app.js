var express = require("express");
var app = express();

var httpServer = require("http").createServer(app);

var socketio = require("socket.io");
var io = socketio.listen(httpServer);

var history = [];
var rooms = ["main"];

app.use(express.static("public"));
app.use(express.static("bower_components"));

io.sockets.on('connection', function (socket) {
	var roomName = socket.room;
	io.sockets.in(socket.room).emit('rec msg',"Witaj na czacie! Jesteś na kanale głównym!");

	socket.on('send msg', function (data) {
		history.unshift(data);
		io.sockets.emit('rec msg', data);
	});
	socket.on('create room', function (data) {
		rooms.unshift(data);
		io.sockets.emit('rec room', data);
	});
    socket.on('change room', function(room){
        socket.leave(socket.room);
        socket.room = room;
        socket.join(room);
        roomName = socket.room;
        socket.emit('history', history[room]);
        console.log("przełączyłem na pokój o nazwie:  " + socket.room );
        console.log(history);
    });

	
	socket.emit('roomHistory', rooms);
	socket.emit('history', history);
});

httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na pocie 3000');
});
