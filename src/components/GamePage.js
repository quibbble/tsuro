import React, { useEffect, useRef, useState } from "react";
import { BsArrowClockwise, BsArrowUp, BsArrowLeft } from "react-icons/bs";
import { CONFIG } from "../components/Config";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { useHistory } from "react-router-dom"
import { useParams } from "react-router-dom"
import { isMobile } from 'react-device-detect';

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
        ws.current = new WebSocket(`ws${ CONFIG.scheme }://${ CONFIG.host }/game/join?GameKey=Tsuro&GameID=${ gid }`);
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

    // trigger used to force a refresh of the page to check for potential need to display unsupported screen
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
                <div className="coquette leading-4 text-2xl font-black text-red-600 cursor-pointer">
                    <a href={ `${ window.location.protocol }//${ window.location.host }` }>Tsuro</a>
                </div>
                <div className="flex">
                    <div className="px-3 py-1 font-bold cursor-pointer flex items-center justify-center text-xs bg-zinc-600" onClick={ () => resetGame() }>new game</div>
                </div>
            </div>
        </div>
        )
}

function Notch({ notch, color }) {
    switch (notch) {
        case "A":
            return <circle className={ color } cx="25" cy="5" r="5"/>;
        case "B":
            return <circle className={ color } cx="50" cy="5" r="5"/>;
        case "C":
            return <circle className={ color } cx="70" cy="25" r="5"/>;
        case "D":
            return <circle className={ color } cx="70" cy="50" r="5"/>;
        case "E":
            return <circle className={ color } cx="50" cy="70" r="5"/>;
        case "F":
            return <circle className={ color } cx="25" cy="70" r="5"/>;
        case "G":
            return <circle className={ color } cx="5" cy="50" r="5"/>;
        case "H":
            return <circle className={ color } cx="5" cy="25" r="5"/>;
        default:
            return <path/>;
    }
}

