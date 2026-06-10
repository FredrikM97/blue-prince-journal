import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./routes/__root";
import "./styles.css";

function resolveInitialTheme(): "light" | "dark" {
  const stored = window.localStorage.getItem("bp-theme");
  if (stored === "light" || stored === "dark") return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

document.documentElement.classList.toggle("dark", resolveInitialTheme() === "dark");

const router = getRouter();
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
