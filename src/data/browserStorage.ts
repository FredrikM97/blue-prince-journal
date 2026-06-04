export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = "bp-storage-probe";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getLocalStorageValue(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalStorageValue(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function getLocalStorageFlag(key: string): boolean {
  return getLocalStorageValue(key) === "1";
}

export function setLocalStorageFlag(key: string): boolean {
  return setLocalStorageValue(key, "1");
}

export function readLocalStorageJson<T>(key: string): T | null {
  const raw = getLocalStorageValue(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeLocalStorageJson<T>(key: string, value: T): boolean {
  try {
    return setLocalStorageValue(key, JSON.stringify(value));
  } catch {
    return false;
  }
}
