import { useCallback, useMemo, useState } from "react";

type MobileDrawerSignal = string;
type MobileDrawerOpenKey = MobileDrawerSignal | false;

export function useMobileAwarePanel<T>({
  getSignal,
}: {
  getSignal: (value: T) => MobileDrawerSignal;
}) {
  const [panelValue, setPanelValue] = useState<T | null>(null);

  const openPanel = useCallback((value: T) => {
    setPanelValue(value);
  }, []);

  const closePanel = useCallback(() => {
    setPanelValue(null);
  }, []);

  const mobileDrawerOpen = useMemo<MobileDrawerOpenKey>(() => {
    if (panelValue === null) return false;
    return getSignal(panelValue);
  }, [getSignal, panelValue]);

  return {
    panelValue,
    setPanelValue,
    openPanel,
    closePanel,
    mobileDrawerOpen,
  };
}