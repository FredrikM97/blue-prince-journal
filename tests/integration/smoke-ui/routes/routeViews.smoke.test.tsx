import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockStoreState = {
  sections: [] as Array<{
    id: string;
    label: string;
    builtin?: string;
    filter?: { type?: string };
  }>,
};

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    HeadContent: () => null,
    Outlet: () => <div data-testid="mock-outlet" />,
    Scripts: () => null,
    useRouter: () => ({ invalidate: vi.fn() }),
  };
});

vi.mock("@/data/store", () => ({
  useStore: (selector: (state: typeof mockStoreState) => unknown) => selector(mockStoreState),
}));

vi.mock("@/components/notes/NotesPage", () => ({
  NotesPage: (props: Record<string, unknown>) => (
    <div data-testid="notes-page">notes:{JSON.stringify(props)}</div>
  ),
}));

vi.mock("@/components/settings/SettingsPage", () => ({
  SettingsPage: () => <div data-testid="settings-page">settings</div>,
}));

vi.mock("@/components/todos/TodosPage", () => ({
  TodosPage: () => <div data-testid="todos-page">todos</div>,
}));

vi.mock("@/components/map/MapPage", () => ({
  MapPage: () => <div data-testid="map-page">map</div>,
}));

vi.mock("@/components/images/ImagesPage", () => ({
  ImagesPage: () => <div data-testid="images-page">images</div>,
}));

vi.mock("@/components/graph/GraphPage", () => ({
  GraphPage: () => <div data-testid="graph-page">graph</div>,
}));

import { NotFoundView, NotesIndexView } from "@/routes/__root";

describe("route views smoke snapshots", () => {
  beforeEach(() => {
    mockStoreState.sections = [];
  });

  it("matches snapshot for not-found route shell", () => {
    const { asFragment } = render(<NotFoundView />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot for notes index route", () => {
    const { asFragment } = render(<NotesIndexView />);
    expect(asFragment()).toMatchSnapshot();
  });

});
