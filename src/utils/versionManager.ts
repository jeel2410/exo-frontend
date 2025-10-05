import { APP_VERSION, VERSION_STORAGE_KEY } from "./constant/version";

/**
 * Checks if the app version has changed and clears storage if needed
 * Should be called before the app initializes
 */
export const checkAppVersion = (): void => {
  try {
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

    // If no version stored or version mismatch
    if (!storedVersion || storedVersion !== APP_VERSION) {
      console.log(
        `App version changed from ${
          storedVersion || "unknown"
        } to ${APP_VERSION}. Clearing storage...`
      );

      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage completely
      sessionStorage.clear();

      // Set the new version
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);

      // Force reload the window to ensure fresh state
      // window.location.reload();
      window.location.reload();
    }
  } catch (error) {
    console.error("Error checking app version:", error);
    // If version check fails, still try to set current version
    try {
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    } catch (setError) {
      console.error("Failed to set app version:", setError);
    }
  }
};

/**
 * Gets the current app version
 */
export const getCurrentAppVersion = (): string => {
  return APP_VERSION;
};

/**
 * Gets the stored app version from localStorage
 */
export const getStoredAppVersion = (): string | null => {
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY);
  } catch (error) {
    console.error("Error getting stored app version:", error);
    return null;
  }
};

/**
 * Manually force clear storage and reload (for testing or manual reset)
 */
export const forceAppReset = (): void => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    window.location.reload();
  } catch (error) {
    console.error("Error forcing app reset:", error);
  }
};
