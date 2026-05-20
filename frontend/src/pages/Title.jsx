import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMetaStore } from "../store/useMetaStore";

export default function Title() {
  const hydrate = useMetaStore((s) => s.hydrate);
  const secured = useMetaStore((s) => s.securedScrap);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-7 px-6 text-center overflow-hidden"
      data-testid="title-page"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(80,30,5,0.35) 0%, rgba(15,8,4,0.95) 80%), " +
          "linear-gradient(180deg, #3a1a07 0%, #1a0a04 60%, #0c0604 100%)",
      }}
    >
      {/* rust speckle overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 23% 17%, rgba(255,140,40,0.4) 0px, transparent 5px), " +
            "radial-gradient(circle at 71% 38%, rgba(255,120,30,0.35) 0px, transparent 7px), " +
            "radial-gradient(circle at 12% 71%, rgba(180,70,15,0.45) 0px, transparent 6px), " +
            "radial-gradient(circle at 88% 81%, rgba(255,160,55,0.3) 0px, transparent 9px)",
          backgroundSize: "240px 240px",
        }}
      />
      {/* bullet hole accents */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 22%, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.4) 3px, transparent 5px), " +
            "radial-gradient(circle at 92% 14%, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.4) 4px, transparent 7px), " +
            "radial-gradient(circle at 17% 88%, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.4) 3px, transparent 6px), " +
            "radial-gradient(circle at 80% 70%, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.4) 3px, transparent 6px)",
          backgroundRepeat: "no-repeat",
        }}
      />

      <h1
        className="relative text-4xl sm:text-6xl tracking-tight"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          color: "#ff7a18",
          textShadow:
            "0 0 2px #000, 3px 3px 0 #2b0d00, 6px 6px 0 rgba(0,0,0,0.55), 0 0 26px rgba(255,120,30,0.35)",
          lineHeight: 1.15,
        }}
      >
        LAST<br />SCRAP
      </h1>

      <p
        className="relative max-w-md text-amber-100/70 text-xl uppercase tracking-widest"
        style={{ fontFamily: "'VT323', monospace" }}
      >
        Defend the rig. Survive. Cash out before greed kills you.
      </p>

      <div
        className="relative border-4 px-5 py-2 shadow-[inset_0_0_22px_rgba(0,0,0,0.9)]"
        style={{
          fontFamily: "'VT323', monospace",
          background: "#18181b",
          borderColor: "#3f3f46",
          color: "#ffa872",
        }}
      >
        <span className="text-amber-100/60 mr-2 uppercase tracking-widest text-sm">Secured Scrap</span>
        <span className="font-bold text-amber-300 text-2xl" data-testid="title-secured-scrap">{secured}</span>
      </div>

      <div className="relative flex flex-col gap-4 w-full max-w-xs">
        <Link
          to="/play"
          data-testid="title-start-btn"
          className="block px-6 py-4 text-center text-3xl uppercase font-bold transition-transform active:translate-x-1 active:translate-y-1"
          style={{
            fontFamily: "'VT323', monospace",
            background: "#ff7a18",
            color: "#000",
            borderTop: "4px solid #ffa872",
            borderLeft: "4px solid #ffa872",
            borderBottom: "4px solid #9a3412",
            borderRight: "4px solid #9a3412",
            letterSpacing: "0.1em",
          }}
        >
          START
        </Link>
        <Link
          to="/upgrades"
          data-testid="title-upgrades-btn"
          className="block px-6 py-3 text-center text-2xl uppercase font-bold transition-transform active:translate-x-1 active:translate-y-1"
          style={{
            fontFamily: "'VT323', monospace",
            background: "#27272a",
            color: "#ffa872",
            borderTop: "4px solid #52525b",
            borderLeft: "4px solid #52525b",
            borderBottom: "4px solid #0a0908",
            borderRight: "4px solid #0a0908",
            letterSpacing: "0.1em",
          }}
        >
          BUY UPGRADES
        </Link>
      </div>

      <div
        className="absolute bottom-3 left-0 right-0 text-center text-amber-100/35 tracking-widest"
        style={{ fontFamily: "'VT323', monospace", fontSize: 14 }}
      >
        WASD MOVE · SPACE FIRE · Q SWAP · SHIFT/E DASH · TOUCH ON MOBILE
      </div>
    </div>
  );
}
