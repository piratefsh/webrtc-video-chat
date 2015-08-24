# WebRTC chat client and signalling server

Video only for now. Build on webRTC technology for the video streaming.

Includes signalling server built on node.js.

## To Run

### To run server

```
npm install
node server/server.js 
// or supervisor server/server.js to watch for file changes and autoreload
```

### To watch HTML/CSS and JS files:

```
npm install
grunt watch
```
Remember to update your signalling server IP in `main.js` to your local IP if running on a separate device.

1. Open http://localhost:2013 in browser
2. Open the same in another browser 
3. Host clicks on 'Start'
4. Guest clicks on 'Join'
5. Accept permission to user vidcam
6. Chat!

Client built on vanilla Javascript and socket.io for signalling.

Signalling server built on node.js (node-static and socket.io) with reference from [webRTC codelab](https://bitbucket.org/webrtc/codelab).


