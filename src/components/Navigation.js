import { createControlComponent } from "@react-leaflet/core";
import { Control, DomUtil, DomEvent } from "leaflet";
import ReactDOMServer from 'react-dom/server';
import { FaHome, FaInfoCircle } from 'react-icons/fa';

Control.Navigation = Control.extend({
  options: {
    position: "topleft",
  },
  onAdd: function (map) {
    // const options = this.options;
    const controlName = "leaflet-control-navbar";
    const container = DomUtil.create("div", controlName + " leaflet-bar");
    this._infoButton = this._createButton(
      ReactDOMServer.renderToString(<FaHome />),
      "Homepage",
      controlName + "-home",
      container,
      this._goHome
    );
    this._infoButton = this._createButton(
      ReactDOMServer.renderToString(<FaInfoCircle />),
      "Information",
      controlName + "-info",
      container,
      this._goHome
    );
    return container;
  },

  onRemove: function (map) {},

  _createButton: function (html, title, className, container, fn, context) {
    var link = DomUtil.create("a", className, container);
    link.innerHTML = html;
    link.href = "#";
    link.title = title;

    var stop = DomEvent.stopPropagation;

    DomEvent.on(link, "click", stop)
      .on(link, "mousedown", stop)
      .on(link, "dblclick", stop)
      .on(link, "click", DomEvent.preventDefault)
      .on(link, "click", fn, context);

    return link;
  },
  _goHome: function () {
    // pass
  },
});

export const Navigation = createControlComponent(
  (props) => new Control.Navigation(props)
);
