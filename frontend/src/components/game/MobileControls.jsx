import { useRef, useState } from "react";
import { useRunStore } from "../../store/useRunStore";

const STICK_RADIUS = 48;
const KNOB_RADIUS = 22;

export function MobileControls() {
  const setInput = useRunStore((s) => s.setInput);
  const stickRef = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef(null);

  const updateFromTouch = (clientX, clientY) => {
    const el = stickRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const mag = Math.hypot(dx, dy);
    if (mag > STICK_RADIUS) {
      dx = (dx / mag) * STICK_RADIUS;
      dy = (dy / mag) * STICK_RADIUS;
    }
    setKnob({ x: dx, y: dy });
    setInput({ moveX: dx / STICK_RADIUS, moveY: dy / STICK_RADIUS });
  };

  return (
    <div
      data-testid="mobile-controls"
      className="flex w-full items-center justify-between px-3 py-2 md:hidden"
      style={{
        background: "linear-gradient(180deg,#0a0908 0%, #18181b 100%)",
        borderTop: "3px solid #3f3f46",
        minHeight: 124,
      }}
    >
      <div
        ref={stickRef}
        className="relative rounded-full border-2 select-none"
        style={{
          width: STICK_RADIUS * 2,
          height: STICK_RADIUS * 2,
          background: "rgba(20,12,6,0.65)",
          borderColor: "#3f3f46",
          touchAction: "none",
        }}
        onTouchStart={(e) => {
          const t = e.changedTouches[0];
          touchIdRef.current = t.identifier;
          updateFromTouch(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          for (const t of Array.from(e.changedTouches)) {
            if (t.identifier === touchIdRef.current) updateFromTouch(t.clientX, t.clientY);
          }
        }}
        onTouchEnd={() => {
          touchIdRef.current = null;
          setKnob({ x: 0, y: 0 });
          setInput({ moveX: 0, moveY: 0 });
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: KNOB_RADIUS * 2,
            height: KNOB_RADIUS * 2,
            left: STICK_RADIUS - KNOB_RADIUS + knob.x,
            top: STICK_RADIUS - KNOB_RADIUS + knob.y,
            background: "#ff7a18",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
          }}
        />
      </div>

      <div className="flex items-end gap-2">
        <ActionButton
          testId="mobile-swap-btn"
          label="SWAP"
          color="#ffa872"
          border="#9a3412"
          size={56}
          onTouchStart={(e) => { e.preventDefault(); setInput({ swapPressed: true }); }}
        />
        <ActionButton
          testId="mobile-dash-btn"
          label="DASH"
          color="#7ad8ff"
          border="#0e3a52"
          size={64}
          onTouchStart={(e) => { e.preventDefault(); setInput({ dashPressed: true }); }}
        />
        <ActionButton
          testId="mobile-fire-btn"
          label="FIRE"
          color="#ff7a18"
          border="#9a3412"
          size={96}
          onTouchStart={(e) => { e.preventDefault(); setInput({ firePressed: true, fireHeld: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); setInput({ fireHeld: false }); }}
          onTouchCancel={(e) => { e.preventDefault(); setInput({ fireHeld: false }); }}
        />
      </div>
    </div>
  );
}

function ActionButton({ testId, label, color, border, size, onTouchStart, onTouchEnd, onTouchCancel }) {
  return (
    <button
      data-testid={testId}
      className="rounded-full text-black select-none active:translate-y-0.5"
      style={{
        width: size,
        height: size,
        background: color,
        borderTop: `3px solid ${color}`,
        borderLeft: `3px solid ${color}`,
        borderRight: `3px solid ${border}`,
        borderBottom: `3px solid ${border}`,
        fontFamily: "'VT323', monospace",
        fontSize: size > 80 ? 22 : 16,
        fontWeight: 700,
        letterSpacing: "0.05em",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      {label}
    </button>
  );
}
