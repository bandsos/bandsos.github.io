import { GeoJSON } from "react-leaflet";
import L from "leaflet";

const SocialDataLayer = function ({ data }) {
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
    const color = getColor(feature.properties.SSVI);
    const icon = L.divIcon({
      className: "social-human-marker",
      html: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2H5Z" fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
      iconSize: [24, 24],
      iconAnchor: [12, 21]
    });

    return new L.Marker(latlng, { icon });
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