var leftArm;
var rightArm;
var belt;
var tv;
var ingredients;
var ingredientCounter;
var gameSocket;
var uuid;
var updateCanvasInterval;
var gameIsStarted;
var gameIsOver;
var loadedAssets;

// Todo: solve image loading problems
// Todo: can we download everything in advance
// Todo: when game is over, let the player put the last ingredient before freezing

function init(uuid_, roomName_) {
	this.uuid = uuid_;
	gameCanvas.init();

	ingredients = [];
	gameIsStarted = false;
	gameIsOver = false;
	nextLayer = undefined;
	loadedAssets = {};
	loadAllAssets(() => {
		leftArm = new createLeftArm(-350, gameCanvas.canvas.height - 150, 512, 120);
		rightArm = new createRightArm(
			gameCanvas.canvas.width - 150,
			gameCanvas.canvas.height - 150,
			512,
			120
		);
		belt = new createBelt(0, 130, gameCanvas.canvas.width, 25);
		tv = new createTV(gameCanvas.canvas.width - 220, 170, 200, 200);

		belt.draw();
		leftArm.draw();
		rightArm.draw();
		drawText("Waiting for other player...");

		gameSocket = createGameSocket(roomName_, () => {
			gameSocket.send(
				JSON.stringify({
					message_type: "register",
					uuid: uuid,
				})
			);
		});
	});
}

function loadAllAssets(callback) {
	const allFiles = [
		"bun.png",
		"cheese.png",
		"ketchup.png",
		"leftArm.png",
		"lettuce.png",
		"mayo.png",
		"MouseMemoirs-Regular.ttf",
		"onion.png",
		"rightArm.png",
		"scrambled.png",
		"steak.png",
		"tv.png",
	];
	allFiles.forEach((file) => {
		const fullPath = "/static/" + file;
		if (fullPath.endsWith(".png")) {
			const img = new Image();
			img.onload = function () {
				loadedAssets[fullPath] = img;
				console.log("downloaded " + fullPath);
				if (Object.keys(loadedAssets).length == allFiles.length) {
					callback();
				}
			};
			img.src = fullPath;
		} else if (fullPath == "/static/MouseMemoirs-Regular.ttf") {
			//https://www.1001fonts.com/mouse-memoirs-font.html
			const f = new FontFace("MouseMemoirs", "url(/static/MouseMemoirs-Regular.ttf)");
			f.load().then(function (font) {
				// Add font on the html page
				document.fonts.add(font);
				loadedAssets[fullPath] = font;
				console.log("downloaded " + fullPath);
				if (Object.keys(loadedAssets).length == allFiles.length) {
					callback();
				}
			});
		} else {
			console.error("could not download " + fullPath);
		}
	});
}

function drawText(text) {
	ctx = gameCanvas.context;
	ctx.font = "100px MouseMemoirs";
	ctx.fillStyle = "white";
	textWidth = ctx.measureText(text).width;
	ctx.fillText(text, gameCanvas.canvas.width / 2 - textWidth / 2, gameCanvas.canvas.height / 2);
	ctx.fillStyle = "black";
	ctx.lineWidth = 3;
	ctx.strokeText(text, gameCanvas.canvas.width / 2 - textWidth / 2, gameCanvas.canvas.height / 2);
}

function startGame() {
	ingredients = [];
	ingredientCounter = 1;
	gameIsStarted = true;
	clearInterval(updateCanvasInterval);
	updateCanvasInterval = setInterval(updateCanvas, 20);
}

var gameCanvas = {
	canvas: document.createElement("canvas"),
	context: null,
	init: function () {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
	},
};

function createTV(x, y, width, height) {
	function createTVContent(name, parent) {
		this.img = loadedAssets["/static/" + name + ".png"];

		x_offset = 50;
		y_offset = 20;
		this.x = parent.x + x_offset;
		this.width = parent.width - 2 * x_offset;
		this.height = (this.width * this.img.height) / this.img.width;
		this.y = parent.y + (parent.height - this.height) / 2 + y_offset;

		this.draw = function () {
			ctx = gameCanvas.context;
			ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
		};
	}

	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;

	this.content = undefined;

	this.tvImg = loadedAssets["/static/tv.png"];
	this.scrambledImg = loadedAssets["/static/scrambled.png"];

	this.setIngredient = function (name) {
		this.content = new createTVContent(name, this);
	};

	this.removeIngredient = function () {
		this.content = undefined;
	};

	this.draw = function () {
		ctx = gameCanvas.context;
		if (this.content == undefined) {
			ctx.drawImage(this.scrambledImg, this.x + 25, this.y + 65, this.width - 50, this.height - 85);
		} else {
			// Todo: add more pastel color variety
			ctx.fillStyle = "yellow";
			ctx.fillRect(this.x + 25, this.y + 65, this.width - 50, this.height - 85);
			this.content.draw();
		}
		ctx.drawImage(this.tvImg, this.x, this.y, this.width, this.height);
	};
}

