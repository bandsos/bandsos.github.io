import logo from "./assets/icons/logo.png";

let config = {
    "sitename":"BandSOS",
    "dataurl":"https://bandsos.github.io",
    "map":{
        "bounds":{
            "east":93,
            "west":87,
            "south":20,
            "north":25
        },
        "minzoom":6,
        "maxzoom":10,
        "stationSearchZoom":10
    },
    "navbar":{
        "branding":{
            "icon": logo
        },
    },
    "cycles":["00", "06", "12", "18"],
    "fallback_forecast":{
        date: '2022-10-01',
        cycle: '00'
    }
}

export default config;
