let game;

let gameOptions = {
    // player gravity
    playerGravity: 200,
    mountainSpeed: 80,
    lives: 2,
    groundEventsCount: 2,
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
        this.load.image('up', 'assets/jump.png');
        this.load.image('right', 'assets/forward.png');
        this.load.image('left', 'assets/backward.png');
        this.load.image('space', 'assets/scan_button.png');
        this.load.spritesheet("mountain", "assets/mountains.png", { frameWidth: 500, frameHeight: 500 });
        this.load.spritesheet("cloud", "assets/clouds.png", { frameWidth: 75, frameHeight: 50 });
        this.load.spritesheet("storm", "assets/storm.png", { frameWidth: 100, frameHeight: 100 });
        this.load.spritesheet("meteor", "assets/meteor.png", { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet("alien", "assets/alien.png", { frameWidth: 30, frameHeight: 50 });
        this.load.spritesheet("water", "assets/water.png", { frameWidth: 30, frameHeight: 30 });
        this.load.spritesheet("scan", "assets/scan.png", { frameWidth: 30, frameHeight: 18 });
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
            frameRate: 10,
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
        this.anims.create({
            key: 'welcome',
            frames: this.anims.generateFrameNumbers('alien', {
                start: 0,
                end: 2
            }),
            frameRate: 5
        });
        this.anims.create({
            key: 'flow',
            frames: this.anims.generateFrameNumbers('water', {
                start: 0,
                end: 2
            }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'scan',
            frames: this.anims.generateFrameNumbers('scan', {
                start: 0,
                end: 2
            }),
            frameRate: 5,
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
        this.score = 0.0;
        this.isOver = false;
        this.lives = gameOptions.lives;
        this.movingGroup = [];
        this.scoreText = this.add.text(16, 16, `score: ${this.score}`, { fontSize: '32px', fill: '#000' });
        this.scoreText.setDepth(10);
        this.livesText = this.add.text(1100, 16, `lives: ${this.lives}`, { fontSize: '32px', fill: '#000' });
        this.livesText.setDepth(10);

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
        this.physics.add.collider(this.player, this.platforms);
        this.scan = null;

        if (!this.sys.game.device.input.touch) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.scanButton = this.cursors.space;
            this.scanButton.on('down', () => this.startScan());
            this.scanButton.on('up', () => this.stopScan());
        } else {
            this.createButtons();
        }

        this.meteorGroup = this.add.group();
        this.movingGroup.push(this.meteorGroup);

        this.alienGroup = this.add.group();
        this.movingGroup.push(this.alienGroup);
        this.addAlien();

        this.stormGroup = this.add.group();
        this.movingGroup.push(this.stormGroup);
        this.addStorm();

        this.waterGroup = this.add.group();
        this.movingGroup.push(this.waterGroup);
        this.addWater();
    }

    startScan() {
        this.scan = this.physics.add.sprite(this.player.x, this.player.y + 50, 'scan');
        this.scan.anims.play('scan');
        this.scan.setDepth(5);
        this.scanWater();
    }

    stopScan() {
        if (this.scan !== null) {
            this.scan.destroy();
        }
    }

    createButtons() {
        this.input.addPointer(2);
        this.input.topOnly = true;
        this.cursors = {'up': {}, 'left': {}, 'right': {}, 'down': {}, 'space': {}};

        const pointerDown = key => this.cursors[key].isDown = true;
        const pointerUp = key => this.cursors[key].isDown = false;

        const createBtn = (key, x, y) => {
            let btn = this.add.image(x, y, key);
            btn.setDepth(6);
            btn.setInteractive();
            btn.on('pointerdown', () => pointerDown(key));
            btn.on('pointerup', () => pointerUp(key));
        };

        createBtn('up', 100, 600);
        createBtn('right', 1250, 600);
        createBtn('left', 1050, 600);
        createBtn('space', 200, 600);
        let space = this.add.image(200, 600, 'space');
        space.setDepth(6);
        space.setInteractive();
        space.on('pointerdown', () => {pointerDown('space'); this.startScan()});
        space.on('pointerup', () => {pointerUp('space'); this.stopScan();});
        this.scanButton = this.cursors.space;
    }

    update() {
        if (this.isOver) {
            return;
        }
        if (this.scanButton.isDown) {
        } else if (this.cursors.right.isDown) {
            this.moveForward();
        } else if (this.cursors.left.isDown) {
            this.moveBackward();
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('stop');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.jump();
        }
    }

    jump() {
        this.player.setVelocityY(-200);
    }

    moveForward() {
        this.player.anims.play('drive', true);
        if (this.player.x < 300) {
            this.player.setVelocityX(100);
        } else {
            this.player.setVelocityX(0);
            this.score += 0.1;
            this.scoreText.text = `score: ${this.score.toFixed()}`;
            this.mountainGroup.getChildren().forEach(function (mountains) {
                mountains.x += -1 - (mountains.depth / 5);
            });
            this.cloudGroup.getChildren().forEach(function (cloud) {
                cloud.x += -0.3 - (cloud.depth / 5);
            });
            this.recyclingMountains();
            this.recyclingClouds();
            this.recyclingElements();
            this.movingGroup.forEach(group => {
                group.getChildren().forEach(item => {
                    item.x -= 2;
                });
            });
            this.alienGroup.getChildren().forEach(alien => {
                if ((alien.x - this.player.x <= 200) && !alien.anims.isPlaying) {
                    alien.anims.play('welcome');
                }
            });
        }
    }

    recyclingElements() {
        this.recyclingMeteors();
        this.recyclingWater();
        this.recyclingGroundEvents();
    }

    recyclingGroundEvents() {
        this.alienGroup.getChildren().forEach((alien) => {
            if(alien.x < 0) {
                this.alienGroup.killAndHide(alien);
                this.alienGroup.remove(alien);
                alien.destroy();
            }
        });
        this.stormGroup.getChildren().forEach((storm) => {
            if(storm.x < 0) {
                this.alienGroup.killAndHide(storm);
                this.alienGroup.remove(storm);
                storm.destroy();
            }
        });
        if (this.stormGroup.getChildren().length + this.alienGroup.getChildren().length < gameOptions.groundEventsCount) {
            let eventTypes = {
                "alien": this.addAlien,
                "storm": this.addStorm
            };
            let eventData = getGroundEvents();
            eventTypes[eventData.type].bind(this)(eventData.distance);
        }
    }

    recyclingWater() {
        this.waterGroup.getChildren().forEach((water) => {
            if(water.x < -water.displayWidth) {
                let waterData = getWatter();
                water.x = game.config.width + waterData.distance;
                water.y = 500 + waterData.depth;
                water.setFrame(Phaser.Math.Between(0, 3));
                water.setDepth(5);
            }
        });
        if ((this.waterGroup.getChildren().length === 0)) {
            this.addWater(game.config.width);
        }
    }

    recyclingMeteors() {
        let minMeteors = 1 + Number.parseInt((this.score / 500).toFixed());
        if (this.meteorGroup.getChildren().length < minMeteors) {
            this.addMeteor();
        }
    }

    scanWater() {
        if(!this.scanButton.isDown) {
            return;
        }
        this.waterGroup.getChildren().forEach(water => {
            if (Math.abs(water.x - this.player.x) <= 50) {
                setTimeout(() => {
                    if (!this.scanButton.isDown) {
                        return;
                    }
                    this.waterGroup.killAndHide(water);
                    this.waterGroup.remove(water);
                    this.score += 20;
                    this.scoreText.text = `score: ${this.score.toFixed()}`;
                }, 500 + (water.y - 550) * 10);
            }
        });
    }

    moveBackward() {
        this.player.anims.play('drive', true);
        this.player.setVelocityX(-100);
    }

    addWater(initialDistance = 0) {
        let waterData = getWatter();
        let water = this.physics.add.sprite(initialDistance + waterData.distance, 500 + waterData.depth, 'water');
        water.setDepth(4);
        water.setScale(2);
        water.anims.play('flow');
        this.waterGroup.add(water);
    }

    addAlien(initialDistance = 0) {
        let alien = this.physics.add.sprite(initialDistance + 600, 480, 'alien');
        alien.setDepth(4);
        alien.body.setGravityY(gameOptions.playerGravity);
        this.physics.add.collider(alien, this.platforms);
        this.physics.add.collider(alien, this.player, () => {
            this.score += 1;
            this.alienGroup.killAndHide(alien);
            this.alienGroup.remove(alien);
            alien.destroy();
        });
        this.alienGroup.add(alien);
    }

    addStorm(initialDistance = 0) {
        let storm = this.physics.add.sprite(initialDistance + 1000, 350, 'storm');
        storm.anims.play('storm');
        storm.setScale(0.5);
        storm.setDepth(4);
        storm.body.setGravityY(gameOptions.playerGravity);

        this.stormGroup.add(storm);

        this.physics.add.collider(this.platforms, storm);
        this.physics.add.collider(this.player, storm, (r, s) => {
            this.roverHit(s);
        });
    }

    addMeteor() {
        let meteorData = getMeteor();
        let meteor = this.physics.add.sprite(meteorData.location, -100, 'meteor');
        meteor.setCollideWorldBounds(true);
        meteor.anims.play('fall');
        meteor.setDepth(4);
        meteor.setVelocityX(-meteorData.velocity);
        meteor.body.setGravityY(meteorData.mass);

        this.meteorGroup.add(meteor);
        this.physics.add.collider(this.player, meteor, (r, m) => {
            this.meteorExplode(meteor);
            this.roverHit(m);
        });
        this.physics.add.collider(this.platforms, meteor, () => {
            this.meteorExplode(meteor);
        });
    }

    meteorExplode(meteor) {
        meteor.setVelocityX(0);
        meteor.anims.play('explode');
        setTimeout(() => {
            this.meteorGroup.killAndHide(meteor);
            this.meteorGroup.remove(meteor);
            meteor.destroy();
        }, 100);
    }

    addMountains() {
        let rightmostMountain = this.getRightmostElement(this.mountainGroup);
        if(rightmostMountain < game.config.width * 2){
            let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height - Phaser.Math.Between(0, 150), "mountain");
            mountain.setOrigin(0.5, 1);
            this.mountainGroup.add(mountain);
            if(Phaser.Math.Between(0, 1)) {
                mountain.setDepth(2);
            }
            mountain.setFrame(Phaser.Math.Between(0, 3));
            this.addMountains()
        }
    }

    recyclingMountains() {
        this.mountainGroup.getChildren().forEach((mountain) => {
            if(mountain.x < - mountain.displayWidth) {
                let rightmostMountain = this.getRightmostElement(this.mountainGroup);
                mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
                mountain.y = game.config.height - Phaser.Math.Between(0, 150);
                mountain.setFrame(Phaser.Math.Between(0, 3));
                if(Phaser.Math.Between(0, 1)){
                    mountain.setDepth(1);
                }
            }
        });
    }

    getRightmostElement(elementGroup) {
        let rightmostElement = -200;
        elementGroup.getChildren().forEach(function(element){
            rightmostElement = Math.max(rightmostElement, element.x);
        });
        return rightmostElement;
    }

    recyclingClouds() {
        this.cloudGroup.getChildren().forEach((cloud) => {
            if(cloud.x < -cloud.displayWidth) {
                let rightmostCloud = this.getRightmostElement(this.cloudGroup);
                cloud.x = rightmostCloud + Phaser.Math.Between(100, 350);
                cloud.y = game.config.height - Phaser.Math.Between(350, 650);
                cloud.setFrame(Phaser.Math.Between(0, 3));
                cloud.setScale(2);
                if(Phaser.Math.Between(0, 1)) {
                    cloud.setDepth(1);
                }
            }
        });
    }

    addClouds() {
        let rightmostCloud = this.getRightmostElement(this.cloudGroup);
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

    roverHit(hitObject) {
        if (hitObject.hit) {
            return;
        }
        hitObject.hit = true;
        this.lives -= 1;
        this.livesText.text = `lives: ${this.lives}`;
        if (this.lives <= 0) {
            let text = this.add.text(667, 325, 'Game Over', { fontSize: '64px', fill: '#e0e1c3' });
            text.setDepth(100);
            text.setShadow(2, 2, "#333333", 2, false, true);
            this.restartButton();

            this.isOver = true;
            game.scene.stop();
        }
    }

    restartButton() {
        let restart = this.add.text(667, 425, 'restart', { fontSize: '64px', fill: '#e0e1c3' })
            .setDepth(100)
            .setInteractive()
            .on('pointerdown', () => location.reload() )
    }
}
