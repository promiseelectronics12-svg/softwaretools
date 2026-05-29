"use client";

import { useEffect, useState } from "react";
import { SETTING_DEFAULTS, type SettingsMap } from "./settings";

let cachedSettings: SettingsMap | null = null;

export function useSettings(): SettingsMap {
  const [settings, setSettings] = useState<SettingsMap>(cachedSettings ?? SETTING_DEFAULTS);

  useEffect(() => {
    if (cachedSettings) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        cachedSettings = { ...SETTING_DEFAULTS, ...data.settings };
        setSettings(cachedSettings!);
      })
      .catch(() => {});
  }, []);

  return settings;
}
