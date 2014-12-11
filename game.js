/*global Phaser*/
/*jslint sloppy:true, browser: true, devel: true, eqeq: true, vars: true, white: true*/
var game;
var time = 0;
var money = 1000000;
var llamaCount = 0;
var grassSupply = 0;
var highScore = 0;
var mainMenu = {
    preload: function() {
        game.load.image('ferrisWheel', 'imgs/ferrisWheel.png');
        game.load.image('sky', 'imgs/skyBackground.png');
        game.load.image('cloud', 'imgs/cloud.png');
        game.load.image('start', 'imgs/start.jpg');
    },
    create: function() {
        //backgrounds
        this.bgSky = game.add.sprite(0,0, 'sky');
        this.bgSky.scale.x = 0.8; this.bgSky.scale.y = 0.8;
        this.bgWheel = game.add.sprite(0,0 , 'ferrisWheel');
        this.bgWheel.scale.x = 1.2; this.bgWheel.scale.y = 1.2;
        this.bgWheel.position.y = game.stage.height - this.bgWheel.height;
        
        //animating clouds
        this.clouds = game.add.group(game, 'cloud', 'clouds');
        this.clouds.scale.x = 0.1; this.clouds.scale.y = 0.1;
        this.clouds.enableBody = true;
        this.clouds.createMultiple(30, 'cloud');
        game.time.events.loop(1000, this.addCloud, this);
        
        //start button
        this.start = game.add.button(0,0, 'start', this.start, this);
        this.start.x = game.world.width/2 - this.start.width/2;
        this.start.y = game.world.height - this.start.height;
        
        //fonts or text
        var title = "Llama Empire";
        var style = {font: "28px Arial", fill: "#ff0044", align: "center"};

    },
    update: function() {
    },
    
    addCloud: function(){
        //animating clouds
        var cloud = this.clouds.getFirstDead();
        cloud.reset(game.stage.width * 9 , Math.random() * 1000);
        cloud.body.velocity.x = Math.floor(Math.random() * -500 - 300);
        cloud.checkWorldBounds = true;
        cloud.outOfBoundsKill = true;
    },
    
    start: function(){
        this.clouds.destroy();
        game.state.start('main'); 
    }
};

