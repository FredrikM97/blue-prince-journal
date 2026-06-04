import { browserDbStorage } from "./syncStorage/browserDbStorage";
import { localDbStorage } from "./syncStorage/localDbStorage";
import type { AppDataSnapshot, StorageAdapter } from "./syncStorage/types";

export type { AppDataSnapshot, StorageAdapter };

export type StorageBackend = "indexed-db" | "local-storage";

const backends: Record<StorageBackend, StorageAdapter> = {
  "indexed-db": browserDbStorage,
  "local-storage": localDbStorage,
};

let activeBackend: StorageBackend = "indexed-db";

export function getStorageBackend(): StorageBackend {
  return activeBackend;
}

export function setStorageBackend(backend: StorageBackend): void {
  activeBackend = backend;
}

export const storageAdapter: StorageAdapter = {
  read() {
    return backends[activeBackend].read();
  },
  clear() {
    return backends[activeBackend].clear();
  },
  write(data) {
    return backends[activeBackend].write(data);
  },
};
