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

function startGame() {
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

document.body.onkeyup = function(e) {
  if (e.keyCode == 32) {
    isJumping = true;
    jumpSpeed = 10;
  } else if (e.keyCode == 39) {
    if(!leftArmIsMoving) {
      leftArmIsMoving = true;
      leftArmSpeed = armSpeed;
    }
  } else if (e.keyCode == 37) {
    if (!rightArmIsMoving) {
      rightArmIsMoving = true;
      rightArmSpeed = -armSpeed;
    }
  }
}