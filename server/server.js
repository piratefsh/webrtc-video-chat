var static = require('node-static');
var http = require('http');
var util = require('util');
var file = new(static.Server)();
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(2013);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket){

  // convenience function to log server messages on the client
	function log(){
		var array = [">>> Message from server: "];
	  for (var i = 0; i < arguments.length; i++) {
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message:', message);
    // for a real app, would be room only (not broadcast)
		socket.broadcast.emit('message', message);
	});

	socket.on('create or join', function (room) {
		// join room
		var existingRoom = io.sockets.adapter.rooms[room];
		var clients = [];

		if(existingRoom){
			clients = Object.keys(existingRoom);
		}

		if(clients.length == 0){
			socket.join(room);
			io.to(room).emit('log', ['Room ' + room + ' created!']);
		}
		else if(clients.length == 1){
			socket.join(room);
			io.to(room).emit('log', ['New user joined the room!', 
				'There are ' + clients.length + ' in the room.']);
		}
		else{
			socket.emit('log', ['Sorry, room is full!']);
		}
	});

	socket.on('error', function(error){
		log('Error: ' + error)
	})

});

