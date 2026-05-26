import { useRunStore } from "../../store/useRunStore";

const FONT_PIXEL = { fontFamily: "'VT323', monospace" };

export function HUD() {
  const player = useRunStore((s) => s.player);
  const rig = useRunStore((s) => s.rig);
  const wave = useRunStore((s) => s.wave);
  const unsecured = useRunStore((s) => s.unsecured);
  const phase = useRunStore((s) => s.phase);
  const kills = useRunStore((s) => s.kills);
  const roundTimer = useRunStore((s) => s.roundTimer);
  const gambleMult = useRunStore((s) => s.gambleMult);

  const mm = Math.floor(roundTimer / 60).toString();
  const ss = Math.floor(roundTimer % 60).toString().padStart(2, "0");

  return (
    <div
      className="relative flex flex-col gap-1 px-2 py-1 text-amber-100 border-b-2"
      data-testid="game-hud"
      style={{
        background: "linear-gradient(180deg, #18181b 0%, #0a0908 100%)",
        borderColor: "#3f3f46",
        ...FONT_PIXEL,
      }}
    >
      {/* Row 1: compact stat row */}
      <div className="flex items-center justify-between gap-1 text-base sm:text-lg">
        <span className="px-1.5 py-0.5 border-2 border-zinc-700 bg-black" data-testid="hud-wave-block">
          <span className="text-amber-100/60 mr-1">W</span>
          <span className="font-bold text-amber-300" data-testid="hud-wave">{wave}</span>
          <span className="ml-1 text-xs text-amber-100/50 uppercase" data-testid="hud-phase">{phase.slice(0,4)}</span>
        </span>
        {gambleMult > 1 && (
          <span className="px-1.5 py-0.5 border-2 font-bold uppercase" data-testid="hud-gamble"
                style={{ background: "#0a0908", borderColor: "#dc2626", color: "#dc2626" }}>
            ×{gambleMult}
          </span>
        )}
        <span className="px-1.5 py-0.5 border-2 font-bold uppercase" data-testid="hud-weapon"
              style={{
                background: "#0a0908",
                borderColor: player.weaponMode === "melee" ? "#dc2626" : "#4ade80",
                color: player.weaponMode === "melee" ? "#dc2626" : "#4ade80",
              }}>
          {player.weaponMode === "melee" ? (player.weaponLocked ? "MEL!" : "MEL") : "GUN"}
        </span>
        <span className="px-1.5 py-0.5 border-2 font-bold uppercase" data-testid="hud-dash"
              style={{
                background: "#0a0908",
                borderColor: player.dashCooldown <= 0 ? "#7ad8ff" : "#52525b",
                color: player.dashCooldown <= 0 ? "#7ad8ff" : "#52525b",
              }}>
          {player.dashCooldown <= 0 ? "DASH" : player.dashCooldown.toFixed(1)}
        </span>
        <span className="px-1.5 py-0.5 border-2 border-zinc-700 bg-black" data-testid="hud-time-block">
          <span className="text-amber-100/60 mr-0.5">⏱</span>
          <span className="font-bold" style={{ color: roundTimer < 10 ? "#ff6b6b" : "#fde68a" }}
                data-testid="hud-time">{mm}:{ss}</span>
        </span>
        <span className="px-1.5 py-0.5 border-2 border-zinc-700 bg-black" data-testid="hud-kills-block">
          <span className="text-amber-100/60 mr-0.5">☠</span>
          <span className="font-bold" data-testid="hud-kills">{kills}</span>
        </span>
        <span className="px-1.5 py-0.5 border-2 border-zinc-700 bg-black" data-testid="hud-scrap-block">
          <span className="text-amber-100/60 mr-0.5">⚙</span>
          <span className="font-bold text-amber-300" data-testid="hud-scrap">{unsecured}</span>
        </span>
      </div>

      {/* Row 2: bars */}
      <div className="flex flex-wrap gap-1">
        <SegBar label="HP"  value={player.hp}  max={player.maxHp}  color="#4ade80" testId="hud-hp" />
        <SegBar label="RIG" value={rig.hp}      max={rig.maxHp}     color="#c9a84c" testId="hud-rig" />
        <SegBar
          label={player.weaponMode === "melee" ? "MEL" : "AMMO"}
          value={player.ammo}
          max={player.maxAmmo}
          color={player.ammo <= 0 ? "#dc2626" : "#ff7a18"}
          testId="hud-ammo"
        />
      </div>
    </div>
  );
}

function SegBar({ label, value, max, color, testId }) {
  const segs = 12;
  const filled = Math.max(0, Math.min(segs, Math.round((value / max) * segs)));
  const arr = Array.from({ length: segs });
  return (
    <div className="flex-1 min-w-[100px] flex items-center gap-1" data-testid={testId}>
      <span className="w-8 text-amber-100/80 text-sm uppercase tracking-wider">{label}</span>
      <div className="flex flex-1 items-center gap-[2px] h-3 p-[2px] border border-zinc-800 bg-zinc-950">
        {arr.map((_, i) => (
          <div key={i} className="flex-1 h-full"
               style={{
                 background: i < filled ? color : "transparent",
                 boxShadow: i < filled ? "inset 0 0 3px rgba(0,0,0,0.6)" : "none",
               }} />
        ))}
      </div>
      <span className="text-amber-100/60 text-xs tabular-nums w-12 text-right">
        {Math.max(0, Math.ceil(value))}/{max}
      </span>
    </div>
  );
}
