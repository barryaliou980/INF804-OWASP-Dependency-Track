import { ScanResult } from './types';

// Utilisation de globalThis pour persister le storage entre les recompilations
// de modules en développement Next.js (le Map classique est recréé à chaque hot-reload)
const STORAGE_KEY = '__depscan_storage__';

function getStorage(): Map<string, unknown> {
  if (!(globalThis as Record<string, unknown>)[STORAGE_KEY]) {
    (globalThis as Record<string, unknown>)[STORAGE_KEY] = new Map<string, unknown>();
  }
  return (globalThis as Record<string, unknown>)[STORAGE_KEY] as Map<string, unknown>;
}

export const globalStorage = {
  get(key: string): any {
    return getStorage().get(key);
  },
  set(key: string, value: unknown): void {
    getStorage().set(key, value);
  },
  delete(key: string): boolean {
    return getStorage().delete(key);
  },
  has(key: string): boolean {
    return getStorage().has(key);
  }
};
