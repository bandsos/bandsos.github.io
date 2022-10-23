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
  console.log('Site config', config);

  // Load platform status
  const [platformStatus, setPlatformStatus] = useState({"available":false, "data":{}});
  useEffect( () => {
    const platformStatusUrl = config.dataurl + '/status/status.json';
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
    date: config.fallback_forecast.date,
    cycle: config.fallback_forecast.cycle,
    dataurl: config.dataurl,
    folder: `${config.fallback_forecast.date.replaceAll("-","")}${config.fallback_forecast.cycle}`
  });
  useEffect( () => {
    if (platformStatus.available) {
      setSelectedForecast({
        date: platformStatus.data.lastforecast.date,
        cycle: platformStatus.data.lastforecast.cycle,
        dataurl: config.dataurl,
        folder: `${platformStatus.data.lastforecast.date.replaceAll("-","")}${platformStatus.data.lastforecast.cycle}`
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
  }, [platformStatus, selectedforecast]);

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
          cycles={config.cycles}
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
          <TimeSlider forecast={forecast.payload} setTimestep={setTimestep}></TimeSlider>
          </div>
        : <Container>
          <Alert className="" variant="danger" key="danger">
            Forecast for {selectedforecast.date} cycle {selectedforecast.cycle} not available!
            </Alert>
          </Container>
      }
    </div>
  );
}
