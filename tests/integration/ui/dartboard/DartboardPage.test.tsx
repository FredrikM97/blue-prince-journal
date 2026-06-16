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

describe("DartboardPage", () => {
  it("cycles wedge colors and recomputes the result", () => {
    render(<DartboardPage />);

    fireEvent.change(screen.getByLabelText("Bullseye starting value"), { target: { value: "5" } });
    fireEvent.click(screen.getByLabelText("inner wedge 20"));

    expect(screen.getByText("25")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("inner wedge 20"));

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("keeps modifier toggles active and shows modifier-applied steps in the result", () => {
    render(<DartboardPage />);

    fireEvent.change(screen.getByLabelText("Bullseye starting value"), { target: { value: "5" } });
    fireEvent.click(screen.getAllByTitle("Square — Square the number (n²).", { exact: true })[1]);
    fireEvent.click(screen.getByLabelText("inner wedge 20"));

    expect(screen.getAllByTitle("Square — Square the number (n²).", { exact: true })[1]).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("625")).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("center modifier") && content.includes("Square")),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("inner wedge 20"));

    expect(screen.getAllByTitle("Square — Square the number (n²).", { exact: true })[1]).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("10000")).toBeInTheDocument();
  });

  it("keeps only one center modifier active at a time", () => {
    render(<DartboardPage />);

    const squareButton = screen.getAllByTitle("Square — Square the number (n²).", { exact: true })[1];
    const roundButton = screen.getAllByTitle("Round to 10 — Round to the nearest 10.", { exact: true })[1];

    fireEvent.click(squareButton);
    fireEvent.click(roundButton);

    expect(squareButton).toHaveAttribute("aria-pressed", "false");
    expect(roundButton).toHaveAttribute("aria-pressed", "true");
  });

  it("applies an exclusive outer operator after the main result", () => {
    render(<DartboardPage />);

    fireEvent.change(screen.getByLabelText("Bullseye starting value"), { target: { value: "5" } });
    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    fireEvent.click(screen.getByRole("button", { name: /diagonal line/i }));

    expect(screen.getByText("12.5")).toBeInTheDocument();
    expect(screen.getByText(/outer modifier · Diagonal Line/i)).toBeInTheDocument();
  });

  it("routes the advanced outer ring to outer modifier selection", () => {
    render(<DartboardPage />);

    fireEvent.change(screen.getByLabelText("Bullseye starting value"), { target: { value: "5" } });
    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    fireEvent.click(screen.getByRole("button", { name: /advanced/i }));
    fireEvent.click(screen.getByLabelText("outer modifier Diagonal Line"));

    expect(screen.getByText("12.5")).toBeInTheDocument();
  });

  it("clears the selected area and the whole dartboard independently", () => {
    render(<DartboardPage />);

    fireEvent.change(screen.getByLabelText("Bullseye starting value"), { target: { value: "5" } });
    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    expect(screen.getByText("25")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear selection/i }));
    expect(screen.getByText("5", { selector: "div" })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("inner wedge 20"));
    fireEvent.click(screen.getAllByTitle("Square — Square the number (n²).", { exact: true })[1]);
    fireEvent.click(screen.getByRole("button", { name: /clear dartboard/i }));

    expect(screen.getByText("Enter the bullseye starting value.")).toBeInTheDocument();
    expect(screen.getAllByTitle("Square — Square the number (n²).", { exact: true })[1]).toHaveAttribute("aria-pressed", "false");
  });
});