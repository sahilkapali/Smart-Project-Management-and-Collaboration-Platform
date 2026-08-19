export type { AppSettings } from "../types/settings.types";
import type { AppSettings } from "../types/settings.types";

const SETTINGS_KEY = "appSettings";

export const defaultSettings: AppSettings = {
  language: "English",

  timezone: "(UTC +05:45) Kathmandu",

  dateFormat: "DD MM YYYY",

  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: false,
    securityAlerts: true,
  },

  privacy: {
    profileVisibility: "public",
    allowIndexing: false,
    shareAnalytics: true,
  },
};

export const getSettings = (): AppSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);

  if (!saved) {
    return defaultSettings;
  }

  const parsed = JSON.parse(saved);

  return {
    ...defaultSettings,

    ...parsed,

    notifications: {
      ...defaultSettings.notifications,
      ...parsed.notifications,
    },

    privacy: {
      ...defaultSettings.privacy,
      ...parsed.privacy,
    },
  };
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const resetSettings = () => {
  localStorage.removeItem(SETTINGS_KEY);
};
