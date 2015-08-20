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

	// when receive sdp, broadcast sdp to other user
	socket.on('sdp', function(data){
		console.log('Received SDP from ' + socket.id);
		socket.to(data.room).emit('sdp received', data.sdp);
	});

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
			io.to(room).emit('empty', room);
		}
		else if(clients.length == 1){
			socket.join(room);
			socket.to(room).emit('joined', room, clients.length + 1);
		}
		// only allow 2 users max per room
		else{
			socket.emit('full');
		}
	});

	socket.on('error', function(error){
		console.error(error);
	})

});

