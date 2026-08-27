import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';

// ─── Local version source of truth ────────────────────────────────────────────
// To release a new version: bump "version" in /version.json and push to main.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const localVersionInfo = require('../../version.json') as {
  version: string;
  buildNumber: number;
  releaseNotes: string;
};

// ─── GitHub raw URL ────────────────────────────────────────────────────────────
// Points to version.json on the main branch of your repo.
const GITHUB_VERSION_URL =
  'https://raw.githubusercontent.com/MSV-Global-Tech/Siddhanta-Shikamani/main/version.json';

export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.msvglobaltech.siddhantashikamani';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseVersion(version: string): number[] {
  return (version ?? '0.0.0')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
}

function isNewerVersion(remote: string, current: string): boolean {
  const r = parseVersion(remote);
  const c = parseVersion(current);
  for (let i = 0; i < Math.max(r.length, c.length); i++) {
    const rv = r[i] ?? 0;
    const cv = c[i] ?? 0;
    if (rv > cv) return true;
    if (rv < cv) return false;
  }
  return false;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface RemoteVersionInfo {
  version: string;
  buildNumber: number;
  releaseNotes: string;
}

export interface AppUpdateState {
  /** True when GitHub version.json has a newer version */
  updateAvailable: boolean;
  /** Full remote version info fetched from GitHub */
  remoteVersionInfo: RemoteVersionInfo | null;
  /** Current installed version from local version.json */
  currentVersion: string;
  /** True while OTA update is downloading/applying */
  isApplyingOTA: boolean;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useAppUpdate
 *
 * Layer 1 — EAS OTA: silently checks, downloads and reloads for JS/asset changes.
 * Layer 2 — version.json check: fetches version.json from GitHub main branch.
 *   If remote version > local version → shows forced "Update Now" modal.
 *
 * To trigger an update prompt: bump "version" in /version.json and push to main.
 */
export function useAppUpdate(): AppUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [remoteVersionInfo, setRemoteVersionInfo] = useState<RemoteVersionInfo | null>(null);
  const [isApplyingOTA, setIsApplyingOTA] = useState(false);

  const currentVersion = localVersionInfo.version;

  useEffect(() => {
    async function checkForUpdates() {
      // ── Layer 1: EAS OTA (production builds only) ────────────────────────
      if (!__DEV__) {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            setIsApplyingOTA(true);
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync(); // App restarts here — no return
            return;
          }
        } catch (_e) {
          // Offline or OTA unavailable — fall through
        } finally {
          setIsApplyingOTA(false);
        }
      }

      // ── Layer 2: GitHub version.json check ───────────────────────────────
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(GITHUB_VERSION_URL, {
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeout);

        if (!response.ok) return;

        const remote: RemoteVersionInfo = await response.json();

        if (remote.version && isNewerVersion(remote.version, currentVersion)) {
          setRemoteVersionInfo(remote);
          setUpdateAvailable(true);
        }
      } catch (_e) {
        // Network error or timeout — silently skip
      }
    }

    checkForUpdates();
  }, [currentVersion]);

  return { updateAvailable, remoteVersionInfo, currentVersion, isApplyingOTA };
}