var mainState = {
    preload: function () {
        game.load.image('sky', 'imgs/skyBackground.png');
        game.load.image('hfence', 'imgs/horizontalFence.png');
        game.load.image('llama' , 'imgs/placeholder.png');
        game.load.image('bar', 'imgs/bar.png');
        game.load.image('buy', 'imgs/buyButton.png');
        game.load.image('sell', 'imgs/sellButton.png');
        game.load.image('llamas', 'imgs/placeholder_mini.png');
        game.load.image('vFence', 'imgs/verticalFence.png');
        game.load.image('feedAlert', 'imgs/feedAlert.png');
        game.load.image('grass', 'imgs/grass.png');
        game.load.image('feed', 'imgs/feedButton.png');
        game.load.image('all', 'imgs/all.png');
        game.load.image('mg', 'imgs/mgButton.png');
    },
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //backgrounds
        this.bgSky = game.add.sprite(0,0, 'sky');
        
        //variables
        this.growth = 0.2;
        this.textStyle = { fontSize: '22px', fill: '#fff'};
        
        //fence
        this.hFence = game.add.sprite(0,200, 'hfence');
        game.physics.arcade.enable(this.hFence);
        this.hFence.body.immovable = true;
        this.vFence = game.add.sprite(270, 200, 'vFence');
        game.physics.arcade.enable(this.vFence);
        this.vFence.body.immovable = true;
        
        //llama stuff
        //TODO: MAKE SPRITE CLASS AND MAKE IT RESEMBLE BUTTONS CLASS
        this.llama = game.add.button(0, this.hFence.position.y -10, 'llama', this.llamaOnClick, this);
        this.llamas = game.add.group(game, 'llamas','llamas');
        this.llamas.enableBody = true;
        this.llamas.createMultiple(1000, 'llamas');
        
        //llama bar
        this.bar = game.add.sprite(this.llama.position.x, this.llama.position.y + 20, 'bar');
        this.bar.scale.x = 0.45; this.bar.scale.y = 0.1;
        this.bar.visible = false;

        //buy button
        this.buyButton = game.add.button(this.bar.position.x + 5, this.bar.position.y +0.1, 'buy', this.buyOnClick, this);
        this.buyButton.visible = false;
        game.physics.arcade.enable(this.buyButton);
        

        //sell button
        this.sellButton = game.add.button(this.buyButton.position.x+ this.buyButton.width + 5 , this.buyButton.position.y,'sell', this.sellOnClick, this);
        this.sellButton.visible = false;
        game.physics.arcade.enable(this.sellButton);
        
            
        //feeding stuff
        this.feedButton = game.add.button(this.sellButton.position.x +this.sellButton.width + 5, this.sellButton.position.y, 'feed', this.feedOnClick, this);
        this.feedButton.visible = false;
        this.feedAlert = game.add.sprite(this.vFence.position.x, this.vFence.position.y, 'feedAlert');
        this.feedAlert.visible = false;
        this.feedAlertTime = 15;
        game.physics.arcade.enable(this.feedButton);
        
        //feed all 
        this.feedAllButton = game.add.button(this.feedButton.position.x + this.feedButton.width + 5, this.feedButton.position.y, 'all', this.feedAll, this);
        this.feedAllButton.visible = false;
        
        //grass supply
        this.grass = game.add.button(game.world.width -155, 0, 'grass', this.grassOnclick, this);
        this.gBuyButton = game.add.button(this.grass.position.x + 10, this.grass.position.y + this.grass.height,'buy', this.buyGrass , this);
        this.gBuyButton.visible = false;
        
        //text
        this.llamaText = game.add.text(0,0,'Llamas: '+ llamaCount, this.textStyle);
        this.moneyText = game.add.text(game.world.width/3 , 0, 'Money: $' + money,  this.textStyle);
        this.grassText = game.add.text(this.gBuyButton.position.x + this.gBuyButton.width + 10, this.gBuyButton.position.y, '' + grassSupply, this.textStyle);
        this.grassText.visible = false;
        //mini games button
        
        
        this.miniGamesButton = game.add.button(game.world.width - 200 , game.world.height - 138, 'mg', this.miniGames, this)
        
        game.time.events.loop(1000, this.timer, this);
        
        for (var i = 0; i < llamaCount; i++) {
            this.addLlama();
        }

        
    },
    
    update: function () {
        //update texts
        this.llamaText.setText('Llamas: '+ llamaCount);
        this.moneyText.setText('Money: $' + money);
        this.grassText.setText('' + grassSupply);
        this.now = time;
        var llama = this.llamas.getFirstAlive();
        if (llama != null){
            this.starve();
            this.grow();
        } else {return;}
        
        
        
        //keep llamas inside fence
        game.physics.arcade.collide(this.llamas, this.hFence);
        game.physics.arcade.collide(this.llamas, this.vFence);

    }, 
    
    llamaOnClick: function() {
        this.bar.visible = !this.bar.visible;
        this.buyButton.visible = !this.buyButton.visible;
        this.sellButton.visible = !this.sellButton.visible;
        this.feedButton.visible =!this.feedButton.visible;
        this.feedAllButton.visible = !this.feedAllButton.visible;

    },
    
    buyOnClick: function () {
        if (money >= 100 ) {
            llamaCount++;
            this.addLlama();
            money -= 100;
        }
    },
    
    sellOnClick: function() {
        if (llamaCount > 1){
            llamaCount--;
            var llama = this.llamas.getFirstAlive();
            this.multiple = ((llama.scale.x - 1 ) / this.growth ) + 1 ;
            money = money + Math.floor( 100 * this.multiple);
            this.sell();
        }
    },
    feedOnClick: function() {
        if (grassSupply >= 1) {
            this.llamas.forEachAlive(function(llama){
                if (this.now - llama.lastFed > this.feedAlertTime){
                    grassSupply--;
                    llama.lastFed = time;
                }
            }, this);
        }
    },
    feedAll: function(){
        if (grassSupply >= llamaCount) {
            this.llamas.forEachAlive(function(llama) {
                llama.lastFed = time;
                grassSupply -= llamaCount;
            },this);
        }
    },
    
    addLlama: function() {
        var llama = this.llamas.getFirstDead();
        if (llama === null) {return;}
        llama.reset(0, 400);
        llama.scale.x = 1; llama.scale.y = 1;
        llama.body.velocity.x = Math.random() * 100 ; 
        llama.body.velocity.y = Math.random() * 300;
        llama.checkWorldBounds = true;
        llama.body.collideWorldBounds = true;
        llama.body.bounce.set(1);
        llama.lastFed = time;
        llama.growth = 0;
    },
    
    sell: function() {
        var llama = this.llamas.getFirstAlive();
        llama.kill();
    },
    
    starve: function() {
        //change number to change time(seconds) needed for llama to starve + die
        this.feedAlert.visible = false;
        this.llamas.forEachAlive(function(llama) {
            if (this.now - llama.lastFed > this.feedAlertTime){
                this.feedAlert.visible = true;
            }
            if (this.now - llama.lastFed > 120) {
                this.sell();
            }
        }, this);
        
    },
    
    grow: function() {
        this.llamas.forEachAlive(function(llama) {
            llama.growth++;
            if (llama.growth > 5000) {
                llama.scale.x += this.growth; llama.scale.y += this.growth;
                llama.growth = 0;
            }
        },this);
    },
    
    grassOnclick: function() {
        this.gBuyButton.visible = !this.gBuyButton.visible; 
        this.grassText.visible = !this.grassText.visible;
    },
    
    buyGrass: function() {
        if (money >= 20) {
            grassSupply++;
            money -= 20;
        }
    },
    
    miniGames: function() {
            this.llamas.visible = false;
            game.state.start('mgSelection')
    },
    
    timer: function() {
        time ++;
    }
};

