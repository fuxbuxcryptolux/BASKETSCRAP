const KEY = "lastscrap.meta.v1";

const DEFAULT = { securedScrap: 0, upgrades: {} };

export function loadMeta() {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return { securedScrap: parsed.securedScrap ?? 0, upgrades: parsed.upgrades ?? {} };
  } catch {
    return DEFAULT;
  }
}

export function saveMeta(m) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    // ignore
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
        const safe = {
          securedScrap: typeof parsed.securedScrap === "number" ? parsed.securedScrap : 0,
          upgrades: parsed.upgrades && typeof parsed.upgrades === "object" ? parsed.upgrades : {},
        };
        saveMeta(safe);
        resolve(safe);
      } catch {
        reject(new Error("Invalid save file"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}