function Edge({ edge, color }) {
    switch (true) {
        case edge === "AB" || edge === "BA":
            return <path className={ color } d="M37.5,19.54c-11.07,0-14-12.78-14-19.54h3c0,.67.15,16.54,11,16.54S48.5.67,48.5,0h3C51.5,6.76,48.57,19.54,37.5,19.54Z"/>;
        case edge === "AC" || edge === "CA":
            return <path className={ color } d="M75,26.51C24.08,26.51,23.5,1.09,23.5,0h3c0,.06.13,5.88,6,11.63C38,17.05,49.89,23.51,75,23.51Z"/>;
        case edge === "AD" || edge === "DA":
            return <path className={ color } d="M75,51.5c-26.59,0-39.2-14-45.09-25.83A63.14,63.14,0,0,1,23.5,0h3a61.37,61.37,0,0,0,6.14,24.42c8,16,22.28,24.08,42.36,24.08Z"/>;
        case edge === "AE" || edge === "EA":
            return <path className={ color } d="M48.5,75h3c0-25.67-3.9-29.56-12.46-38.08l-1-1C26.5,24.38,26.5,23.92,26.5,0h-3c0,24.17,0,25.62,12.44,38.06l1,1C45.35,47.43,48.5,50.57,48.5,75Z"/>;
        case edge === "AF" || edge === "FA":
            return <rect className={ color } x="23.5" width="3" height="75"/>;
        case edge === "AG" || edge === "GA":
            return <path className={ color } d="M26.51,0C26.51,50.92,1.09,51.5,0,51.5v-3c.06,0,5.88-.13,11.63-6C17.05,37,23.51,25.11,23.51,0Z"/>;
        case edge === "AH" || edge === "HA":
            return <path className={ color } d="M26.5,0C26.5,26.2.27,26.5,0,26.5v-3c1,0,23.5-.33,23.5-23.5Z"/>;
        case edge === "BC" || edge === "CB":
            return <path className={ color } d="M75,26.5C48.8,26.5,48.5.27,48.5,0h3c0,1,.33,23.5,23.5,23.5Z"/>;
        case edge === "BD" || edge === "DB":
            return <path className={ color } d="M48.49,0c0,50.92,25.42,51.5,26.5,51.5v-3c-.06,0-5.88-.13-11.63-6C58,37,51.49,25.11,51.49,0Z"/>;
        case edge === "BE" || edge === "EB":
            return <rect className={ color } x="48.5" width="3" height="75"/>;
        case edge === "BF" || edge === "FB":
            return <path className={ color } d="M26.5,75h-3c0-25.67,3.9-29.56,12.46-38.08l1-1C48.5,24.38,48.5,23.92,48.5,0h3c0,24.17,0,25.62-12.44,38.06l-1,1C29.65,47.43,26.5,50.57,26.5,75Z"/>;
        case edge === "BG" || edge === "GB":
            return <path className={ color } d="M51.5,0c0,26.59-14,39.2-25.83,45.09A63.14,63.14,0,0,1,0,51.5v-3a61.37,61.37,0,0,0,24.42-6.14C40.4,34.33,48.5,20.08,48.5,0Z"/>;
        case edge === "BH" || edge === "HB":
            return <path className={ color } d="M0,26.51C50.92,26.51,51.5,1.09,51.5,0h-3c0,.06-.13,5.88-6,11.63C37,17.05,25.11,23.51,0,23.51Z"/>;
        case edge === "CD" || edge === "DC":
            return <path className={ color } d="M55.46,37.5c0-11.07,12.78-14,19.54-14v3c-.67,0-16.54.15-16.54,11s15.87,11,16.54,11v3C68.24,51.5,55.46,48.57,55.46,37.5Z"/>;
        case edge === "CE" || edge === "EC":
            return <path className={ color } d="M48.49,75c0-50.92,25.42-51.5,26.5-51.5v3c-.06,0-5.88.13-11.63,6C58,38,51.49,49.89,51.49,75Z"/>;
        case edge === "CF" || edge === "FC":
            return <path className={ color } d="M23.5,75c0-26.59,14-39.2,25.83-45.09A63.14,63.14,0,0,1,75,23.5v3a61.37,61.37,0,0,0-24.42,6.14C34.6,40.67,26.5,54.92,26.5,75Z"/>;
        case edge === "CG" || edge === "GC":
            return <path className={ color } d="M0,48.5v3c25.67,0,29.56-3.9,38.08-12.46l1-1C50.62,26.5,51.08,26.5,75,26.5v-3c-24.17,0-25.62,0-38.06,12.44l-1,1C27.57,45.35,24.43,48.5,0,48.5Z"/>;
        case edge === "CH" || edge === "HC":
            return <rect className={ color } y="23.5" width="75" height="3"/>;
        case edge === "DE" || edge === "ED":
            return <path className={ color } d="M48.5,75c0-26.2,26.23-26.5,26.5-26.5v3c-1,0-23.5.33-23.5,23.5Z"/>;
        case edge === "DF" || edge === "FD":
            return <path className={ color } d="M75,48.49c-50.92,0-51.5,25.42-51.5,26.5h3c0-.06.13-5.88,6-11.63C38,58,49.89,51.49,75,51.49Z"/>;
        case edge === "DG" || edge === "GD":
            return <rect className={ color } y="48.5" width="75" height="3"/>;
        case edge === "DH" || edge === "HD":
            return <path className={ color } d="M0,26.5v-3c25.67,0,29.56,3.9,38.08,12.46l1,1C50.62,48.5,51.08,48.5,75,48.5v3c-24.17,0-25.62,0-38.06-12.44l-1-1C27.57,29.65,24.43,26.5,0,26.5Z"/>;
        case edge === "EF" || edge === "FE":
            return <path className={ color } d="M37.5,55.46c11.07,0,14,12.78,14,19.54h-3c0-.67-.15-16.54-11-16.54S26.5,74.33,26.5,75h-3C23.5,68.24,26.43,55.46,37.5,55.46Z"/>;
        case edge === "EG" || edge === "GE":
            return <path className={ color } d="M0,48.49c50.92,0,51.5,25.42,51.5,26.5h-3c0-.06-.13-5.88-6-11.63C37,58,25.11,51.49,0,51.49Z"/>;
        case edge === "EH" || edge === "HE":
            return <path className={ color } d="M0,23.5c26.59,0,39.2,14,45.09,25.83A63.14,63.14,0,0,1,51.5,75h-3a61.37,61.37,0,0,0-6.14-24.42C34.33,34.6,20.08,26.5,0,26.5Z"/>;
        case edge === "FG" || edge === "GF":
            return <path className={ color } d="M0,48.5c26.2,0,26.5,26.23,26.5,26.5h-3c0-1-.33-23.5-23.5-23.5Z"/>;
        case edge === "FH" || edge === "HF":
            return <path className={ color } d="M26.51,75C26.51,24.08,1.09,23.5,0,23.5v3c.06,0,5.88.13,11.63,6C17.05,38,23.51,49.89,23.51,75Z"/>;
        case edge === "GH" || edge === "HG":
            return <path className={ color } d="M19.54,37.5c0,11.07-12.78,14-19.54,14v-3c.67,0,16.54-.15,16.54-11S.67,26.5,0,26.5v-3C6.76,23.5,19.54,26.43,19.54,37.5Z"/>;
        default:
            return <path/>;
    }
}

function Tile({ edges, paths, row, col, tokens, team, placeTile }) {
    const [notches, setNotches] = useState([]);
    useEffect(() => {
        let temp = [];
        Object.keys(tokens).forEach(team => {
            if (tokens[team]["Row"] === row && tokens[team]["Col"] === col) temp.push(<Notch key={team} notch={tokens[team]["Notch"]} color={`fill-${team}-500`}/>);
        });
        setNotches(temp)
    }, [row, col, tokens]);

    const [hideTile, setHideTile] = useState(false);
    const [{isDragging}, drag] = useDrag(() => ({
        type: "tile",
        item: { edges },
        canDrag: () => row < 0 && col < 0,
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) placeTile(team, dropResult.row, dropResult.col, edges);
            setHideTile(false);
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
            handlerId: monitor.getHandlerId(),
        }),
    }), [edges, team]);

    useEffect(() => {
        if (isDragging) setHideTile(true);
    }, [isDragging]);

    return (
        hideTile ?
            <span/> :
            <div ref={drag}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75">
                    {
                        edges ?
                        [0, 2, 4, 6].map(idx => {
                            const edge = edges[idx]+edges[idx+1];
                            const t1 = paths[edge];
                            const t2 = paths[edge[1]+edge[0]];
                            return <Edge key={ idx } edge={ edge } color={ t1 ? `fill-${t1}-500` : t2 ? `fill-${t2}-500` : `fill-zinc-100` } />
                        }) : null
                    }
                    { notches.map(n => n) }
                </svg>
            </div>
    )
}

function DropSpace({row, col, children}) {
    const [, drop] = useDrop(() => ({
        accept: "tile",
        drop: () => ({ row: row, col: col }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));
    return (
        <div ref={drop}>{children}</div>
    )
}
