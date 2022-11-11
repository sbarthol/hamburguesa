
var player;
var leftArm;
var rightArm;
var interval;
var isJumping = true;
var jumpSpeed = -1;
var armSpeed = 14;
var leftArmSpeed;
var rightArmSpeed;
var leftArmIsMoving = false;
var rightArmIsMoving = false;
var ingredients = []

const burgerImg = new Image();
burgerImg.src = '/static/burgerImg.png';

const leftArmImg = new Image();
leftArmImg.src = '/static/leftArm.png';

const rightArmImg = new Image();
rightArmImg.src = '/static/rightArm.png';

var uuid

function startGame(uuid_) {
  uuid = uuid_;
  gameCanvas.start();
  player = new createPlayer(window.innerWidth / 2, window.innerHeight / 2, 100, 100);
  leftArm = new createLeftArm(-200, window.innerHeight / 2, 512, 120);
  rightArm = new createRightArm(window.innerWidth - 300, window.innerHeight / 2, 512, 120);
  belt = new createBelt(0, 130, window.innerWidth, 25);
  setInterval(updateCanvas, 20);
  setInterval(addIngredient, 1000);
}



function resetJump() {
  jumpSpeed = 0;
  isJumping = false;
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

function createIngredient(x, y, width, height, img) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.img = img

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(leftArmImg, this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "gray";
    border = 2
    ctx.fillRect(this.x, this.y + border, this.width, this.height - 2 * border);
  }

  this.move = function() {
    this.x += 3.0;
  }

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(img, this.x, this.y, this.width, this.height);
  }
}

function createBelt(x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(leftArmImg, this.x, this.y, this.width, this.height);
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

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(leftArmImg, this.x, this.y, this.width, this.height);
  }

  this.move = function() {
    if(leftArmIsMoving) {
      this.x += leftArmSpeed;
    } else {

    }
  }

  this.changeDir = function() {
    if (leftArmIsMoving && this.x + 500 > window.innerWidth / 2) {
      this.x = window.innerWidth / 2 - 500;
      leftArmSpeed = -leftArmSpeed;
    }
  }

  this.stop = function() {
    if (leftArmIsMoving && this.x  < -400) {
      this.x = -400;
      leftArmIsMoving = false;
    }
  }
}

function createRightArm(x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.draw = function() {
    ctx = gameCanvas.context;
    ctx.drawImage(rightArmImg, this.x, this.y, this.width, this.height);
  }

  this.move = function() {
    if(rightArmIsMoving) {
      this.x += rightArmSpeed;
    }
  }

  this.changeDir = function() {
    if (rightArmIsMoving && this.x < window.innerWidth / 2) {
      this.x = window.innerWidth / 2;
      rightArmSpeed = -rightArmSpeed;
    }
  }

  this.stop = function() {
    if (rightArmIsMoving && this.x  > 500) {
      this.x = 500;
      rightArmIsMoving = false;
    }
  }
}

function createPlayer(x, y, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  
  this.draw = function() {
      ctx = gameCanvas.context;
      ctx.drawImage(burgerImg, this.x, this.y, this.width, this.height);
  }
  this.stopPlayer = function() {
      var ground = window.innerHeight - this.height;
      if (this.y > ground) {
          this.y = ground;
          isJumping = false;
      }
  }
  this.jump = function() {
      if (isJumping) {
          this.y -= jumpSpeed;
          jumpSpeed -= 0.3;
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

gameCanvas.canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(gameCanvas.canvas, evt);
  // console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
  leftArm.y = mousePos.y
  gameSocket.send(JSON.stringify({
        'pos': mousePos.y
  }));
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
    rightArm.y = data.pos
};

gameSocket.onclose = function(e) {
    console.error('Socket closed unexpectedly');
};

function updateCanvas() {
  ctx = gameCanvas.context;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  player.jump();
  player.stopPlayer();
  leftArm.move();
  leftArm.changeDir();
  leftArm.stop();
  rightArm.move();
  rightArm.changeDir();
  rightArm.stop();

  while(ingredients.length > 0 && ingredients[0].x > window.innerWidth) {
    ingredients.shift();
  }
  for (var i = 0; i < ingredients.length; i++) {
    ingredients[i].move();
  }

  player.draw();
  leftArm.draw();
  rightArm.draw();
  belt.draw();
  for (var i = 0; i < ingredients.length; i++) {
    ingredients[i].draw();
  }
}

function addIngredient() {
  ingredients.push(new createIngredient(-100, belt.y - 100, 100, 100, burgerImg));
}

function displayError(message) {
  alert(message)
	console.log(message)
}

function getCSRFToken() {
	let cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		let c = cookies[i].trim();
		if (c.startsWith("csrftoken=")) {
			return c.substring("csrftoken=".length, c.length);
		}
	}
	return "unknown";
}

function addIngredientRequest(ingredient) {
  let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) return;
		if (xhr.status == 200) {
      return;
    }
    if (xhr.status == 0) {
      displayError("Cannot connect to server");
      return;
    }
    if (!xhr.getResponseHeader("content-type") == "application/json") {
      displayError("Received status=" + xhr.status);
      return;
    }
    let response = JSON.parse(xhr.responseText);
    if (response.hasOwnProperty("error")) {
      displayError(response.error);
      return;
    }
	};

	xhr.open("POST", addIngredientUrl, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send(
		"ingredient=" +
    ingredient +
			"&uuid=" +
			uuid +
			"&csrfmiddlewaretoken=" +
			getCSRFToken()
	);
}

document.body.onkeyup = function(e) {
  if (e.keyCode == 32) {
    isJumping = true;
    jumpSpeed = 10;
  } else if (e.keyCode == 39) {
    if(!leftArmIsMoving) {
      leftArmIsMoving = true;
      leftArmSpeed = armSpeed;
      addIngredientRequest("onions")
    }
  } else if (e.keyCode == 37) {
    if (!rightArmIsMoving) {
      rightArmIsMoving = true;
      rightArmSpeed = -armSpeed;
    }
  }
}