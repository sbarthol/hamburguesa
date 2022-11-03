var canvasHeight = 400;
var canvasWidth = 600;

var player;
var leftArm;
var rightArm;
var playerYPosition = 200;

var interval;

var isJumping = true;
var jumpSpeed = -1;

var armSpeed = 14;
var leftArmSpeed;
var rightArmSpeed;
var leftArmIsMoving = false;
var rightArmIsMoving = false;

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
  player = new createPlayer(120, 120, 300 - 60);
  leftArm = new createLeftArm(500, 100, 280);
  rightArm = new createRightArm(500, 100, 280);
  setInterval(updateCanvas, 20);
}

function resetJump() {
  jumpSpeed = 0;
  isJumping = false;
}

var gameCanvas = {
  canvas: document.createElement("canvas"),
  context: null,
  start: function() {
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
  }
}

function createLeftArm(width, height, y) {
  this.width = width;
  this.height = height;
  this.x = -400;
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
    if (leftArmIsMoving && this.x + 500 > canvasWidth / 2) {
      this.x = canvasWidth / 2 - 500;
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

function createRightArm(width, height, y) {
  this.width = width;
  this.height = height;
  this.x = 500;
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
    if (rightArmIsMoving && this.x < canvasWidth / 2) {
      this.x = canvasWidth / 2;
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

function createPlayer(width, height, x) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = playerYPosition;
  
  this.draw = function() {
      ctx = gameCanvas.context;
      ctx.fillStyle = "green";
      //ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.drawImage(burgerImg, this.x, this.y, this.width, this.height);
  }
  this.stopPlayer = function() {
      var ground = canvasHeight - this.height;
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
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  player.jump();
  player.stopPlayer();
  leftArm.move();
  leftArm.changeDir();
  leftArm.stop();
  rightArm.move();
  rightArm.changeDir();
  rightArm.stop();
  player.draw();
  leftArm.draw();
  rightArm.draw();
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