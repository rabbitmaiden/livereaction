const io = require('socket.io-client');
const socket = io("http://127.0.0.1:3400");

var statusTextEl = document.getElementById("connection-status");
var userCountEl = document.getElementById("user-count");
var buttonsContainerEl = document.getElementById("emoji-buttons");
var emojiPoolEl = document.getElementById("emoji-pool");
var streamingModeEl = document.getElementById("streaming-mode");

const emojis = [];
emojis.push({name: "clap", url: require("emoji-images/pngs/clap.png").default, key: "C", keyCode: 67});
emojis.push({name: "heart", url: require("emoji-images/pngs/sparkling_heart.png").default, key: "H", keyCode: 72});
emojis.push({name: "respects", url: require("./images/f_key.png").default, key: "F", keyCode: 70});
emojis.push({name: "airhorn", url: require("./images/airhorn.png").default, key: "A", keyCode: 65});

var lastId = -1;

socket.on("connect", () => {
  console.log("connected");
  statusTextEl.innerText = "Connected!"
});

socket.on("disconnect", () => {
  console.log("disconnected");
  statusTextEl.innerText = "Disconnected~!"
});

socket.on("users", (count) => {
  console.log("users", count);
  userCountEl.innerText = count;
});

socket.on("update", (update) => {
  userCountEl.innerText = update.userCount;

  for (let name in update.emojis) {
    animate(name, update.emojis[name]);
  }
});

socket.on("emoji", (name) => {
  animate(name, 1);
});

function findEmojiByName(name) {
  for (let i = 0; i < emojis.length; i++) {
    if (emojis[i].name == name) {
      return emojis[i];
    }
  }
  console.log("couldn't find", name);
  return null;
}

const animProps = {
  col: {max: 19, dupeLength: 10},
  speed: {max: 8, dupeLength: 4}
};

let lastProps = {
  col: [],
  speed: []
};

function rand(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

const POOL_SIZE = 100;
var openDivs = [];

for (let i = 0; i < POOL_SIZE; i++) {
  let div = document.createElement("DIV");
  div.classList.add("emoji");
  emojiPoolEl.appendChild(div);
  openDivs.push(div);
}

function animate(name, count) {
  let emoji = findEmojiByName(name);
  if (!emoji) {
    return;
  }

  if (openDivs.length === 0) {
    console.log("no open divs");
    return;
  }

  let div = openDivs.shift();

  for (let prop in animProps) {
    let value = 0;
    do {
      value = rand(1, animProps[prop].max);
    } while (lastProps[prop].indexOf(value) > -1);
    lastProps[prop].push(value);

    if (lastProps[prop].length > animProps[prop].dupeLength) {
      lastProps[prop].shift();
    }

    div.setAttribute("data-" + prop, value);
  }

  let size = 1;
  if ( count > 50 ) {
    size = 4;
  } else if (count > 25) {
    size = 3;
  } else if (count > 10) {
    size = 2;
  }
  div.setAttribute("data-esize", size);
  div.style.backgroundImage = "url(" + emoji.url + ")";

  // start animation
  div.setAttribute('data-animation', 1)

  setTimeout(function(){
    div.removeAttribute("data-animation");
    openDivs.push(div);
  }, 7000);

}

var nextEmit = null;
const USE_BULK = true;
const DISABLE_SPAM = false;
var keyCodeToNameMap = {};

function requestEmoji(name, buttonEl) {
  if (USE_BULK) {
    if (!nextEmit) {
      nextEmit = {};
    }
    if (!nextEmit[name]) {
      nextEmit[name] = 1;
    } else {
      nextEmit[name]++;
    }

  } else {
    socket.emit("emoji-request", name);
  }
}

function createButton(emoji) {
  var buttonEl = document.createElement("DIV");
  buttonEl.classList.add("button");
  buttonEl.style.backgroundImage = "url(" + emoji.url + ")";
  buttonEl.addEventListener("mousedown", () => {
    requestEmoji(emoji.name);
    if (DISABLE_SPAM) {
      buttonEl.classList.add("disabled");
      setTimeout(() => {
        buttonEl.classList.remove("disabled");
      }, 1000);
    }
  });

  let keyEl = document.createElement("DIV");
  keyEl.classList.add("key");
  keyEl.innerText = emoji.key;
  buttonEl.appendChild(keyEl);
  keyCodeToNameMap[emoji.keyCode] = emoji.name;

  buttonsContainerEl.appendChild(buttonEl);
}

if (USE_BULK) {
  setInterval(function(){
    if (nextEmit) {
      console.log("request", nextEmit);
      socket.emit("emoji-bulk-request", nextEmit);
      nextEmit = null;
    }
  }, 200);
  }


for (var i = 0; i < emojis.length; i++) {
  createButton(emojis[i]);
}

streamingModeEl.addEventListener("click", function(){
  document.body.classList.add("streaming");
});

document.body.addEventListener("keydown", function(e){
  if (e.keyCode == 81) {
    document.body.classList.remove("streaming");
  } else if (keyCodeToNameMap[e.keyCode]) {
    requestEmoji(keyCodeToNameMap[e.keyCode]);
  }
});
