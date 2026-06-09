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
 * All visual styles are defined in dropdown.css — do not pass className.
 */

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";

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
  if (variant === "select") variantClass = "dropdown-select-content";

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={`dropdown-content ${variantClass} ${className}`.trim()}
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
    <DropdownMenuPrimitive.SubTrigger className="dropdown-sub-trigger" {...props}>
      {children}
      <ChevronRight className="ml-auto icon-sm" />
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
      className={`dropdown-content ${className}`.trim()}
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
  if (tone === "active") toneClass = "menu-item-active";

  return (
    <DropdownMenuPrimitive.Item
      className={`dropdown-item ${toneClass} ${className}`.trim()}
      {...props}
    />
  );
}

/** Horizontal divider between menu sections. */
export function DropdownMenuSeparator(
  props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>,
) {
  return <DropdownMenuPrimitive.Separator className="dropdown-separator" {...props} />;
}
