// https://www.anycodings.com/1questions/1902754/react-leaflet-v3-custom-control
import { useLeafletContext } from "@react-leaflet/core";
import L from "leaflet";
import { useEffect } from "react";
import "./Colorbar.css";

function Colorbar(props) {
  const context = useLeafletContext();

  L.Control.Colorbar = L.Control.extend({
    onAdd: function (map) {
      var container = L.DomUtil.create("div", "colorbar-container")
      var img = L.DomUtil.create("img", "colorbar", container);

      img.src = props.colorbar;
      // img.style.width = "75px";

      return container;
    },

    onRemove: function (map) {
      // Nothing to do here
    },
  });

  L.control.colorbar = function (opts) {
    return new L.Control.Colorbar(opts);
  };

  useEffect(() => {
    const container = context.layerContainer || context.map;

    const control = L.control.colorbar({ position: props.position });
    container.addControl(control);

    return () => {
      container.removeControl(control);
    };
  });

  return null;
}

export default Colorbar;
