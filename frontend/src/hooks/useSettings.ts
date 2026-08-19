import { useState } from "react";

import { getSettings, saveSettings } from "../utils/settings.storage";

import type { AppSettings } from "../utils/settings.storage";

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const updateSettings = (data: Partial<AppSettings>) => {
    const updated = {
      ...settings,
      ...data,
    };

    setSettings(updated);

    saveSettings(updated);
  };

  return {
    settings,

    updateSettings,
  };
};
