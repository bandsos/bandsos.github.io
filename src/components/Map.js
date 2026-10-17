import React, {useEffect, useRef, useState} from 'react';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  LayerGroup,
  ScaleControl,
  Marker,
  ZoomControl,
  useMap
} from "react-leaflet";

import { icon, latLng, latLngBounds } from "leaflet";
import DyGraph from "./Graph";
import Colorbar from './Colorbar';
import shsData from "../assets/data/coastal_ssvi_data.json";
import SocialDataLayer from './SocialDataLayer';
import "./Map.css";
import { Modal } from "react-bootstrap";

import marker_level from "../assets/icons/level.svg";
const icon_level = icon({
  iconUrl: marker_level,
  iconSize: [24, 24]
});

function InvalidateMapSize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frame;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    });

    resizeObserver.observe(container);
    map.invalidateSize({ pan: false });

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [map]);

  return null;
}

// Main component
function Map({dataurl, config, forecast, timestep, mapRequestBase, onTileLayerSettled}) {
  const [selectedStation, setSelectedStation] = useState(null);
  const timeseriesFilename = selectedStation
    ? `bandsos-${forecast.cycle}-${selectedStation.ID}-${selectedStation.Name}`
    : "";

  console.log("From Map container", config, forecast, timestep);
  console.log(shsData);

  // const ref = useRef(null);
  // const waterLevelsUrl = props.forecast.url + '/' + props.forecast.folder + '/' + props.forecast.branch + '/waterlevels/'
  // const waterLevelsUrl = props.forecast.url + '/' + props.forecast.folder + '/forecasts/elev/tiles'
  // const stationUrl = props.forecast.url + '/' + props.forecast.folder + '/forecasts/elev/stations'
  // const layerUrl = waterLevelsUrl + props.layer.folder + "/{z}/{x}/{y}.png";
  const requestKey = `${mapRequestBase}${timestep.folder}`;
  const tileurl = `${requestKey}/{z}/{x}/{y}.png`;

  console.log(tileurl);

  const requestedKeyRef = useRef(requestKey);
  requestedKeyRef.current = requestKey;
  const tileErrorsRef = useRef({ requestKey, count: 0 });
  if (tileErrorsRef.current.requestKey !== requestKey) {
    tileErrorsRef.current = { requestKey, count: 0 };
  }
  const stationTimeseriesUrl = selectedStation
    ? `${dataurl}/${forecast.cycle}/${forecast.forecasts.elev.src}/${forecast.forecasts.elev.layers[1].type}/${selectedStation.ID}.csv`
    : null;

  const tileEventHandlers = {
    tileerror: () => {
      if (requestedKeyRef.current === requestKey) {
        tileErrorsRef.current.count += 1;
      }
    },
    load: () => {
      if (requestedKeyRef.current === requestKey) {
        onTileLayerSettled(requestKey, tileErrorsRef.current.count);
      }
    }
  };

  return (
    <>
    <MapContainer
      // key={props.forecast.date + props.forecast.cycle}
      center={config.center}
      bounds={latLngBounds(latLng(config.bounds.south, config.bounds.west), latLng(config.bounds.north, config.bounds.east))}
      zoom={config.zoom}
      scrollWheelZoom={true}
      zoomControl={false}
      minZoom={config.minzoom}
      maxZoom={config.maxzoom}
      style={{ width: "100%", height: "100%"}}
    >
      <InvalidateMapSize />

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

        <LayersControl.Overlay checked name="Forecast Stations">
        <LayerGroup>
            {
            forecast.forecasts.elev.layers[1].stations.map( (station) => (
              <Marker
                key={station.ID}
                position={[station.Lat, station.Lon]}
                icon={icon_level}
                eventHandlers={{
                  click: () => setSelectedStation(station)
                }}
              >
              </Marker>  
            ))
          }
        </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Social Indicators">
          <SocialDataLayer data={shsData}></SocialDataLayer>
        </LayersControl.Overlay>

      </LayersControl>

      <ZoomControl position="topright" />
      
      <TileLayer
        key={requestKey}
        url={tileurl}
        tms={true}
        opacity={1}
        zIndex={10}
        eventHandlers={tileEventHandlers}
      ></TileLayer>

      <Colorbar
        position="topleft"
        colorbar={dataurl + '/' + forecast.cycle + '/' + forecast.forecasts.elev.src + '/' + forecast.forecasts.elev.layers[0].type + '/' + 'colorbar.png'}>
      </Colorbar>
      
      <ScaleControl
        position="bottomleft"
        metric={true}
        imperial={true}
        maxWidth={200}
      ></ScaleControl>
    </MapContainer>
    <Modal
      show={selectedStation !== null}
      onHide={() => setSelectedStation(null)}
      centered
      scrollable
      dialogClassName="timeseries-modal-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedStation && (
            selectedStation.Organization
              ? `${selectedStation.Name} - ${selectedStation.Organization}`
              : selectedStation.Name
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedStation && (
          <DyGraph
            url={stationTimeseriesUrl}
            filename={timeseriesFilename}
          />
        )}
      </Modal.Body>
    </Modal>
    </>
  );
}

export default Map;
