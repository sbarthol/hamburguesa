
var leftArm;
var rightArm;
var belt;
var ingredients
var ingredientCounter
var gameSocket
var uuid
var updateCanvasInterval
var addRandomIngredientInterval
const allIngredients = ["mayo", "lettuce", "ketchup", "steak", "onion", "cheese", "bun"]

function init(uuid_, roomName_) {
  this.uuid = uuid_
  gameSocket = createGameSocket(roomName_, () => {
    gameSocket.send(JSON.stringify({
      'message_type': 'register',
      'uuid': uuid,
    }));
  })
  gameCanvas.init();
  leftArm = new createLeftArm(-350, window.innerHeight - 150, 512, 120);
  rightArm = new createRightArm(window.innerWidth - 150, window.innerHeight - 150, 512, 120);
  belt = new createBelt(0, 130, window.innerWidth, 25);
}

function startGame() {
  ingredients = []
  ingredientCounter = 1
  console.log("here")
  clearInterval(updateCanvasInterval)
  clearInterval(addRandomIngredientInterval)
  updateCanvasInterval = setInterval(updateCanvas, 20);
  addRandomIngredientInterval = setInterval(addRandomIngredient, 1000);
}

var gameCanvas = {
  canvas: document.createElement("canvas"),
  context: null,
  init: function() {
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
  this.startX = x;
  this.startY = y;

  this.img = new Image();
  this.img.src = '/static/leftArm.png';

  this.dest = null; // contains the dest of the upper right corner
  this.movingState = 0; // 1 -> grab, 2 -> put down, 3 -> back to start pos

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }


  this.fetchIngredient = function(dest_) {
    this.movingState = 1;
    this.dest = dest_;
  }

  this.move = function() {
    if(this.dest != null) {
      const dirVec = {x: this.dest.x - (this.x + this.width), y: this.dest.y - this.y};
      const norm = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
      const speedVec = {x: 20 * dirVec.x / norm, y: 20 * dirVec.y / norm};
      this.x += speedVec.x;
      this.y += speedVec.y;

      if(this.movingState == 1 && this.y < this.dest.y) {
        this.dest = {x: window.innerWidth / 2, y: this.startY};
        this.movingState = 2;
      } else if (this.movingState == 2 && this.y > this.dest.y) {
        this.dest = {x: this.startX, y: this.startY};
        this.movingState = 3;
      } else if (this.movingState == 3 && this.x < this.dest.x) {
        this.dest = null;
      }
    }
  }
}

function createRightArm(x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.startX = x;
  this.startY = y;

  this.img = new Image();
  this.img.src = '/static/rightArm.png';

  this.dest = null; // contains the dest of the upper right corner
  this.movingState = 0; // 1 -> grab, 2 -> put down, 3 -> back to start pos

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }


  this.fetchIngredient = function(dest_) {
    this.movingState = 1;
    this.dest = dest_;
  }

  this.move = function() {
    if(this.dest != null) {
      const dirVec = {x: this.dest.x - this.x, y: this.dest.y - this.y};
      const norm = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
      const speedVec = {x: 20 * dirVec.x / norm, y: 20 * dirVec.y / norm};
      this.x += speedVec.x;
      this.y += speedVec.y;

      if(this.movingState == 1 && this.y < this.dest.y) {
        this.dest = {x: window.innerWidth / 2, y: this.startY};
        this.movingState = 2;
      } else if (this.movingState == 2 && this.y > this.dest.y) {
        this.dest = {x: this.startX, y: this.startY};
        this.movingState = 3;
      } else if (this.movingState == 3 && this.x > this.dest.x) {
        this.dest = null;
      }
    }
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

gameCanvas.canvas.addEventListener('click', function(evt) {
  var mousePos = getMousePos(gameCanvas.canvas, evt);
  var clickedIngredient = null
  for(var i=0;i<ingredients.length;i++){
    if(ingredients[i].x <= mousePos.x && mousePos.x < ingredients[i].x + ingredients[i].width
      && ingredients[i].y <= mousePos.y && mousePos.y < ingredients[i].y + ingredients[i].height) {
        clickedIngredient = ingredients[i];
      }
  }
  if(clickedIngredient != null) {
    console.log("clicked on " + clickedIngredient.name + ", id = " + clickedIngredient.id);
    gameSocket.send(JSON.stringify({
        'ingredient_id': clickedIngredient.id,
        'message_type': 'pick_ingredient',
        'uuid': uuid
    }));
    // Todo: make hand x movement non screen dependent
    // calculate the offset
    leftArm.fetchIngredient( {x: clickedIngredient.x + clickedIngredient.width + 100, y: clickedIngredient.y})
  }
  
}, false);

function createGameSocket(roomName, callback) {
  const gameSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/'
    + roomName
    + '/'
  );

  gameSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("received data " + e.data);

    if(data["message_type"] == undefined) {
      console.log("message_type undefined");
      return;
    }
    if(data["message_type"] == "start_game") {
      console.log("here");
      startGame();
    } else if(data["message_type"] == "pick_ingredient") {
      const ingredientId = data["ingredient_id"];
      var clickedIngredient = null;
      for(var i=0;i<ingredients.length;i++) {
        if(ingredients[i].id == ingredientId) {
          clickedIngredient = ingredients[i]
        }
      }
      if(clickedIngredient != null) {
        rightArm.fetchIngredient( {x: clickedIngredient.x + 100, y: clickedIngredient.y})
      }
    }
  };
  gameSocket.onclose = function(e) {
    console.error('Socket closed unexpectedly');
  };
  gameSocket.onopen = function(e) {
    callback();
  };
  return gameSocket;
}

function updateCanvas() {
  ctx = gameCanvas.context;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
  leftArm.move();
  rightArm.move();

  // Todo: should i let the ingredients past the edge
  // for the case where the mouse grabs an ingredient
  // just before it disapears ?
  while(ingredients.length > 0 && ingredients[0].x > window.innerWidth) {
    ingredients.shift();
  }
  for (var i = 0; i < ingredients.length; i++) {
    ingredients[i].move();
  }

  belt.draw();
  for (var i = 0; i < ingredients.length; i++) {
    ingredients[i].draw();
  }
  leftArm.draw();
  rightArm.draw();
}

function addRandomIngredient() {
  const name = allIngredients[ingredientCounter % allIngredients.length];
  ingredients.push(new createIngredient(-100, belt.y - 100, 100, 100, name));
}
