const io = require('socket.io-client');
const socket = io("http://loverevolution21.com:3400");

setInterval(function(){

  var emoji = ['clap', 'heart', 'respects', 'airhorn'];
  var index = Math.floor(Math.random() * 4);
  var name = emoji[index];
  var request = {};
  request[name] = 1;
  socket.emit("emoji-bulk-request", request);

}, 100);