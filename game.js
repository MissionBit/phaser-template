/*global Phaser*/
/*jslint sloppy:true, browser: true, devel: true, eqeq: true, vars: true, white: true*/
var game;

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
    },
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //backgrounds
        this.bgSky = game.add.sprite(0,0, 'sky');
        
        //fence
        this.hFence = game.add.sprite(0,200, 'hfence');
        game.physics.arcade.enable(this.hFence);
        this.hFence.body.immovable = true;
        this.vFence = game.add.sprite(270, 200, 'vFence');
        game.physics.arcade.enable(this.vFence);
        this.vFence.body.immovable = true;
        
        //llama stuff
        //TODO: MAKE SPRITE CLASS AND MAKE IT RESEMBLE BUTTONS CLASS
        this.llamaCount = 1;
        this.llama = game.add.button(0, this.hFence.position.y -10, 'llama', this.llamaOnClick, this);
        this.llamas = game.add.group(game, 'llamas','llamas');
        this.llamas.enableBody = true;
        this.llamas.createMultiple(1000, 'llamas');

        
        //text
        this.llamaText = game.add.text(0,0,'Llamas: '+ this.llamaCount, { fontSize: '22px', fill: '#fff'});
        this.moneyText = game.add.text(game.world.width/2 , 0, 'Money: $' + this.money,  { fontSize: '22px', fill: '#fff'});
        
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
        /*this.grass = game.add.button(this.moneyText.position.x + game.world.width/4, 0, 'grass', this.grassOnclick, this);
        this.gBuyButton = game.add.button(this.grass.position.x + 10, this.grass.position.y + this.grass.height, this.buyGrass , this);
        this.gbuyButton.visible = false;*/
        
        //variables
        this.growth = 0.2;
        this.money = 500;
             
    },
    
    update: function () {
        //update texts
        this.llamaText.setText('Llamas: '+ this.llamaCount);
        this.moneyText.setText('Money: $' + this.money);
        this.now = new Date().getTime() / 1000;
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
        if (this.money >= 100 ) {
            this.llamaCount ++;
            this.addLlama();
            this.money -= 100;
        }
    },
    
    sellOnClick: function() {
        if (this.llamaCount > 1){
            this.llamaCount --;
            var llama = this.llamas.getFirstAlive();
            this.multiple = ((llama.scale.x - 1 ) / this.growth ) + 1 ;
            this.money = this.money + Math.floor( 100 * this.multiple);
            this.sell();
        }
    },
    feedOnClick: function() {
        if (this.money >= 20) {
            this.llamas.forEachAlive(function(llama){
                if (this.now - llama.lastFed > this.feedAlertTime){
                    llama.lastFed = new Date().getTime() / 1000;
                    this.money -= 20;
                }
            }, this)
        }
    },
    feedAll: function(){
        if (this.money >= this.llamaCount * 20) {
            this.llamas.forEachAlive(function(llama) {
                llama.lastFed = new Date().getTime() / 1000;
                this.money -= this.llamaCount * 20;
            },this)
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
        llama.lastFed = new Date().getTime() / 1000;
        llama.growth = 0
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
            llama.growth++
            if (llama.growth > 10000) {
                llama.scale.x += this.growth; llama.scale.y += this.growth;
                llama.growth = 0;
            }
        },this);
    },
    
    grassOnclick: function() {
        this.gBuyButton.visible = !this.gBuyButton.visible;  
    },
    
    buyGrass: function() {
        this.grass ++;
    }
       
    

};

// Initialize Phaser
game = new Phaser.Game(640, 480, Phaser.AUTO, 'gameDiv');
// And finally we tell Phaser to add and start our 'main' state
game.state.add('main', mainState);
game.state.add('mainMenu', mainMenu);
game.state.start('main');
