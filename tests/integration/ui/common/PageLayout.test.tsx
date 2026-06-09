import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageLayout } from "@/components/common/PageLayout";
import { usePageLayoutMobileDrawerControls } from "@/hooks/usePageLayoutMobileDrawer";

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

    expect(container.querySelector(".page-layout-mobile-drawer-right")).not.toBeNull();
  });
});
