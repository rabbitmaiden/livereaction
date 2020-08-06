const io = require('socket.io-client');
const socket = io("http://127.0.0.1:3400");

var statusTextEl = document.getElementById("connection-status");
var userCountEl = document.getElementById("user-count");
var buttonsContainerEl = document.getElementById("emoji-buttons");

const emojis = [];
emojis.push({name: "clap", url: require("emoji-images/pngs/clap.png").default});
emojis.push({name: "heart", url: require("emoji-images/pngs/sparkling_heart.png").default});
emojis.push({name: "respects", url: require("./images/f_key.png").default});
emojis.push({name: "airhorn", url: require("./images/airhorn.png").default});


socket.on("connect", () => {
  console.log("connected");
  statusTextEl.innerText = "Connected!"
});

socket.on("users", (count) => {
  console.log("users", count);
  userCountEl.innerText = count;
});

socket.on("emoji", (emote) => {
  console.log("emoji", emote);
});




function createButton(emoji) {
  var buttonEl = document.createElement("DIV");
  buttonEl.classList.add("button");
  buttonEl.style.backgroundImage = "url(" + emoji.url + ")";
  buttonEl.addEventListener("mousedown", () => {
    console.log("requesting", emoji.name);
    socket.emit("emoji-request", emoji.name);
  });
  buttonsContainerEl.appendChild(buttonEl);
}

for (var i = 0; i < emojis.length; i++) {
  createButton(emojis[i]);
}