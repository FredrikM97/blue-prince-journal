/**
 * Thin styled wrappers around Radix UI DropdownMenu primitives.
 *
 * Typical structure:
 *   <DropdownMenu>
 *     <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *     <DropdownMenuContent>
 *       <DropdownMenuItem onSelect={...}>Action</DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuSub>
 *         <DropdownMenuSubTrigger>Group</DropdownMenuSubTrigger>
 *         <DropdownMenuSubContent>
 *           <DropdownMenuItem onSelect={...}>Item</DropdownMenuItem>
 *         </DropdownMenuSubContent>
 *       </DropdownMenuSub>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 *
 * All visual styles are co-located in this module.
 */

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";

const DROPDOWN_CONTENT_CLASS =
  "z-50 min-w-[8rem] max-h-[var(--radix-dropdown-menu-content-available-height)] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md [scrollbar-gutter:stable] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";
const DROPDOWN_SUB_TRIGGER_CLASS =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent";
const DROPDOWN_ITEM_CLASS =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
const DROPDOWN_ACTIVE_ITEM_CLASS = "bg-accent";
const DROPDOWN_SEPARATOR_CLASS = "-mx-1 my-1 h-px bg-muted";
const DROPDOWN_SELECT_CONTENT_CLASS = "w-[var(--radix-dropdown-menu-trigger-width)]";

type DropdownMenuContentVariant = "default" | "select";
type DropdownMenuItemTone = "default" | "active";

/** Root controller — manages open/close state. Pass modal={false} for inline panels. */
export const DropdownMenu = DropdownMenuPrimitive.Root;

/** Wraps the element that opens the menu on click. Use asChild to forward to a custom button. */
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/** Root of a sub-menu section. Must contain a SubTrigger and SubContent. */
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/** Renders menu content in a Portal above the page. Accepts an optional extra CSS class. */
export function DropdownMenuContent({
  sideOffset = 4,
  variant = "default",
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
  variant?: DropdownMenuContentVariant;
}) {
  let variantClass = "";
  if (variant === "select") variantClass = DROPDOWN_SELECT_CONTENT_CLASS;

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={`${DROPDOWN_CONTENT_CLASS} ${variantClass} ${className}`.trim()}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

/** Row that opens a nested sub-menu. Automatically appends a chevron icon. */
export function DropdownMenuSubTrigger({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger className={DROPDOWN_SUB_TRIGGER_CLASS} {...props}>
      {children}
      <ChevronRight className="ml-auto h-3.5 w-3.5" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

/** Content panel for a nested sub-menu. Accepts an optional extra CSS class. */
export function DropdownMenuSubContent({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      className={`${DROPDOWN_CONTENT_CLASS} ${className}`.trim()}
      {...props}
    />
  );
}

/** A single clickable menu row. Use onSelect for actions; use asChild to render a link. */
export function DropdownMenuItem({
  tone = "default",
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  tone?: DropdownMenuItemTone;
}) {
  let toneClass = "";
  if (tone === "active") toneClass = DROPDOWN_ACTIVE_ITEM_CLASS;

  return (
    <DropdownMenuPrimitive.Item
      className={`${DROPDOWN_ITEM_CLASS} ${toneClass} ${className}`.trim()}
      {...props}
    />
  );
}

/** Horizontal divider between menu sections. */
export function DropdownMenuSeparator(
  props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>,
) {
  return <DropdownMenuPrimitive.Separator className={DROPDOWN_SEPARATOR_CLASS} {...props} />;
}
