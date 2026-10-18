import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  MapContainer,
  TileLayer,
  ScaleControl,
  Marker,
  useMap
} from "react-leaflet";
import { createLayerComponent } from "@react-leaflet/core";

import L, { divIcon, latLng, latLngBounds } from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import DyGraph from "./Graph";
import Colorbar from './Colorbar';
import shsData from "../assets/data/coastal_ssvi_data.json";
import SocialDataLayer from './SocialDataLayer';
import "./Map.css";
import { Modal } from "react-bootstrap";

const stationIcon = divIcon({
  className: "station-marker-icon",
  html: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="#302783" stroke="#fff" stroke-width="2"/><path d="M5.5 11.2c1.5-1.2 2.5 1.1 4 0s2.5 1.2 5 0" fill="none" stroke="#00a3d9" stroke-width="1.8" stroke-linecap="round"/></svg>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const MarkerClusterGroup = createLayerComponent((props, context) => {
  const instance = L.markerClusterGroup(props.options);
  return {
    instance,
    context: { ...context, layerContainer: instance }
  };
});

const stationClusterOptions = {
  maxClusterRadius: 50,
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: false,
  zoomToBoundsOnClick: true,
  iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? "small" : count < 50 ? "medium" : "large";
    return divIcon({
      html: `<span>${count}</span>`,
      className: `station-cluster station-cluster-${size}`,
      iconSize: size === "small" ? [36, 36] : size === "medium" ? [42, 42] : [48, 48]
    });
  }
};

function InvalidateMapSize({ bounds, focusedStation }) {
  const map = useMap();
  const focusedStationRef = useRef(null);
  focusedStationRef.current = focusedStation;

  useEffect(() => {
    const container = map.getContainer();
    let frame;
    const restoreView = () => {
      const station = focusedStationRef.current;
      if (station) {
        map.setView([station.Lat, station.Lon], map.getZoom(), { animate: false });
        return;
      }
      map.fitBounds(bounds, {
        animate: false,
        padding: [16, 16]
      });
    };
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
        restoreView();
      });
    });

    resizeObserver.observe(container);
    map.invalidateSize({ pan: false });
    restoreView();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [bounds, map]);

  return null;
}

function FocusSelectedStation({ station, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (station) {
      map.setView([station.Lat, station.Lon], zoom, { animate: false });
    }
  }, [map, station?.ID, station?.Lat, station?.Lon, zoom]);

  return null;
}

