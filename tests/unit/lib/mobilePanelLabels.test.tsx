import { describe, expect, it } from "vitest";
import { resolveMobilePanelLabels } from "@/routes/mobilePanelLabels";

describe("resolveMobilePanelLabels", () => {
  it("returns section-specific mobile labels", () => {
    expect(resolveMobilePanelLabels("/graph")).toEqual({ left: "Filters", right: "Details" });
    expect(resolveMobilePanelLabels("/map")).toEqual({ left: "Filters", right: "Details" });
    expect(resolveMobilePanelLabels("/images")).toEqual({ left: "Library", right: "Details" });
    expect(resolveMobilePanelLabels("/todos")).toEqual({ left: "Filters" });
    expect(resolveMobilePanelLabels("/notes")).toEqual({ left: "Filters", right: "Preview" });
    expect(resolveMobilePanelLabels("/")).toEqual({ left: "Filters", right: "Preview" });
  });

  it("falls back to default labels for unknown routes", () => {
    expect(resolveMobilePanelLabels("/books")).toEqual({
      left: "Left panel",
      right: "Right panel",
    });
    expect(resolveMobilePanelLabels("/settings")).toEqual({
      left: "Left panel",
      right: "Right panel",
    });
  });
});
