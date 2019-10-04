const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
var config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var platforms;
var cursors;
var score = 0;
var scoreText;
var mountainsGroup;
var clouds = [];

var game1 = new Phaser.Game(config);

function preload () {
    this.load.image('sky', 'assets1/sky.png');
    this.load.image('clouds', 'assets1/clouds.png');
    this.load.image('ground', 'assets1/ground.png');
    this.load.image('mountains', 'assets1/mountains.png');
    this.load.spritesheet('rover', 'assets1/rover.png', { frameWidth: 42, frameHeight: 31 });
}

function create () {
    this.add.image(400, 300, 'sky');

    clouds.push(this.add.tileSprite(100, 150, 299, 196, 'clouds'));
    clouds.push(this.add.tileSprite(150, 350, 299, 196, 'clouds'));
    clouds.push(this.add.tileSprite(400, 150, 299, 196, 'clouds'));
    clouds.push(this.add.tileSprite(650, 350, 299, 196, 'clouds'));
    clouds.push(this.add.tileSprite(700, 150, 299, 196, 'clouds'));
    // this.add.image(400, 400, 'mountains');

    mountainsGroup = this.add.group();
    let mountains = this.add.tileSprite(400, 400, 800, 174, "mountains");
    mountainsGroup.add(mountains);
    platforms = this.physics.add.staticGroup();
    platforms.create(200, 600, 'ground').setScale(2).refreshBody();

    player = this.physics.add.sprite(200, 350, 'rover');

    player.setBounce(0.4);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('rover', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'stay',
        frames: [ { key: 'rover', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('rover', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);
    player.body.setGravityY(100);

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function update () {
    // if (cursors.left.isDown) {
    //     // player.setVelocityX(-160);
    //     player.anims.play('left', true);
    //     mountains.x += 1;
    //     clouds.forEach(function (cloud) {
    //         cloud.x += 0.3
    //     });
    // } else
    if (cursors.right.isDown) {
        // player.setVelocityX(160);
        player.anims.play('right', true);
        let rightmostMountain = -200;
        mountainsGroup.getChildren().forEach(function (mountains) {
            mountains.x += -1;
            rightmostMountain = Math.max(rightmostMountain, mountains.x);
            if (rightmostMountain < GAME_WIDTH / 2) {
                // let newMountain = that.add.tileSprite(400, 800, 800, 174, "mountains");
                // mountainsGroup.add(newMountain);
                // rightmostMountain = -200;
            }
        });
        clouds.forEach(function (cloud) {
            cloud.x += -0.3
        });
    } else {
        // player.setVelocityX(0);
        player.anims.play('stay');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-150);
    }
}

function addBackground(scene) {
    mountains = this.add.tileSprite(400, 800, 800, 174, "mountains");
}