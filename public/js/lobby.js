var lobbyState = function() {};

lobbyState.prototype = {

    create: function() {
        // add lobby state
        var players = [];

        var nameLabel = game.add.text(80, 80, 'Mellow Martian',{font:'40px Verdana', fill:'#ffffff'});
        var startLabel = game.add.text(80, 200, 'Redy to Q ~',{font:'40px Verdana', fill:'#ffffff'});

        var startKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);

        startKey.onDown.addOnce(this.start, this);
        // socket stuff
    },

    start: function() {
        game.state.start('play');
    }
};