var loadState = function() {};

loadState.prototype = {
	
	preload: function() {
		var loadLabel = game.add.text(100,200, 'Loading assets...', {font:'40px Verdana', fill:'#ffffff'});

		//connect to server
		socket = io();

		//init physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//load assets
		game.load.image('player', 'assets/player.png');
		game.load.image('player_small', 'assets/player_small.png');
		game.load.image('enemy', 'assets/enemy.png');
		game.load.image('enemy_small', 'assets/enemy_small.png');
		game.load.image('tile', 'assets/tile.png');
		game.load.image('wall', 'assets/wall.png');
		game.load.image('bullet', 'assets/bullet.png');
	},

	create: function() {
		// skip the menu
		// game.state.start('menu');
		game.state.start('lobby');
	}
};