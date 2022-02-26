import React, { useEffect, useRef, useState } from "react";
import { BsArrowClockwise, BsArrowUp, BsArrowLeft } from "react-icons/bs";
import { CONFIG } from "../components/Config";
import { DndProvider } from "react-dnd";
import DropSpace from "./game/DropSpace";
import { HTML5Backend } from "react-dnd-html5-backend";
import Tile from "./game/Tile";
import { TouchBackend } from "react-dnd-touch-backend";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import { isMobile } from "react-device-detect";

export default function GamePage() {
    const history = useHistory();
    const { gid } = useParams();

    // websocket connectivity logic 
    const ws = useRef();
    const [game, setGame] = useState();
    const [network, setNetwork] = useState();
    // const [chat, setChat] = useState([]);
    const [connected, setConnected] = useState();
    // const [error, setError] = useState();

    useEffect(() => {
        ws.current = new WebSocket(`ws${ CONFIG.scheme }://${ CONFIG.host }/game/join?GameKey=${ CONFIG.key }&GameID=${ gid }`);
        ws.current.onopen = () => {};
        ws.current.onclose = () => history.push("/");
        ws.current.onmessage = async e => {
            let msg = JSON.parse(e.data);
            if (msg.Type === "Game") setGame(msg.Payload);
            else if (msg.Type === "Network") setNetwork(msg.Payload);
            // else if (msg.Type === "Chat") setChat(c => c.concat([msg.Payload]));
            else if (msg.Type === "Connected") setConnected(msg.Payload);
            // else if (msg.Type === "Error") setError(msg.Payload);
        };
        ws.current.onerror = () => history.push("/");
    }, [ws, history, gid]);

    // websocket messages
    const setTeam = (team) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "SetTeam", "MoreDetails": {"Team": team}}));
    }

    const resetGame = () => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "Reset", "MoreDetails": {"MoreOptions": {"Seed": Date.now()}}}));
    }

    const placeTile = (team, row, col, tile) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "PlaceTile", "Team": team, "MoreDetails": {"Row": row, "Column": col, "Tile": tile}}));
    }

    const rotateTile = (team, tile) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "RotateTileRight", "Team": team, "MoreDetails": {"Tile": tile}}));
    }

    // trigger used to force a refresh of the page
    const [trigger, setTrigger] = useState(true);
    useEffect(() => {
        const handleResize = () => setTrigger(!trigger);
        window.addEventListener("resize", handleResize);
        return _ => window.removeEventListener("resize", handleResize)
    });

    // board resize logic
    const [tileSize, setTileSize] = useState(0);
    const ref = useRef(null);
    function handleResize() {
        const width = 6;
        if (!ref || !ref.current) return;
        else setTileSize(ref.current.clientWidth/width);
    }
    useEffect(() => handleResize());
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return _ => window.removeEventListener("resize", handleResize)
    }, []);

    return (
        <div ref={ref} className="h-full flex flex-col items-center">
            {/* TAILWIND HACK - Tailwind preloads only used classes so anything not in initial render will not work */}
            <div className="text-red-500 text-blue-500 text-green-500 text-yellow-500 text-orange-500 text-pink-500 text-purple-500 text-teal-500"/>
            <div className="border-red-500 border-blue-500 border-green-500 border-yellow-500 border-orange-500 border-pink-500 border-purple-500 border-teal-500"/>
            <div className="bg-red-500 bg-blue-500 bg-green-500 bg-yellow-500 bg-orange-500 bg-pink-500 bg-pink-500 bg-purple-500 bg-teal-500"/>
            <div className="fill-red-500 fill-blue-500 fill-green-500 fill-yellow-500 fill-orange-500 fill-pink-500 fill-pink-500 fill-purple-500 fill-teal-500"/>
            {/* END HACK */}
            <div className="w-full mb-1 justfy-self-start font-thin text-sm">Share this link with friends: <span className="underline"><a href={ `${ window.location.protocol }//${ window.location.host }/${ gid }` } target="_blank" rel="noreferrer">{ `${ window.location.protocol }//${ window.location.host }/${ gid }` }</a></span></div>
            <hr className="w-full mb-2"/>
            <div className="flex w-full justify-between items-center mb-4">
                <div className="flex">
                    { game ? game.Teams.map(el => <div key={ el } className={ `cursor-pointer mr-1 w-6 h-6 rounded-full border-4 border-${ el }-500 ${ network && connected && connected[network.Name] === el  ? `bg-${ connected[network.Name] }-500` : "" }` } onClick={ () => setTeam(el) }/>) : null }
                </div>
                <div className={ `font-extrabold ${ game && connected && network && connected[network.Name] && game.Winners.length === 0 ? `text-${ game.Turn }-500` : "text-zinc-100" }` }>
                    { 
                        game && connected && network && connected[network.Name] ? 
                            game.Message : 
                            <div className="flex items-center">
                                <BsArrowLeft className="mr-1" />
                                <div>select a team</div>
                            </div>
                    }
                </div>
            </div>

            <DndProvider backend={ isMobile ? TouchBackend : HTML5Backend }>
                <div className="h-full flex flex-col justify-center items-center grow">
                    <div className="box-border flex flex-col mb-4" style={{ width: `${ tileSize*6 }px`, height: `${ tileSize*6 }px` }}>
                        { 
                            game ? game.MoreData.Board.map((row, rIdx) => 
                                <div key={ rIdx } className="w-full h-full flex">
                                    {
                                        row.map((el, cIdx) => 
                                            <DropSpace key={ cIdx } row={ rIdx } col={ cIdx }>
                                                <div className="box-border border border-zinc-100" style={{ width: `${tileSize}px`, height: `${tileSize}px` }}>
                                                    { 
                                                        el ? 
                                                            <Tile edges={ el.Edges } paths={ el.Paths } row={ rIdx } col={ cIdx } tokens={ game.MoreData.Tokens } team={ null } placeTile={ () => {} }/> : 
                                                            <Tile edges={ null } paths={ null } row={ rIdx } col={ cIdx } tokens={ game.MoreData.Tokens } team={ null } placeTile={ () => {} }/> 
                                                    }
                                                </div>
                                            </DropSpace>) 
                                    }
                                </div>) : null
                        }
                    </div>

                    <div className="mb-4 w-full flex justify-between items-center" style={{ height: `${tileSize}px` }}>
                        <div className="flex flex-col items-center text-zinc-400 max-w-[20%]">
                            <div className="text-xs font-light italic mb-1 text-center">Click tile to rotate</div>
                            <BsArrowClockwise />    
                        </div>       
                        {
                            [0, 1, 2].map((_, idx) => 
                                <div key={ idx } className="box-border border border-zinc-100" style={{ width: `${ tileSize }px`, height: `${ tileSize }px` }}>
                                    { 
                                        game && network && connected && game.MoreData.Hands[connected[network.Name]] && game.MoreData.Hands[connected[network.Name]].length > idx ? 
                                            <div className="cursor-pointer" onClick={ () => rotateTile(connected[network.Name], game.MoreData.Hands[connected[network.Name]][idx].Edges) }>
                                                <Tile edges={ game.MoreData.Hands[connected[network.Name]][idx].Edges } paths={ game.MoreData.Hands[connected[network.Name]][idx].Paths } row={ -1 } col={ -1 } tokens={ {} } team={ connected[network.Name] } placeTile={ placeTile } />
                                            </div> : 
                                            null
                                    }
                                </div>) 
                        }
                        <div className="flex flex-col items-center text-zinc-400 max-w-[20%]">
                            <div className="text-xs font-light italic mb-1 text-center">Drag tile to place</div>
                            <BsArrowUp />    
                        </div>
                    </div>
                </div>
            </DndProvider>

            <hr className="w-full mb-2"/>
            <div className="w-full flex justify-between items-center">
                <div className="title leading-4 text-2xl font-black text-red-600 cursor-pointer">
                    <a href={ `${ window.location.protocol }//${ window.location.host }` }>Tsuro</a>
                </div>
                <div className="flex">
                    <div className="px-3 py-1 font-bold cursor-pointer flex items-center justify-center text-xs bg-zinc-600" onClick={ () => resetGame() }>new game</div>
                </div>
            </div>
        </div>
        )
}
