import React, { useEffect, useState } from "react";
import Notch from "./Notch";
import Edge from "./Edge";
import { useDrag } from "react-dnd";

export default function Tile({ edges, paths, row, col, tokens, team, placeTile }) {
    const [notches, setNotches] = useState([]);
    useEffect(() => {
        let temp = [];
        Object.keys(tokens).forEach(team => {
            if (tokens[team]["Row"] === row && tokens[team]["Col"] === col) temp.push(<Notch key={team} notch={tokens[team]["Notch"]} color={`fill-${team}-500`}/>);
        });
        setNotches(temp)
    }, [row, col, tokens]);

    const [{opacity}, drag, preview] = useDrag(() => ({
        type: "tile",
        item: { edges },
        canDrag: () => row < 0 && col < 0,
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) placeTile(team, dropResult.row, dropResult.col, edges);
        },
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.4 : 1,
        }),
    }), [edges, team]);

    return (
        <div ref={ preview }>
            <div ref={ drag } style={{ opacity }} className={ edges ? "bg-zinc-900" : "" }>
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
        </div>
    )
}
