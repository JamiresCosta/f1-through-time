import { useRef, useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   Theme
───────────────────────────────────────────── */
const RED      = "#e10600";
const WHITE    = "rgba(255,255,255,0.92)";
const MUTED    = "rgba(255,255,255,0.4)";
const TITANIUM = "#c8c8c8";

/* ─────────────────────────────────────────────
   Upgrade steps — visual level + tags introduced at that level
───────────────────────────────────────────── */
const UPGRADES = [
  { id: "asas",       label: "Asas",              tags: ["Ground Effect"] },
  { id: "pneus",       label: "Pneus maiores",     tags: ['18" tyres'] },
  { id: "halo",        label: "Halo",              tags: ["Halo"] },
  { id: "sensores",    label: "Sensores",          tags: ["300 sensores", "GPS"] },
  { id: "drs",         label: "DRS",               tags: ["DRS"] },
  { id: "ers",         label: "ERS",               tags: ["ERS"] },
  { id: "telemetria",  label: "Telemetria",        tags: ["Telemetria", "22 corridas", "Budget Cap"] },
  { id: "ia",          label: "Inteligência artificial", tags: ["IA"] },
];

// step 0 = base 1950 car, steps 1..8 = upgrades, step 9 = final quote
const TOTAL_STEPS = UPGRADES.length + 2;
const PX_PER_STEP = 340;
const TOTAL_SCROLL = PX_PER_STEP * (TOTAL_STEPS - 1);

/* Tag positions around the car (fixed layout, reused across steps) */
const TAG_SLOTS = {
  "Ground Effect": { x: 60, y: 205 },
  '18" tyres': { x: 335, y: 205 },
  "Halo": { x: 200, y: 55 },
  "300 sensores": { x: 55, y: 100 },
  "GPS": { x: 55, y: 130 },
  "DRS": { x: 345, y: 100 },
  "ERS": { x: 345, y: 130 },
  "Telemetria": { x: 60, y: 160 },
  "22 corridas": { x: 340, y: 160 },
  "Budget Cap": { x: 200, y: 235 },
  "IA": { x: 200, y: 25 },
};

/* ─────────────────────────────────────────────
   Evolving car — a single silhouette that gains parts
───────────────────────────────────────────── */
function EvolvingCar({ level }) {
  // level: 0..8 (fractional) — how many upgrades have "landed"
  const lv = (n) => Math.max(0, Math.min(level - (n - 1), 1));

  const cx = 200, cy = 130;
  const wheelRx = 13 + lv(2) * 7; // pneus maiores
  const wheelRy = 9 + lv(2) * 5;

  return (
    <g>
      {/* Body */}
      <rect x={cx - 78} y={cy - 16} width={156} height={32} rx={9}
        fill="rgba(210,210,210,0.85)" />
      <polygon
        points={`${cx + 78},${cy} ${cx + 68},${cy - 7} ${cx + 68},${cy + 7}`}
        fill="rgba(150,150,150,0.8)"
      />
      <ellipse cx={cx - 6} cy={cy} rx={20} ry={12}
        fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.1)" />

      {/* Wheels — grow with lv(2) */}
      {[
        [cx + 46, cy - 38], [cx + 46, cy + 38],
        [cx - 46, cy - 38], [cx - 46, cy + 38],
      ].map(([wx, wy], i) => (
        <ellipse key={i} cx={wx} cy={wy} rx={wheelRx} ry={wheelRy} fill="#181818"
          stroke="rgba(255,255,255,0.1)" />
      ))}

      {/* Wings — asas (step 1) */}
      <g opacity={lv(1)}>
        <rect x={cx + 68} y={cy - 30} width={7} height={60} rx={3} fill="rgba(160,160,160,0.7)" />
        <rect x={cx - 75} y={cy - 34} width={7} height={68} rx={3} fill="rgba(160,160,160,0.7)" />
      </g>

      {/* Halo — step 3 */}
      <g opacity={lv(3)} style={{ filter: lv(3) > 0.8 ? "drop-shadow(0 0 4px rgba(255,220,80,0.4))" : "none" }}>
        <path
          d={`M ${cx - 20} ${cy - 4} C ${cx - 20} ${cy - 34}, ${cx + 20} ${cy - 34}, ${cx + 20} ${cy - 4}`}
          fill="none" stroke={TITANIUM} strokeWidth={5} strokeLinecap="round"
        />
        <line x1={cx} y1={cy - 6} x2={cx} y2={cy - 28} stroke={TITANIUM} strokeWidth={3.5} strokeLinecap="round" />
      </g>

      {/* Sensors — step 4, little red dots across the body */}
      <g opacity={lv(4)}>
        {[[-55, -8], [-25, -14], [10, -14], [40, -8], [-55, 8], [10, 12], [40, 8]].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx} cy={cy + dy} r={1.6} fill={RED} />
        ))}
      </g>

      {/* DRS flap — step 5, rear wing splits open */}
      <g opacity={lv(5)}>
        <rect x={cx - 75} y={cy - 34} width={7} height={26} rx={2}
          fill="rgba(225,6,0,0.75)"
          transform={`rotate(${lv(5) * -30}, ${cx - 71.5}, ${cy - 21})`} />
      </g>

      {/* ERS badge — step 6, glowing hybrid unit indicator */}
      <g opacity={lv(6)}>
        <circle cx={cx} cy={cy + 20} r={5} fill="none" stroke="#4dff88" strokeWidth={1.5} />
        <circle cx={cx} cy={cy + 20} r={2} fill="#4dff88" />
      </g>

      {/* Telemetry — step 7, antenna + broadcasting arcs */}
      <g opacity={lv(7)}>
        <line x1={cx} y1={cy - 30} x2={cx} y2={cy - 48} stroke={MUTED} strokeWidth={1.5} />
        {[10, 18, 26].map((r, i) => (
          <path key={i}
            d={`M ${cx - r} ${cy - 48 + r * 0.15} A ${r} ${r} 0 0 1 ${cx + r} ${cy - 48 + r * 0.15}`}
            fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1}
            opacity={1 - i * 0.25}
          />
        ))}
      </g>

      {/* AI — step 8, scanning grid overlay */}
      <g opacity={lv(8)}>
        <rect x={cx - 90} y={cy - 46} width={180} height={92} rx={10}
          fill="none" stroke={RED} strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />
        <text x={cx} y={cy - 54} textAnchor="middle" fontSize={11} fill={RED}
          fontFamily="monospace" letterSpacing={2}>AI</text>
      </g>
    </g>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const SVG_W = 400;