function createIngredient(x, bottom_y, width, name) {
	this.width = width;
	this.x = x;
	this.name = name;

	this.img = loadedAssets["/static/" + name + ".png"];

	this.height = (width * this.img.height) / this.img.width;
	this.y = bottom_y - this.height;

	this.id = ingredientCounter++;
	this.grabbingArm = undefined;

	this.grab = function (arm) {
		this.grabbingArm = arm;
	};

	this.release = function () {
		this.grabbingArm = undefined;
		this.x = gameCanvas.canvas.width;
	};

	this.move = function () {
		if (this.grabbingArm != undefined) {
			const speedVec = this.grabbingArm.getSpeedVec();
			this.x += speedVec.x;
			this.y += speedVec.y;
		} else {
			this.x += 3.0;
		}
	};

	this.draw = function () {
		ctx = gameCanvas.context;
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	};
}

function createBelt(x, y, width, height) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;

	this.draw = function () {
		ctx = gameCanvas.context;
		ctx.fillStyle = "black";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "gray";
		border = 2;
		ctx.fillRect(this.x, this.y + border, this.width, this.height - 2 * border);
	};
}

function createLeftArm(x, y, width, height) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.startX = x;
	this.startY = y;

	this.img = loadedAssets["/static/leftArm.png"];

	this.dest = null; // contains the dest of the upper right corner
	this.movingState = 0; // 1 -> grab, 2 -> put down, 3 -> back to start pos

	this.fetchedIngredient = undefined;

	this.draw = function () {
		ctx = gameCanvas.context;
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	};

	this.fetchIngredient = function (ingredient) {
		this.dest = {
			x: ingredient.x + ingredient.width + 100,
			y: ingredient.y,
		};
		this.movingState = 1;
		this.fetchedIngredient = ingredient;
	};

	this.getSpeedVec = function () {
		const dirVec = { x: this.dest.x - (this.x + this.width), y: this.dest.y - this.y };
		const norm = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
		const speedVec = { x: (20 * dirVec.x) / norm, y: (20 * dirVec.y) / norm };
		return speedVec;
	};

	this.move = function () {
		if (this.dest != null) {
			const speedVec = this.getSpeedVec();
			this.x += speedVec.x;
			this.y += speedVec.y;

			if (this.movingState == 1 && this.y < this.dest.y) {
				this.dest = { x: gameCanvas.canvas.width / 2, y: this.startY };
				this.movingState = 2;
				this.fetchedIngredient.grab(this);
			} else if (this.movingState == 2 && this.y > this.dest.y) {
				this.dest = { x: this.startX, y: this.startY };
				this.movingState = 3;
				this.fetchedIngredient.release();
				this.fetchedIngredient = undefined;
			} else if (this.movingState == 3 && this.x < this.dest.x) {
				this.dest = null;
			}
		}
	};
}

function createRightArm(x, y, width, height) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.startX = x;
	this.startY = y;

	this.img = loadedAssets["/static/rightArm.png"];

	this.dest = null; // contains the dest of the upper right corner
	this.movingState = 0; // 1 -> grab, 2 -> put down, 3 -> back to start pos

	this.fetchedIngredient = undefined;

	this.draw = function () {
		ctx = gameCanvas.context;
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	};

	this.fetchIngredient = function (ingredient) {
		this.dest = { x: ingredient.x + 100, y: ingredient.y };
		this.movingState = 1;
		this.fetchedIngredient = ingredient;
	};

	this.getSpeedVec = function () {
		const dirVec = { x: this.dest.x - this.x, y: this.dest.y - this.y };
		const norm = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
		const speedVec = { x: (20 * dirVec.x) / norm, y: (20 * dirVec.y) / norm };
		return speedVec;
	};

	this.move = function () {
		if (this.dest != null) {
			const speedVec = this.getSpeedVec();
			this.x += speedVec.x;
			this.y += speedVec.y;

			if (this.movingState == 1 && this.y < this.dest.y) {
				this.dest = { x: gameCanvas.canvas.width / 2, y: this.startY };
				this.movingState = 2;
				this.fetchedIngredient.grab(this);
			} else if (this.movingState == 2 && this.y > this.dest.y) {
				this.dest = { x: this.startX, y: this.startY };
				this.movingState = 3;
				this.fetchedIngredient.release();
				this.fetchedIngredient = undefined;
			} else if (this.movingState == 3 && this.x > this.dest.x) {
				this.dest = null;
			}
		}
	};
}

