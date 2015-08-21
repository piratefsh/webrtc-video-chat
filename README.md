# WebRTC chat client and signalling server

Video only for now. Build on webRTC technology for the video streaming.

Includes signalling server built on node.js.

## To Run

### Client

```
npm install
grunt serve
```

1. Open http://localhost:9000/index.html in browser
2. Open the same in another browser
3. Host clicks on 'Start'
4. Guest clicks on 'Join'
5. Accept permission to user vidcam
6. Chat!

Built on vanilla Javascript and socket.io for signalling.

### Server

```
npm install
node server/server.js
```
Built on node.js (node-static and socket.io) with reference from [webRTC codelab](https://bitbucket.org/webrtc/codelab).

