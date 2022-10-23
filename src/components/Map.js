import React, {useEffect, useRef} from 'react';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  ScaleControl,
  Marker,
  LayerGroup,
  Popup,
  Tooltip
} from "react-leaflet";

import { icon, latLng, latLngBounds } from "leaflet";
import DyGraph from "./Graph";
import Colorbar from './Colorbar';

import marker_level from "../assets/icons/level.svg";
const icon_level = icon({
  iconUrl: marker_level,
  iconSize: [24, 24]
});

// Main component
function Map({dataurl, config, forecast, timestep}) {

  console.log("From Map container", config, forecast, timestep);

  // const ref = useRef(null);
  // const waterLevelsUrl = props.forecast.url + '/' + props.forecast.folder + '/' + props.forecast.branch + '/waterlevels/'
  // const waterLevelsUrl = props.forecast.url + '/' + props.forecast.folder + '/forecasts/elev/tiles'
  // const stationUrl = props.forecast.url + '/' + props.forecast.folder + '/forecasts/elev/stations'
  // const layerUrl = waterLevelsUrl + props.layer.folder + "/{z}/{x}/{y}.png";
  const tileurl = dataurl + '/' + forecast.cycle + '/' + forecast.forecasts.elev.src + '/' + forecast.forecasts.elev.layers[0].type + '/' + timestep.folder + "/{z}/{x}/{y}.png";

  console.log(tileurl);

  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.setUrl(tileurl);
    }
  }, [tileurl]);

  return (
    <MapContainer
      // key={props.forecast.date + props.forecast.cycle}
      center={config.center}
      bounds={latLngBounds(latLng(config.bounds.south, config.bounds.west), latLng(config.bounds.north, config.bounds.east))}
      zoom={config.zoom}
      scrollWheelZoom={true}
      minZoom={config.minzoom}
      maxZoom={config.maxzoom}
      style={{ width: "100vw", height: "100%"}}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OSM - Standard">
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            zIndex={1}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="ESRI Satellite">
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            zIndex={1}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {
        forecast.forecasts.elev.layers[1].stations.map( (station) => (
          <Marker
            key={station.ID}
            position={[station.Lat, station.Lon]}
            icon={icon_level}
          >
            <Popup maxWidth={"80%"}>
              <Tooltip>
                Station ID: {station.ID} <br />
                Station Name: {station.Name} <br />
                Longitude: {station.Lon} <br />
                Latitude: {station.Lat} <br />
              </Tooltip>
              <DyGraph
              url={dataurl + '/' + forecast.cycle + '/' + forecast.forecasts.elev.src + '/' + forecast.forecasts.elev.layers[1].type + '/' + station.ID + '.csv'}
              title={station.Name + ' - ' + station.Organization}
              />
            </Popup>
          </Marker>  
        ))
      }
      
      <TileLayer
        url={tileurl}
        tms={true}
        opacity={1}
        zIndex={10}
        ref={ref}
      ></TileLayer>

      <Colorbar 
        position="bottomright" 
        colorbar={dataurl + '/' + forecast.cycle + '/' + forecast.forecasts.elev.src + '/' + forecast.forecasts.elev.layers[0].type + '/' + 'colorbar.png'}>
      </Colorbar>
      
      <ScaleControl
        position="bottomleft"
        metric={true}
        imperial={true}
        maxWidth={200}
      ></ScaleControl>
    </MapContainer>
  );
}

export default Map;
