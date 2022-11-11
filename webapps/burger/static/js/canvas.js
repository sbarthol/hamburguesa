
var leftArm;
var rightArm;
var belt;
var ingredients = []
var ingredientCounter = 1
const allIngredients = ["mayo", "lettuce", "ketchup", "steak", "onion", "cheese", "bun"]

// Todo: what to do with the uuid
function startGame(uuid) {
  gameCanvas.start();
  leftArm = new createLeftArm(-200, window.innerHeight / 2, 512, 120);
  rightArm = new createRightArm(window.innerWidth - 300, window.innerHeight / 2, 512, 120);
  belt = new createBelt(0, 130, window.innerWidth, 25);
  setInterval(updateCanvas, 20);
  setInterval(addRandomIngredient, 1000);
}

var gameCanvas = {
  canvas: document.createElement("canvas"),
  context: null,
  start: function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
  }
}

function createIngredient(x, y, width, height, name) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.name = name;  

  this.img = new Image();
  this.img.src = '/static/' + name + '.png';

  this.id = ingredientCounter++;

  this.move = function() {
    this.x += 3.0;
  }

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}

function createBelt(x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "gray";
    border = 2
    ctx.fillRect(this.x, this.y + border, this.width, this.height - 2 * border);
  }
}

function createLeftArm(x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.img = new Image();
  this.img.src = '/static/leftArm.png';

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  this.move = function() {
    
  }

  this.stop = function() {
    
  }
}

function createRightArm(x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.img = new Image();
  this.img.src = '/static/rightArm.png';

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  this.move = function() {
  
  }

  this.stop = function() {
    
  }
}


// From https://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

gameCanvas.canvas.addEventListener('mousemove', function(evt) {
  /*var mousePos = getMousePos(gameCanvas.canvas, evt);
  gameSocket.send(JSON.stringify({
        'pos': mousePos.y
  }));*/
}, false);

const roomName = JSON.parse(document.getElementById('room-name').textContent);

const gameSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/'
    + roomName
    + '/'
);

gameSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log(data)
};

gameSocket.onclose = function(e) {
    console.error('Socket closed unexpectedly');
};

function updateCanvas() {
  ctx = gameCanvas.context;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
  leftArm.move();
  leftArm.stop();

  rightArm.move();
  rightArm.stop();

  // Todo: should i let the ingredients past the edge
  // for the case where the mouse grabs an ingredient
  // just before it disapears ?
  while(ingredients.length > 0 && ingredients[0].x > window.innerWidth) {
    ingredients.shift();
  }
  for (var i = 0; i < ingredients.length; i++) {
    ingredients[i].move();
  }

  leftArm.draw();
  rightArm.draw();
  belt.draw();
  for (var i = 0; i < ingredients.length; i++) {
    ingredients[i].draw();
  }
}

function addRandomIngredient() {
  const name = allIngredients[Math.floor(Math.random() * allIngredients.length)];
  ingredients.push(new createIngredient(-100, belt.y - 100, 100, 100, name));
}

function displayError(message) {
  alert(message)
	console.log(message)
}

document.body.onkeyup = function(e) {
  if (e.keyCode == 32) {
  } else if (e.keyCode == 39) {
    
  } else if (e.keyCode == 37) {
    
  }
}