var menuState = function() {};

menuState.prototype = {

	create: function() {
		var nameLabel = game.add.text(80, 80, 'Mellow Martian',{font:'40px Verdana', fill:'#ffffff'});
		var startLabel = game.add.text(80, 200, 'Press Q to Start',{font:'40px Verdana', fill:'#ffffff'});

		var startKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);

		startKey.onDown.addOnce(this.start, this);
	},

	start: function() {
		game.state.start('play');
	}
};