function MapToolbar({
  stations,
  query,
  onQueryChange,
  onSelect,
  bounds,
  baseLayer,
  onBaseLayerChange,
  stationsVisible,
  onStationsVisibleChange,
  socialVisible,
  onSocialVisibleChange
}) {
  const map = useMap();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [showBaseLayerMenu, setShowBaseLayerMenu] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = normalizedQuery
    ? stations
      .filter((station) => (
        `${station.Name} ${station.Organization ?? ""} ${station.ID}`
          .toLowerCase()
          .includes(normalizedQuery)
      ))
      .slice(0, 8)
    : [];

  useEffect(() => {
    const container = map.getContainer().querySelector(".map-toolbar");
    if (container) {
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
    }
  }, [map]);

  const selectStation = (station) => {
    setActiveIndex(-1);
    setShowResults(false);
    onSelect(station);
  };

  const selectBaseLayer = (layer) => {
    onBaseLayerChange(layer);
    setShowBaseLayerMenu(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onQueryChange("");
      setActiveIndex(-1);
      setShowResults(false);
      setShowBaseLayerMenu(false);
    } else if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectStation(results[activeIndex]);
    }
  };

  return (
    <div className="leaflet-top leaflet-right map-toolbar-container">
      <div className="leaflet-control map-toolbar">
        <div className="map-toolbar-layer-toggles">
          <button
            type="button"
            className={`btn map-toolbar-toggle${stationsVisible ? " is-active" : ""}`}
            aria-label="Gauge Stations"
            title="Gauge Stations"
            aria-pressed={stationsVisible}
            onClick={() => onStationsVisibleChange(!stationsVisible)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                className="map-toolbar-marker-shape"
                d="M12 22s8-7.1 8-13a8 8 0 1 0-16 0c0 5.9 8 13 8 13Z"
                fill={stationsVisible ? "currentColor" : "none"}
                stroke="currentColor"
              />
              <path className="map-toolbar-marker-wave" d="M8 11c1.3-1 2.2 1 3.5 0s2.2 1 4.5 0" />
            </svg>
          </button>
          <button
            type="button"
            className={`btn map-toolbar-toggle${socialVisible ? " is-active" : ""}`}
            aria-label="Social Indicators"
            title="Social Indicators"
            aria-pressed={socialVisible}
            onClick={() => onSocialVisibleChange(!socialVisible)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                className="map-toolbar-person-shape"
                cx="12"
                cy="7"
                r="3.5"
                fill={socialVisible ? "currentColor" : "none"}
                stroke="currentColor"
              />
              <path
                className="map-toolbar-person-shape"
                d="M5 21v-2a7 7 0 0 1 14 0v2H5Z"
                fill={socialVisible ? "currentColor" : "none"}
                stroke="currentColor"
              />
            </svg>
          </button>
        </div>
        <span className="map-toolbar-separator" aria-hidden="true" />
        <div className="map-toolbar-search-control">
          <label className="visually-hidden" htmlFor="station-search">Search forecast stations</label>
          <div className="map-toolbar-search-input">
            <svg className="map-toolbar-search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              id="station-search"
              type="search"
              className="form-control map-toolbar-search"
              placeholder="Search stations"
              value={query}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showResults && Boolean(normalizedQuery)}
              aria-controls="station-search-results"
              aria-activedescendant={activeIndex >= 0 ? `station-search-result-${activeIndex}` : undefined}
              autoComplete="off"
              onFocus={(event) => {
                if (event.currentTarget.value) {
                  event.currentTarget.select();
                }
              }}
              onChange={(event) => {
                onQueryChange(event.target.value);
                setActiveIndex(-1);
                setShowResults(true);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          {showResults && normalizedQuery && (
            <div
              id="station-search-results"
              className="station-search-results"
              role="listbox"
              aria-label="Matching forecast stations"
            >
              {results.length > 0 ? results.map((station, index) => (
                <button
                  id={`station-search-result-${index}`}
                  key={station.ID}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index}
                  className="station-search-result"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectStation(station)}
                >
                  <span>{station.Name}</span>
                  <small>
                    {station.Organization ? `${station.Organization} · ${station.ID}` : station.ID}
                  </small>
                </button>
              )) : (
                <div className="station-search-empty" role="status">No stations found</div>
              )}
            </div>
          )}
        </div>
        <div className="map-toolbar-map-controls">
          <div className="map-toolbar-basemap-control">
            <button
              type="button"
              className="btn map-toolbar-icon-button"
              aria-label="Choose basemap"
              title="Choose basemap"
              aria-haspopup="menu"
              aria-expanded={showBaseLayerMenu}
              onClick={() => setShowBaseLayerMenu((visible) => !visible)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 2 10 5-10 5L2 7l10-5Z" />
                <path d="m2 12 10 5 10-5M2 17l10 5 10-5" />
              </svg>
            </button>
            {showBaseLayerMenu && (
              <div className="map-toolbar-basemap-menu" role="menu" aria-label="Choose basemap">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={baseLayer === "osm"}
                  className="map-toolbar-basemap-option"
                  onClick={() => selectBaseLayer("osm")}
                >
                  OpenStreetMap
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={baseLayer === "satellite"}
                  className="map-toolbar-basemap-option"
                  onClick={() => selectBaseLayer("satellite")}
                >
                  ESRI Imagery World 2D
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={baseLayer === "toner-dark"}
                  className="map-toolbar-basemap-option"
                  onClick={() => selectBaseLayer("toner-dark")}
                >
                  Stamen Toner Black
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn map-toolbar-icon-button"
            aria-label="Reset map view"
            title="Reset map view"
            onClick={() => map.fitBounds(bounds, { animate: false, padding: [16, 16] })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 11a9 9 0 1 1 2.64 6.36" />
              <path d="M3 4v7h7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component
function Map({dataurl, config, forecast, timestep, mapRequestBase, onTileLayerSettled}) {
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [stationSearchQuery, setStationSearchQuery] = useState("");
  const [baseLayer, setBaseLayer] = useState("osm");
  const [stationsVisible, setStationsVisible] = useState(true);
  const [socialVisible, setSocialVisible] = useState(false);
  const stations = forecast.forecasts.elev.layers[1].stations;
  const selectedStation = stations.find((station) => station.ID === selectedStationId) ?? null;

  useEffect(() => {
    if (selectedStationId !== null && selectedStation === null) {
      setSelectedStationId(null);
    }
  }, [selectedStation, selectedStationId]);

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
  const targetBounds = useMemo(
    () => latLngBounds(
      latLng(config.bounds.south, config.bounds.west),
      latLng(config.bounds.north, config.bounds.east)
    ),
    [config.bounds.east, config.bounds.north, config.bounds.south, config.bounds.west]
  );

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
      bounds={targetBounds}
      boundsOptions={{ padding: [16, 16] }}
      scrollWheelZoom={true}
      zoomControl={false}
      minZoom={config.minzoom}
      maxZoom={config.maxzoom}
      style={{ width: "100%", height: "100%"}}
    >
      <InvalidateMapSize bounds={targetBounds} focusedStation={selectedStation} />
      <FocusSelectedStation
        station={selectedStation}
        zoom={Math.min(config.stationSearchZoom ?? config.maxzoom, config.maxzoom)}
      />
      <MapToolbar
        stations={stations}
        query={stationSearchQuery}
        onQueryChange={setStationSearchQuery}
        onSelect={(station) => {
          setSelectedStationId(station.ID);
          setStationSearchQuery(station.Name);
        }}
        bounds={targetBounds}
        baseLayer={baseLayer}
        onBaseLayerChange={setBaseLayer}
        stationsVisible={stationsVisible}
        onStationsVisibleChange={setStationsVisible}
        socialVisible={socialVisible}
        onSocialVisibleChange={setSocialVisible}
      />

      {baseLayer === "osm" && (
        <TileLayer
          key="osm"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          zIndex={1}
        />
      )}
      {baseLayer === "satellite" && (
        <TileLayer
          key="satellite"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          zIndex={1}
        />
      )}
      {baseLayer === "toner-dark" && (
        <TileLayer
          key="toner-dark"
          attribution='&copy; <a href="https://stadiamaps.com/attribution/" target="_blank" rel="noreferrer">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank" rel="noreferrer">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.png"
          zIndex={1}
        />
      )}

      {stationsVisible && (
        <MarkerClusterGroup
          options={{
            ...stationClusterOptions,
            disableClusteringAtZoom: config.maxzoom
          }}
        >
          {stations.map((station) => (
            <Marker
              key={station.ID}
              position={[station.Lat, station.Lon]}
              icon={stationIcon}
              eventHandlers={{
                click: () => {
                  setSelectedStationId(station.ID);
                  setStationSearchQuery(station.Name);
                }
              }}
            />
          ))}
        </MarkerClusterGroup>
      )}

      {socialVisible && <SocialDataLayer data={shsData} />}

      <TileLayer
        key={requestKey}
        url={tileurl}
        tms={true}
        opacity={1}
        zIndex={10}
        eventHandlers={tileEventHandlers}
      />

      <Colorbar
        position="topleft"
        colorbar={dataurl + '/' + forecast.cycle + '/' + forecast.forecasts.elev.src + '/' + forecast.forecasts.elev.layers[0].type + '/' + 'colorbar.png'}>
      </Colorbar>

      <ScaleControl
        position="bottomleft"
        metric={true}
        imperial={true}
        maxWidth={200}
      />
    </MapContainer>
    <Modal
      show={selectedStation !== null}
      onHide={() => setSelectedStationId(null)}
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
