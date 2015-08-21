var SignallingServer = function(room, socketServer){
    this.room = room;
    this.socket = io.connect(socketServer);
    this.socket.on('full', function (room){
      console.log('Room ' + room + ' is full');
    });

    this.socket.on('empty', function (room){
      isInitiator = true;
      console.log('Room ' + room + ' is empty');
    });

    this.socket.on('join', function (room){
      console.log('Making request to join room ' + room);
    });

    this.socket.on('joined', function (room, numClients){
      console.log('New user has joined ' + room);
      console.log('Room has ' + numClients + ' clients');
      //ask host to initiate sdp transfer
      this.onGuestJoined();
    }.bind(this));

    this.socket.on('sdp received', function(sdp){
        console.log('Received SDP ');
        console.log(sdp);
        this.onReceiveSdp(sdp);
    }.bind(this));

    this.socket.on('ice candidate received', function(candidate){
        console.log('Received ICE candidate ');
        console.log(candidate);
        this.onReceiveICECandidate(candidate);
    }.bind(this));

    this.socket.on('log', function (array){
      console.log.apply(console, array);
    });
}

SignallingServer.prototype = {
    connect: function(){
        if (this.room !== '') {
          console.log('Joining room ' + this.room);
          this.socket.emit('create or join', this.room);
        }
    },
    close: function(){
        console.log('Disconnecting')
        this.socket.disconnect();
    },
    sendSDP: function(sdp){
        console.log('sending sdp')
        this.socket.emit('sdp', {
            room: this.room,
            sdp: sdp
        });
    },
    sendICECandidate: function(candidate){
        console.log('sending ice candidate');
        this.socket.emit('ice candidate', {
            room: this.room,
            candidate: candidate
        });
    },
    onReceiveSdp: function(sdp){
        console.log('Placeholder function: Received SDP')
    },
    onGuestJoined: function(){
        console.log('Placeholder function: Guest joined room')
    },
    onReceiveICECandidate: function(candidate){
        console.log('Placeholder function: Received ICE candidate')
    }
}

window.SignallingServer = SignallingServer;