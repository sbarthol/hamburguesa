var leftArm;
var rightArm;
var belt;
var tv;
var burger;
var ingredients;
var gameSocket;
var uuid;
var updateCanvasInterval;
var gameIsStarted;
var gameIsOver;
var loadedAssets;
var youWon;
var nextLayer;
var freeze;
var backTrack;

function init(uuid_, roomName_, username_) {
	this.uuid = uuid_;
	gameCanvas.init();

	ingredients = [];
	gameIsStarted = false;
	gameIsOver = false;
	nextLayer = undefined;
	youWon = undefined;
	freeze = false;

	loadedAssets = {};
	loadAllAssets(() => {
		const armHeight = 120;
		const armWidth = 3000;
		leftArm = new createLeftArm(
			-armWidth + 150,
			gameCanvas.canvas.height - 150,
			armWidth,
			armHeight
		);
		rightArm = new createRightArm(
			gameCanvas.canvas.width - 150,
			gameCanvas.canvas.height - 150,
			armWidth,
			armHeight
		);
		belt = new createBelt(0, 130, gameCanvas.canvas.width, 25);
		tv = new createTV(gameCanvas.canvas.width - 220, 170, 200, 200);
		burger = new createBurger(
			(gameCanvas.canvas.width - 256) / 2,
			gameCanvas.canvas.height - 60,
			256
		);

		belt.draw();
		leftArm.draw();
		rightArm.draw();
		burger.draw();

		backTrack = loadedAssets["/static/burger_background.wav"];
		backTrack.loop = true;
		backTrack.volume = 0.1;

		drawText("Waiting for other player...");

		gameSocket = createGameSocket(roomName_, () => {
			gameSocket.send(
				JSON.stringify({
					message_type: "register",
					uuid: uuid,
					username: username_,
				})
			);
		});
	});
}

