import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import App from './App';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('renders the forecast application shell', () => {
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  render(<App />);
  expect(screen.getByText("BandSOS")).toBeInTheDocument();
});
