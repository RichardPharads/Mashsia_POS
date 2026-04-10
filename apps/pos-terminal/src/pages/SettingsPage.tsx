import React, { useEffect, useState, useRef } from "react";

/**
 * SettingsPage
 *
 * Simple configurable settings page for POS Terminal:
 * - Shop Name
 * - POS ID
 * - API URL (with test button)
 * - WiFi (SSID & Password) — note: storing only; actual OS wifi not modified
 * - Theme: light / dark
 * - Primary color (hex)
 * - Logo upload (image preview, stored in localStorage as base64)
 *
 * Stores settings in localStorage under `pos_terminal_settings`.
 *
 * NOTE: This page is UI-only for the terminal app (Tauri) and does not perform
 * system-level changes such as actually changing WiFi or OS theme. It does,
 * however, persist settings and can test the API endpoint with a fetch to /health.
 */

type Settings = {
  shopName: string;
  posId: string;
  apiUrl: string;
  wifiSsid: string;
  wifiPassword: string;
  theme: "light" | "dark";
  primaryColor: string; // hex
  logoBase64?: string | null;
};

const STORAGE_KEY = "pos_terminal_settings_v1";

const DEFAULTS: Settings = {
  shopName: "My Shop",
  posId: "POS-001",
  apiUrl: "http://localhost:3000",
  wifiSsid: "",
  wifiPassword: "",
  theme: "dark",
  primaryColor: "#0ea5e9", // sky-500
  logoBase64: null,
};

export default function SettingsPage(): any {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      } else {
        setSettings(DEFAULTS);
      }
      setStatusMessage(null);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setStatusMessage("Failed to load settings from storage.");
    }
  }

  function validate(s: Settings) {
    const e: Record<string, string> = {};
    if (!s.shopName || s.shopName.trim().length < 2) {
      e.shopName = "Shop name must be at least 2 characters.";
    }
    if (!s.posId || s.posId.trim().length < 1) {
      e.posId = "POS ID is required.";
    }
    try {
      // ensure API URL is a valid URL
      // allow missing trailing path; we'll attempt fetch to /health during test
      const url = new URL(s.apiUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        e.apiUrl = "API URL must start with http:// or https://";
      }
    } catch {
      e.apiUrl = "API URL is not a valid URL.";
    }
    // primary color hex basic validation
    if (!/^#([0-9A-Fa-f]{6})$/.test(s.primaryColor)) {
      e.primaryColor = "Primary color must be a hex code like #1e40af";
    }
    return e;
  }

  function saveSettings() {
    const errs = validate(settings);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStatusMessage("Please fix validation errors before saving.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setStatusMessage("Settings saved.");
    } catch (err) {
      console.error("Failed to save settings:", err);
      setStatusMessage("Failed to save settings.");
    }
  }

  function resetToDefaults() {
    setSettings(DEFAULTS);
    setErrors({});
    setStatusMessage("Reset to defaults (not yet saved). Hit Save to persist.");
  }

  function onLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      setSettings((prev) => ({ ...prev, logoBase64: base64 }));
      setStatusMessage("Logo loaded (not yet saved).");
    };
    reader.onerror = () => {
      setStatusMessage("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  }

  function clearLogo() {
    setSettings((prev) => ({ ...prev, logoBase64: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function testApiConnection() {
    setApiTestResult(null);
    setStatusMessage(null);
    const url = settings.apiUrl.replace(/\/+$/, ""); // strip trailing slash
    const healthUrl = url + "/health";
    setLoading(true);
    try {
      const resp = await fetch(healthUrl, { method: "GET", cache: "no-store" });
      if (!resp.ok) {
        setApiTestResult(`API responded with status ${resp.status}`);
      } else {
        const text = await resp.text();
        setApiTestResult(`OK — ${resp.status}: ${text}`);
      }
    } catch (err: any) {
      setApiTestResult(`Failed: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  // small helper to update single field
  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const cp = { ...prev };
      delete cp[key as string];
      return cp;
    });
  }

  return (
    <div className="p-6  mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Terminal Settings</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium">Shop Name</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            value={settings.shopName}
            onChange={(e) => updateField("shopName", e.target.value)}
            placeholder="My Coffee Shop"
          />
          {errors.shopName && (
            <p className="text-xs text-red-400">{errors.shopName}</p>
          )}

          <label className="block text-sm font-medium">POS ID</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            value={settings.posId}
            onChange={(e) => updateField("posId", e.target.value)}
            placeholder="POS-001"
          />
          {errors.posId && (
            <p className="text-xs text-red-400">{errors.posId}</p>
          )}

          <label className="block text-sm font-medium">API URL</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            value={settings.apiUrl}
            onChange={(e) => updateField("apiUrl", e.target.value)}
            placeholder="http://localhost:3000"
          />
          {errors.apiUrl && (
            <p className="text-xs text-red-400">{errors.apiUrl}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={testApiConnection}
              disabled={loading}
              className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
            >
              Test API (/health)
            </button>
            {apiTestResult && (
              <div className="text-sm text-slate-300 ml-2">{apiTestResult}</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">WiFi SSID</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            value={settings.wifiSsid}
            onChange={(e) => updateField("wifiSsid", e.target.value)}
            placeholder="MyWiFiNetwork"
          />

          <label className="block text-sm font-medium">WiFi Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            value={settings.wifiPassword}
            onChange={(e) => updateField("wifiPassword", e.target.value)}
            placeholder="••••••••"
          />
          <p className="text-xs text-slate-400">
            Note: This page stores WiFi credentials locally for the terminal —
            it does not connect the OS to WiFi automatically.
          </p>

          <label className="block text-sm font-medium">POS Theme</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateField("theme", "dark")}
              className={`rounded-md px-3 py-2 text-sm ${
                settings.theme === "dark"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => updateField("theme", "light")}
              className={`rounded-md px-3 py-2 text-sm ${
                settings.theme === "light"
                  ? "bg-slate-200 text-slate-900"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              Light
            </button>
          </div>

          <label className="block text-sm font-medium">Primary Color</label>
          <input
            type="color"
            className="w-16 h-10 p-0 rounded-md border border-slate-700"
            value={settings.primaryColor}
            onChange={(e) => updateField("primaryColor", e.target.value)}
            title="Primary brand color"
          />

          <label className="block text-sm font-medium">Logo (PNG/JPG)</label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onLogoSelected}
              className="text-sm text-slate-300"
            />
            <button
              type="button"
              onClick={clearLogo}
              className="rounded-md bg-gray-700 px-3 py-1 text-xs text-white"
            >
              Clear
            </button>
          </div>
          {settings.logoBase64 && (
            <div className="mt-2">
              <img
                src={settings.logoBase64}
                alt="Logo preview"
                className="h-20 w-auto object-contain border border-slate-700 bg-white/5"
              />
            </div>
          )}
        </div>
      </section>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={saveSettings}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Save Settings
        </button>
        <button
          onClick={resetToDefaults}
          className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
        >
          Reset to defaults
        </button>
        <div className="ml-auto text-sm text-slate-300">{statusMessage}</div>
      </div>
    </div>
  );
}
