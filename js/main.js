"use strict"

var localPeerConnection, sendChannel;

var btnSend = document.getElementById('btn-send');
var btnVideoStop = document.getElementById('btn-video-stop');
var localVideo = document.getElementById('local-video');
var localStream;
btnVideoStop.onclick = function(){
    if(localStream != null){
        localStream.stop();
    }
}

var divLocalVideo = document.getElementById('local-video');
var divRemoteVideo = document.getElementById('remote-video');

// Set objects as most are currently prefixed
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || 
                       window.webkitRTCPeerConnection || window.msRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription ||
                       window.webkitRTCSessionDescription || window.msRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia ||
                       navigator.webkitGetUserMedia || navigator.msGetUserMedia;

// RTCPeerConnection Options
var server = {
    iceServers: [{"url": "stun:stun.l.google.com:19302"}]
};

var sdpConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveVideo: true,
    }
}

function createConnection(localIsCaller){
    // create peer connection
    localPeerConnection = new RTCPeerConnection(server);

    // get ice candidates and send them over
    // wont get called unless SDP has been exchanged
    localPeerConnection.onicecandidate = function(event){
        if(event.candidate){
            //!!! send ice candidate over via signalling channel
            trace(event.candidate.candidate)
        }
    }

    // when stream is added to connection, put it in video src
    localPeerConnection.onaddstream = function(data){
        var video = document.createElement("video");
        video.src = URL.createObjectURL(data.stream);
        divRemoteVideo.appendChild(video);
    }
    
    // create local data channel, send it to remote
    navigator.getUserMedia({ video: true }, function(stream){
        //!!! do something with stream here

        // add local stream
        localPeerConnection.addStream(stream);
        localStream = stream;

        // show local video
        localVideo.src = window.URL.createObjectURL(stream);

        // send video over
        // if local is caller, then create offer
        if(localIsCaller){
            localPeerConnection.createOffer(function(sessionDescription){
                // set local description
                trace('session desc')
                trace(sessionDescription.sdp)
                localPeerConnection.setLocalDescription(sessionDescription);
                
                //!!! send local sdp to remote
            });
        }
        // if local is joining a call, create answer instead
        else{
            localPeerConnection.createAnswer(localPeerConnection.remoteDescription, function(sessionDescription){
                // set local description
                localPeerConnection.setLocalDescription(sessionDescription);

                //!!! send local sdp to remote too
            })
        }
    }, errorHandler)

    sendChannel = localPeerConnection.createDataChannel('sendDataChannel', {
        reliable: false
    });
}

function errorHandler(error){
    console.error('Something went wrong!');
    console.error(error);
}

function init(){
    createConnection(true);
}

function trace(text){
    console.info(text)
}
init();