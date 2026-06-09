"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import "./dialog.css";

export type DialogVariant =
  | "default"
  | "compact"
  | "preview"
  | "expand"
  | "wide"
  | "fullscreen"
  | "editor";

export type DialogOverlayVariant = "default" | "subtle";

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

function getDialogOverlayClass(variant: DialogOverlayVariant): string {
  if (variant === "subtle") return "dialog-overlay dialog-overlay-subtle";
  return "dialog-overlay";
}

export const Dialog = DialogPrimitive.Root;
export const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    variant?: DialogOverlayVariant;
  }
>(({ variant = "default", ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={getDialogOverlayClass(variant)} {...props} />
));

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
    /** Backdrop intensity preset — defaults to "default". */
    overlayVariant?: DialogOverlayVariant;
  }
>(({ children, variant = "default", showClose, overlayVariant = "default", ...props }, ref) => {
  const { ["aria-describedby"]: ariaDescribedBy, ...contentProps } = props;

  let shouldShowClose = getDefaultShowClose(variant);
  if (showClose !== undefined) shouldShowClose = showClose;

  return (
    <DialogPrimitive.Portal>
      <DialogOverlay variant={overlayVariant} />
      <DialogPrimitive.Content
        ref={ref}
        className={getDialogContentClass(variant)}
        aria-describedby={ariaDescribedBy ?? undefined}
        {...contentProps}
      >
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
