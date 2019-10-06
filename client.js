
function getMeteor() {
    return {
        location: getRandomInt(500, 1300),
        mass: getRandomInt(100, 400),
        velocity: getRandomInt(100, 300)
    }
}

function getWatter() {
    return {
        distance: getRandomInt(100, 1300),
        depth: getRandomInt(50, 200)
    }
}

function getGroundEvents() {
    let items = [
        {
            type: "alien",
            distance: getRandomInt(100, 500)
        },
        {
            type: "storm",
            distance: getRandomInt(100, 500)
        }
    ];
    return items[Math.floor(Math.random()*items.length)];
}

function getPlayerName() {
    return "BestPlayer";
}

function getLeaderBoard() {
    return {
        "Player1": 1500,
        "Player2": 1256,
        "Player3": 244,
    };
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
