var loadState = function() {};

loadState.prototype = {
	
	preload: function() {
		var loadLabel = game.add.text(100,200, 'Loading assets...', {font:'40px Verdana', fill:'#ffffff'});

		//connect to server
		socket = io();

		//init physics
		game.physics.startSystem(Phaser.Physics.P2JS);

		//load assets
		game.load.image('asteroidlg', 'assets/asteroidlg.png');
		game.load.image('asteroidsm', 'assets/asteroidsm.png');
		game.load.image('hexgem', 'assets/hexgem.png');

		game.load.image('thrust1', 'assets/Flame1.png');
		game.load.image('ship', 'assets/spaceship.png');

		game.load.image('temp_enemy', 'assets/enemy.png');
	},

	create: function() {
		// skip the menu
		// game.state.start('menu');
		game.state.start('lobby');
	}
};