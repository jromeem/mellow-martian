

// var newChar = Object.create(this.Character);
// vs
// var newChar = new this.Character();
// 'new' automatically executes the body of the function.
// create does not. but it does allow for more 'regular' function definitions
// using new, functions need to be defined using this.func = function(){func body};
// using create: func: function(){func body}

var CharacterSystem  = (function() {
	//'create'
	var Character = function(x,y,image){
		// console.log(this);
		//this.maxHealth = -1;
		//this.currentHealth = this.maxHealth;
		this.moveSpeed = 200;

		// this.sprite = game.add.sprite(x,y, image);
		// this.sprite.anchor.setTo(0.5,0.5);	//set to center of sprite for rotation purposes
		Phaser.Sprite.call(this, game, x, y, image);
		this.anchor.setTo(0.5,0.5);

		game.physics.enable(this, Phaser.Physics.ARCADE);
		game.add.existing(this);

		this.shoot = function() {
			if (game.time.now > this.nextFireTime && this.bullets.countDead() > 0) {
				this.didShoot = true;
				this.lastShotTarget = game.input.activePointer.position;
				this.nextFireTime = game.time.now + this.fireRate;
				var bullet = this.bullets.getFirstExists(false);
				bullet.reset(this.x, this.y);
				bullet.rotation = game.physics.arcade.moveToPointer(bullet, this.bulletSpeed, game.input.activePointer) + 1.57079633;
				this.progressBarTween.start();
			}
		};

		this.getHit = function(bullet) {
			this.tint = Math.floor(Math.random() * (0xffffff - 0x000000 + 1)) + 0x000000;
			bullet.kill();
		};

		return this;
	};

	//set prototype to Sprite
	Character.prototype = Object.create(Phaser.Sprite.prototype);

	//additions to prototype need to be made AFTER setting the prototype to Sprite.
	// Character.prototype.shoot = function() {
	// };

	var PlayerCharacter = {
		init: function(x,y,image) {
			var newChar = new Character(x,y,image);
			newChar.didShoot = false;
			newChar.lastShotTarget = {};
			newChar.nextFireTime = 0;
			newChar.fireRate = 300;	//in millseconds (1/1000)
			newChar.bulletSpeed = 1500;	//careful setting this too high- physics update can cause it to 'miss' objects

			//create bullet pool
			newChar.bullets = game.add.group();
			newChar.bullets.enableBody = true;
			newChar.bullets.physicsBodyType = Phaser.Physics.ARCADE;
			newChar.bullets.createMultiple(30, 'bullet', 0, false);   //30 bullets in recycle pool
			newChar.bullets.setAll('anchor.x', 0.5);	//set anchor for proper rotatoin
			newChar.bullets.setAll('anchor.y', 0.5);
			newChar.bullets.setAll('outOfBoundsKill', true);	//'recycle' if out of bounds
			newChar.bullets.setAll('checkWorldBounds', true);
			newChar.bullets.forEach(function(item) {
				game.debug.body(item,'red'); //display hitbox in red
				item.body.setSize(4,4); //figire out P2 physics... this is a hack for now. b/c arcade physics cannot rotate hitbox
			},newChar);

			//create circular progress bar (currently displays shooting cooldown)
			newChar.progressBar = new CircularProgressBar(game, x+100, y+100, 32, 0x000000, 0, 0.2);
			game.world.add(newChar.progressBar);
			newChar.addChild(newChar.progressBar);

			//subract 50ms to give time for oncomplete to run.
			newChar.progressBarTween = game.add.tween(newChar.progressBar).to({progress:1}, newChar.fireRate - 50, Phaser.Easing.Quintic.InOut, false, 0, 0, false);
			newChar.progressBarTween.onComplete.add(function(){newChar.progressBar.progress = 0;},newChar);

			delete this.init; //remove init
			return newChar;
		}
	};

	var EnemyCharacter = {
		init: function(x,y,image) {
			var newChar = new Character(x,y,image);

			delete this.init; //remove init
			return newChar;
		}
	};

	return {
	 	createPlayerCharacter: function(x,y) {
			x = typeof x !== 'undefined' ? x : -100;
			y = typeof y !== 'undefined' ? y : -100;
			var newChar = Object.create(PlayerCharacter).init(x,y,'player_small');
			console.log(newChar);
			return newChar;
		},

	 	createEnemyCharacter: function(x,y) {
			x = typeof x !== 'undefined' ? x : -100;
			y = typeof y !== 'undefined' ? y : -100;
	 		var newChar = Object.create(EnemyCharacter).init(x,y,'player_small');
			return newChar;
		},
	};
 })();

 //http://www.html5gamedevs.com/topic/9716-circle-progress-bar/

var CircularProgressBar = function(game, x, y, radius, color, angle, weight) {
	this._radius = radius;
	this._progress = 0;
	this._weight = weight || 0.25;
	this._color = color || "#fff";
	this.bmp = game.add.bitmapData((this._radius * 2) + (this._weight * (this._radius * 0.6)), (this._radius * 2) + (this._weight * (this._radius * 0.6)));
	Phaser.Sprite.call(this, game, x, y, this.bmp); //invoke Sprite, pass args (basically, make a sprite)

	this.anchor.setTo(0.5);
	this.angle = angle || -90;
	this.updateProgress();
};

CircularProgressBar.prototype = Object.create(Phaser.Sprite.prototype);
CircularProgressBar.prototype.constructor = CircularProgressBar;


CircularProgressBar.prototype.updateProgress = function() {
	var progress = this._progress;
	progress = Phaser.Math.clamp(progress, 0.00001, 0.99999);
	
	this.bmp.clear();
	this.bmp.ctx.strokeStyle = this.color;
	this.bmp.ctx.lineWidth = this._weight * this._radius;
	this.bmp.ctx.beginPath();
	this.bmp.ctx.arc(this.bmp.width * 0.5, this.bmp.height * 0.5, this._radius - 15, 0, (Math.PI * 2) * progress, false);
	this.bmp.ctx.stroke();
	this.bmp.dirty = true;
};


CircularProgressBar.prototype.updateBmdSize = function() {
	this.bmp.resize((this._radius * 2) + (this._weight * (this._radius * 0.75)), (this._radius * 2) + (this._weight * (this._radius * 0.75)));
};

//define more properties for circular progres bar
Object.defineProperties(CircularProgressBar.prototype, {
	color: {
		get: function() {
			return this._color;   
		},
		set: function(val) {
			this._color = val;
			this.updateProgress();
		}
	},
	radius: {
		get: function() {
			return this._radius;   
		},
		set: function(val) {
			this._radius = (val > 0 ? val : 0);
			this.updateBmdSize();
			this.updateProgress();
		}
	},
	progress: {
		get: function() {
			return this._progress;   
		},
		set: function(val) {
			this._progress = Phaser.Math.clamp(val, 0, 1);
			this.updateProgress();
		}
	},
	weight: {
		get: function() {
			return this._weight;   
		},
		set: function(val) {
			this._weight = Phaser.Math.clamp(val, 0.01, 0.99);
			this.updateBmdSize();
			this.updateProgress();
		}
	}
});
