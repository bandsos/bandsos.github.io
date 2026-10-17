import { useEffect, useRef, useState } from "react";
import "./ForecastDateTimePicker.css";

const MIN_DATE = "2020-01-01";

function monthStart(date) {
    return `${date.slice(0, 7)}-01`;
}

function addMonths(date, amount) {
    const [year, month] = date.slice(0, 7).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1 + amount, 1)).toISOString().slice(0, 10);
}

function formatSelectedDate(date, cycle) {
    if (!date || !cycle) {
        return "Select forecast date and cycle";
    }

    const [year, month, day] = date.split("-").map(Number);
    const formattedDate = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
        undefined,
        { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }
    );
    return `${formattedDate} · ${cycle}Z`;
}

function ForecastDateTimePicker({ forecast, setForecast, cycles, maxForecast }) {
    const [isOpen, setIsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(monthStart(forecast.date || MIN_DATE));
    const pickerRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (forecast.date) {
            setVisibleMonth(monthStart(forecast.date));
        }
    }, [forecast.date]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!pickerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const selectForecast = (date, cycle) => {
        setForecast({
            ...forecast,
            date,
            cycle,
            folder: `${date.replaceAll("-", "")}${cycle}`
        });
    };

    const [year, month] = visibleMonth.split("-").map(Number);
    const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
        undefined,
        { year: "numeric", month: "long", timeZone: "UTC" }
    );
    const previousMonth = addMonths(visibleMonth, -1);
    const nextMonth = addMonths(visibleMonth, 1);
    const lastAvailableDate = maxForecast?.date;
    const dateIsAfterLastForecast = Boolean(lastAvailableDate && forecast.date > lastAvailableDate);
    const nextMonthIsUnavailable = Boolean(
        lastAvailableDate && nextMonth > monthStart(lastAvailableDate)
    );

    return (
        <div className="forecast-picker" ref={pickerRef}>
            <button
                ref={triggerRef}
                className="forecast-picker-trigger"
                type="button"
                aria-label="Forecast date and cycle"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{formatSelectedDate(forecast.date, forecast.cycle)}</span>
                <span className="forecast-picker-caret" aria-hidden="true">▾</span>
            </button>
            {isOpen && (
                <div className="forecast-picker-popover" role="dialog" aria-label="Forecast Cycle">
                    <div className="forecast-picker-popover-header">
                        <h2>Forecast Cycle</h2>
                        <button
                            className="forecast-picker-reset"
                            type="button"
                            aria-label="Reset to last forecast"
                            title="Reset to last forecast"
                            disabled={!maxForecast?.date || !maxForecast?.cycle}
                            onClick={() => selectForecast(maxForecast.date, maxForecast.cycle)}
                        >
                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M2.25 8a5.75 5.75 0 1 0 1.68-4.07L2.5 5.35M2.5 2.5v2.85h2.85M8 4.75V8l2.1 1.25"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="forecast-picker-content">
                        <section className="forecast-calendar" aria-label="Forecast date">
                            <div className="forecast-calendar-header">
                                <button
                                    type="button"
                                    aria-label="Previous month"
                                    disabled={previousMonth < monthStart(MIN_DATE)}
                                    onClick={() => setVisibleMonth(previousMonth)}
                                >
                                    ‹
                                </button>
                                <strong>{monthLabel}</strong>
                                <button
                                    type="button"
                                    aria-label="Next month"
                                    disabled={nextMonthIsUnavailable}
                                    onClick={() => setVisibleMonth(nextMonth)}
                                >
                                    ›
                                </button>
                            </div>
                            <div className="forecast-calendar-grid" role="grid" aria-label={monthLabel}>
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((weekday) => (
                                    <span className="forecast-calendar-weekday" role="columnheader" key={weekday}>
                                        {weekday}
                                    </span>
                                ))}
                                {Array.from({ length: firstWeekday }, (_, index) => (
                                    <span className="forecast-calendar-empty" aria-hidden="true" key={`empty-${index}`} />
                                ))}
                                {Array.from({ length: daysInMonth }, (_, index) => {
                                    const day = index + 1;
                                    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                    const selected = forecast.date === date;
                                    const unavailable = Boolean(lastAvailableDate && date > lastAvailableDate);
                                    return (
                                        <button
                                            className="forecast-calendar-day"
                                            type="button"
                                            role="gridcell"
                                            disabled={unavailable}
                                            aria-label={new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
                                                undefined,
                                                { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
                                            )}
                                            aria-pressed={selected}
                                            key={date}
                                            onClick={() => selectForecast(date, cycles[0])}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                        <section className="forecast-cycle-picker" aria-label="Forecast cycle">
                            <h2>Cycle (UTC)</h2>
                            <div role="group" aria-label="Forecast cycle">
                                {cycles.map((cycle) => (
                                    <button
                                        className="forecast-cycle-option"
                                        type="button"
                                        disabled={dateIsAfterLastForecast || (
                                            maxForecast?.date === forecast.date &&
                                            Number(cycle) > Number(maxForecast.cycle)
                                        )}
                                        aria-pressed={forecast.cycle === cycle}
                                        key={cycle}
                                        onClick={() => selectForecast(forecast.date || MIN_DATE, cycle)}
                                    >
                                        {cycle}Z
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ForecastDateTimePicker;
