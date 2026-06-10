import { describe, expect, it } from "vitest";
import { resolveMobilePanelLabels } from "@/routes/mobilePanelLabels";

describe("resolveMobilePanelLabels", () => {
  it("returns section-specific mobile labels", () => {
    expect(resolveMobilePanelLabels("/section/graph")).toEqual({ left: "Filters", right: "Details" });
    expect(resolveMobilePanelLabels("/section/map")).toEqual({ left: "Filters", right: "Details" });
    expect(resolveMobilePanelLabels("/section/images")).toEqual({ left: "Library", right: "Details" });
    expect(resolveMobilePanelLabels("/section/todos")).toEqual({ left: "Filters" });
    expect(resolveMobilePanelLabels("/")).toEqual({ left: "Filters", right: "Preview" });
  });

  it("falls back to default labels for unknown routes", () => {
    expect(resolveMobilePanelLabels("/section/books")).toEqual({
      left: "Left panel",
      right: "Right panel",
    });
    expect(resolveMobilePanelLabels("/settings")).toEqual({
      left: "Left panel",
      right: "Right panel",
    });
  });
});
