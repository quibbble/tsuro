import React, { useState } from "react";
import { Adjectives, Nouns } from "./Words";
import { CreateGame } from "../api/API";
import { useHistory } from "react-router-dom"

export default function HomePage() {
    const history = useHistory();

    const [gid, setGameID] = useState(`${ Adjectives[Math.floor(Math.random()*Adjectives.length)] }-${ Nouns[Math.floor(Math.random()*Nouns.length)] }`);
    const [teams, setTeams] = useState(2);

    async function handleGo(e) {
        e.preventDefault();
        let status = await CreateGame(gid, teams, null);
        if (status === 201) history.push(`/${ gid }`);
    }
    return (
        <div className="flex flex-col items-center">
            <div className="coquette text-5xl font-black text-red-600 mb-1 cursor-pointer">
                <a href={ `${ window.location.protocol }//${ window.location.host }` }>Tsuro</a>
            </div>
            <div className="font-thin mb-3">
                Play two to eight player Tsuro online against friends.
                To create a game or join an existing one, enter a game ID and click 'Go'.
            </div>
            <form className="w-full flex mb-1" onSubmit={ handleGo }>
                <input className="w-10/12 p-2 text-zinc-100 bg-zinc-800 border border-zinc-100 text-3xl font-medium box-border focus:outline-dashed outline-blue-500 outline-2" autoFocus type="text" value={ gid } onChange={ e => setGameID(e.target.value) }/>
                <button className="w-2/12 font-bold grow-0 bg-blue-500">Go</button>
            </form>
            <div className="flex w-full items-center justify-between">
                <div className="font-thin italic text-xs">
                    <a href="https://www.buymeacoffee.com/chrisfregly" target="_blank" rel="noreferrer">support the developer</a>
                </div>
                <div className="flex items-center ml-3">
                    <div className="mr-1 font-black text-blue-500">PLAYERS</div>
                    <select className="bg-zinc-800 text-sm h-6 border font-bold border-zinc-100 focus:outline-none" id="players" onChange={ e => setTeams(parseInt(e.target.value)) }>
                        { [2, 3, 4, 5, 6, 7, 8].map(el => <option key={ el } value={ el }>{ el }</option>) }
                    </select>
                </div>
            </div>
        </div>
    )
}
