import logo from "./assets/icons/logo.png";
import status from "./status.json";

let config = {
    "sitename":"BandSOS",
    "dataurl":"https://jamalkhan.me",
    "map":{
        "mapcenter":[22, 90], // [lat, long], Bangladesh
        "bounds":{
            "east":85,
            "west":95,
            "south":20,
            "north":24
        },
        "zoom":9,
        "minzoom":6,
        "maxzoom":10
    },
    "navbar":{
        "branding":{
            "icon": logo
        },
    },
    "status": status,
}

export default config;
