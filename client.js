const meteorHost = "http://localhost:8080";
const nameHost = "http://localhost:8081";
const groundEventsHost = "http://localhost:8082";

async function getMeteor(username) {
    const axiosOptions = {
        method: 'GET',
        url: meteorHost + "/meteor",
        headers: {
            'user': username
        },
    };
    let response = await axios(axiosOptions);
    return response.data;
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

function updateScore(username, score) {
    const axiosOptions = {
        method: 'POST',
        url: nameHost + "/score/" + score.toFixed(),
        headers: {
            'user': username
        },
    };
    return axios(axiosOptions);
}

async function getPlayerName() {
    let response = await axios.get(nameHost + "/name");
    return response.data;
}

async function getLeaderboard() {
    let response = await axios.get(nameHost + "/leaderboard?top=" + 3);
    return response.data;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
