var app = require("express")();
var http = require("http").createServer(app);
var io = require('socket.io')(http);




var userCount = 0;

io.on('connection', (socket) => {
  ++userCount;
  console.log('User connected, now', userCount, 'connected');

  io.emit('users', userCount);


  socket.on('disconnect', () => {
    --userCount;
    console.log('User disconnected, now', userCount, 'connected');
    io.emit('users', userCount);
  });

  socket.on('emoji-request', (request) => {
    console.log("emoji-request", request);
  });

});





http.listen(3400, () => {
  console.log("Started");
});