const host = "http://localhost:8080";

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

function updateScore(username, score) {
    const axiosOptions = {
        method: 'POST',
        url: host + "/score/" + score.toFixed(),
        headers: {
            'user': username
        },
    };
    return axios(axiosOptions);
}

async function getPlayerName() {
    let response = await axios.get(host + "/name");
    return response.data;
}

async function getLeaderboard() {
    let response = await axios.get(host + "/leaderboard");
    return response.data;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
