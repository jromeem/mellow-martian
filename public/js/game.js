// Create game
// arguments:
// 1 : game screen width, 2: game screen height, 3: rendering context, 4: DOM element to insert canvas into
var game = new Phaser.Game(720, 720, Phaser.AUTO, 'gameDiv');
var TILE_SIZE = { x:32, y:32 };
var socket;

game.state.add('load', loadState);
game.state.add('lobby', lobbyState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.add('win', winState);

game.state.start('load');