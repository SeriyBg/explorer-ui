let leaderBoard = {
    "Player1": 701,
    "Player2": 243,
    "Player3": 114,
};

function getMeteor() {
    return Promise.resolve({
        location: getRandomInt(500, 1300),
        mass: getRandomInt(100, 400),
        velocity: getRandomInt(100, 300)
    })
}

function getWatter() {
    return Promise.resolve({
        distance: getRandomInt(100, 1300),
        depth: getRandomInt(50, 200)
    });
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
    return Promise.resolve(items[Math.floor(Math.random()*items.length)]);
}

async function updateScore(username, score) {
    return new Promise((resolve) => {
        leaderBoard["Player1"] = leaderBoard["Player1"] + 1;
        leaderBoard[username] = score;
        resolve();
    });
}

async function getPlayerName() {
    const name = "Best Player";
    leaderBoard[name] = 0;
    return Promise.resolve(name);
}

async function getLeaderboard() {
    return Promise.resolve(leaderBoard);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
