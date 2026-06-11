import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageLayout } from "@/components/common/PageLayout";
import { usePageLayoutMobileDrawerControls } from "@/hooks/usePageLayoutMobileDrawer";

vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => unknown }) =>
    select({ location: { pathname: "/" } }),
}));

function MobileDrawerTrigger() {
  const controls = usePageLayoutMobileDrawerControls();

  return (
    <button type="button" onClick={() => controls?.openMobileDrawer("right")}>
      Open right
    </button>
  );
}

describe("PageLayout", () => {
  it("matches snapshot for three-column layout", () => {
    const { asFragment } = render(
      <PageLayout>
        <PageLayout.Left>
          <div>left</div>
        </PageLayout.Left>
        <PageLayout.Middle>
          <div>middle</div>
        </PageLayout.Middle>
        <PageLayout.Right>
          <div>right</div>
        </PageLayout.Right>
      </PageLayout>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot for single-column layout", () => {
    const { asFragment } = render(
      <PageLayout>
        <PageLayout.Middle>
          <div>settings-like-content</div>
        </PageLayout.Middle>
      </PageLayout>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("keeps middle scroll position when wheeling sidebars", () => {
    const { container } = render(
      <PageLayout>
        <PageLayout.Left>
          <div>left</div>
        </PageLayout.Left>
        <PageLayout.Middle>
          <div>middle</div>
        </PageLayout.Middle>
      </PageLayout>,
    );

    const middle = container.querySelector("main") as HTMLElement;
    const sidebar = container.querySelector("aside") as HTMLElement;
    middle.scrollTop = 5;

    fireEvent.wheel(sidebar, { deltaY: 20 });
    expect(middle.scrollTop).toBe(5);
  });

  it("opens the right mobile drawer through the shared controls", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        media: "(max-width: 767px)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    const { container } = render(
      <PageLayout>
        <PageLayout.Middle>
          <MobileDrawerTrigger />
        </PageLayout.Middle>
        <PageLayout.Right>
          <div>right drawer content</div>
        </PageLayout.Right>
      </PageLayout>,
    );

    expect(container.querySelector(".page-layout-mobile-drawer-right")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open right" }));

    expect(screen.getByText("right drawer content")).toBeInTheDocument();
  });

  it("does not render desktop grid track classes in mobile mode", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        media: "(max-width: 767px)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    const { container } = render(
      <PageLayout>
        <PageLayout.Left>
          <div>left</div>
        </PageLayout.Left>
        <PageLayout.Middle>
          <div>middle</div>
        </PageLayout.Middle>
        <PageLayout.Right>
          <div>right</div>
        </PageLayout.Right>
      </PageLayout>,
    );

    expect(container.firstElementChild?.className).not.toContain(
      "grid-cols-[var(--sidebar-width)_minmax(0,1fr)_var(--sidebar-width)]",
    );
  });
});
