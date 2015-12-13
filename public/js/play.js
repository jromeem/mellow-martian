var playState = function() {
	this.otherPlayers = {};
	this.player = null;
	this.playerId = -1; //id assigned by server
	this.enemies = [];
	this.keyboard = null;
	this.startPosition = {};
	
	this.map = []; //map generated by server
	this.wallTiles = null; //stores sprites
	this.floorTiles = null;

	this.obstaclePolygons = [];
	this.obstacleCanvas = null; //for debugging
	this.lightCanvas = null;
};

playState.prototype = {

	preload: function() {
		game.time.advancedTiming = true; //for profiling and FPS display
	},

	create: function() {
		//'_this' will refer to context of playState, used for explicit binding within anonymous functions (see example @ joinSuccess)
		//more info: http://alistapart.com/article/getoutbindingsituations
		var _this = this;

		//network stuff

		//this player joined game. init network and world info
		socket.on('joinSuccess', function(data) {
			console.log('[Network] Join success. Initializing game.');
			_this.joinedGameInitialization(data); //'this' refers to socket, not playState. hence, we use '_this'
		});

		//other player disconnected
		socket.on('clientDisconnect', function (data) {
			console.log('[Network] Player disconnected: ' + JSON.stringify(data)); //should be dc message
			_this.removeClientPlayer(data);
		});

		//update other players' positions
		socket.on('clientUpdateInputData', function(data) {
			//console.log('[Network] Position data from server:' + JSON.stringify(data));
			if (data.playerId != _this.playerId && _this.playerId >= 0)
				_this.updateClientInputData(data);
		});

		//new player joined, save network info and create obj for player
		socket.on('clientJoined', function(data) {
			console.log('[Network] New client/player joined');
			if (data.playerId != _this.playerId && _this.playerId >= 0)
				_this.createClientNewPlayer(data);
		});

		//bind keyboard
		this.keyboard = game.input.keyboard;

		//create groups
		this.wallTiles = game.add.group();
		this.floorTiles = game.add.group();
		this.enemies = game.add.group();

		this.wallTiles.enableBody = true; //enable collision for walls

		//add player/enemy
		this.player = CharacterSystem.createPlayerCharacter();
		this.player.tint = 0x00ff00;

		//join the game
		socket.emit('join','roomid goes here');
	},

	update: function() {
		var hasMoved = false;
		//debug info
		game.debug.text(game.time.fps + ' FPS', 2, 14, 0x000000);	//display fps
		game.debug.body(this.player,'red');	//display player hitbox
		// this.player.bullets.forEachAlive(function(member) {game.debug.body(member,'red');}, this); //display bullet hitbox
		
		//collide with walls
		game.physics.arcade.collide(this.player, this.wallTiles);

		//end game when enemy is touched
		// game.physics.arcade.overlap(this.player, this.enemies, this.gameOver);

		//hit enemy
		game.physics.arcade.overlap(this.player.bullets, this.enemies, function(bullet,enemy) {
			enemy.getHit(bullet); // or is it a? in any case, these don't work. need to extend sprite in character.
		});

		//hit wall
		game.physics.arcade.overlap(this.player.bullets, this.wallTiles, function(bullet,wall) { bullet.kill();});

		//rotate player to face mouse position
		this.player.rotation = this.physics.arcade.angleToPointer(this.player);	//+ 1.57079633 (add this to add 90 degrees to angle if needed)

		//horizontal movement
		if (this.keyboard.isDown(Phaser.Keyboard.A)) {
			this.player.body.velocity.x = -200;
			hasMoved = true;
		} else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
			this.player.body.velocity.x = 200;
			hasMoved = true;
		} else {
			this.player.body.velocity.x = 0;
		}

		//vertical movement
		if (this.keyboard.isDown(Phaser.Keyboard.W)) {
			this.player.body.velocity.y = -200;
			hasMoved = true;
		} else if (this.keyboard.isDown(Phaser.Keyboard.S)) {
			this.player.body.velocity.y = 200;
			hasMoved = true;
		} else {
			this.player.body.velocity.y = 0;
		}

		//shooting / attacking
		if (game.input.activePointer.isDown)
		{
			console.log(this.player);
			this.player.shoot();
		}

		//update the server w/ new position
		this.updateServerInputData();
	},

	gameOver: function() {
		game.state.start('win');
	},

	//runs after joining game. adds/creates current players.
	joinedGameInitialization: function(data) {
		this.playerId = data.playerId;
		// this.map = data.map;
		// this.startPosition = data.startPosition;
		// this.player.position.x = this.startPosition.x * TILE_SIZE.x;
		// this.player.position.y = this.startPosition.y * TILE_SIZE.y;
		this.player.position.x = 50;
		this.player.position.y = 50;
		// this.createMap(this.map);
		for (var p in data.otherPlayers)
		{
			console.log(data.otherPlayers[p]);
			this.createClientNewPlayer(data.otherPlayers[p]);
		}

		// this.spawnRandomEnemies(); //temp, spawn enemies
	},

	//create object to represent new player
	createClientNewPlayer: function(data) {
		console.log('attempting to add new player by ID: ' + data.playerId);

		//add to list of other players
		this.otherPlayers[data.playerId] = CharacterSystem.createPlayerCharacter();
		this.otherPlayers[data.playerId].sprite.tint = 0x00ffff;
	},

	removeClientPlayer: function(data) {
		this.otherPlayers[data.playerId].sprite.destroy();
		delete this.otherPlayers[data.playerId];
	},

	//send new pos data to server
	updateServerInputData: function() {
		var data = {};

		//eventually, we should only send player inputs to server, to prevent tampering/cheating.
		data.position = this.player.position;
		data.rotation = this.player.rotation;
		//if player is shooting, send mouse position
		if (this.player.didShoot)
		{
			this.player.didShoot = false;
			data.didShoot = true;
			data.mousePosition  = this.player.lastShotTarget;
		}
		socket.emit('serverUpdateInputData',data);
	},

	//received pos data from other player; update their location
	updateClientInputData: function(data) {
		var playerToUpdate = this.otherPlayers[data.playerId];
		playerToUpdate.sprite.position = data.position;
		playerToUpdate.sprite.rotation = data.rotation;
	},
	
	//creates actual tiles for collision
	createMap: function(map) {
		var wallColor = 0xcccccc;
		var floorColor = 0x999999;
		for (var i = 0; i < this.map.length;i++) {
			if (this.map[i].image == 'tile') {
				var floortile = this.floorTiles.create(map[i].x * TILE_SIZE.x, this.map[i].y * TILE_SIZE.y, 'tile');
				floortile.tint = floorColor;
				this.map[i].sprite = floortile;
			} else if (this.map[i].image == 'wall') {
				var walltile = this.wallTiles.create(this.map[i].x * TILE_SIZE.x, this.map[i].y * TILE_SIZE.y, 'tile');
				walltile.tint = wallColor;
				walltile.body.immovable = true;
				this.map[i].sprite = walltile;
			} else if (this.map[i].image == 'tunnel_h') {
				var floortile = this.floorTiles.create(this.map[i].x * TILE_SIZE.x, this.map[i].y * TILE_SIZE.y, 'tile');
				floortile.tint = floorColor;
				this.map[i].sprite = floortile;
				//walltile.body.immovable = true;
			} else if (this.map[i].image == 'tunnel_v') {
				var floortile = this.floorTiles.create(this.map[i].x * TILE_SIZE.x, this.map[i].y * TILE_SIZE.y, 'tile');
				floortile.tint = floorColor;
				this.map[i].sprite = floortile;
				//walltile.body.immovable = true;
			} else {
				console.log('WARNING: Tile image \'' + this.map[i].image + '\' not found');
			}
			//var pos = '(' + map[i].x + ',' + map[i].y + ')'; //debug
			//var nameLabel = game.add.text(map[i].x * 32, map[i].y * 32, pos,{font:'8px Verdana', fill:'#ffffff'}); //debug
		}
	},

	//used to test shooting, these enemies have no interaction aside from getting shot
	spawnRandomEnemies: function() {
		for (var t in this.map) {
			var chance = game.rnd.between(0,10);
			if (chance < 3 && this.map[t].image == 'tile')
			{
				// create(map[i].x * TILE_SIZE.x, this.map[i].y * TILE_SIZE.y, 'tile');
				var enemy = CharacterSystem.createEnemyCharacter();
				this.enemies.add(enemy);
				enemy.tint = 0xff0000;
				enemy.position.x = this.map[t].x*32+16;
				enemy.position.y = this.map[t].y*32+16;
			}
		}
	},

	getTileAt: function(x,y) {
		var index = x * this.mapSize.height + y;
		// console.log('GetTile:(' + x + ',' + y + ') index:' + index + 'mapsize:' + JSON.stringify(this.mapSize));
		return this.map[index];
	},

};