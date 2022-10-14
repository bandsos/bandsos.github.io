import React, { useState, useEffect } from "react";

import Map from "./components/Map";
import BasicNavbar from "./components/Navbar";
import TimeSlider from "./components/TimeSlider";

import config from "./config";

// Stylesheets
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Alert, Container } from "react-bootstrap";

// The main application
export default function App() {
  // Site configuration
  console.log(Date.now(), " site configuration", config);

  // Forecast date and time selection in <Navbar>
  const [selectedforecast, setSelectedForecast] = useState({
    date: config.status.forecast.lastforecast.date,
    cycle: config.status.forecast.lastforecast.cycle,
    dataurl: config.dataurl,
    folder: `${config.status.forecast.lastforecast.date.replaceAll("-","")}${config.status.forecast.lastforecast.cycle}`
  });

  // forecast manifest
  const [forecast, setForecast] = useState({});
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

  return (
    <div id="wrapper">
      <div id="header">
        <BasicNavbar
          sitename={config.sitename}
          navbar={config.navbar}
          forecast={selectedforecast}
          setForecast={setSelectedForecast}
          cycles={config.status.forecast.cycles}
        ></BasicNavbar>
      </div>

      {
        forecast.available
        ? <div id="content">
          <Map
            dataurl={selectedforecast.dataurl}
            config={config.map}
            forecast={forecast.payload}
            timestep={timestep}
          ></Map>
          </div>
        : <Container>
          <Alert className="" variant="danger" key="danger">
            Forecast for {selectedforecast.date} cycle {selectedforecast.cycle} not available!
            </Alert>
          </Container>
      }

      { forecast.available
        ? <TimeSlider forecast={forecast.payload} setTimestep={setTimestep}></TimeSlider>
        : <></>
      }
    </div>
  );
}
