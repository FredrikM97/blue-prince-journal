import { useEffect, useRef, type ReactNode } from "react";
import { Maximize2, X } from "lucide-react";
import { IconButton } from "@/components/common/Button";
import {
  usePageLayoutMobileDrawerControls,
  type MobileDrawerSide,
} from "@/components/common/PageLayoutMobileDrawerContext";

type SidePanelBaseProps = {
  title: string;
  /** Short secondary text shown below the title (e.g. type, status). */
  subtitle?: string;
  /** When true, renders the title with a strikethrough (e.g. completed todo). */
  done?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
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
  subtitle,
  done = false,
  onClose,
  onExpand,
}: {
  title: string;
  subtitle?: string;
  done?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
}) {
  let titleClass = "panel-title";
  if (done) {
    titleClass = "panel-title panel-title-done";
  }

  return (
    <div className="panel-header">
      <div className="panel-header-title-wrap">
        <h2 className={titleClass}>{title}</h2>
        {subtitle && <p className="preview-subtitle">{subtitle}</p>}
      </div>
      {(onExpand || onClose) && (
        <div className="preview-header-actions">
          {onExpand && (
            <IconButton onClick={onExpand} title="Expand preview">
              <Maximize2 className="icon-md" />
            </IconButton>
          )}
          {onClose && (
            <IconButton onClick={onClose} title="Close" aria-label="Close panel">
              <X className="icon-md" />
            </IconButton>
          )}
        </div>
      )}
    </div>
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
  subtitle,
  done = false,
  onClose,
  onExpand,
  expandDialog,
  mobileDrawerSide,
  mobileDrawerKey,
  children,
}: SidePanelInternalProps) {
  const mobileDrawerControls = usePageLayoutMobileDrawerControls();
  const lastOpenedKeyRef = useRef<string | null>(null);

  function handleClose() {
    if (mobileDrawerControls && mobileDrawerSide && typeof window !== "undefined") {
      if (window.innerWidth < 1024) {
        mobileDrawerControls.closeMobileDrawer();
      }
    }
    onClose?.();
  }

  useEffect(() => {
    if (!mobileDrawerControls || !mobileDrawerSide || !mobileDrawerKey) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) return;
    if (lastOpenedKeyRef.current === mobileDrawerKey) return;

    lastOpenedKeyRef.current = mobileDrawerKey;
    mobileDrawerControls.openMobileDrawer(mobileDrawerSide);
  }, [mobileDrawerControls, mobileDrawerKey, mobileDrawerSide]);

  return (
    <div className="side-panel-shell">
      <PanelHeader
        title={title}
        subtitle={subtitle}
        done={done}
        onExpand={onExpand}
        onClose={handleClose}
      />
      {children}
      {expandDialog}
    </div>
  );
}

function SidePanelRight({ panelKey, ...props }: SidePanelVariantProps) {
  return <SidePanelComponent {...props} mobileDrawerSide="right" mobileDrawerKey={panelKey} />;
}

function SidePanelLeft({ panelKey, ...props }: SidePanelVariantProps) {
  return <SidePanelComponent {...props} mobileDrawerSide="left" mobileDrawerKey={panelKey} />;
}

export const SidePanel = Object.freeze({
  Right: SidePanelRight,
  Left: SidePanelLeft,
});
