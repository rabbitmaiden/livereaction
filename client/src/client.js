const emojis = require("../../shared/emojis");
const io = require('socket.io-client');
const socket = io("http://localhost:3400");
//const socket = io("http://loverevolution21.com:3400");

var statusTextEl = document.getElementById("connection-status");
var userCountEl = document.getElementById("user-count");
var buttonsContainerEl = document.getElementById("emoji-buttons");
var emojiPoolEl = document.getElementById("emoji-pool");
var streamingModeEl = document.getElementById("streaming-mode");
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

function getEmojiUrl(name) {
  return "images/" + name + ".png";
}

const animProps = {
  col: {max: 19, dupeLength: 10},
  speed: {max: 8, dupeLength: 4},
  // animation: {max: 3, dupeLength: 1},
};

let lastProps = {
  col: [],
  speed: [],
  // animation: [],
};

const sizeCounts = [
  0,
  3,
  6,
  10
]

function rand(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

// Create pool of reusable emoji elements
const POOL_SIZE = 200;
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

  let size = 1;
  if ( count > sizeCounts[3] ) {
    size = 4;
  } else if (count > sizeCounts[2]) {
    size = 3;
  } else if (count > sizeCounts[1]) {
    size = 2;
  }
  div.setAttribute("data-esize", size);
  div.style.backgroundImage = "url(" + getEmojiUrl(emoji.name) + ")";

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
  div.setAttribute("data-animation", "1");

  setTimeout(function(){
    div.removeAttribute("data-animation");
    setTimeout(function(){
      openDivs.push(div);
    }, 200);
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
  buttonEl.style.backgroundImage = "url(" + getEmojiUrl(emoji.name) + ")";
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


let sortedEmojis = emojis; /*emojis.sort(function(a,b){
  if (a.keyCode === b.keyCode) {
    return 0;
  }
  return (a.keyCode < b.keyCode) ? -1 : 1;
});*/

for (var i = 0; i < sortedEmojis.length; i++) {
  createButton(sortedEmojis[i]);
}

streamingModeEl.addEventListener("click", function(){
  document.body.classList.add("streaming");
});

document.body.addEventListener("keydown", function(e){
  console.log("KEYCODE:", e.keyCode);
  if (e.keyCode == 115) {
    document.body.classList.remove("streaming");
  } else if (keyCodeToNameMap[e.keyCode]) {
    requestEmoji(keyCodeToNameMap[e.keyCode]);
  }
});
