var path = require ('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 3000;

var clientIds = {};
var playerIdCount = 0;

// var mapGen = require('./mapgen');
// var map = mapGen.makeMap(40,22,2,6,7); //(map width, map height, min roomsize, max roomsize, num rooms)

// Express setup, serving static files
app.use(express.static(path.join(__dirname, '../public')));

//rerouting to web page
app.get('/', function(req, res){
  res.sendFile(__dirname + '../public/index.html');
});

io.on('connection', function(socket){
	console.log('[Network] A user connected. ID:' + socket.id);

	socket.on('error', function(data) {
		console.log('Error:' + data);
	});

	socket.on('join', function(data) {
		console.log('[Network] User ' + socket.id + 'is joining.');
		clientIds[socket.id] = playerIdCount; //assign client an ID
		playerIdCount = playerIdCount + 1;

		var newData = {};
		newData.playerId = clientIds[socket.id];
		// newData.map = map;
		// newData.startPosition = mapGen.startPosition;
		newData.otherPlayers = [];
		//add send clientIds to new player. jp = currentPlayer
		for (var cp in clientIds) {
			if (cp == socket.id)
				continue; //dont include current player
			newData.otherPlayers.push({playerId:clientIds[cp]});
		}

		socket.emit('joinSuccess', newData);	//send init data to new client
		io.emit('clientJoined', newData);		//tell existing clients that a new client connected
	});

	socket.on('disconnect', function() {
		console.log('[Network] A user disconnected.');

		var newData = {};
		newData.playerId = clientIds[socket.id];

		io.emit('clientDisconnect', newData);
		delete clientIds[socket.id];
	});

	socket.on('serverUpdateInputData', function(data) {
		// console.log('[Network] Received position data from client:' + JSON.stringify(data));
		console.log('[Network] Received position data from client ' + socket.id);
		data.playerId = clientIds[socket.id];
		io.emit('clientUpdateInputData', data);
	});
});

server.listen(port, function(){
  console.log('listening on *:' + port);
});