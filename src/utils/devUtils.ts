// Development utilities for version management testing
// These can be used in browser console for testing

import { checkAppVersion, getCurrentAppVersion, getStoredAppVersion, forceAppReset } from './versionManager';

// Make version management functions available globally in development
declare global {
  interface Window {
    __DEV_VERSION_UTILS__: {
      getCurrentVersion: () => string;
      getStoredVersion: () => string | null;
      checkVersion: () => void;
      forceReset: () => void;
      testVersionChange: (newVersion: string) => void;
    };
  }
}

// Only expose in development
if (import.meta.env.DEV) {
  window.__DEV_VERSION_UTILS__ = {
    getCurrentVersion: getCurrentAppVersion,
    getStoredVersion: getStoredAppVersion,
    checkVersion: checkAppVersion,
    forceReset: forceAppReset,
    testVersionChange: (newVersion: string) => {
      console.log(`Testing version change to: ${newVersion}`);
      localStorage.setItem('app_version', newVersion);
      console.log('Now reload the page to see version mismatch handling');
    }
  };

  console.log('🔧 Version management dev tools available at: window.__DEV_VERSION_UTILS__');
  console.log('Current app version:', getCurrentAppVersion());
  console.log('Stored version:', getStoredAppVersion());
}

export {};
