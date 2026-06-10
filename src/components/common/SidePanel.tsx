import { useEffect, useRef, type ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Heading, MetaText } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";
import { TitleActionHeader } from "@/components/common/TitleActionHeader";
import {
  usePageLayoutMobileDrawerControls,
  type MobileDrawerSide,
} from "@/hooks/usePageLayoutMobileDrawer";

type SidePanelBaseProps = {
  title: string;
  textSize?: "p" | "h1" | "h2";
  /** Short secondary text shown below the title (e.g. type, status). */
  subtitle?: string;
  /** When true, renders the title with a strikethrough (e.g. completed todo). */
  done?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
  headerActions?: ReactNode;
  /** Dialog element rendered at the root (outside of the scrollable area). */
  expandDialog?: ReactNode;
  children?: ReactNode;
};

type SidePanelInternalProps = SidePanelBaseProps & {
  mobileDrawerSide?: MobileDrawerSide;
  mobileDrawerKey?: string;
};

type SidePanelVariantProps = SidePanelBaseProps & {
  panelKey?: string;
};

export function PanelHeader({
  title,
  textSize = "p",
  subtitle,
  done = false,
  onClose,
  onExpand,
  headerActions,
  showCloseOnDesktop = false,
  forceShowClose = false,
}: {
  title: string;
  textSize?: "p" | "h1" | "h2";
  subtitle?: string;
  done?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
  headerActions?: ReactNode;
  showCloseOnDesktop?: boolean;
  forceShowClose?: boolean;
}) {
  let titleMuted = false;
  if (done) {
    titleMuted = true;
  }

  let shouldShowClose = false;
  if (showCloseOnDesktop || forceShowClose) {
    shouldShowClose = true;
  }

  let headingSize: "base" | "lg" = "base";
  if (textSize === "h1") {
    headingSize = "lg";
  }
  if (textSize === "h2") {
    headingSize = "base";
  }

  const titleNode = (
    <Heading as="h2" size={headingSize} leading="snug" muted={titleMuted}>
      <span className={done ? "line-through" : undefined}>{title}</span>
    </Heading>
  );

  const subtitleNode = subtitle ? (
    <MetaText as="p" size="xs" capitalize>
      {subtitle}
    </MetaText>
  ) : undefined;

  const actionsNode = (
    <>
      {headerActions}
      {onExpand && (
        <Button variant="ghost" size="icon" onClick={onExpand} title="Expand preview">
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}
    </>
  );

  return (
    <TitleActionHeader
      title={titleNode}
      subtitle={subtitleNode}
      actions={actionsNode}
      showClose={shouldShowClose}
      onClose={onClose}
    />
  );
}

/**
 * Standard right-side (or left-side) panel card.
 *
 * Contract:
 * - This component owns the panel title bar (title/subtitle/close/expand).
 * - Callers should pass header intent through props, not recreate header rows in children.
 * - `panelKey` is only for intentional mobile auto-open behavior.
 */
function SidePanelComponent({
  title,
  textSize = "p",
  subtitle,
  done = false,
  onClose,
  onExpand,
  headerActions,
  expandDialog,
  mobileDrawerSide,
  mobileDrawerKey,
  children,
}: SidePanelInternalProps) {
  const mobileDrawerControls = usePageLayoutMobileDrawerControls();
  const lastOpenedKeyRef = useRef<string | null>(null);
  const forceShowClose = mobileDrawerControls?.isPageLayoutMobile ?? false;

  function handleClose() {
    if (mobileDrawerControls?.isPageLayoutMobile && mobileDrawerSide) {
      mobileDrawerControls.closeMobileDrawer();
    }
    onClose?.();
  }

  useEffect(() => {
    if (!mobileDrawerControls || !mobileDrawerSide || !mobileDrawerKey) return;
    if (!mobileDrawerControls.isPageLayoutMobile) return;
    if (lastOpenedKeyRef.current === mobileDrawerKey) return;

    lastOpenedKeyRef.current = mobileDrawerKey;
    mobileDrawerControls.openMobileDrawer(mobileDrawerSide);
  }, [mobileDrawerControls, mobileDrawerKey, mobileDrawerSide]);

  return (
    <Stack gap="0" className="flex flex-col gap-3 rounded-lg p-2.5 text-sm sm:p-3">
      <PanelHeader
        title={title}
        textSize={textSize}
        subtitle={subtitle}
        done={done}
        headerActions={headerActions}
        onExpand={onExpand}
        onClose={handleClose}
        showCloseOnDesktop={false}
        forceShowClose={forceShowClose}
      />
      {children}
      {expandDialog}
    </Stack>
  );
}

export function SidePanelRight({ panelKey, ...props }: SidePanelVariantProps) {
  return <SidePanelComponent {...props} mobileDrawerSide="right" mobileDrawerKey={panelKey} />;
}

export function SidePanelLeft({ panelKey, ...props }: SidePanelVariantProps) {
  return <SidePanelComponent {...props} mobileDrawerSide="left" mobileDrawerKey={panelKey} />;
}
