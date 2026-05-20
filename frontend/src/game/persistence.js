import { UPGRADES } from "./data/upgrades";

const KEY = "lastscrap.meta.v1";

const DEFAULT = { securedScrap: 0, upgrades: {} };

// [fix 2.1] Validate any incoming save data: clamp securedScrap to a
// non-negative integer, and reject upgrade ids we don't know about. Clamp
// upgrade levels to 0..maxLevel from the canonical UPGRADES table. This
// stops the most obvious "edit lastscrap-save.json" cheat from giving
// users 999999 scrap or above-max upgrade levels.
function sanitizeMeta(raw) {
  const safe = { securedScrap: 0, upgrades: {} };
  if (!raw || typeof raw !== "object") return safe;
  if (typeof raw.securedScrap === "number" && Number.isFinite(raw.securedScrap)) {
    safe.securedScrap = Math.max(0, Math.floor(raw.securedScrap));
  }
  if (raw.upgrades && typeof raw.upgrades === "object") {
    for (const def of UPGRADES) {
      const lvl = raw.upgrades[def.id];
      if (typeof lvl !== "number" || !Number.isFinite(lvl)) continue;
      const clamped = Math.max(0, Math.min(def.maxLevel, Math.floor(lvl)));
      if (clamped > 0) safe.upgrades[def.id] = clamped;
    }
  }
  return safe;
}

export function loadMeta() {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return sanitizeMeta(JSON.parse(raw));
  } catch (err) {
    console.error("loadMeta failed:", err);
    return DEFAULT;
  }
}

export function saveMeta(m) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(m));
  } catch (err) {
    console.error("saveMeta failed:", err);
  }
}

export function downloadSave() {
  const data = loadMeta();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lastscrap-save.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importSave(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result);
        const safe = sanitizeMeta(parsed);
        saveMeta(safe);
        resolve(safe);
      } catch (err) {
        console.error("importSave parse failed:", err);
        reject(new Error("Invalid save file"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}
