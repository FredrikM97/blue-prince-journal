import { useLayoutEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/common/Button";
import { matchesMediaQuery } from "@/hooks/useMediaQuery";

type Theme = "light" | "dark";

function resolveInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("bp-theme");
  if (stored === "light" || stored === "dark") return stored;
  return matchesMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const disableTransitions = document.createElement("style");
  disableTransitions.appendChild(
    document.createTextNode("*{transition:none!important;animation:none!important}"),
  );
  document.head.appendChild(disableTransitions);

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("bp-theme", theme);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      disableTransitions.remove();
    });
  });
}

/** Self-contained theme toggle. Manages its own state, reads/writes localStorage,
 *  and applies the `dark` class to <html>. No external state needed. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme());

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    setTheme((current) => {
      if (current === "dark") return "light";
      return "dark";
    });
  }

  let ariaLabel = "Switch to light theme";
  let title = "Light theme";
  if (theme === "light") {
    ariaLabel = "Switch to dark theme";
    title = "Dark theme";
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-8 w-8"
      aria-label={ariaLabel}
      title={title}
    >
      {theme === "dark" && <Sun className="h-4 w-4" />}
      {theme === "light" && <Moon className="h-4 w-4" />}
    </Button>
  );
}
