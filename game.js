let game;

let gameOptions = {
    // player gravity
    playerGravity: 200,
    mountainSpeed: 80,
    lives: 1
};

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 1334,
            height: 750
        },
        scene: [preloadGame, playGame],
        backgroundColor: 0x0c88c7,

        physics: {
            default: "arcade"
        }
    };
    game = new Phaser.Game(gameConfig);
    window.focus();
};

class preloadGame extends Phaser.Scene {
    constructor() {
        super("PreloadGame");
    }

    preload(){
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.spritesheet("mountain", "assets/mountains.png", {
            frameWidth: 500,
            frameHeight: 500
        });
        this.load.spritesheet("cloud", "assets/clouds.png", {
            frameWidth: 75,
            frameHeight: 50
        });
        this.load.spritesheet("storm", "assets/storm.png", {
            frameWidth: 100,
            frameHeight: 100
        });
        this.load.spritesheet("meteor", "assets/meteor.png", {
            frameWidth: 50,
            frameHeight: 50
        });
        this.load.spritesheet('rover', 'assets/rover.png', { frameWidth: 42, frameHeight: 31 });
    }

    create(){
        // setting player animation
        this.anims.create({
            key: "drive",
            frames: this.anims.generateFrameNumbers("rover", {
                start: 0,
                end: 1
            }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: "stop",
            frames: [ { key: 'rover', frame: 0 } ],
            frameRate: 20
        });
        this.anims.create({
            key: "storm",
            frames: this.anims.generateFrameNumbers('storm', {
                start: 0,
                end: 1
            }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNumbers('meteor', {
                start: 0,
                end: 2
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'explode',
            frames: [ { key: 'meteor', frame: 3 } ],
            frameRate: 10,
            repeat: -1
        });

        this.scene.start("PlayGame");
    }
}

// playGame scene
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    create(){
        this.sky = this.physics.add.staticGroup();
        this.sky.create(600, 400, 'sky').scaleX = 2;
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(600, 700, 'ground').setScale(2).refreshBody();
        this.platforms.setDepth(3);

        this.mountainGroup = this.add.group();
        this.cloudGroup = this.add.group();

        this.addMountains();
        this.addClouds();

        this.player = this.physics.add.sprite(200, 350, 'rover');

        this.player.setScale(1.3);
        this.player.setBounce(0.4);
        this.player.setDepth(4);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(gameOptions.playerGravity);
        this.platformCollider = this.physics.add.collider(this.player, this.platforms);
        this.cursors = this.input.keyboard.createCursorKeys();

        //TODO storm
        this.stormGroup = this.add.group();

        this.addStorm();

        //TODO meteor
        this.meteorGroup = this.add.group();

        this.addMeteor();
    }

    update() {
        if (this.cursors.right.isDown) {
            this.moveForward();
        } else if (this.cursors.left.isDown) {
            this.moveBackward();
        } else {
            // player.setVelocityX(0);
            this.player.anims.play('stop');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
           this.player.setVelocityY(-200);
        }
    }

    moveForward() {
        this.player.anims.play('drive', true);
        this.mountainGroup.getChildren().forEach(function (mountains) {
            mountains.x += -1 - (mountains.depth / 5);
        });
        this.cloudGroup.getChildren().forEach(function (cloud) {
            cloud.x += -0.3 - (cloud.depth / 5);
        });
        this.recyclingMountains();
        this.stormGroup.getChildren().forEach(function (storm) {
            storm.x += -2;
        });
        this.meteorGroup.getChildren().forEach(function (meteor) {
            meteor.x += -2;
        });
    }

    moveBackward() {
    }

    addStorm() {
        let storm = this.physics.add.sprite(1000, 350, 'storm');
        storm.anims.play('storm');
        storm.setScale(0.5);
        storm.setDepth(4);
        storm.body.setGravityY(gameOptions.playerGravity);

        this.stormGroup.add(storm);

        this.physics.add.collider(this.platforms, storm);
        this.physics.add.collider(this.player, storm, () => this.roverHit());
    }

    addMeteor() {
        let meteor = this.physics.add.sprite(700, -100, 'meteor');
        meteor.anims.play('fall');
        meteor.setDepth(4);
        meteor.setVelocityX(-100);
        meteor.body.setGravityY(gameOptions.playerGravity);

        this.meteorGroup.add(meteor);
        this.physics.add.collider(this.player, meteor, () => {
            meteor.anims.play('explode');
            this.roverHit()
        });
        this.physics.add.collider(this.platforms, meteor, function () {
            meteor.setVelocityX(0);
            meteor.anims.play('explode');
            setTimeout(() => meteor.destroy(), 100);
        }, function () {}, this);
    }

    addMountains() {
        let rightmostMountain = this.getRightmostMountain();
        if(rightmostMountain < game.config.width * 2){
            let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height - Phaser.Math.Between(0, 150), "mountain");
            mountain.setOrigin(0.5, 1);
            this.mountainGroup.add(mountain);
            if(Phaser.Math.Between(0, 1)){
                mountain.setDepth(2);
            }
            mountain.setFrame(Phaser.Math.Between(0, 3));
            this.addMountains()
        }
    }

    recyclingMountains() {
        this.mountainGroup.getChildren().forEach((mountain) => {
            if(mountain.x < - mountain.displayWidth) {
                let rightmostMountain = this.getRightmostMountain();
                mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
                mountain.y = game.config.height - Phaser.Math.Between(0, 150);
                mountain.setFrame(Phaser.Math.Between(0, 3));
                if(Phaser.Math.Between(0, 1)){
                    mountain.setDepth(1);
                }
            }
        }, this);
    }

    addClouds() {
        let rightmostCloud = this.getRightmostCloud();
        if(rightmostCloud < game.config.width * 2){
            let cloud = this.physics.add.sprite(rightmostCloud + Phaser.Math.Between(100, 350), game.config.height - Phaser.Math.Between(350, 650), "cloud");
            cloud.setOrigin(0.5, 1);
            cloud.setScale(2);
            this.cloudGroup.add(cloud);
            if(Phaser.Math.Between(0, 1)){
                cloud.setDepth(1);
            }
            cloud.setFrame(Phaser.Math.Between(0, 5));
            this.addClouds()
        }
    }

    getRightmostCloud() {
        let rightmostCloud = -200;
        this.cloudGroup.getChildren().forEach(function(cloud) {
            rightmostCloud = Math.max(rightmostCloud, cloud.x);
        });
        return rightmostCloud;
    }

    roverHit() {
        gameOptions.lives -= 1;
        if (gameOptions.lives <= 0) {
            let text = this.add.text(667, 325, 'Game Over', { fontSize: '64px', fill: '#e0e1c3' });
            text.setDepth(100);
            text.setShadow(2, 2, "#333333", 2, false, true);
            game.destroy()
        }
    }

    getRightmostMountain() {
        let rightmostMountain = -200;
        this.mountainGroup.getChildren().forEach(function(mountain){
            rightmostMountain = Math.max(rightmostMountain, mountain.x);
        });
        return rightmostMountain;
    }
}
