var express = require("express");
var app = express();

var httpServer = require("http").createServer(app);

var socketio = require("socket.io");
var io = socketio.listen(httpServer);

var history = [];
var rooms = [];

app.use(express.static("public"));
app.use(express.static("bower_components"));

io.sockets.on('connection', function (socket) {
	var roomName = socket.room;
	console.log("socket.room: " + socket.room)
	io.sockets.in(socket.room).emit('rec msg',"Witaj na chacie. Stwórz pokój lub dołącz do istniejącego.");
	console.log()

	socket.on('send msg', function(data){
		console.log("Wysyłam wiadomość w pokoju: " + socket.room)
        roomName = socket.room;
        history[roomName].unshift(data);

        io.sockets.in(socket.room).emit('rec msg', data);
    });


	socket.on('create room', function (newRoom) {
		console.log("Tworze pokoj o nazwe: " + newRoom)
        history[newRoom] = [];
        socket.room = newRoom;
        rooms.push(newRoom);
        socket.emit("show rooms", rooms);
        socket.broadcast.emit("show rooms", rooms);
	});

    socket.on('change room', function(room){
    	console.log("Zmieniam pokoj na: " + room)
        socket.leave(socket.room);
        socket.room = room;
        socket.join(room);
        roomName = socket.room;

        socket.emit('history', history[room]);
        io.sockets.in(socket.room).emit('rec msg', "Zmieniono pokój na: "+room);
    });

    socket.emit("show rooms", rooms);
});

httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na pocie 3000');
});
