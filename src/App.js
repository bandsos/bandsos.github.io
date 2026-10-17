import React, { useState, useEffect } from "react";

import Map from "./components/Map";
import BasicNavbar from "./components/Navbar";
import TimeSlider from "./components/TimeSlider";
import Maintenance from "./components/Maintenance";

import NewNavbar from "./molecules/rkNavbar";
import NewTimeSlider from "./molecules/rkTimeSlider";

import config from "./config";

// Stylesheets
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Alert, Container } from "react-bootstrap";

//run command: npm start

/*
  Rounaq WTF comments:
  - Layer Control is pretty tricky. But they don't go to the highest possible numerical z-index: 2147483647
  - what is <output> tag in TimeSlider.js? 
  
*/

// The main application
export default function App() {
  console.log('Site config', config);

  // Load platform status
  const [platformStatus, setPlatformStatus] = useState({"available":false, "data":{}});
  useEffect( () => {
    // const platformStatusUrl = config.dataurl + '/status/status.json'; // FIXME
    const platformStatusUrl = 'https://raw.githubusercontent.com/bandsos/status/refs/heads/main/status.json';
    fetch(platformStatusUrl)
    .then( async response => {
      const data = await response.json();
      
      if (!response.ok) {
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
      }

      setPlatformStatus({"available":true, "data":data});
    })
    .catch(error => {
      setPlatformStatus({errormessage: error.toString()});
      console.error('Error loading manifest from ', platformStatusUrl);
    });
  }, []);

  console.log('Platform status: ', platformStatus);

  // Forecast date and time selection in <Navbar>
  const [selectedforecast, setSelectedForecast] = useState({
    "downloaded": false,
    "date": config.fallback_forecast.date,
    "cycle": config.fallback_forecast.cycle,
    "dataurl": config.dataurl,
    "folder": `${config.fallback_forecast.date.replaceAll("-","")}${config.fallback_forecast.cycle}`
  });

  // Checking if cycle is passed
  const queryParameters = new URLSearchParams(window.location.search);
  const urlCycle = queryParameters.get("cycle");

  useEffect( () => {
    if (urlCycle != null) {
      setSelectedForecast({
        "downloaded": true,
        "date": `${urlCycle.substring(0, 4)}-${urlCycle.substring(4, 6)}-${urlCycle.substring(6, 8)}`,
        "cycle": urlCycle.substring(8, 10),
        "dataurl": config.dataurl,
        "folder": urlCycle
      })
    }
    else if (platformStatus.available) {
      setSelectedForecast({
        "downloaded": true,
        "date": platformStatus.data.lastforecast.date,
        "cycle": platformStatus.data.lastforecast.cycle,
        "dataurl": config.dataurl,
        "folder": `${platformStatus.data.lastforecast.date.replaceAll("-","")}${platformStatus.data.lastforecast.cycle}`
      });
    }
  }, [platformStatus]);

  console.log('Selected forecast', selectedforecast);

  // forecast manifest
  const [forecast, setForecast] = useState({"available":false, "payload":{}});
  useEffect( () => {
    // Updating manifest for the selected forecast
    const manifestUrl = selectedforecast.dataurl + '/' +  selectedforecast.folder + '/' +  'manifest.json';
    fetch(manifestUrl)
    .then( async response => {
      const data = await response.json();
      
      if (!response.ok) {
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
      }

      setForecast({available: true, payload: data});
    })
    .catch(error => {
      setForecast({errormessage: error.toString()});
      console.error('Error loading manifest from ', selectedforecast.url);
    });
  }, [selectedforecast]);

  // Forecast layer selection from water level forecast <TimeSlider>
  const [timestep, setTimestep] = useState({
    folder: selectedforecast.folder
  });
  const [mapStatus, setMapStatus] = useState({ folder: null, errorCount: 0 });
  useEffect( () => {
    setTimestep({"folder":selectedforecast.folder})
  }, [selectedforecast]);
  const mapRequestBase = forecast.available
    ? `${selectedforecast.dataurl}/${forecast.payload.cycle}/${forecast.payload.forecasts.elev.src}/${forecast.payload.forecasts.elev.layers[0].type}/`
    : "";

  return (
    <>
    <div id="wrapper">
      <header id="header">
        <BasicNavbar
          sitename={config.sitename}
          navbar={config.navbar}
          forecast={selectedforecast}
          setForecast={setSelectedForecast}
          cycles={config.cycles}
          maxForecast={platformStatus.available ? platformStatus.data.lastforecast : null}
        >
        </BasicNavbar>
        {/* <NewNavbar></NewNavbar> */}
      </header>
      
      {
        forecast.available
        ? <>
          <main id="content">
            <Map
              dataurl={selectedforecast.dataurl}
              config={config.map}
              forecast={forecast.payload}
              timestep={timestep}
              mapRequestBase={mapRequestBase}
              onTileLayerSettled={(requestKey, errorCount) => setMapStatus({ requestKey, errorCount })}
            />
          </main>
          <footer id="onTop">
            <TimeSlider
              forecast={forecast.payload}
              setTimestep={setTimestep}
              mapRequestBase={mapRequestBase}
              cycleStartTime={`${selectedforecast.date} ${selectedforecast.cycle}:00:00`}
              mapStatus={mapStatus}
            />
          </footer>
          </>
        : <main id="content"><Container>
          <Alert className="" variant="danger" key="danger">
            Forecast for {selectedforecast.date} cycle {selectedforecast.cycle} not available!
            </Alert>
          </Container></main>
      }
    </div>

    {/* Hotfix warning; Uncomment the following */}
    {/* <Maintenance
        show={modalShow}
        onHide={() => setModalShow(false)}
      /> */}
    </>
  );
}

// const styles = StyleSheet.create({
// });