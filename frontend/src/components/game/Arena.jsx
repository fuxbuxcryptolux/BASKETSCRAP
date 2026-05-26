import { useEffect, useRef } from "react";
import { useRunStore } from "../../store/useRunStore";
import { BALANCE } from "../../game/data/balance";
import arenaUrl from "../../assets/game/arena.png";
import heroUrl from "../../assets/game/hero.png";
import bruteUrl from "../../assets/game/brute.png";
import shamblerUrl from "../../assets/game/shambler.png";
import rigUrl from "../../assets/game/rig.png";

const loadImg = (src) => {
  const i = new Image();
  i.src = src;
  return i;
};
const IMG = {
  arena: loadImg(arenaUrl),
  hero: loadImg(heroUrl),
  brute: loadImg(bruteUrl),
  shambler: loadImg(shamblerUrl),
  rig: loadImg(rigUrl),
};

const MOVE_KEYS = {
  w: ["y", -1], ArrowUp: ["y", -1],
  s: ["y", 1],  ArrowDown: ["y", 1],
  a: ["x", -1], ArrowLeft: ["x", -1],
  d: ["x", 1],  ArrowRight: ["x", 1],
};
const FIRE_KEYS = new Set([" ", "Space", "j", "J"]);
const SWAP_KEYS = new Set(["q", "Q"]);
const DASH_KEYS = new Set(["Shift", "e", "E"]);

