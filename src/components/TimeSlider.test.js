import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import TimeSlider from "./TimeSlider";

const mapRequestBase = "tiles/";

function makeForecast(count = 12) {
  const timestamps = Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(2024, 4, 1, index * 6));
    const time = date.toISOString().replace("T", " ").replace(".000Z", "");

    return { folder: `step-${index}`, time };
  });

  return {
    forecasts: {
      elev: {
        layers: [{ timestamps }]
      }
    }
  };
}

function loadedStatus(folder, errorCount = 0) {
  return { requestKey: `${mapRequestBase}${folder}`, errorCount };
}

afterEach(() => {
  vi.useRealTimers();
});

test("shows the selected forecast time and lets the user step through timestamps", () => {
  const setTimestep = vi.fn();
  const forecast = makeForecast();
  render(
    <TimeSlider
      forecast={forecast}
      setTimestep={setTimestep}
      mapRequestBase={mapRequestBase}
      cycleStartTime="2024-05-02 12:00:00"
      mapStatus={loadedStatus("step-8")}
    />
  );

  expect(screen.getByRole("slider", { name: "Forecast time" })).toHaveValue("8");
  expect(screen.getByText("May 3, 2024")).toBeInTheDocument();
  expect(screen.getByText("00:00 UTC")).toBeInTheDocument();
  expect(document.querySelectorAll(".timeline-tick")).toHaveLength(12);
  expect(document.querySelectorAll(".timeline-date-label")).toHaveLength(3);
  expect(document.querySelectorAll(".timeline-hour-label")).toHaveLength(12);
  expect([...document.querySelectorAll(".timeline-date-label")].map((label) => label.textContent))
    .toEqual(["May 1", "May 2", "May 3"]);
  expect([...document.querySelectorAll(".timeline-hour-label")].map((label) => label.textContent))
    .toEqual(["00h", "06h", "12h", "18h", "00h", "06h", "12h", "18h", "00h", "06h", "12h", "18h"]);
  const cycleStartMarker = document.querySelector(".timeline-cycle-marker");
  expect(cycleStartMarker).toHaveAttribute(
    "title",
    "Forecast starts from here under current cycle"
  );
  expect(cycleStartMarker.parentElement.parentElement).toHaveClass("timeline-range-wrap");
  expect(cycleStartMarker.style.left).toBe("54.54545454545454%");
  expect(document.querySelector(".timeline-date-label").style.left).toBe("0%");
  expect(document.querySelectorAll(".timeline-date-label")[1].style.left).toBe("36.36363636363637%");
  expect(setTimestep).toHaveBeenLastCalledWith({ folder: "step-8" });

  fireEvent.click(screen.getByRole("button", { name: "Next forecast time" }));
  expect(screen.getByRole("slider", { name: "Forecast time" })).toHaveValue("9");
  expect(setTimestep).toHaveBeenLastCalledWith({ folder: "step-9" });
  expect(document.querySelector(".timeline-spinner")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next forecast time" })).toBeDisabled();
});

test("waits for the selected map tiles before accepting another step", () => {
  const setTimestep = vi.fn();
  const forecast = makeForecast();
  const props = {
    forecast,
    setTimestep,
    mapRequestBase,
    mapStatus: loadedStatus("step-8")
  };
  const { rerender } = render(<TimeSlider {...props} />);

  fireEvent.click(screen.getByRole("button", { name: "Next forecast time" }));
  expect(document.querySelector(".timeline-spinner")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next forecast time" }));
  expect(setTimestep).toHaveBeenLastCalledWith({ folder: "step-9" });

  rerender(
    <TimeSlider {...props} mapStatus={loadedStatus("step-9")} />
  );
  expect(document.querySelector(".timeline-spinner")).toBeInTheDocument();
  expect(document.querySelector(".timeline-spinner")).not.toHaveClass("timeline-spinner-loading");
  expect(document.querySelector(".timeline-spinner")).toHaveClass("timeline-spinner-loaded");
  expect(screen.getByRole("button", { name: "Next forecast time" })).toBeEnabled();

  fireEvent.click(screen.getByRole("button", { name: "Next forecast time" }));
  expect(setTimestep).toHaveBeenLastCalledWith({ folder: "step-10" });
});

test("keeps tile errors in the background after the map has settled", () => {
  render(
    <TimeSlider
      forecast={makeForecast()}
      setTimestep={vi.fn()}
      mapRequestBase={mapRequestBase}
      mapStatus={loadedStatus("step-8", 2)}
    />
  );

  expect(document.querySelector(".timeline-spinner")).toBeInTheDocument();
  expect(document.querySelector(".timeline-spinner")).not.toHaveClass("timeline-spinner-loading");
  expect(document.querySelector(".timeline-spinner")).toHaveClass("timeline-spinner-loaded");
  expect(document.querySelector(".timeline-map-status")).not.toBeInTheDocument();
});

test("waits for each map update during playback and stops at the last timestamp", () => {
  vi.useFakeTimers();
  const setTimestep = vi.fn();
  const forecast = makeForecast(2);
  const { rerender } = render(
    <TimeSlider
      forecast={forecast}
      setTimestep={setTimestep}
      mapRequestBase={mapRequestBase}
      mapStatus={loadedStatus("step-1")}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Play forecast animation" }));
  expect(screen.getByRole("slider", { name: "Forecast time" })).toHaveValue("0");
  expect(document.querySelector(".timeline-spinner")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1400);
  });
  expect(screen.getByRole("slider", { name: "Forecast time" })).toHaveValue("0");

  rerender(
    <TimeSlider
      forecast={forecast}
      setTimestep={setTimestep}
      mapRequestBase={mapRequestBase}
      mapStatus={loadedStatus("step-0")}
    />
  );
  act(() => {
    vi.advanceTimersByTime(700);
  });
  expect(screen.getByRole("slider", { name: "Forecast time" })).toHaveValue("1");
  expect(document.querySelector(".timeline-spinner")).toBeInTheDocument();

  rerender(
    <TimeSlider
      forecast={forecast}
      setTimestep={setTimestep}
      mapRequestBase={mapRequestBase}
      mapStatus={loadedStatus("step-1", 1)}
    />
  );
  expect(screen.getByRole("button", { name: "Play forecast animation" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next forecast time" })).toBeDisabled();
  expect(document.querySelector(".timeline-spinner")).toBeInTheDocument();
  expect(document.querySelector(".timeline-spinner")).not.toHaveClass("timeline-spinner-loading");
  expect(document.querySelector(".timeline-spinner")).toHaveClass("timeline-spinner-loaded");
});

test("updates the map folder when the range input changes", () => {
  const setTimestep = vi.fn();
  const forecast = makeForecast();
  render(
    <TimeSlider
      forecast={forecast}
      setTimestep={setTimestep}
      mapRequestBase={mapRequestBase}
      mapStatus={loadedStatus("step-8")}
    />
  );

  fireEvent.change(screen.getByRole("slider", { name: "Forecast time" }), {
    target: { value: "4" }
  });
  expect(setTimestep).toHaveBeenLastCalledWith({ folder: "step-4" });
});

test("clamps the selected timestamp when a shorter forecast is loaded", () => {
  const setTimestep = vi.fn();
  const { rerender } = render(
    <TimeSlider
      forecast={makeForecast()}
      setTimestep={setTimestep}
      mapRequestBase={mapRequestBase}
      mapStatus={loadedStatus("step-8")}
    />
  );

  rerender(
    <TimeSlider
      forecast={makeForecast(3)}
      setTimestep={setTimestep}
      mapRequestBase={mapRequestBase}
      mapStatus={loadedStatus("step-2")}
    />
  );

  expect(screen.getByRole("slider", { name: "Forecast time" })).toHaveValue("2");
  expect(setTimestep).toHaveBeenLastCalledWith({ folder: "step-2" });
});
