import { useLeafletContext } from "@react-leaflet/core";
import {
  GeoJSON
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const SocialDataLayer = function ({ data }) {

  const context = useLeafletContext();

  function getColor(d) {
    // Generated using colorbrewer
    return d > 0.9 ? '#67000d' :
           d > 0.8 ? '#a50f15' :
           d > 0.7 ? '#cb181d' :
           d > 0.6 ? '#ef3b2c' :
           d > 0.5 ? '#fb6a4a' :
           d > 0.4 ? '#fc9272' :
           d > 0.3 ? '#fcbba1' :
           d > 0.2 ? '#fee0d2':
           d > 0.1 ? '#fff5f0':
                     '#fff5f0';
  }

  const jsonSetStyle = function (feature) {
    return {
      color: getColor(feature.properties.SSVI),
    };
  }

  const jsonPointToLayer = function (feature, latlng) {
    return new L.CircleMarker(latlng, {
      radius: 5,
      fillOpacity: 0.85
    })
  }

  const jsonOnEachFeature = function (feature, layer) {
    let popupContent = `<div style="align-items:center;text-align:center;">
  <span><b>${feature.properties.Zila} - ${feature.properties.Upazila}</b></span>\n
  <table>
  <tr style="border-bottom:1px solid black">
    <td colspan="100%"></td>
  </tr>
  <tr><td style="text-align: right;">Poverty rate (2011): </td><td>${Number(feature.properties.Poverty).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">Female (2011): </td><td>${Number(feature.properties.Female).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">Children (2011): </td><td>${Number(feature.properties.Children).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">Elderly (2011): </td><td>${Number(feature.properties.Elderly).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">Disabled (2011): </td><td>${Number(feature.properties.WithDisability).toFixed(1)}%</td></tr>
  <tr style="border-bottom:1px solid black">
    <td colspan="100%"></td>
  </tr>
  <tr><td style="text-align: right;">Weak Housing (2011): </td><td>${Number(feature.properties.WeakHousing).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">No Mobile Phone (2011): </td><td>${Number(feature.properties.WeakHousing).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">Unpaved road (2017): </td><td>${Number(feature.properties.UnpavedRoad).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">Hospitals/10k inhabitants (2016): </td><td>${Number(feature.properties.Hospitals).toFixed(1)}</td></tr>
  <tr style="border-bottom:1px solid black">
    <td colspan="100%"></td>
  </tr>
  <tr><td style="text-align: right;">Polder Coverage: </td><td>${Number(feature.properties.PolderCoverage).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">Shelter Availability: </td><td>${Number(feature.properties.PolderCoverage).toFixed(1)}%</td></tr>
  <tr><td style="text-align: right;">Exposed Population: </td><td>${Number(feature.properties.ExposedPopulation50).toFixed(1)}%</td></tr>
  <tr style="border-bottom:1px solid black">
    <td colspan="100%"></td>
  </tr>
  <tr><td style="text-align: right;"><b>SSVI: </b></td><td>${Number(feature.properties.SSVI).toFixed(2)}</td></tr>
  </table>
  </div>
  `;

    if (feature.properties && feature.properties.popupContent) {
      popupContent += feature.properties.popupContent;
    }

    layer.bindPopup(popupContent);
  }

  return (
    <GeoJSON 
      data={data} 
      style={jsonSetStyle} 
      pointToLayer={jsonPointToLayer} 
      onEachFeature={jsonOnEachFeature}></GeoJSON>
  );

}

export default SocialDataLayer;