export function Arena() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(0);
  const keysRef = useRef(new Set());
  const fireHeldRef = useRef(false);
  const firePressedQueueRef = useRef(false);
  const swapPressedQueueRef = useRef(false);
  const dashPressedQueueRef = useRef(false);

  useEffect(() => {
    const tick = useRunStore.getState().tick;
    const setInput = useRunStore.getState().setInput;

    const loop = (t) => {
      const last = lastTRef.current || t;
      const dt = Math.min(0.05, (t - last) / 1000);
      lastTRef.current = t;

      let x = 0, y = 0;
      for (const k of keysRef.current) {
        const m = MOVE_KEYS[k];
        if (!m) continue;
        if (m[0] === "x") x += m[1];
        if (m[0] === "y") y += m[1];
      }
      const current = useRunStore.getState().input;
      const touchActive = Math.abs(current.moveX) + Math.abs(current.moveY) > 0.01;
      if (!touchActive) setInput({ moveX: x, moveY: y });

      const fireHeld = fireHeldRef.current || current.fireHeld;
      const firePressed = firePressedQueueRef.current || current.firePressed;
      const swapPressed = swapPressedQueueRef.current || current.swapPressed;
      const dashPressed = dashPressedQueueRef.current || current.dashPressed;
      setInput({ fireHeld, firePressed, swapPressed, dashPressed });

      tick(dt);

      firePressedQueueRef.current = false;
      swapPressedQueueRef.current = false;
      dashPressedQueueRef.current = false;
      setInput({ firePressed: false, attack: false, swapPressed: false, dashPressed: false });

      render();
      rafRef.current = requestAnimationFrame(loop);
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const s = useRunStore.getState();
      const W = BALANCE.arena.width;
      const H = BALANCE.arena.height;

      if (IMG.arena.complete && IMG.arena.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(IMG.arena, 0, 0, W, H);
      } else {
        ctx.fillStyle = "#1a1614";
        ctx.fillRect(0, 0, W, H);
      }

      const rig = s.rig;
      const rigPct = rig.hp / rig.maxHp;
      // [visual] new ring-shaped rig graphic, clipped to a circle so any
      // residual background pixels from the source jpg don't leak.
      const rigDrawR = BALANCE.arena.rigRadius * 3.4;
      if (IMG.rig.complete && IMG.rig.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(rig.pos.x, rig.pos.y, rigDrawR / 2 - 2, 0, Math.PI * 2);
        ctx.clip();
        if (rigPct < 0.5) {
          ctx.shadowColor = rigPct < 0.25 ? "#a04848" : "#d28a3a";
          ctx.shadowBlur = 16;
        }
        ctx.drawImage(IMG.rig, rig.pos.x - rigDrawR / 2, rig.pos.y - rigDrawR / 2, rigDrawR, rigDrawR);
        ctx.restore();
      } else {
        ctx.fillStyle = "#3a2f25";
        ctx.beginPath(); ctx.arc(rig.pos.x, rig.pos.y, BALANCE.arena.rigRadius + 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rigPct > 0.5 ? "#c9a84c" : rigPct > 0.25 ? "#d28a3a" : "#a04848";
        ctx.beginPath(); ctx.arc(rig.pos.x, rig.pos.y, BALANCE.arena.rigRadius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1a1614";
        ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("RIG", rig.pos.x, rig.pos.y);
      }

      ctx.imageSmoothingEnabled = false;
      for (const e of s.enemies) {
        const img = e.kind === "brute" ? IMG.brute : IMG.shambler;
        if (img.complete && img.naturalWidth > 0) {
          // [visual] sprites face RIGHT by default → mirror when moving left.
          const flip = (e.facingSign ?? 1) < 0 ? -1 : 1;
          // [mobile readability] target height scales radius up generously.
          const targetH = e.radius * 3.6;
          const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
          ctx.save();
          ctx.translate(e.pos.x, e.pos.y);
          ctx.scale(flip, 1);
          ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
          ctx.restore();
        } else {
          ctx.fillStyle = e.color;
          ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2); ctx.fill();
        }
        const barW = e.radius * 2.4;
        const pct = e.hp / e.maxHp;
        ctx.fillStyle = "#000"; ctx.fillRect(e.pos.x - barW / 2, e.pos.y - e.radius - 12, barW, 4);
        ctx.fillStyle = "#73ffb8"; ctx.fillRect(e.pos.x - barW / 2, e.pos.y - e.radius - 12, barW * pct, 4);
      }

      for (const b of s.bullets) {
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2); ctx.fill();
      }

      const P = s.player;
      // [visual] hero sprite now faces UP by default → rotate by facing + PI/2.
      if (IMG.hero.complete && IMG.hero.naturalWidth > 0) {
        const targetH = 84;
        const targetW = (IMG.hero.naturalWidth / IMG.hero.naturalHeight) * targetH;
        ctx.save();
        ctx.translate(P.pos.x, P.pos.y);
        ctx.rotate(P.facing + Math.PI / 2);
        if (P.dashTimer > 0) {
          // Dash visual: bright trail/glow.
          ctx.globalAlpha = 0.9;
          ctx.shadowColor = "#7ad8ff";
          ctx.shadowBlur = 18;
        }
        if (P.invulnTimer > 0 && P.dashTimer <= 0) ctx.globalAlpha = 0.6;
        if (!P.alive) ctx.globalAlpha = 0.3;
        ctx.drawImage(IMG.hero, -targetW / 2, -targetH / 2, targetW, targetH);
        ctx.restore();
      } else {
        ctx.fillStyle = P.alive ? "#e8edf3" : "#555";
        ctx.beginPath(); ctx.arc(P.pos.x, P.pos.y, 16, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = "#ffd84a"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(P.pos.x + Math.cos(P.facing) * 18, P.pos.y + Math.sin(P.facing) * 18);
      ctx.lineTo(P.pos.x + Math.cos(P.facing) * 28, P.pos.y + Math.sin(P.facing) * 28);
      ctx.stroke();
    };

    const onKeyDown = (e) => {
      if (FIRE_KEYS.has(e.key)) {
        if (!fireHeldRef.current) firePressedQueueRef.current = true;
        fireHeldRef.current = true;
        e.preventDefault();
        return;
      }
      if (SWAP_KEYS.has(e.key)) {
        swapPressedQueueRef.current = true;
        e.preventDefault();
        return;
      }
      if (DASH_KEYS.has(e.key)) {
        dashPressedQueueRef.current = true;
        e.preventDefault();
        return;
      }
      keysRef.current.add(e.key);
    };
    const onKeyUp = (e) => {
      if (FIRE_KEYS.has(e.key)) {
        fireHeldRef.current = false;
        useRunStore.getState().setInput({ fireHeld: false });
        return;
      }
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={BALANCE.arena.width}
      height={BALANCE.arena.height}
      data-testid="game-arena-canvas"
      style={{ width: "100%", height: "100%", display: "block", background: "#1a1614", touchAction: "none" }}
    />
  );
}
