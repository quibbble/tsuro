import React, { useState, useEffect, forwardRef, useCallback } from "react";
import { BsArrowClockwise, BsArrowUp } from "react-icons/bs";
import DropSpace from "./DropSpace";
import { DraggableTile, Tile } from "./Tile";
import { DndContext, PointerSensor, useSensors, useSensor } from '@dnd-kit/core';

export const Game = forwardRef((props, ref) => {
    // eslint-disable-next-line no-unused-vars
    const { ws, game, network, chat, connected, error } = props;

    // websocket messages
    const sendSetTeamAction = useCallback((team) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "SetTeam", "MoreDetails": {"Team": team}}));
    }, [ws])

    const sendPlaceTileAction = useCallback((team, row, col, tile) => {
        if (!ws.current) return;
        console.log({"ActionType": "PlaceTile", "Team": team, "MoreDetails": {"Row": row, "Column": col, "Tile": tile}})
        ws.current.send(JSON.stringify({"ActionType": "PlaceTile", "Team": team, "MoreDetails": {"Row": row, "Column": col, "Tile": tile}}));
    }, [ws])

    const sendRotateTileAction = useCallback((team, tile) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "RotateTileRight", "Team": team, "MoreDetails": {"Tile": tile}}));
    }, [ws])

    // game data
    const [team, setTeam] = useState();
    useEffect(() => {
        if (connected && network) setTeam(connected[network.Name])
    }, [connected, network])

    const [hand, setHand] = useState([]);
    useEffect(() => {
        if (!(team && game && game.MoreData && game.MoreData.Hands && game.MoreData.Hands[team])) return 
        setHand(game.MoreData.Hands[team])
    }, [game, team])

    // change teams every turn for solo variant
    useEffect(() => {
        if (team && game && game.MoreData.Variant === "Solo" && team !== game.Turn) {
            sendSetTeamAction(game.Turn)
        }
    }, [game, team, sendSetTeamAction])

    // drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const handleDragEnd = useCallback((e) => {
        if (!e.over || team !== game.Turn || game.Winners.length > 0) return
        sendPlaceTileAction(team, e.over.data.current.row, e.over.data.current.col, e.active.data.current.edges)
    }, [team, game, sendPlaceTileAction])

    // board resize logic
    const [tileSize, setTileSize] = useState(0);

    const handleResize = useCallback(() => {
        const width = 6;
        if (!ref || !ref.current) return;
        else setTileSize(ref.current.clientWidth/width);
    }, [ref])

    useEffect(() => handleResize());

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize)
    }, [handleResize]);

    return (
        <DndContext onDragEnd={ handleDragEnd } sensors={ sensors }>
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
                                                        <Tile edges={ el.Edges } paths={ el.Paths } row={ rIdx } col={ cIdx } tokens={ game.MoreData.Tokens } /> : 
                                                        <Tile edges={ null } paths={ null } row={ rIdx } col={ cIdx } tokens={ game.MoreData.Tokens } /> 
                                                }
                                            </div>
                                        </DropSpace>) 
                                }
                            </div>) : null
                    }
                </div>

                <div className="mb-4 w-full flex justify-between items-center" style={{ height: `${tileSize}px` }}>
                    <div className="flex flex-col items-center text-zinc-400 max-w-[20%] select-none">
                        <div className="text-xs font-light italic mb-1 text-center">Click tile to rotate</div>
                        <BsArrowClockwise />    
                    </div>       
                    {
                        [0, 1, 2].map((_, idx) => 
                            <div key={ idx } className="box-border border border-zinc-100" style={{ width: `${ tileSize }px`, height: `${ tileSize }px` }}>
                                { 
                                    hand.length > idx ? 
                                        <div className="cursor-pointer" onClick={ () => game.Winners.length === 0 ? sendRotateTileAction(team, hand[idx].Edges) : null }>
                                            { <DraggableTile id={ idx+1 } edges={ hand[idx].Edges } paths={ hand[idx].Paths } row={ -1 } col={ -1 } tokens={ {} } /> }
                                        </div> : null
                                }
                            </div>) 
                    }
                    <div className="flex flex-col items-center text-zinc-400 max-w-[20%] select-none">
                        <div className="text-xs font-light italic mb-1 text-center">Drag tile to place</div>
                        <BsArrowUp />    
                    </div>
                </div>
            </div>
        </DndContext>
)})
