"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export type DialogVariant =
  | "default"
  | "compact"
  | "preview"
  | "expand"
  | "wide"
  | "fullscreen"
  | "editor";

function getDialogContentClass(variant: DialogVariant): string {
  if (variant === "compact") return "dialog-content-compact";
  if (variant === "preview") return "dialog-content-preview";
  if (variant === "expand") return "dialog-content-expand";
  if (variant === "wide") return "dialog-content-wide";
  if (variant === "fullscreen") return "dialog-content-fullscreen";
  if (variant === "editor") return "dialog-content-editor";
  return "dialog-content-default";
}

function getDefaultShowClose(variant: DialogVariant): boolean {
  if (variant === "editor") return false;
  return true;
}

export const Dialog = DialogPrimitive.Root;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>((props, ref) => <DialogPrimitive.Overlay ref={ref} className="dialog-overlay" {...props} />);

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "className"> & {
    /** Size/layout preset — defaults to "default". */
    variant?: DialogVariant;
    /**
     * Whether to show the built-in close (×) button.
     * Defaults to false for the "editor" variant where the caller owns the header.
     */
    showClose?: boolean;
  }
>(({ children, variant = "default", showClose, ...props }, ref) => {
  let shouldShowClose = getDefaultShowClose(variant);
  if (showClose !== undefined) shouldShowClose = showClose;

  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} className={getDialogContentClass(variant)} {...props}>
        {children}
        {shouldShowClose && (
          <DialogPrimitive.Close className="dialog-close-btn">
            <X className="icon-md" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

/** Stacked title + optional description header. */
export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="dialog-header">{children}</div>;
}

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>((props, ref) => <DialogPrimitive.Title ref={ref} className="dialog-title-elem" {...props} />);

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>((props, ref) => (
  <DialogPrimitive.Description ref={ref} className="dialog-description-elem" {...props} />
));