// From https://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top,
	};
}

gameCanvas.canvas.addEventListener(
	"click",
	function (evt) {
		if (leftArm.fetchedIngredient != undefined) {
			return;
		}
		var mousePos = getMousePos(gameCanvas.canvas, evt);
		var clickedIngredient = null;
		for (var i = 0; i < ingredients.length; i++) {
			if (
				ingredients[i].x <= mousePos.x &&
				mousePos.x < ingredients[i].x + ingredients[i].width &&
				ingredients[i].y <= mousePos.y &&
				mousePos.y < ingredients[i].y + ingredients[i].height
			) {
				clickedIngredient = ingredients[i];
			}
		}
		if (clickedIngredient != null) {
			console.log("clicked on " + clickedIngredient.name + ", id = " + clickedIngredient.id);
			gameSocket.send(
				JSON.stringify({
					ingredient_id: clickedIngredient.id,
					message_type: "pick_ingredient",
					uuid: uuid,
				})
			);
			// Todo: make hand x movement non screen dependent
			// calculate the offset
			leftArm.fetchIngredient(clickedIngredient);
		}
	},
	false
);

window.addEventListener("beforeunload", function () {
	gameIsOver = true;
	gameSocket.close();
});

function createGameSocket(roomName, callback) {
	const gameSocket = new WebSocket("ws://" + window.location.host + "/ws/" + roomName + "/");

	gameSocket.onmessage = function (e) {
		if (gameIsOver) {
			return;
		}
		const data = JSON.parse(e.data);

		if (data["message_type"] == undefined) {
			console.error("message_type field is not set");
			return;
		}
		if (data["message_type"] == "start_game") {
			console.log("received data " + e.data);
			startGame();
		} else if (data["message_type"] == "pick_ingredient") {
			console.log("received data " + e.data);
			const ingredientId = data["ingredient_id"];
			var clickedIngredient = null;
			for (var i = 0; i < ingredients.length; i++) {
				if (ingredients[i].id == ingredientId) {
					clickedIngredient = ingredients[i];
				}
			}
			if (clickedIngredient != null) {
				rightArm.fetchIngredient(clickedIngredient);
			}
		} else if (data["message_type"] == "next_ingredient") {
			const name = data["ingredient_name"];
			ingredients.push(new createIngredient(-100, belt.y, 100, name));
		} else if (data["message_type"] == "next_layer") {
			console.log("received data " + e.data);
			tv.removeIngredient();
			setTimeout(() => {
				tv.setIngredient(data["ingredient_name"]);
			}, 1000);
		} else if (data["message_type"] == "game_over_win") {
			console.log("received data " + e.data);
			clearInterval(updateCanvasInterval);

			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
			ctx.fillRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

			drawText("You win!");
			gameIsOver = true;
		} else if (data["message_type"] == "game_over_lose") {
			console.log("received data " + e.data);
			clearInterval(updateCanvasInterval);

			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
			ctx.fillRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

			drawText("You lose!");
			gameIsOver = true;
		} else {
			console.error("unhandled message_type: " + data["message_type"]);
		}
	};
	gameSocket.onclose = function (e) {
		console.error("socket closed unexpectedly");
		if (gameIsOver) {
			return;
		}

		clearInterval(updateCanvasInterval);

		if (!gameIsStarted) {
			ctx = gameCanvas.context;
			ctx.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

			belt.draw();
			leftArm.draw();
			rightArm.draw();
		}

		ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
		ctx.fillRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

		drawText("Oops, something went wrong...");
	};
	gameSocket.onopen = function (e) {
		callback();
	};
	return gameSocket;
}

function updateCanvas() {
	ctx = gameCanvas.context;
	ctx.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

	leftArm.move();
	rightArm.move();

	// Todo: should i let the ingredients past the edge
	// for the case where the mouse grabs an ingredient
	// just before it disapears ?
	while (ingredients.length > 0 && ingredients[0].x > gameCanvas.canvas.width) {
		ingredients.shift();
	}
	for (var i = 0; i < ingredients.length; i++) {
		ingredients[i].move();
	}

	belt.draw();
	tv.draw();
	for (var i = 0; i < ingredients.length; i++) {
		ingredients[i].draw();
	}
	leftArm.draw();
	rightArm.draw();
}
