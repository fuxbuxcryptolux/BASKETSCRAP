import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRunStore } from "../store/useRunStore";
import { useMetaStore } from "../store/useMetaStore";
import { Arena } from "../components/game/Arena";
import { HUD } from "../components/game/HUD";
import { CashoutModal } from "../components/game/CashoutModal";
import { SummaryScreen } from "../components/game/SummaryScreen";
import { MobileControls } from "../components/game/MobileControls";
import { DebugPanel } from "../components/game/DebugPanel";

export default function Run() {
  const phase = useRunStore((s) => s.phase);
  const endSummary = useRunStore((s) => s.endSummary);
  const beginNextWave = useRunStore((s) => s.beginNextWave);
  const cashOut = useRunStore((s) => s.cashOut);
  const surrender = useRunStore((s) => s.surrender);
  const startRun = useRunStore((s) => s.startRun);
  const markSummaryPersisted = useRunStore((s) => s.markSummaryPersisted);

  const secured = useMetaStore((s) => s.securedScrap);
  const upgrades = useMetaStore((s) => s.upgrades);
  const addSecured = useMetaStore((s) => s.addSecured);
  const hydrate = useMetaStore((s) => s.hydrate);
  const navigate = useNavigate();

  const bankedKeyRef = useRef(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (phase === "idle") navigate("/play");
  }, [phase, navigate]);

  useEffect(() => {
    if (phase !== "ended" || !endSummary || endSummary.persisted) return;
    const key = `${endSummary.cause}-${endSummary.waveReached}-${endSummary.banked}-${endSummary.unsecuredBefore}`;
    if (bankedKeyRef.current === key) return;
    bankedKeyRef.current = key;
    addSecured(endSummary.banked);
    const newSecured = useMetaStore.getState().securedScrap;
    markSummaryPersisted(newSecured);
  }, [phase, endSummary, addSecured, markSummaryPersisted]);

  return (
    <div
      className="relative flex flex-col bg-black overflow-hidden"
      data-testid="run-page"
      style={{ height: "100dvh", width: "100vw" }}
    >
      <HUD />

      {/* Arena container: fills remaining space, locks to square. */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 min-w-0 overflow-hidden">
        <div
          className="relative"
          style={{
            // Square sized to whichever dimension is smaller. Using the
            // CSS aspect-ratio property + a 1:1 sizing trick: set height to
            // 100% and width auto (aspect-ratio fills width), with max-width
            // 100% as a safety clamp on tall phones.
            height: "100%",
            aspectRatio: "1 / 1",
            maxWidth: "100%",
          }}
        >
          {/* Inner clamp: when maxWidth caps us, force height to follow. */}
          <div
            className="relative h-full w-full"
            style={{ maxHeight: "100%" }}
          >
            <Arena />
            <button
              data-testid="surrender-btn"
              className="absolute right-1 top-1 z-10 px-2 py-1 text-xs"
              onClick={() => surrender(secured)}
              style={{
                fontFamily: "'VT323', monospace",
                background: "rgba(10,9,8,0.85)",
                color: "#ffa872",
                border: "2px solid #9a3412",
                letterSpacing: "0.1em",
              }}
            >
              ⚑ END
            </button>
          </div>
        </div>
      </div>

      <MobileControls />
      <DebugPanel />

      {phase === "cashout" && (
        <CashoutModal
          onContinue={(gambleMult, penalty) => {
            bankedKeyRef.current = null;
            beginNextWave(gambleMult, penalty);
          }}
          onCashout={() => cashOut(secured)}
        />
      )}

      {phase === "ended" && endSummary && endSummary.persisted && (
        <SummaryScreen
          summary={endSummary}
          onHome={() => { useRunStore.setState({ phase: "idle" }); navigate("/"); }}
          onUpgrades={() => { useRunStore.setState({ phase: "idle" }); navigate("/upgrades"); }}
          onAgain={() => { bankedKeyRef.current = null; startRun(upgrades); }}
        />
      )}
    </div>
  );
}
