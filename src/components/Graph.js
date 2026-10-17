import React, { useEffect, useRef } from "react";
import Dygraph from "dygraphs";
import "dygraphs/dist/dygraph.min.css";

// Check if an url exists
// async function exists(url) {
//     const result = await fetch(url, { method: 'HEAD' });
//     return result.ok;
//   }

function DyGraph(props) {
  const graphRef = useRef(null);
  console.log(props);

  useEffect(() => {
    const graph = new Dygraph(graphRef.current, props.url, {
      title: props.title,
      ylabel: "Water level (m)",
      xlabel: "Datetime",
      gridLineWidth: "0.1",
      // valueRange: [0, null],
    });
    const resizeObserver = new ResizeObserver(() => graph.resize());
    resizeObserver.observe(graphRef.current);

    return () => {
      resizeObserver.disconnect();
      graph.destroy();
    };
  }, [props.title, props.url]);

  return <div ref={graphRef} className="timeseries-chart"></div>;
}

export default DyGraph;
