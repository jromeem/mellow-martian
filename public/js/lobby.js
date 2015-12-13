var lobbyState = function() {};

lobbyState.prototype = {

    create: function() {
        // add lobby state
    },

    restart: function() {
        game.state.start('menu');
    }
};