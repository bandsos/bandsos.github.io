import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, ButtonGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaSearchMinus, FaSearchPlus, FaUndo } from "react-icons/fa";
import Dygraph from "dygraphs";
import "dygraphs/dist/dygraph.min.css";

function downloadBlob(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;"
  })[character]);
}

function getDownloadFilename(filename, extension) {
  const safeFilename = Array.from(filename, (character) => {
    const code = character.charCodeAt(0);
    return /[<>:"/\\|?*]/.test(character) || code < 32 || code === 127 ? "_" : character;
  }).join("");
  return `${safeFilename}.${extension}`;
}

function createChartSvg(chartElement) {
  const bounds = chartElement.getBoundingClientRect();
  const width = Math.ceil(bounds.width);
  const height = Math.ceil(bounds.height);
  const chartImages = Array.from(chartElement.querySelectorAll("canvas"), (canvas) => (
    `<image href="${canvas.toDataURL("image/png")}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/>`
  )).join("");
  const labels = Array.from(
    chartElement.querySelectorAll(".dygraph-label, .dygraph-axis-label"),
    (label) => {
      const labelBounds = label.getBoundingClientRect();
      const style = window.getComputedStyle(label);
      const x = labelBounds.left - bounds.left;
      const y = labelBounds.top - bounds.top;
      const fontSize = parseFloat(style.fontSize);
      const vertical = label.classList.contains("dygraph-ylabel");
      const anchor = style.textAlign === "right" ? "end" : style.textAlign === "center" ? "middle" : "start";
      const textX = vertical ? x + labelBounds.width / 2 : x + (
        anchor === "end" ? labelBounds.width : anchor === "middle" ? labelBounds.width / 2 : 0
      );
      const textY = vertical ? y + labelBounds.height / 2 : y + labelBounds.height / 2 + fontSize * 0.35;
      const transform = vertical ? ` transform="rotate(-90 ${textX} ${textY})"` : "";

      return `<text x="${textX}" y="${textY}" text-anchor="${vertical ? "middle" : anchor}"${transform} fill="${escapeXml(style.color)}" font-family="${escapeXml(style.fontFamily)}" font-size="${fontSize}px" font-weight="${style.fontWeight}">${escapeXml(label.textContent)}</text>`;
    }
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/>${chartImages}${labels}</svg>`;

  return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render the chart image."));
    image.src = url;
  });
}

function DyGraph({url, filename}) {
  const graphRef = useRef(null);
  const chartRef = useRef(null);
  const graphInstanceRef = useRef(null);
  const [graphReady, setGraphReady] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    const graph = new Dygraph(graphRef.current, url, {
      ylabel: "Water level (m)",
      xlabel: "Datetime",
      gridLineWidth: "0.1",
      drawCallback: () => setGraphReady(true),
      // valueRange: [0, null],
    });
    graphInstanceRef.current = graph;
    const resizeObserver = new ResizeObserver(() => graph.resize());
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      graph.destroy();
      graphInstanceRef.current = null;
      setGraphReady(false);
    };
  }, [url]);

  const zoomChart = (factor) => {
    const graph = graphInstanceRef.current;
    if (!graph) return;

    const [start, end] = graph.xAxisRange();
    const midpoint = (start + end) / 2;
    const halfRange = ((end - start) * factor) / 2;
    const min = graph.getValue(0, 0);
    const max = graph.getValue(graph.numRows() - 1, 0);

    graph.updateOptions({
      dateWindow: [
        Math.max(min, midpoint - halfRange),
        Math.min(max, midpoint + halfRange)
      ]
    });
  };

  const resetZoom = () => {
    graphInstanceRef.current?.updateOptions({ dateWindow: null, valueRange: null });
  };

  const exportChart = async (format) => {
    setExportError("");
    try {
      const svg = createChartSvg(graphRef.current);
      if (format === "svg") {
        downloadBlob(svg, getDownloadFilename(filename, "svg"));
        return;
      }

      const svgUrl = URL.createObjectURL(svg);
      try {
        const image = await loadImage(svgUrl);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not create the PNG image.");
        }
        context.drawImage(image, 0, 0);
        const png = await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Could not create the PNG image."));
          }, "image/png");
        });
        downloadBlob(png, getDownloadFilename(filename, "png"));
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    } catch (error) {
      setExportError(error.message);
    }
  };

  const exportCsv = async () => {
    setExportError("");
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CSV download failed: ${response.status} ${response.statusText}`);
      }
      downloadBlob(await response.blob(), getDownloadFilename(filename, "csv"));
    } catch (error) {
      setExportError(error.message);
    }
  };

  return (
    <>
      <div className="timeseries-toolbar">
        <div className="timeseries-view-controls">
          <OverlayTrigger
            placement="bottom"
            trigger={["hover", "focus"]}
            overlay={(
              <Tooltip id="timeseries-view-control-tooltip">
                Drag across the chart with a mouse on a PC or touch and drag on a phone to zoom in. Use Zoom out to widen the time range, or Reset zoom to restore the full chart.
              </Tooltip>
            )}
          >
            <span className="timeseries-view-label" tabIndex={0}>
              View:
            </span>
          </OverlayTrigger>
          <ButtonGroup size="sm" aria-label="Chart zoom controls">
            <Button
              variant="outline-secondary"
              title="Zoom in"
              aria-label="Zoom in"
              disabled={!graphReady}
              onClick={() => zoomChart(0.5)}
            >
              <FaSearchPlus aria-hidden="true" />
            </Button>
            <Button
              variant="outline-secondary"
              title="Zoom out"
              aria-label="Zoom out"
              disabled={!graphReady}
              onClick={() => zoomChart(2)}
            >
              <FaSearchMinus aria-hidden="true" />
            </Button>
            <Button
              variant="outline-secondary"
              title="Reset zoom"
              aria-label="Reset zoom"
              disabled={!graphReady}
              onClick={resetZoom}
            >
              <FaUndo aria-hidden="true" />
            </Button>
          </ButtonGroup>
        </div>
        <div className="timeseries-download-controls">
          <span>Download:</span>
          <ButtonGroup size="sm" aria-label="Download chart or data">
          <Button variant="outline-secondary" disabled={!graphReady} onClick={() => exportChart("svg")}>
            SVG
          </Button>
          <Button variant="outline-secondary" disabled={!graphReady} onClick={() => exportChart("png")}>
            PNG
          </Button>
          <Button variant="outline-secondary" onClick={exportCsv}>
            CSV
          </Button>
          </ButtonGroup>
        </div>
      </div>
      {exportError && <Alert variant="danger" className="timeseries-export-error">{exportError}</Alert>}
      <div ref={chartRef} className="timeseries-chart">
        <div ref={graphRef} className="timeseries-chart-graph"></div>
      </div>
    </>
  );
}

export default DyGraph;
