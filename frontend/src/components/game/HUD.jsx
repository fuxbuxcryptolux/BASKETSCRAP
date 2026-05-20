import { useRunStore } from "../../store/useRunStore";

export function HUD() {
  const player = useRunStore((s) => s.player);
  const rig = useRunStore((s) => s.rig);
  const wave = useRunStore((s) => s.wave);
  const unsecured = useRunStore((s) => s.unsecured);
  const phase = useRunStore((s) => s.phase);
  const kills = useRunStore((s) => s.kills);
  const roundTimer = useRunStore((s) => s.roundTimer);
  const gambleMult = useRunStore((s) => s.gambleMult);

  const mm = Math.floor(roundTimer / 60).toString().padStart(1, "0");
  const ss = Math.floor(roundTimer % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-2 border-b border-white/10 bg-stone-950 p-2 text-xs font-medium text-white sm:text-sm" data-testid="game-hud">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="rounded bg-black/70 px-3 py-1.5">
          Wave <span className="font-bold text-amber-300" data-testid="hud-wave">{wave}</span>
          <span className="ml-2 text-xs text-white/60 uppercase" data-testid="hud-phase">{phase}</span>
          {gambleMult > 1 && (
            <span className="ml-2 rounded bg-rose-500/30 px-2 py-0.5 text-xs font-bold text-rose-200">
              GAMBLE ×{gambleMult}
            </span>
          )}
          <span
            data-testid="hud-weapon"
            className={`ml-2 rounded px-2 py-0.5 text-xs font-bold ${player.weaponMode === "melee" ? "bg-rose-500/30 text-rose-200" : "bg-emerald-500/20 text-emerald-200"}`}
          >
            {player.weaponMode === "melee" ? (player.weaponLocked ? "MELEE (no ammo)" : "MELEE") : "GUN"}
          </span>
          <span
            data-testid="hud-dash"
            className={`ml-2 rounded px-2 py-0.5 text-xs font-bold ${player.dashCooldown <= 0 ? "bg-sky-500/30 text-sky-200" : "bg-white/10 text-white/40"}`}
            title="Dash (Shift / E)"
          >
            {player.dashCooldown <= 0 ? "DASH" : `DASH ${player.dashCooldown.toFixed(1)}s`}
          </span>
        </div>
        <Stat label="Time" value={`${mm}:${ss}`} accent={roundTimer < 10 ? "#ff6b6b" : "#e8edf3"} testId="hud-time" />
        <Stat label="Kills" value={kills} testId="hud-kills" />
        <Stat label="Scrap" value={unsecured} accent="#ffd84a" testId="hud-scrap" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Bar label="HP" value={player.hp} max={player.maxHp} color="#e85d3a" testId="hud-hp" />
        <Bar label="RIG" value={rig.hp} max={rig.maxHp} color="#c9a84c" testId="hud-rig" />
        <Bar
          label={player.weaponMode === "melee" ? "MELEE" : "AMMO"}
          value={player.ammo}
          max={player.maxAmmo}
          color={player.ammo <= 0 ? "#ff6b6b" : "#73ffb8"}
          testId="hud-ammo"
        />
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "#e8edf3", testId }) {
  return (
    <div className="rounded bg-black/70 px-3 py-1.5" data-testid={testId}>
      <span className="text-xs text-white/60 uppercase mr-2">{label}</span>
      <span className="font-bold font-mono" style={{ color: accent }}>{value}</span>
    </div>
  );
}

function Bar({ label, value, max, color, testId }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="flex-1 min-w-[110px] rounded bg-black/70 px-2 py-1" data-testid={testId}>
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span>{Math.ceil(value)}/{max}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full" style={{ width: `${pct * 100}%`, background: color }} />
      </div>
    </div>
  );
}
