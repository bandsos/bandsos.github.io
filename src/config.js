import logo from "./assets/icons/logo.png";

const dataurl = (
    import.meta.env.VITE_DATA_URL ??
    (import.meta.env.DEV ? "https://coastal.ffwc.gov.bd" : "")
).replace(/\/+$/, "");
const statusurl = import.meta.env.VITE_STATUS_URL ??
    "https://raw.githubusercontent.com/bandsos/status/refs/heads/main/status.json";

let config = {
    "sitename":"BandSOS",
    dataurl,
    statusurl,
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
