import { Link } from "@tanstack/react-router";
import { Stack } from "@/components/common/general/Stack";

const NAV_ROUTES = [
  { to: "/notes" as const, label: "Notes" },
  { to: "/todos" as const, label: "Todo" },
  { to: "/map" as const, label: "Map" },
  { to: "/graph" as const, label: "Graph" },
  { to: "/images" as const, label: "Images" },
  { to: "/dartboard" as const, label: "Dartboard" },
] as const;

export function HeaderNav({ pathname }: { pathname: string }) {
  return (
    <Stack
      as="nav"
      className="order-3 flex basis-full min-w-0 flex-nowrap items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-none lg:basis-auto lg:flex-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
      gap="0"
    >
      {NAV_ROUTES.map(({ to, label }) => {
        const isActive = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            className={`relative rounded px-2 py-1 text-sm text-muted-foreground after:absolute after:inset-x-2 after:-bottom-0.5 after:h-[3px] after:rounded-full after:transition-colors dark:text-foreground/70${
              isActive
                ? " font-semibold text-foreground after:bg-brass"
                : " hover:text-foreground after:bg-transparent hover:after:bg-border"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </Stack>
  );
}
