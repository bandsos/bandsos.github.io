import { useEffect, useState } from "react";

import "./TimeSlider.css";

const PLAYBACK_INTERVAL = 700;

function getTimestampDate(timestamp) {
  const value = timestamp.includes("T")
    ? timestamp.endsWith("Z") ? timestamp : `${timestamp}Z`
    : `${timestamp.replace(" ", "T")}Z`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(timestamp) {
  const date = getTimestampDate(timestamp);
  return date
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
      }).format(date)
    : timestamp;
}

function formatTime(timestamp) {
  const date = getTimestampDate(timestamp);
  return date
    ? `${new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "UTC"
      }).format(date)} UTC`
    : "";
}

function TimeSlider({
  forecast,
  setTimestep,
  mapRequestBase = "",
  cycleStartTime,
  mapStatus = { requestKey: null, errorCount: 0 }
}) {
  const steps = forecast.forecasts.elev.layers[0].timestamps;
  const maxIndex = steps.length - 1;
  const initialIndex = Math.min(8, maxIndex);
  const [index, setIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeIndex = Math.min(index, maxIndex);
  const activeStep = steps[activeIndex];
  const activeRequestKey = `${mapRequestBase}${activeStep.folder}`;
  const isLoading = mapStatus.requestKey !== activeRequestKey;
  const progress = maxIndex > 0 ? (activeIndex / maxIndex) * 100 : 0;
  const cycleStartDate = cycleStartTime ? getTimestampDate(cycleStartTime) : null;

  useEffect(() => {
    setIndex(initialIndex);
    setIsPlaying(false);
    setTimestep({ folder: steps[initialIndex].folder });
  }, [initialIndex, setTimestep, steps]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (isLoading) return undefined;
    if (activeIndex >= maxIndex) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const nextIndex = activeIndex + 1;
      setIndex(nextIndex);
      setTimestep({ folder: steps[nextIndex].folder });
    }, PLAYBACK_INTERVAL);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isLoading, isPlaying, maxIndex, setTimestep, steps]);

  const selectStep = (nextIndex) => {
    const selectedIndex = Math.max(0, Math.min(nextIndex, maxIndex));
    setIndex(selectedIndex);
    setTimestep({ folder: steps[selectedIndex].folder });
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (isLoading) return;
    if (activeIndex === maxIndex) selectStep(0);
    setIsPlaying(true);
  };

  const dateTicks = [];
  const hourTicks = [];
  steps.forEach((step, stepIndex) => {
    const date = getTimestampDate(step.time);
    if (!date || date.getUTCMinutes() !== 0) return;

    if (date.getUTCHours() === 0) {
      dateTicks.push({
        index: stepIndex,
        label: new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
          timeZone: "UTC"
        }).format(date)
      });
    }

    if (date.getUTCHours() % 6 === 0) {
      hourTicks.push({
        index: stepIndex,
        label: `${String(date.getUTCHours()).padStart(2, "0")}h`,
        isCycleStart: cycleStartDate?.getTime() === date.getTime()
      });
    }
  });

  return (
    <section
      className="forecast-timeline"
      aria-label="Forecast timeline"
      data-loading={isLoading}
    >
      <div className="timeline-controls">
        <div className="timeline-control-group">
          <div className="timeline-buttons" aria-label="Timeline playback controls">
            <button
              className="timeline-button"
              type="button"
              aria-label="Previous forecast time"
              title="Previous forecast time"
              disabled={isLoading || activeIndex === 0}
              onClick={() => selectStep(activeIndex - 1)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M6 4v12M15 5l-7 5 7 5z" />
              </svg>
            </button>
            <button
              className="timeline-button timeline-play-button"
              type="button"
              aria-label={isPlaying ? "Pause forecast animation" : "Play forecast animation"}
              title={isPlaying ? "Pause" : "Play"}
              disabled={!isPlaying && isLoading}
              onClick={togglePlayback}
            >
              {isPlaying
                ? <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" /></svg>
                : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6z" /></svg>}
            </button>
            <button
              className="timeline-button"
              type="button"
              aria-label="Next forecast time"
              title="Next forecast time"
              disabled={isLoading || activeIndex === maxIndex}
              onClick={() => selectStep(activeIndex + 1)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M14 4v12M5 5l7 5-7 5z" />
              </svg>
            </button>
          </div>
          <output className="timeline-current-time" aria-live="polite">
            <span
              className={`timeline-spinner${isLoading ? " timeline-spinner-loading" : " timeline-spinner-loaded"}`}
              aria-hidden="true"
            />
            <span className="timeline-current-date">{formatDate(activeStep.time)}</span>
            <span className="timeline-current-hour">{formatTime(activeStep.time)}</span>
          </output>
        </div>

        <div className="timeline-slider-area">
          <div className="timeline-label-row timeline-date-labels" aria-hidden="true">
            {dateTicks.map((tick) => (
              <span
                className="timeline-date-label"
                key={tick.index}
                style={{ left: `${maxIndex > 0 ? (tick.index / maxIndex) * 100 : 0}%` }}
              >
                {tick.label}
              </span>
            ))}
          </div>
          <div className="timeline-range-wrap">
            <div className="timeline-position-markers" aria-hidden="true">
              <div className="timeline-tick-marks">
                {steps.map((_, stepIndex) => (
                  <span
                    className="timeline-tick"
                    key={stepIndex}
                    style={{ left: `${maxIndex > 0 ? (stepIndex / maxIndex) * 100 : 0}%` }}
                  />
                ))}
              </div>
              {hourTicks.filter((tick) => tick.isCycleStart).map((tick) => (
                <span
                  className="timeline-cycle-marker"
                  key={tick.index}
                  style={{ left: `${maxIndex > 0 ? (tick.index / maxIndex) * 100 : 0}%` }}
                  title="Forecast starts from here under current cycle"
                  aria-label="Forecast starts from here under current cycle"
                />
              ))}
            </div>
            <input
              className="timeline-range"
              type="range"
              min={0}
              max={maxIndex}
              step={1}
              value={activeIndex}
              aria-label="Forecast time"
              aria-valuetext={`${formatDate(activeStep.time)} ${formatTime(activeStep.time)}`}
              style={{ "--timeline-progress": `${progress}%` }}
              disabled={isLoading}
              onChange={(event) => selectStep(Number(event.target.value))}
            />
          </div>
          <div className="timeline-label-row timeline-hour-labels" aria-hidden="true">
            {hourTicks.map((tick) => (
              <span
                className="timeline-hour-label"
                key={tick.index}
                style={{ left: `${maxIndex > 0 ? (tick.index / maxIndex) * 100 : 0}%` }}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TimeSlider;
