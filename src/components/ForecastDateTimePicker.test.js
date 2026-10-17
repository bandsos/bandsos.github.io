import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ForecastDateTimePicker from "./ForecastDateTimePicker";

test("opens one side-by-side date and cycle picker and builds the forecast folder", () => {
  const forecast = {
    date: "2024-05-26",
    cycle: "06",
    dataurl: "https://bandsos.github.io",
    folder: "2024052606"
  };
  const setForecast = vi.fn();

  const { rerender } = render(
    <ForecastDateTimePicker
      forecast={forecast}
      setForecast={setForecast}
      cycles={["00", "06", "12", "18"]}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Forecast date and cycle" }));
  const dialog = screen.getByRole("dialog", { name: "Forecast Cycle" });
  const calendar = within(dialog).getByRole("region", { name: "Forecast date" });
  const day = Array.from(calendar.querySelectorAll(".forecast-calendar-day"))
    .find((button) => button.textContent === "27");

  expect(day).toBeDefined();
  fireEvent.click(day);
  expect(setForecast).toHaveBeenLastCalledWith({
    ...forecast,
    date: "2024-05-27",
    cycle: "00",
    folder: "2024052700"
  });

  rerender(
    <ForecastDateTimePicker
      forecast={{ ...forecast, date: "2024-05-27", cycle: "00", folder: "2024052700" }}
      setForecast={setForecast}
      cycles={["00", "06", "12", "18"]}
    />
  );

  fireEvent.click(within(dialog).getByRole("button", { name: "18Z" }));
  expect(setForecast).toHaveBeenLastCalledWith({
    ...forecast,
    date: "2024-05-27",
    cycle: "18",
    folder: "2024052718"
  });
});

test("disables dates and cycles after the latest available forecast", () => {
  render(
    <ForecastDateTimePicker
      forecast={{
        date: "2024-05-27",
        cycle: "06",
        dataurl: "https://bandsos.github.io",
        folder: "2024052706"
      }}
      setForecast={vi.fn()}
      cycles={["00", "06", "12", "18"]}
      maxForecast={{ date: "2024-05-27", cycle: "06" }}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Forecast date and cycle" }));
  const dialog = screen.getByRole("dialog", { name: "Forecast Cycle" });
  const calendar = within(dialog).getByRole("region", { name: "Forecast date" });
  const unavailableDate = within(calendar).getByRole("gridcell", { name: "May 28, 2024" });
  expect(unavailableDate).toBeDisabled();

  expect(within(dialog).getByRole("button", { name: "00Z" })).toBeEnabled();
  expect(within(dialog).getByRole("button", { name: "06Z" })).toBeEnabled();
  expect(within(dialog).getByRole("button", { name: "12Z" })).toBeDisabled();
  expect(within(dialog).getByRole("button", { name: "18Z" })).toBeDisabled();
});

test("resets the cycle to 00Z when the selected date changes", () => {
  const forecast = {
    date: "2024-05-27",
    cycle: "12",
    dataurl: "https://bandsos.github.io",
    folder: "2024052712"
  };
  const setForecast = vi.fn();
  const props = {
    setForecast,
    cycles: ["00", "06", "12", "18"],
    maxForecast: { date: "2024-05-27", cycle: "12" }
  };
  const { rerender } = render(
    <ForecastDateTimePicker
      forecast={forecast}
      {...props}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Forecast date and cycle" }));
  let dialog = screen.getByRole("dialog", { name: "Forecast Cycle" });
  let calendar = within(dialog).getByRole("region", { name: "Forecast date" });
  fireEvent.click(within(calendar).getByRole("gridcell", { name: "May 26, 2024" }));

  expect(setForecast).toHaveBeenLastCalledWith({
    ...forecast,
    date: "2024-05-26",
    cycle: "00",
    folder: "2024052600"
  });

  const previousDayAtMidnight = { ...forecast, date: "2024-05-26", cycle: "00", folder: "2024052600" };
  rerender(
    <ForecastDateTimePicker forecast={previousDayAtMidnight} {...props} />
  );
  dialog = screen.getByRole("dialog", { name: "Forecast Cycle" });

  fireEvent.click(within(dialog).getByRole("button", { name: "18Z" }));
  expect(setForecast).toHaveBeenLastCalledWith({
    ...forecast,
    date: "2024-05-26",
    cycle: "18",
    folder: "2024052618"
  });

  rerender(
    <ForecastDateTimePicker
      forecast={{ ...forecast, date: "2024-05-26", cycle: "18", folder: "2024052618" }}
      {...props}
    />
  );
  dialog = screen.getByRole("dialog", { name: "Forecast Cycle" });
  calendar = within(dialog).getByRole("region", { name: "Forecast date" });
  fireEvent.click(within(calendar).getByRole("gridcell", { name: "May 27, 2024" }));

  expect(setForecast).toHaveBeenLastCalledWith({
    ...forecast,
    date: "2024-05-27",
    cycle: "00",
    folder: "2024052700"
  });
});

test("resets the selection to the last available forecast", () => {
  const setForecast = vi.fn();
  const maxForecast = { date: "2024-05-27", cycle: "12" };

  render(
    <ForecastDateTimePicker
      forecast={{
        date: "2024-05-26",
        cycle: "18",
        dataurl: "https://bandsos.github.io",
        folder: "2024052618"
      }}
      setForecast={setForecast}
      cycles={["00", "06", "12", "18"]}
      maxForecast={maxForecast}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Forecast date and cycle" }));
  const dialog = screen.getByRole("dialog", { name: "Forecast Cycle" });
  expect(within(dialog).getByRole("heading", { name: "Forecast Cycle" })).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole("button", { name: "Reset to last forecast" }));

  expect(setForecast).toHaveBeenCalledWith({
    date: "2024-05-27",
    cycle: "12",
    dataurl: "https://bandsos.github.io",
    folder: "2024052712"
  });
});
