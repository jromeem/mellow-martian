var winState = function() {};

winState.prototype = {

	create: function() {
		var winLabel = game.add.text(100,100, 'Game Over',{font:'40px Verdana', fill:'#ffffff'});
		var startLabel = game.add.text(100,200, 'Press Q to restart',{font:'40px Verdana', fill:'#ffffff'});

		var startKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);

		startKey.onDown.addOnce(this.restart, this);
	},

	restart: function() {
		game.state.start('menu');
	}
};