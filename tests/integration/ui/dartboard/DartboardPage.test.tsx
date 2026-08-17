import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DartboardPage } from "@/components/dartboard/DartboardPage";

vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (value: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: "/dartboard" } }),
}));

vi.mock("@/components/common/PageLayout", async () => {
  function Slot({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  function PageLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }

  return {
    PageLayout: Object.assign(PageLayout, {
      Left: Slot,
      Middle: Slot,
      Right: Slot,
    }),
  };
});

function getResultText() {
  return document.querySelector(".font-serif.text-5xl.font-bold")?.textContent;
}

describe("DartboardPage", () => {
  it("paints a wedge and computes the additive result", () => {
    render(<DartboardPage />);

    fireEvent.click(screen.getByLabelText("Add operator"));
    fireEvent.click(screen.getByLabelText("inner wedge 20"));

    expect(getResultText()).toBe("20");
  });

  it("clicking the same painted wedge again clears it", () => {
    render(<DartboardPage />);

    fireEvent.click(screen.getByLabelText("Add operator"));
    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    expect(getResultText()).toBe("20");

    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    expect(getResultText()).toBe("0");
  });

  it("applies a center modifier after painting", () => {
    render(<DartboardPage />);

    fireEvent.click(screen.getByLabelText("Add operator"));
    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    fireEvent.click(screen.getByRole("button", { name: "Inner" }));
    fireEvent.click(screen.getByTitle("Square — Square the number (n²).", { exact: true }));

    expect(getResultText()).toBe("400");
  });

  it("keeps only one center modifier active at a time", () => {
    render(<DartboardPage />);

    fireEvent.click(screen.getByLabelText("Add operator"));
    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    fireEvent.click(screen.getByRole("button", { name: "Inner" }));

    const squareButton = screen.getByTitle("Square — Square the number (n²).", { exact: true });
    const roundButton = screen.getByTitle("Round to 10 — Round to the nearest 10.", { exact: true });

    fireEvent.click(squareButton);
    fireEvent.click(roundButton);

    expect(squareButton).toHaveAttribute("aria-pressed", "false");
    expect(roundButton).toHaveAttribute("aria-pressed", "true");
  });

  it("applies an outer modifier placed on the outer modifier ring", () => {
    render(<DartboardPage />);

    fireEvent.click(screen.getByLabelText("Add operator"));
    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    fireEvent.click(screen.getByTitle("Toggle advanced mode"));
    fireEvent.click(screen.getByRole("button", { name: "Outer" }));
    fireEvent.click(screen.getByTitle("Diagonal Line — Divide the final number by 2.", { exact: true }));
    fireEvent.click(screen.getByLabelText("outer modifier wedge 20"));

    expect(getResultText()).toBe("10");
  });

  it("clears the selected area and the whole dartboard independently", () => {
    render(<DartboardPage />);

    fireEvent.click(screen.getByLabelText("Add operator"));
    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    expect(getResultText()).toBe("20");

    fireEvent.click(screen.getByRole("button", { name: "Inner" }));
    fireEvent.click(screen.getByTitle("Square — Square the number (n²).", { exact: true }));
    expect(getResultText()).toBe("400");

    fireEvent.click(screen.getByLabelText("Clear tool"));
    fireEvent.click(screen.getByLabelText("inner wedge 20"));

    expect(getResultText()).toBe("0");
  });
});
