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

export type DialogOverlayVariant = "default" | "subtle";

function getDialogContentClass(variant: DialogVariant): string {
  const baseClassName =
    "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border border-border bg-card shadow-lg duration-150 sm:rounded-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0";
  const bodyUtilityClass =
    "[&_.dialog-scroll-body]:min-h-0 [&_.dialog-scroll-body]:flex [&_.dialog-scroll-body]:flex-1 [&_.dialog-scroll-body]:flex-col [&_.dialog-scroll-body]:overflow-y-auto [&_.dialog-scroll-body-tall]:min-h-0 [&_.dialog-scroll-body-tall]:flex [&_.dialog-scroll-body-tall]:flex-1 [&_.dialog-scroll-body-tall]:flex-col [&_.dialog-scroll-body-tall]:overflow-y-auto";

  if (variant === "compact") return `${baseClassName} grid w-full max-w-md gap-4 p-6`;
  if (variant === "preview") {
    return `${baseClassName} ${bodyUtilityClass} flex h-auto max-h-[calc(100dvh-2rem)] w-[96vw] max-w-5xl flex-col gap-4 overflow-hidden p-6`;
  }
  if (variant === "expand") {
    return `${baseClassName} ${bodyUtilityClass} flex max-h-[calc(100dvh-2rem)] w-[90vw] max-w-4xl flex-col gap-3 overflow-hidden p-6`;
  }
  if (variant === "wide") {
    return `${baseClassName} ${bodyUtilityClass} flex h-auto max-h-[calc(100dvh-2rem)] w-[90vw] max-w-5xl flex-col gap-3 overflow-hidden p-4`;
  }
  if (variant === "fullscreen") {
    return `${baseClassName} flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-0 p-3 pr-10`;
  }
  if (variant === "editor") return `${baseClassName} max-h-[80vh] max-w-2xl overflow-hidden p-0`;
  return `${baseClassName} grid w-full max-w-lg gap-4 p-6`;
}

function getDefaultShowClose(variant: DialogVariant): boolean {
  if (variant === "editor") return false;
  return true;
}

function getDialogOverlayClass(variant: DialogOverlayVariant): string {
  const baseOverlayClass =
    "fixed inset-0 z-50 bg-background/35 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0";
  if (variant === "subtle") return `${baseOverlayClass} bg-background/25`;
  return baseOverlayClass;
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
          <DialogPrimitive.Close className="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

/** Stacked title + optional description header. */
export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>((props, ref) => (
  <DialogPrimitive.Title ref={ref} className="text-lg font-semibold leading-none tracking-tight" {...props} />
));

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>((props, ref) => (
  <DialogPrimitive.Description ref={ref} className="text-sm text-muted-foreground" {...props} />
));
