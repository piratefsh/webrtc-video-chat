function trace(text){
    console.info(text);
}

// Connects to signalling server with given room and IP
// has methods to exchange SDP and ICE candidates

var SignallingServer = function(room, socketServer){
    this.room = room;
    this.socket = io.connect(socketServer);
    this.socket.on('full', function (room){
      trace('Room ' + room + ' is full');
      this.onRoomFull(room);
    }.bind(this));

    this.socket.on('empty', function (room){
      this.isInitiator = true;
      trace('Room ' + room + ' is empty');
      this.onRoomEmpty();
    });

    this.socket.on('join', function (room){
      trace('Making request to join room ' + room);
    });

    this.socket.on('joined', function (room, numClients){
      trace('New user has joined ' + room);
      trace('Room has ' + numClients + ' clients');
      //ask host to initiate sdp transfer
      this.onGuestJoined();
    }.bind(this));

    this.socket.on('sdp received', function(sdp){
        trace('Received SDP ');
        trace(sdp);
        this.onReceiveSdp(sdp);
    }.bind(this));

    this.socket.on('ice candidate received', function(candidate){
        trace('Received ICE candidate ');
        trace(candidate);
        this.onReceiveICECandidate(candidate);
    }.bind(this));

    this.socket.on('log', function (array){
      console.log.apply(console, array);
    });
}

SignallingServer.prototype = {
    connect: function(){
        if (this.room !== '') {
          trace('Joining room ' + this.room);
          this.socket.emit('create or join', this.room);
        }
    },
    close: function(){
        trace('Disconnecting')
        this.socket.disconnect();
    },
    sendSDP: function(sdp){
        trace('sending sdp')
        this.socket.emit('sdp', {
            room: this.room,
            sdp: sdp
        });
    },
    sendICECandidate: function(candidate){
        trace('sending ice candidate');
        this.socket.emit('ice candidate', {
            room: this.room,
            candidate: candidate
        });
    },
    onReceiveSdp: function(sdp){
        trace('Placeholder function: Received SDP')
    },
    onGuestJoined: function(){
        trace('Placeholder function: Guest joined room')
    },
    onReceiveICECandidate: function(candidate){
        trace('Placeholder function: Received ICE candidate')
    },
    onRoomFull: function(room){
        trace('Placeholder function: Room is full!');
    }
}

window.SignallingServer = SignallingServer;