var mgSelection = {
    preload: function() {
        game.load.image('sky', 'imgs/skyBackground.png');
        game.load.image('flappyLlama', 'imgs/flappyLlamasIcon.png');
        game.load.image('back', 'imgs/backButton.png');
    },
    create: function() {
        //bg
        this.bg = game.add.sprite(0 , 0 ,'sky'); 
        
        //game icons
        this.flappyLlama = game.add.button(100, 100, 'flappyLlama', function() {game.state.start('flappyLlama')} , this);
        
        //back button
        this.back = game.add.button(0,0, 'back', function() {game.state.start('main')}, this);
        this.back.scale.x = 0.3; this.back.scale.y = 0.3;
    }    
};

var flappyLlama = {
    preload: function() {
        game.load.image('bg', 'imgs/flappyBirdBackground.png');
        game.load.image('llama', 'imgs/placeholder_mini.png');
        game.load.image('pipe', 'imgs/pipe.png');
        game.load.image('pipe2', 'imgs/pipe2.png');
        game.load.image('board', 'imgs/board.png');
        game.load.image('replay', 'imgs/replayButton.png');
        game.load.image('back', 'imgs/backButton.png');
    },
    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //bg
        this.bg = game.add.sprite(0,0,'bg');
        this.bg.height = game.world.height;
        this.bg2 = game.add.sprite(this.bg.width, 0, 'bg');
        this.bg2.height = game.world.height;
        
        //llama
        this.llama = game.add.sprite(0, game.world.height/2, 'llama');
        game.physics.arcade.enable(this.llama);
        this.llama.body.gravity.y = 1000;
        
        
        var space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            space.onDown.add(this.jump, this);
        
        //pipes
        this.pipes = game.add.group();  
        this.pipes.enableBody = true;   
        this.pipes.createMultiple(5, 'pipe'); 
        game.time.events.loop(1500, this.addOnePipe, this);
        
        this.pipes2 = game.add.group();
        this.pipes2.enableBody = true;
        this.pipes2.createMultiple(5, 'pipe2');
        this.pipes2.checkWorldBounds = true;
        this.pipes2.outOfBoundsKill = true;
        //texts
        this.score = 0;  
        this.scoreText = game.add.text(game.world.centerX, 0, ''+ this.score, { font: "30px Arial", fill: "#ffffff" });
            
    },
    
    update: function() {
        if (this.llama.inWorld == false){
            this.gameOver();
        }
        //fix this
        if (this.llama.position.x == this.pipes) {
            this.score++;
        }
        
        this.pipes.forEachAlive(function(pipeT) {
            if (!pipeT.inWorld)
                this.score++;
        },this);
        
        
        this.scoreText.setText(game.world.centerX, 0, ''+ this.score, { font: "30px Arial", fill: "#ffffff" });
        
        game.physics.arcade.overlap(this.llama, this.pipes, this.gameOver, null, this);
        game.physics.arcade.overlap(this.llama, this.pipes2, this.gameOver, null, this); 

    },
    
    jump: function() {
        this.llama.body.velocity.y = -350;
    },
    
    gameOver: function() {
        this.llama.body.velocity.y = 0;
        this.pipes.forEachAlive(function(pipeT){
            pipeT.body.velocity.x = 0;
        },this);
        this.pipes2.forEachAlive(function(pipeB){
            pipeB.body.velocity.x = 0;
        },this);
        this.gameOverBoard = game.add.sprite(50, 50, 'board');
        this.back = game.add.button(60, 350, 'back', function() {game.state.start('mgSelection')}, this);
        this.replay = game.add.button(this.back.position.x + this.back.width + 5, this.back.position.y,'replay', this.restart, this);
        this.scoreText2 = game.add.text(game.world.centerX - 200,game.world.centerY - 100, 'Score:' + this.score, { font: "60px Arial", fill: "black" });
        this.highScoreText = game.add.text(game.world.centerX - 200,game.world.centerY , 'High score:' + highScore, { font: "60px Arial", fill: "black" });
    },
    
    restart: function() {
        game.state.start('flappyLlama');
    },
    
    addOnePipe: function(x, y) { 
        var pipeT = this.pipes.getFirstDead();
        pipeT.reset(game.world.width, Math.random() * -200);
        pipeT.body.velocity.x = -200;
        pipeT.checkWorldBounds = true;
        pipeT.outOfBoundsKill = true;
        
        
        var pipeB = this.pipes2.getFirstDead();
        pipeB.reset(pipeT.position.x, pipeT.position.y + 130 + pipeT.height);
        pipeB.body.velocity.x = -200;
        pipeB.checkWorldBounds = true;
        pipeB.outOfBoundsKill = true;
        
    }
        
        
};

// Initialize Phaser
game = new Phaser.Game(640, 480, Phaser.AUTO, 'gameDiv');
// And finally we tell Phaser to add and start our 'main' state
game.state.add('main', mainState);
game.state.add('mainMenu', mainMenu);
game.state.add('mgSelection', mgSelection);
game.state.add('flappyLlama', flappyLlama);
game.state.start('main');
