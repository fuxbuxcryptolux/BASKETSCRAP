import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMetaStore } from "../store/useMetaStore";

export default function Title() {
  const hydrate = useMetaStore((s) => s.hydrate);
  const secured = useMetaStore((s) => s.securedScrap);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-7 px-6 text-center text-white overflow-hidden"
      data-testid="title-page"
      style={{
        background:
          // layered rust look: dark vignette over warm rust gradient + grain
          "radial-gradient(ellipse at center, rgba(80,30,5,0.35) 0%, rgba(15,8,4,0.95) 80%), " +
          "linear-gradient(180deg, #3a1a07 0%, #1a0a04 60%, #0c0604 100%)",
        fontFamily: '"Black Ops One", "Impact", sans-serif',
      }}
    >
      {/* Procedural rust speckles via repeating radial gradients */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 23% 17%, rgba(255,140,40,0.4) 0px, transparent 5px), " +
            "radial-gradient(circle at 71% 38%, rgba(255,120,30,0.35) 0px, transparent 7px), " +
            "radial-gradient(circle at 12% 71%, rgba(180,70,15,0.45) 0px, transparent 6px), " +
            "radial-gradient(circle at 88% 81%, rgba(255,160,55,0.3) 0px, transparent 9px), " +
            "radial-gradient(circle at 45% 92%, rgba(220,90,20,0.35) 0px, transparent 4px)",
          backgroundSize: "240px 240px",
        }}
      />
      {/* Bullet-hole accents */}
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
        className="relative text-7xl font-black tracking-wider"
        style={{
          color: "#ff8a1a",
          textShadow:
            "0 0 2px #000, 4px 4px 0 #2b0d00, 7px 7px 0 rgba(0,0,0,0.55), 0 0 28px rgba(255,120,30,0.35)",
          letterSpacing: "0.06em",
        }}
      >
        LAST SCRAP
      </h1>
      <p className="relative max-w-md text-amber-100/70 font-mono text-sm tracking-wide">
        Defend the rig. Survive the waves. Cash out before greed kills you.
      </p>

      <div
        className="relative rounded-md border border-amber-700/60 bg-stone-950/70 px-5 py-2 font-mono text-sm shadow-[0_0_18px_rgba(0,0,0,0.7)]"
      >
        <span className="text-amber-100/60 mr-2 uppercase tracking-widest">Secured Scrap</span>
        <span className="font-bold text-amber-300 text-lg" data-testid="title-secured-scrap">{secured}</span>
      </div>

      <div className="relative flex flex-col gap-4 w-full max-w-xs">
        <Link
          to="/play"
          data-testid="title-start-btn"
          className="block rounded-md border-2 border-amber-600 px-6 py-4 text-2xl font-black uppercase tracking-widest text-stone-900 shadow-[0_4px_0_#3a1a00,0_0_22px_rgba(255,130,30,0.45)] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_#3a1a00]"
          style={{
            background: "linear-gradient(180deg, #ffb04a 0%, #ff7a18 50%, #c2470a 100%)",
            textShadow: "1px 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          START
        </Link>
        <Link
          to="/upgrades"
          data-testid="title-upgrades-btn"
          className="block rounded-md border-2 border-stone-500 bg-stone-800/80 px-6 py-3 text-lg font-bold uppercase tracking-widest text-stone-100 shadow-[0_3px_0_#0a0a0a] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_#0a0a0a] hover:bg-stone-700/80"
        >
          BUY UPGRADES
        </Link>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-amber-100/35 tracking-widest font-mono">
        WASD MOVE · SPACE FIRE · Q SWAP · SHIFT/E DASH · TOUCH ON MOBILE
      </div>
    </div>
  );
}
