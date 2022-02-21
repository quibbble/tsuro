import axios from 'axios';
import { CONFIG } from "../components/Config";

axios.defaults.withCredentials = true;

const key = "Tsuro"

export const CreateGame = async (id, teams, turnLength) => {
    let config = {
        method: 'POST',
        url: `http${CONFIG.scheme}://${CONFIG.host}/game/create`,
        headers: {
            'Content-Type': 'application/json'
        },
        data : JSON.stringify({
            GameKey: key,
            GameID: id,
            Teams: teams,
            TurnLength: turnLength,
            MoreOptions: {
                Seed: Date.now(),
            }
        })
    };
    console.log(teams);
    return axios(config)
        .catch(error => error.response)
        .then(response => {
            console.log(response);
            return response.status
        })
};

export const LoadGame = async (id, bgn) => {
    let config = {
        method: 'POST',
        url: `http${CONFIG.scheme}://${CONFIG.host}/game/load`,
        headers: {
            'Content-Type': 'application/json'
        },
        data : JSON.stringify({
            GameKey: key,
            GameID: id,
            BGN: bgn
        })
    };
    return axios(config)
        .catch(error => error.response)
        .then(response => response.status)
};

export const GetBGN = async (id) => {
    let config = {
        method: 'GET',
        url: `http${CONFIG.scheme}://${CONFIG.host}/game/bgn?GameKey=${key}&GameID=${id}`,
    };
    return axios(config)
        .catch(error => error.response)
};
