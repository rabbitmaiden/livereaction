const io = require('socket.io-client');
const socket = io("http://loverevolution21.com:3400");
const emojis = require("../../shared/emojis");
setInterval(function(){
  var index = Math.floor(Math.random() * emojis.length);
  var name = emoji[index].name;
  var request = {};
  request[name] = 1;
  socket.emit("emoji-bulk-request", request);

}, 100);