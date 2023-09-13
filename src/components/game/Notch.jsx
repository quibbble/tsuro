import React from "react";

export default function Notch({ notch, color }) {
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
