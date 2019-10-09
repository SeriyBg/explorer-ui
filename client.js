const eventHost = "";//"http://localhost:8080";
const nameHost = "";//"http://localhost:8081";
const groundEventsHost = "";//"http://localhost:8082";

async function getMeteor(username) {
    const axiosOptions = {
        method: 'GET',
        url: eventHost + "/event/meteor",
        headers: {
            'user': username
        },
    };
    let response = await axios(axiosOptions);
    return response.data;
}

async function getWatter(username) {
    const axiosOptions = {
        method: 'GET',
        url: eventHost + "/event/water",
        headers: {
            'user': username
        },
    };
    let response = await axios(axiosOptions);
    return response.data;
}

async function getGroundEvents(username) {
    const axiosOptions = {
        method: 'GET',
        url: groundEventsHost + "/groundevent/2",
        headers: {
            'user': username
        },
    };
    let response = await axios(axiosOptions);
    return response.data
}

function updateScore(username, score) {
    const axiosOptions = {
        method: 'POST',
        url: nameHost + "/player/score/" + score.toFixed(),
        headers: {
            'user': username
        },
    };
    return axios(axiosOptions);
}

async function getPlayerName() {
    let response = await axios.get(nameHost + "/player/name");
    return response.data;
}

async function getLeaderboard() {
    let response = await axios.get(nameHost + "/player/leaderboard?top=" + 3);
    return response.data;
}

