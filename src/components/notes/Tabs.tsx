import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

function joinClasses(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={joinClasses(
        "inline-flex h-9 items-stretch justify-center rounded-lg bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={joinClasses(
        "relative inline-flex h-full cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:after:absolute data-[state=active]:after:inset-x-2 data-[state=active]:after:-bottom-0.5 data-[state=active]:after:h-[3px] data-[state=active]:after:rounded-full data-[state=active]:after:bg-brass",
        className,
      )}
      {...props}
    />
  );
});

export { Tabs, TabsList, TabsTrigger };
