//map generator guide: http://perplexingtech.weebly.com/software-blog/a-random-dungeon-generator-for-phaserjs

// notes:

// create enum for tileType
// 	idea: each side of room has different 'tunnel origin'. use weighting system- tiles closer to center have better chance of being the origin.
// 	i.e. xxz <- this z has 15% chance of being tunnel origin
// 		 xxz <- this z has 70% chance of being tunnel origin
// 		 xxz <- this z has 15% chance of being tunnel origin
// 	also: if a tile is already tunnel origin, make it even lower chance of being selected as origin for another tunnel (? design choice)

//note: origin is in top-left corner.
var mapper = {
	map: [],
	mapSize: {},
	startPosition: {},

	getRandom: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	// use 'new' to create instances of Tile or Room
	// tile object, used to organize/generate map (no sprites/graphics, just a data structure)
	Tile: function(x, y, image, tileType) {
		this.x = x;
		this.y = y;
		this.image = image;
		this.tileType = tileType;
	},
	
	// room object, used to organize/generate map (no sprites/graphics, just a data structure)
	Room: function(x, y, w, h) {
		this.x1 = x; //top left corner
		this.y1 = y;
		this.x2 = x + w; //bottom right corner
		this.y2 = y + h;
		
		this.center = {x:Math.floor((this.x1 + this.x2) / 2), y:Math.floor((this.y1 + this.y2) / 2)};
	},
	
	makeMap: function(mapWidth, mapHeight, roomSizeMin, roomSizeMax, roomNumMax) {
		// init map with wall tiles (every tile is a wall)
		this.mapSize = {width:mapWidth, height:mapHeight};
		for (var xx = 0; xx < mapWidth; xx++) {
			for (var yy = 0; yy < mapHeight; yy++) {
				this.map.push(new this.Tile(xx, yy, 'wall', 'wall')); //change this to ints or something to save space
			}
		}
		
		var rooms = [];
		var numRooms = 0;

		// generate rooms
		for (var rr = 0; rr < roomNumMax; rr++) {
			
			// generate random width/height
			var w = this.getRandom(roomSizeMax, roomSizeMin);
			var h = this.getRandom(roomSizeMax, roomSizeMin);
			
			// generate random map position (also ensure room is within map)
			var x = this.getRandom(1, (this.mapSize.width - w)) - 1;
			var y = this.getRandom(1, (this.mapSize.height - h)) - 1;
			
			// create room object (does not put room on map)
			var new_room = new this.Room(x, y, w, h);

			// create the room on the map
			this.createRoom(new_room);
			
			// save first room coords, to spawn player here later
			if (numRooms === 0) {
				this.startPosition.x = new_room.center.x;
				this.startPosition.y = new_room.center.y;

			// tunnel back to previous room
			} else { 
				
				// new room
				var new_x = new_room.center.x;
				var new_y = new_room.center.y;
				
				// old room
				var prev_x = rooms[numRooms - 1].center.x;
				var prev_y = rooms[numRooms - 1].center.y;
				
				// create tunnels on the map
				this.createHTunnel(prev_x, new_x, prev_y);
				this.createVTunnel(prev_y, new_y, new_x);
			}
			
			// append the new room to the list
			rooms.push(new_room);
			numRooms += 1;
		}
		return this.map;
	},

	// converts tiles on map to room tiles
	createRoom: function(room) {
		for (var x = room.x1; x < room.x2; x++) {
			for (var y = room.y1; y < room.y2; y++) {
				var tile = this.getTileAt(x,y);
				tile.image = 'tile';
				tile.tileType = 'room';
				// this.map.push(new this.Tile(x, y, 'tile', 'room'));
			}
		}
	},
	
	createHTunnel: function(x1, x2, y) {
		var min = Math.min(x1, x2);
		var max = Math.max(x1, x2);
		for (var x = min; x <= max; x++) {
			var tile = this.getTileAt(x,y);
			tile.image = 'tunnel_h';
			tile.tileType = 'tunnel';
		}
		
	},
	
	createVTunnel: function(y1, y2, x) {
		var min = Math.min(y1, y2);
		var max = Math.max(y1, y2);
		for (var y = min; y <= max; y++) {
			var tile = this.getTileAt(x,y);
			tile.image = 'tunnel_v';
			tile.tileType = 'tunnel';
		}
	},

	getTileAt: function(x,y) {
		var index = x * this.mapSize.height + y;
		// console.log('GetTile:(' + x + ',' + y + ') index:' + index + 'mapsize:' + JSON.stringify(this.mapSize));
		return this.map[index];
	},
};

//export for node
module.exports = mapper;