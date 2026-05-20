import { useRunStore } from "../../store/useRunStore";

const FONT_PIXEL = { fontFamily: "'VT323', monospace" };
const FONT_HEAD = { fontFamily: "'Press Start 2P', monospace" };

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
      className="relative flex flex-col gap-2 p-2 text-amber-100 border-b-4"
      data-testid="game-hud"
      style={{
        background: "linear-gradient(180deg, #18181b 0%, #0a0908 100%)",
        borderColor: "#3f3f46",
        ...FONT_PIXEL,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <Badge testId="hud-wave-block">
          <span className="text-amber-100/60 mr-1 text-base" style={FONT_HEAD}>W</span>
          <span className="font-bold text-2xl text-amber-300" data-testid="hud-wave">{wave}</span>
          <span className="ml-2 text-base text-amber-100/60 uppercase" data-testid="hud-phase">{phase}</span>
        </Badge>
        {gambleMult > 1 && (
          <Pill color="#dc2626" testId="hud-gamble">GAMBLE ×{gambleMult}</Pill>
        )}
        <Pill
          color={player.weaponMode === "melee" ? "#dc2626" : "#4ade80"}
          testId="hud-weapon"
        >
          {player.weaponMode === "melee"
            ? (player.weaponLocked ? "MELEE!" : "MELEE")
            : "GUN"}
        </Pill>
        <Pill
          color={player.dashCooldown <= 0 ? "#7ad8ff" : "#52525b"}
          testId="hud-dash"
        >
          {player.dashCooldown <= 0 ? "DASH" : `DASH ${player.dashCooldown.toFixed(1)}`}
        </Pill>
        <Badge testId="hud-time-block">
          <Icon glyph="⏱" />
          <span
            className="font-bold text-2xl ml-1"
            style={{ color: roundTimer < 10 ? "#ff6b6b" : "#fde68a" }}
            data-testid="hud-time"
          >{`${mm}:${ss}`}</span>
        </Badge>
        <Badge testId="hud-kills-block">
          <Icon glyph="☠" />
          <span className="font-bold text-2xl ml-1" data-testid="hud-kills">{kills}</span>
        </Badge>
        <Badge testId="hud-scrap-block">
          <Icon glyph="⚙" />
          <span className="font-bold text-2xl ml-1 text-amber-300" data-testid="hud-scrap">{unsecured}</span>
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2 px-1">
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

function Badge({ children, testId }) {
  return (
    <div
      data-testid={testId}
      className="flex items-center px-3 py-1 border-2"
      style={{ background: "#0a0908", borderColor: "#3f3f46" }}
    >
      {children}
    </div>
  );
}

function Pill({ children, color, testId }) {
  return (
    <div
      data-testid={testId}
      className="px-3 py-1 border-2 text-base uppercase tracking-wider font-bold"
      style={{ background: "#0a0908", borderColor: color, color }}
    >
      {children}
    </div>
  );
}

function Icon({ glyph }) {
  return <span className="text-amber-100/60 text-xl leading-none">{glyph}</span>;
}

function SegBar({ label, value, max, color, testId }) {
  const segs = 20;
  const filled = Math.max(0, Math.min(segs, Math.round((value / max) * segs)));
  const arr = Array.from({ length: segs });
  return (
    <div className="flex-1 min-w-[140px] flex items-center gap-2" data-testid={testId}>
      <span className="w-12 text-amber-100/80 text-lg uppercase tracking-widest">{label}</span>
      <div
        className="flex flex-1 items-center gap-[2px] h-5 p-1 border-2"
        style={{ background: "#09090b", borderColor: "#18181b" }}
      >
        {arr.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-full"
            style={{
              background: i < filled ? color : "transparent",
              boxShadow: i < filled ? "inset 0 0 4px rgba(0,0,0,0.6)" : "none",
            }}
          />
        ))}
      </div>
      <span className="w-16 text-right text-amber-100/80 text-lg tabular-nums">
        {Math.max(0, Math.ceil(value))}/{max}
      </span>
    </div>
  );
}
