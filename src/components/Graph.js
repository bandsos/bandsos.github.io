import React, { useEffect, useRef } from "react";
import Dygraph from "dygraphs";
import "dygraphs/dist/dygraph.min.css";

// Check if an url exists
// async function exists(url) {
//     const result = await fetch(url, { method: 'HEAD' });
//     return result.ok;
//   }

function DyGraph(props) {
  const graphRef = useRef();
  console.log(props);

  useEffect(() => {
    new Dygraph(
      graphRef.current,
      props.url,
      {
        title: props.title,
        ylabel: "Water level (m)",
        xlabel: "Datetime",
        gridLineWidth: "0.1",
        // valueRange: [0, null],
      }
    );
  });

  return <div ref={graphRef}></div>;
}

export default DyGraph;
