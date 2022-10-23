import logo from "./assets/icons/logo.png";

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
    "cycles":["00", "06", "12", "18"],
    "fallback_forecast":{
        date: '2020-05-17',
        cycle: '00'
    }
}

export default config;
