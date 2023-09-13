export const CONFIG = {
    // server attributes
    host: process.env.REACT_APP_HOST,
    websocket: process.env.REACT_APP_WEBSOCKET,

    // game attributes
    key: "Tsuro",
    variants: {
      "Classic": "standard Tsuro.",
      "Longest Path": "player with the longest path wins.",
      "Most Crossings": "player whose path crosses itself the most wins.",
      "Open Tiles": "players place tiles from a common pool.",
      "Solo": "place all the tiles while keeping every token alive."
    },
    minTeams: 2,
    maxTeams: 8,
  
    // styling attributes
    font: "coquette",
    color: "red-600",

    // misc attributes
    gamePageMaxWidth: "max-w-xl"
  }
  