const SVG_H = 260;

export default function CarEvolutionBlock({ isActive }) {
  const scrollerRef = useRef(null);
  const [rawT, setRawT] = useState(0);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    setRawT(Math.min(1, Math.max(0, el.scrollTop / TOTAL_SCROLL)));
  }

  const scaledT = rawT * (TOTAL_STEPS - 1);
  const step = Math.min(Math.floor(scaledT), TOTAL_STEPS - 1);
  const stepP = scaledT - Math.floor(scaledT);

  // level 0..8 drives the car's visual state (independent of the final quote step)
  const level = Math.min(scaledT, UPGRADES.length);

  // which tags are visible right now (appear at their step, stay until the final step)
  const finalStep = TOTAL_STEPS - 1;
  const isFinal = step >= finalStep - 1 && stepP > 0.5 || step >= finalStep;
  const finalProgress = Math.max(0, Math.min((scaledT - (finalStep - 1)), 1));

  const visibleTags = [];
  UPGRADES.forEach((u, i) => {
    if (scaledT >= i) {
      u.tags.forEach((t) => visibleTags.push({ text: t, appearAt: i }));
    }
  });

  return (
    <>
      <style>{`
        .ce-root {
          position: relative;
          height: 560px;
          background: #000;
          overflow: hidden;
          border-radius: 12px;
        }
        .ce-scroller {
          position: absolute;
          inset: 0;
          overflow-y: scroll;
          scrollbar-width: none;
        }
        .ce-scroller::-webkit-scrollbar { display: none; }
        .ce-spacer { pointer-events: none; }
        .ce-panel {
          position: sticky;
          top: 0;
          height: 560px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          padding: 1.5rem;
        }
        .ce-eyebrow {
          position: absolute;
          top: 1.5rem;
          left: 1.75rem;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }
        .ce-year {
          font-size: 3.2rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          line-height: 1;
          transition: opacity 0.3s;
        }
        .ce-svg-wrap {
          width: 100%;
          max-width: 440px;
          position: relative;
        }
        .ce-tag {
          position: absolute;
          font-size: 0.68rem;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.75);
          background: rgba(225,6,0,0.1);
          border: 1px solid rgba(225,6,0,0.4);
          padding: 3px 9px;
          border-radius: 999px;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          transition: opacity 0.5s ease;
        }
        .ce-quote {
          text-align: center;
          color: #fff;
          transition: opacity 0.6s ease;
        }
        .ce-quote-line1 {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.55);
          margin: 0 0 0.4rem;
        }
        .ce-quote-line2 {
          font-size: 1.7rem;
          font-weight: 700;
          margin: 0;
        }
        .ce-hint {
          position: absolute;
          bottom: 1.25rem;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: opacity 0.3s;
        }
        .ce-hint-icon {
          animation: ce-bob 1.8s ease-in-out infinite;
        }
        @keyframes ce-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        .ce-progress {
          position: absolute;
          top: 0; left: 0;
          height: 2px;
          background: ${RED};
        }
      `}</style>

      <div className="chart-card ce-root">
        <div className="ce-scroller" ref={scrollerRef} onScroll={onScroll}>
          <div className="ce-spacer" style={{ height: `${560 + TOTAL_SCROLL}px` }} />
        </div>

        <div className="ce-panel">

          {!isFinal ? (
            <>
              <div className="ce-year" style={{ opacity: 1 - Math.min(level / 1.2, 1) * 0.0 }}>
                {step === 0 ? "1950" : "2026"}
              </div>

              <div className="ce-svg-wrap">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
                  <EvolvingCar level={level} />
                </svg>

                {visibleTags.map((tag, i) => {
                  const slot = TAG_SLOTS[tag.text];
                  if (!slot) return null;
                  return (
                    <div
                      key={tag.text}
                      className="ce-tag"
                      style={{
                        left: `${(slot.x / SVG_W) * 100}%`,
                        top: `${(slot.y / SVG_H) * 100}%`,
                        opacity: 1,
                      }}
                    >
                      {tag.text}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="ce-svg-wrap">
              <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
                <g opacity={1}>
                  <EvolvingCar level={UPGRADES.length} />
                </g>
              </svg>
              <div className="ce-quote" style={{ opacity: finalProgress, marginTop: 24 }}>
                <p className="ce-quote-line1">O objetivo continua exatamente o mesmo.</p>
                <p className="ce-quote-line2">Ir mais rápido que todos os outros.</p>
              </div>
            </div>
          )}

          <div className="ce-hint" style={{ opacity: rawT > 0.05 ? 0 : 1 }}>
            <span className="ce-hint-icon">↕</span> Role para ver o carro evoluir
          </div>

          <div className="ce-progress" style={{ width: `${rawT * 100}%` }} />
        </div>
      </div>
    </>
  );
}