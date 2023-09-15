import React, { useState, useEffect, forwardRef, useCallback } from "react";
import { BsArrowClockwise, BsArrowUp } from "react-icons/bs";
import { DndProvider } from "react-dnd";
import DropSpace from "./DropSpace";
import { HTML5Backend } from "react-dnd-html5-backend";
import Tile from "./Tile";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile } from "react-device-detect";

export const Game = forwardRef((props, ref) => {
    // eslint-disable-next-line no-unused-vars
    const { ws, game, network, chat, connected, error } = props;

    const placeTile = (team, row, col, tile) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "PlaceTile", "Team": team, "MoreDetails": {"Row": row, "Column": col, "Tile": tile}}));
    }

    const rotateTile = (team, tile) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "RotateTileRight", "Team": team, "MoreDetails": {"Tile": tile}}));
    }

    useEffect(() => {
        const setTeam = (team) => {
            if (!ws.current) return;
            ws.current.send(JSON.stringify({"ActionType": "SetTeam", "MoreDetails": {"Team": team}}));
        }
        if (game && network && connected && game.MoreData.Variant === "Solo" && connected[network.Name] !== game.Turn) {
            setTeam(game.Turn)
        }
    }, [game, network, connected, ws])

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
)})
