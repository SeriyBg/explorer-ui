var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

var game = new Phaser.Game(config);

function preload () {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('clouds', 'assets/clouds.png');
    this.load.image('ground', 'assets/ground.png');
}

function create () {
    this.add.image(400, 300, 'sky');

    this.add.image(100, 150, 'clouds');
    this.add.image(150, 350, 'clouds');
    this.add.image(400, 150, 'clouds');
    this.add.image(650, 350, 'clouds');
    this.add.image(700, 150, 'clouds');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 600, 'ground').setScale(2).refreshBody();
}

function update () {
}