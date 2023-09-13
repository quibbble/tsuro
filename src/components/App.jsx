import React, { useState, useRef, createRef } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { GamePage, HomePage, DownPage } from "@quibbble/boardgame";
import { CONFIG } from "./config";
import { Game } from "./game/Game";

export default function App() {
    const ref = createRef();
    const ws = useRef();

    const [game, setGame] = useState();
    const [network, setNetwork] = useState();
    const [chat, setChat] = useState([]);
    const [connected, setConnected] = useState();
    const [error, setError] = useState();
  
    return (
      <BrowserRouter>
        <Routes>
          <Route exact path="/:gameID" element=
            { 
              <GamePage config={ CONFIG }
                ref={ ref } ws={ ws }
                game={ game } setGame={ setGame }
                network={ network } setNetwork={ setNetwork }
                chat={ chat } setChat={ setChat }
                connected={ connected } setConnected={ setConnected }
                error={ error } setError={ setError }>
                  <Game ref={ ref } ws={ ws }
                    game={ game } network={ network } 
                    chat={ chat } connected={ connected } error={ error } />
              </GamePage>
            }
          />
          <Route exact path="/status/down" element={ <DownPage config={ CONFIG } /> }/>
          <Route path="/" element={ <HomePage config={ CONFIG } /> } />
        </Routes>
      </BrowserRouter>
    );
  }