function loadAllAssets(callback) {
	const allFiles = [
		"bottom_bun.png",
		"top_bun.png",
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
		"plate.png",
		"bottom_bun_layer.png",
		"cheese_layer.png",
		"ketchup_layer.png",
		"lettuce_layer.png",
		"mayo_layer.png",
		"steak_layer.png",
		"top_bun_layer.png",
		"onion_layer.png",
		"tomato.png",
		"tomato_layer.png",
		"bacon.png",
		"bacon_layer.png",
		"pickle.png",
		"pickle_layer.png",
		"mustard.png",
		"mustard_layer.png",
		"sparkles_0.png",
		"sparkles_1.png",
		"sparkles_2.png",
		"sparkles_3.png",
		"spatula.png",
		"access_denied.wav",
		"burger_background.wav",
		"correct.mp3",
		"lose.wav",
		"slap1.mp3",
		"squirt1.mp3",
		"squirt2.wav",
		"win.wav",
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
		} else if (fullPath.endsWith(".wav") || fullPath.endsWith(".mp3")) {
			const audio = new Audio(fullPath);
			audio.onloadeddata = function () {
				loadedAssets[fullPath] = audio;
				console.log("downloaded " + fullPath);
				if (Object.keys(loadedAssets).length == allFiles.length) {
					callback();
				}
			};
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
	gameIsStarted = true;
	clearInterval(updateCanvasInterval);
	updateCanvasInterval = setInterval(updateCanvas, 20);
	backTrack.play();
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

function createBurger(x, y, width) {
	this.x = x;
	this.y = y;
	this.top = y - 50;
	this.width = width;
	this.height = 0;

	const bottom_lines = {
		bottom_bun: 55,
		top_bun: 60,
		mayo: 27,
		ketchup: 27,
		lettuce: 43,
		steak: 45,
		cheese: 25,
		onion: 40,
		bacon: 47,
		mustard: 27,
		pickle: 35,
		tomato: 45,
	};
	const top_lines = {
		bottom_bun: 30,
		top_bun: 34,
		mayo: 12,
		ketchup: 12,
		lettuce: 25,
		steak: 15,
		cheese: 14,
		onion: 22,
		bacon: 22,
		mustard: 12,
		pickle: 13,
		tomato: 20,
	};

	this.layers = [];

	this.addLayer = function (ingredientName) {
		this.layers.push(ingredientName);
		this.top -= bottom_lines[ingredientName] - top_lines[ingredientName];
	};

	this.draw = function () {
		ctx = gameCanvas.context;
		const plate_img = loadedAssets["/static/plate.png"];
		ctx.drawImage(
			plate_img,
			(gameCanvas.canvas.width - plate_img.width) / 2,
			this.y - 80,
			plate_img.width,
			plate_img.height
		);
		var y = this.y;
		for (var i = 0; i < this.layers.length; i++) {
			const img = loadedAssets["/static/" + this.layers[i] + "_layer.png"];
			ctx.drawImage(img, this.x, y - bottom_lines[this.layers[i]], img.width, img.height);
			y = y - bottom_lines[this.layers[i]] + top_lines[this.layers[i]];
		}
	};
}

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

	this.pastelColors = ["#FFCCF9", "#AFF8DB", "#D5AAFF", "#F3FFE3", "#B5B9FF", "#FFBEBC"];
	this.currentPastelColor;
	this.k = Math.floor(Math.random() * this.pastelColors.length);

	this.setIngredient = function (name) {
		this.content = new createTVContent(name, this);
		this.currentPastelColor = this.pastelColors[this.k % this.pastelColors.length];
		this.k = this.k + 1;
	};

	this.removeIngredient = function () {
		this.content = undefined;
	};

	this.draw = function () {
		ctx = gameCanvas.context;
		if (this.content == undefined) {
			ctx.drawImage(this.scrambledImg, this.x + 25, this.y + 65, this.width - 50, this.height - 85);
		} else {
			ctx.fillStyle = this.currentPastelColor;
			ctx.fillRect(this.x + 25, this.y + 65, this.width - 50, this.height - 85);
			this.content.draw();
		}
		ctx.drawImage(this.tvImg, this.x, this.y, this.width, this.height);
	};
}

function createIngredient(x, bottom_y, width, name, id) {
	this.width = width;
	this.x = x;
	this.name = name;
	this.isSpatula = false;

	this.img = loadedAssets["/static/" + name + ".png"];

	this.height = (width * this.img.height) / this.img.width;
	this.y = bottom_y - this.height;

	this.id = id;
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
			this.x += 8.0;
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

function createSpatula(x, bottom_y, width, id) {
	this.width = width;
	this.x = x;
	this.name = undefined;
	this.isSpatula = true;

	this.img = loadedAssets["/static/spatula.png"];
	this.height = (width * this.img.height) / this.img.width;
	this.y = bottom_y - this.height;

	this.id = id;
	this.grabbingArm = undefined;

	this.sparkles = [];
	for (var i = 0; i < 4; i++) {
		this.sparkles.push(loadedAssets["/static/sparkles_" + i + ".png"]);
	}
	this.spakles_drawing_index = 0;
	this.spakles_drawing_counter = 0;
	const sparkles_drawing_period = 10;

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
			this.x += 8.0;
		}
	};

	this.draw = function () {
		ctx = gameCanvas.context;
		ctx.drawImage(
			this.sparkles[this.spakles_drawing_index],
			this.x,
			this.y,
			this.width,
			this.height
		);
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

		this.spakles_drawing_counter++;
		if (this.spakles_drawing_counter >= sparkles_drawing_period) {
			this.spakles_drawing_index = (this.spakles_drawing_index + 1) % this.sparkles.length;
			this.spakles_drawing_counter = 0;
		}
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
		if (this.fetchedIngredient != undefined) {
			this.fetchedIngredient.release();
		}
		this.dest = {
			x: ingredient.x + ingredient.width,
			y: ingredient.y,
		};
		this.movingState = 1;
		this.fetchedIngredient = ingredient;
	};

	this.getSpeedVec = function () {
		const dirVec = { x: this.dest.x - (this.x + this.width), y: this.dest.y - this.y };
		const norm = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
		const speedVec = { x: (30 * dirVec.x) / norm, y: (30 * dirVec.y) / norm };
		return speedVec;
	};

	this.move = function () {
		if (this.dest != null) {
			if (this.movingState == 1) {
				this.dest = {
					x: this.fetchedIngredient.x + this.fetchedIngredient.width,
					y: this.fetchedIngredient.y,
				};
			}
			const speedVec = this.getSpeedVec();
			this.x += speedVec.x;
			this.y += speedVec.y;

			if (this.movingState == 1 && this.y < this.dest.y) {
				this.dest = { x: gameCanvas.canvas.width / 2, y: Math.max(this.y + 1, burger.top) };
				this.movingState = 2;
				this.fetchedIngredient.grab(this);
			} else if (this.movingState == 2 && this.y > this.dest.y) {
				this.y = this.dest.y;

				this.dest = { x: this.startX + this.width, y: this.startY };
				this.movingState = 3;
				burger.addLayer(this.fetchedIngredient.name);
				if (this.fetchedIngredient.name[0] == "k") {
					var audio = loadedAssets["/static/squirt1.mp3"];
				} else if (this.fetchedIngredient.name[0] == "m") {
					var audio = loadedAssets["/static/squirt2.wav"];
				} else {
					var audio = loadedAssets["/static/slap1.mp3"];
				}
				this.fetchedIngredient.release();
				this.fetchedIngredient = undefined;
				audio.play();
			} else if (this.movingState == 3 && this.x + this.width < this.dest.x) {
				this.x = this.dest.x - this.width;
				this.y = this.dest.y;
				this.dest = null;

				if (youWon) {
					gameIsOver = true;
				}
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
		if (this.fetchedIngredient != undefined) {
			this.fetchedIngredient.release();
		}
		this.dest = { x: ingredient.x, y: ingredient.y };
		this.movingState = 1;
		this.fetchedIngredient = ingredient;
	};

	this.getSpeedVec = function () {
		const dirVec = { x: this.dest.x - this.x, y: this.dest.y - this.y };
		const norm = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
		const speedVec = { x: (30 * dirVec.x) / norm, y: (30 * dirVec.y) / norm };
		return speedVec;
	};

	this.move = function () {
		if (this.dest != null) {
			if (this.movingState == 1) {
				this.dest = {
					x: this.fetchedIngredient.x,
					y: this.fetchedIngredient.y,
				};
			}
			const speedVec = this.getSpeedVec();
			this.x += speedVec.x;
			this.y += speedVec.y;

			if (this.movingState == 1 && this.y < this.dest.y) {
				this.dest = { x: gameCanvas.canvas.width + 100, y: this.startY };
				this.movingState = 2;
				this.fetchedIngredient.grab(this);
			} else if (this.movingState == 2 && this.y > this.dest.y) {
				this.y = this.dest.y;

				this.dest = { x: this.startX, y: this.startY };
				this.movingState = 3;
				this.fetchedIngredient.release();
				this.fetchedIngredient = undefined;
			} else if (this.movingState == 3 && this.x < this.dest.x) {
				this.x = this.dest.x;
				this.dest = null;

				if (youWon == false) {
					gameIsOver = true;
				}
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
		if (freeze) {
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

			if (nextLayer != undefined && clickedIngredient.isSpatula) {
				clickedIngredient.name = nextLayer;
				var audio = loadedAssets["/static/correct.mp3"];
				audio.play();
			} else if (nextLayer != undefined && nextLayer != clickedIngredient.name) {
				freeze = true;
				setTimeout(() => {
					freeze = false;
				}, 3000);
				var audio = loadedAssets["/static/access_denied.wav"];
				audio.play();
			} else if (nextLayer != undefined) {
				var audio = loadedAssets["/static/correct.mp3"];
				audio.play();
			}
		}
	},
	false
);

window.addEventListener("beforeunload", function () {
	gameIsOver = true;
	gameSocket.close();
});

function createGameSocket(roomName, callback) {
	const gameSocket = new WebSocket("wss://" + window.location.host + "/ws/" + roomName + "/");

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
		} else if (data["message_type"] == "pick_ingredient_other") {
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
		} else if (data["message_type"] == "pick_ingredient_you") {
			console.log("received data " + e.data);
			const ingredientId = data["ingredient_id"];
			var clickedIngredient = null;
			for (var i = 0; i < ingredients.length; i++) {
				if (ingredients[i].id == ingredientId) {
					clickedIngredient = ingredients[i];
				}
			}
			if (clickedIngredient != null) {
				leftArm.fetchIngredient(clickedIngredient);
			}
		} else if (data["message_type"] == "next_ingredient") {
			const name = data["ingredient_name"];
			if (name == "spatula") {
				ingredients.push(new createSpatula(-100, belt.y, 100, data["ingredient_id"]));
			} else {
				ingredients.push(new createIngredient(-100, belt.y, 100, name, data["ingredient_id"]));
			}
		} else if (data["message_type"] == "next_layer") {
			console.log("received data " + e.data);
			tv.removeIngredient();
			nextLayer = data["ingredient_name"];
			setTimeout(() => {
				tv.setIngredient(data["ingredient_name"]);
			}, 1000);
		} else if (data["message_type"] == "game_over_win") {
			console.log("received data " + e.data);
			youWon = true;
			var audio = loadedAssets["/static/win.wav"];
			audio.play();
			backTrack.pause();
		} else if (data["message_type"] == "game_over_lose") {
			console.log("received data " + e.data);
			youWon = false;
			var audio = loadedAssets["/static/lose.wav"];
			audio.play();
			backTrack.pause();
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

		ctx = gameCanvas.context;
		ctx.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

		belt.draw();
		tv.draw();
		leftArm.draw();
		rightArm.draw();
		for (var i = 0; i < ingredients.length; i++) {
			ingredients[i].draw();
		}
		burger.draw();

		ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
		ctx.fillRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

		drawText("Oops! Something went wrong...");
		backTrack.pause();
	};
	gameSocket.onopen = function (_) {
		callback();
	};
	return gameSocket;
}

function updateCanvas() {
	ctx = gameCanvas.context;
	ctx.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

	leftArm.move();
	rightArm.move();

	while (ingredients.length > 0 && ingredients[0].x > gameCanvas.canvas.width + 1000) {
		ingredients.shift();
	}
	for (var i = 0; i < ingredients.length; i++) {
		ingredients[i].move();
	}

	belt.draw();
	tv.draw();
	leftArm.draw();
	rightArm.draw();
	for (var i = 0; i < ingredients.length; i++) {
		ingredients[i].draw();
	}
	burger.draw();

	if (freeze) {
		ctx.fillStyle = "rgba(255, 128, 0, 0.5)";
		ctx.fillRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);
		drawText("Wrong ingredient!");
	}

	if (gameIsOver) {
		clearInterval(updateCanvasInterval);
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.fillRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);
		if (youWon) {
			drawText("You win!");
		} else {
			drawText("You lose!");
		}
		return;
	}
}
