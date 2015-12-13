var lobbyState = function() {};

lobbyState.prototype = {

    create: function() {
        // add lobby state
        this.players = [];

        var nameLabel = game.add.text(80, 80, 'Mellow Martian',{font:'40px Verdana', fill:'#ffffff'});
        var startLabel = game.add.text(80, 200, 'Redy to Q ~',{font:'40px Verdana', fill:'#ffffff'});
        var startKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);

        startKey.onDown.addOnce(this.start, this);

        // socket stuff
        var _this = this;
        socket.on('joinSuccess', function(data) {
            console.log('[Network] Join success. Initializing game.');
            console.log('data', data);
            _this.joinedGameInitialization(data); //'this' refers to socket, not playState. hence, we use '_this'
        });

    },

    start: function() {
        game.state.start('play');
    },

    restart: function() {

    },

    update: function() {
        // if client joins

        // new player joined, save network info and create obj for player
        var _this = this;
        socket.on('clientJoined', function(data) {
            console.log('[Network] New client/player joined');
            console.log('data', data);
            
            if (data.playerId != _this.playerId && _this.playerId >= 0) {
                _this.createClientNewPlayer(data);
                _this.players.push(player);
            }
        });
    }


};