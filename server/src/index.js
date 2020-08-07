var app = require("express")();
var http = require("http").createServer(app);
var io = require('socket.io')(http);

var userCount = 0;

const validEmojis = [
  "clap",
  "heart",
  "respects",
  "airhorn",
]

var nextUpdate = {};

function requestBulkEmoji(name, count) {
  if (validEmojis.indexOf(name) < 0) {
    return false;
  }
  if (!nextUpdate[name]) {
    nextUpdate[name] = count;
  } else {
    nextUpdate[name] += count;
  }
 }


io.on('connection', (socket) => {
  ++userCount;
  console.log('User connected');

  socket.emit('users', userCount);

  socket.on('disconnect', () => {
    --userCount;
    console.log('User disconnected');
  });

  socket.on('emoji-request', (name) => {
    if (validEmojis.indexOf(name) < 0) {
      return false;
    }
    io.emit('emoji', name);
  });

  socket.on('emoji-bulk-request', (request) => {
    console.log("emoji-request", request);
    for (var name in request) {
      requestBulkEmoji(name, request[name]);
    }
  });
});

setInterval(() => {
  let update = {
    userCount: userCount,
    emojis: nextUpdate
  };
  io.emit('update', update);
  console.log(update);
  nextUpdate = {};
}, 200);


// setInterval(() => {
//   let name = (Math.random() > 0.5) ? "clap" : "heart";
//   io.emit("emoji", name);
// }, 200)

http.listen(3400, () => {
  console.log("Started");
});