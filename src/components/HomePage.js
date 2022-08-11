import React, { useEffect, useState } from "react";
import { Adjectives, Nouns } from "./Words";
import { CreateGame, Health } from "../api/API";
import { useHistory } from "react-router-dom"
import { IoMdInformationCircleOutline } from "react-icons/io"
import Footer from "./Footer";

export default function HomePage() {
    const history = useHistory();

    const [gid, setGameID] = useState(`${ Adjectives[Math.floor(Math.random()*Adjectives.length)] }-${ Nouns[Math.floor(Math.random()*Nouns.length)] }`);
    const [variant, setVariant] = useState("Classic")
    const [teams, setTeams] = useState(2);
    const [showVariantPopop, setShowVariantPopup] = useState(false)

    useEffect(() => {
        async function fetchHealth() {
            let response = await Health();
            if (!response || response.status !== 200) history.push(`/status/down`);
        }
        fetchHealth()
    }, [history])

    async function handleGo(e) {
        e.preventDefault();
        let status = await CreateGame(gid, teams, null, variant);
        if (status === 201 || status === 400) history.push(`/${ gid }`);
    }
    return (
        <div className="flex flex-col items-center m-8 md:m-12">
            {
                showVariantPopop ? 
                    <div className="absolute w-full h-full top-0 bg-zinc-500 bg-opacity-50 flex items-center justify-center fade-in">
                        <div className="px-4 py-4 bg-zinc-800 mx-2">
                            <p className="font-bold text-center mb-1"><span className="title text-3xl font-black text-red-600 mr-1">Tsuro</span> variants</p>
                            <p className="text-sm"><span className="font-bold">Classic:</span> standard Tsuro.</p>
                            <p className="text-sm"><span className="font-bold">Longest Path:</span> player with the longest path wins.</p>
                            <p className="text-sm"><span className="font-bold">Most Crossings:</span> player whose path crosses itself the most wins.</p>
                            <p className="text-sm"><span className="font-bold">Open Tiles:</span> players place tiles from a common pool.</p>
                            <p className="text-sm"><span className="font-bold">Solo:</span> place all the tiles while keeping every token alive.</p>
                            <button className="w-full bg-red-500 mt-2" onClick={() => setShowVariantPopup(false)}>close</button>
                        </div>
                    </div> : <></>
            }
            <div className="w-full max-w-2xl">
                <div className="flex flex-col items-center fade-in">
                    <div className="title text-5xl font-black text-red-600 mb-1 cursor-pointer">
                        <a href={ `${ window.location.protocol }//${ window.location.host }` }>Tsuro</a>
                    </div>
                    <div className="font-thin mb-3">
                        Play two to eight player Tsuro online against friends.
                        To create a game or join an existing one, enter a game ID and click 'Go'.
                    </div>
                    <form className="w-full flex mb-2" onSubmit={ handleGo }>
                        <input className="w-10/12 p-2 text-zinc-100 bg-zinc-800 rounded-none border border-zinc-100 text-3xl font-medium box-border focus:outline-dashed outline-blue-500 outline-2" autoFocus type="text" value={ gid } onChange={ e => setGameID(e.target.value) }/>
                        <button className="w-2/12 font-bold grow-0 bg-blue-500">Go</button>
                    </form>
                    <div className="flex w-full justify-between flex-wrap">
                        <div className="italic text-xs bg-blue-500 py-1 px-2 order-2 md:order-1">
                            <a href="https://quibbble.com">more <span className="quibbble text-sm not-italic">quibbble</span> games</a>
                        </div>
                        <div className="flex items-center order-1 md:order-2 mb-2 md:mb-0">
                            <IoMdInformationCircleOutline className="mr-1 text-xl cursor-pointer" onClick={() => setShowVariantPopup(true)}/>
                            <div className="mr-1 font-black text-blue-500">VARIANT</div>
                            <select className="mr-1 bg-zinc-800 text-xs h-6 border font-bold border-zinc-100 focus:outline-none" id="players" onChange={ e => setVariant(e.target.value.replace(/\s/g, "")) }>
                                { ["Classic", "Longest Path", "Most Crossings", "Open Tiles", "Solo"].map(el => <option key={ el } value={ el }>{ el }</option>) }
                            </select>
                            <div className="mx-1 font-black text-blue-500">{ variant === "Solo" ? "TOKENS" : "PLAYERS" }</div>
                            <select className="bg-zinc-800 text-xs h-6 border font-bold border-zinc-100 focus:outline-none" id="players" onChange={ e => setTeams(parseInt(e.target.value)) }>
                                { [2, 3, 4, 5, 6, 7, 8].map(el => <option key={ el } value={ el }>{ el }</option>) }
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-8 md:bottom-12">
                <Footer />
            </div>
        </div>
    )
}
