"use strict"

var localPeerConnection, signallingServer;

var btnSend = document.getElementById('btn-send');
var btnVideoStop = document.getElementById('btn-video-stop');
var btnVideoStart = document.getElementById('btn-video-start');
var btnVideoJoin = document.getElementById('btn-video-join');
var localVideo = document.getElementById('local-video');
var remoteVideo = document.getElementById('remote-video');

var inputRoomName = document.getElementById('room-name');

var localStream, localIsCaller;

btnVideoStop.onclick = function(e){
    e.preventDefault();
    // stop video stream
    if(localStream != null){
        localStream.stop();
    }

    // kill all connections
    if(localPeerConnection != null){
        localPeerConnection.removeStream(localStream);
        localPeerConnection.close();
        signallingServer.close();
        localVideo.src = "";
        remoteVideo.src = "";
    }

    btnVideoStart.disabled = false;
    btnVideoJoin.disabled = false;
    btnVideoStop.disabled = true;
}

btnVideoStart.onclick = function(e){
    e.preventDefault();
    // is starting the call
    localIsCaller = true;
    initConnection();
}

btnVideoJoin.onclick = function(e){
    e.preventDefault();
    // just joining a call, not offering
    localIsCaller = false;
    initConnection();
}

function initConnection(){
    var room = inputRoomName.value;

    if(room == undefined || room.length <= 0){
        alert('Please enter room name');
        return;
    }

    // start connection!
    connect(room);

    btnVideoStart.disabled = true;
    btnVideoJoin.disabled = true;
    btnVideoStop.disabled = false;
}


// WEBRTC STUFF STARTS HERE
// Set objects as most are currently prefixed
window.RTCPeerConnection        = window.RTCPeerConnection || window.mozRTCPeerConnection || 
                                    window.webkitRTCPeerConnection || window.msRTCPeerConnection;
window.RTCSessionDescription    = window.RTCSessionDescription || window.mozRTCSessionDescription ||
                                    window.webkitRTCSessionDescription || window.msRTCSessionDescription;
navigator.getUserMedia          = navigator.getUserMedia || navigator.mozGetUserMedia ||
                                    navigator.webkitGetUserMedia || navigator.msGetUserMedia;
window.SignallingServer         = window.SignallingServer;

// RTCPeerConnection Options
var server = {
    // User Google's STUN server
    iceServers: [{"url": "stun:stun.l.google.com:19302"}]
};

var sdpConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveVideo: true,
    }
}

function connect(room){
    // create peer connection
    localPeerConnection = new RTCPeerConnection(server);

    // create local data channel, send it to remote
    navigator.getUserMedia({ video: true }, function(stream){
        // get and save local stream
        trace('Got stream, saving it now and starting RTC conn');

        // must add before calling setRemoteDescription() because then 
        // it triggers 'addstream' event
        localPeerConnection.addStream(stream);
        localStream = stream;

        // show local video
        localVideo.src = window.URL.createObjectURL(stream);

        // can start once have gotten local video
        establishRTCConnection(room);

    }, errorHandler)
}

function establishRTCConnection(room){
    // create signalling server
    // var serverIP = "http://192.168.43.241:2013";
    var serverIP = "http://10.0.11.196:2013";
    signallingServer = new SignallingServer(room, serverIP);
    signallingServer.connect();


    // a remote peer has joined room, initiate sdp exchange
    signallingServer.onGuestJoined = function(){
        trace('guest joined!')
        // set local description and send to remote
        localPeerConnection.createOffer(function(sessionDescription){
            trace('set local session desc with offer');

            localPeerConnection.setLocalDescription(sessionDescription);
            
            // send local sdp to remote
            signallingServer.sendSDP(sessionDescription);
        });
    }

    // got sdp from remote
    signallingServer.onReceiveSdp = function(sdp){
        // if local was the caller, set remote desc
        if(localIsCaller){
            trace('is caller');
            trace('set remote session desc with answer');
            localPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        }
        // if local is joining a call, set remote sdp and create answer
        else{
            trace('set remote session desc with offer');
            localPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp), function(){
                trace('make answer')
                localPeerConnection.createAnswer(function(sessionDescription){
                    // set local description
                    trace('set local session desc with answer');
                    localPeerConnection.setLocalDescription(sessionDescription);

                    // send local sdp to remote too
                    signallingServer.sendSDP(sessionDescription);
                });
            });
        }
    }

    // when received ICE candidate
    signallingServer.onReceiveICECandidate = function(candidate){
        trace('Set remote ice candidate');
        localPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    // when room is full, alert user
    signallingServer.onRoomFull = function(room){
        window.alert('Room "' + room + '"" is full! Please join or create another room');
    }

    // get ice candidates and send them over
    // wont get called unless SDP has been exchanged
    localPeerConnection.onicecandidate = function(event){
        if(event.candidate){
            //!!! send ice candidate over via signalling channel
            trace("Sending candidate");
            signallingServer.sendICECandidate(event.candidate);
        }
    }

    // when stream is added to connection, put it in video src
    localPeerConnection.onaddstream = function(data){
        remoteVideo.src = window.URL.createObjectURL(data.stream);
    }
    
}

function errorHandler(error){
    console.error('Something went wrong!');
    console.error(error);
}

function trace(text){
    console.info(text);
}
