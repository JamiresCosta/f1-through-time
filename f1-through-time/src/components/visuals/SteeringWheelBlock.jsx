import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   Theme
───────────────────────────────────────────── */
const RED      = "#e10600";
const WHITE    = "rgba(255,255,255,0.9)";
const MUTED    = "rgba(255,255,255,0.35)";
const DIM      = "rgba(255,255,255,0.12)";
const TITANIUM = "#c8c8c8";

/* ─────────────────────────────────────────────
   Stages of the wheel's evolution
───────────────────────────────────────────── */
const STAGES = [
  {
    id: "basico",
    label: "Anos 90",
    badge: "○",
    stat: "0",
    statLabel: "botões",
    nButtons: 0,
    hub: "circle",
  },
  {
    id: "duplo",
    label: "Anos 2000",
    badge: "⬡",
    stat: "2",
    statLabel: "botões",
    nButtons: 2,
    hub: "hex",
  },
  {
    id: "rotativo",
    label: "Anos 2010",
    badge: "15",
    stat: "15",
    statLabel: "botões rotativos + display",
    nButtons: 15,
    hub: "display-small",
  },
  {
    id: "atual",
    label: "2026",
    badge: "LCD",
    stat: "20+",
    statLabel: "controles",
    nButtons: 22,
    hub: "display-large",
    legend: ["Mapas de motor", "ERS", "Diferencial", "Rádio", "Pit limiter"],
  },
];

const DURATION = 1500;

/* ─────────────────────────────────────────────
   Helpers to lay buttons out around the rim
───────────────────────────────────────────── */
function buttonPositions(n, cx, cy, rInner, rOuter) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    // spread across ~300deg, leaving a gap at the bottom (like a real wheel)
    const angle = (-150 + (i / Math.max(n - 1, 1)) * 300) * (Math.PI / 180);
    const r = i % 2 === 0 ? rOuter : rInner;
    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      angle,
    });
  }
  return pts;
}

/* ─────────────────────────────────────────────
   Wheel SVG
───────────────────────────────────────────── */
function Wheel({ stage, t }) {
  const cx = 175, cy = 130;
  const rimRx = 130, rimRy = 108;

  const nVisible = Math.round(stage.nButtons * Math.min(t * 1.4, 1));
  const positions = buttonPositions(stage.nButtons, cx, cy, 62, 92);

  return (
    <g>
      {/* Rim — D-shaped steering wheel outline */}
      <path
        d={`
          M ${cx - rimRx} ${cy - 10}
          C ${cx - rimRx} ${cy - rimRy}, ${cx - rimRx * 0.5} ${cy - rimRy}, ${cx} ${cy - rimRy}
          C ${cx + rimRx * 0.5} ${cy - rimRy}, ${cx + rimRx} ${cy - rimRy}, ${cx + rimRx} ${cy - 10}
          C ${cx + rimRx} ${cy + rimRy * 0.55}, ${cx + rimRx * 0.55} ${cy + rimRy * 0.85}, ${cx} ${cy + rimRy * 0.85}
          C ${cx - rimRx * 0.55} ${cy + rimRy * 0.85}, ${cx - rimRx} ${cy + rimRy * 0.55}, ${cx - rimRx} ${cy - 10}
          Z
        `}
        fill="rgba(255,255,255,0.02)"
        stroke={DIM}
        strokeWidth={14}
      />

      {/* Spokes */}
      <line x1={cx - 50} y1={cy + 40} x2={cx - 15} y2={cy + 5} stroke={DIM} strokeWidth={10} strokeLinecap="round" />
      <line x1={cx + 50} y1={cy + 40} x2={cx + 15} y2={cy + 5} stroke={DIM} strokeWidth={10} strokeLinecap="round" />

      {/* Buttons scattered around the rim, staggered reveal */}
      {positions.map((p, i) => {
        const visible = i < nVisible;
        const delay = i / Math.max(stage.nButtons, 1);
        const localT = Math.max(0, Math.min((t - delay * 0.7) / 0.3, 1));
        const isDial = stage.hub !== "circle" && stage.hub !== "hex" && i % 4 === 0;
        return (
          <g key={i} opacity={visible ? localT : 0} transform={`scale(${0.5 + 0.5 * localT})`} style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
            {isDial ? (
              <>
                <circle cx={p.x} cy={p.y} r={7} fill="rgba(30,30,30,0.9)" stroke={TITANIUM} strokeWidth={1.5} />
                <line x1={p.x} y1={p.y} x2={p.x + 5} y2={p.y - 3} stroke={RED} strokeWidth={1.5} />
              </>
            ) : (
              <rect x={p.x - 5} y={p.y - 4} width={10} height={8} rx={2}
                fill={i % 3 === 0 ? RED : "rgba(80,80,80,0.85)"}
                stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
            )}
          </g>
        );
      })}

      {/* Hub — evolves with the stage */}
      {stage.hub === "circle" && (
        <circle cx={cx} cy={cy} r={22} fill="none" stroke={TITANIUM} strokeWidth={3} opacity={t} />
      )}

      {stage.hub === "hex" && (
        <g opacity={t}>
          <polygon
            points={[0, 60, 120, 180, 240, 300].map((deg) => {
              const a = (deg * Math.PI) / 180;
              return `${cx + Math.cos(a) * 26},${cy + Math.sin(a) * 26}`;
            }).join(" ")}
            fill="rgba(255,255,255,0.04)"
            stroke={TITANIUM}
            strokeWidth={2.5}
          />
        </g>
      )}

      {stage.hub === "display-small" && (
        <g opacity={t}>
          <rect x={cx - 26} y={cy - 14} width={52} height={28} rx={3}
            fill="#0a0a0a" stroke={TITANIUM} strokeWidth={1.5} />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize={11} fill="#4dff88" fontFamily="monospace">
            5.2
          </text>
        </g>
      )}

      {stage.hub === "display-large" && (
        <g opacity={t}>
          <rect x={cx - 42} y={cy - 26} width={84} height={52} rx={4}
            fill="#050505" stroke={TITANIUM} strokeWidth={1.5} />
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize={9} fill="#4dff88" fontFamily="monospace">
            MAP 5 · ERS 3
          </text>
          <text x={cx} y={cy + 6} textAnchor="middle" fontSize={13} fill={WHITE} fontFamily="monospace" fontWeight="600">
            P2 · L34
          </text>
          <text x={cx} y={cy + 19} textAnchor="middle" fontSize={8} fill="#ffaa00" fontFamily="monospace">
            DIFF 6 · BOX
          </text>
        </g>
      )}
    </g>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const SVG_W = 350;
const SVG_H = 260;

export default function SteeringWheelBlock({ isActive }) {
  const [selected, setSelected] = useState(STAGES[0].id);
  const [t, setT] = useState(0);
  const animRef = useRef(null);
  const startRef = useRef(null);

  const stage = STAGES.find((s) => s.id === selected) ?? STAGES[0];
  const stageIndex = STAGES.findIndex((s) => s.id === selected);

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    startRef.current = null;
    setT(0);

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / DURATION, 1);
      setT(p);
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    }
    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [selected]);

  function goNext() {
    const next = STAGES[Math.min(stageIndex + 1, STAGES.length - 1)];
    setSelected(next.id);
  }
  function goPrev() {
    const prev = STAGES[Math.max(stageIndex - 1, 0)];
    setSelected(prev.id);
  }

  const displayedStat = Math.round(parseFloat(stage.stat) * Math.min(t * 1.3, 1)) || (stage.stat === "0" ? 0 : null);

  return (
    <>
      <style>{`
        .wheel-root {
          font-family: inherit;
          color: #fff;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 2rem;
          align-items: center;
          padding: 1.75rem 2rem;
        }
        @media (max-width: 640px) {
          .wheel-root {
            grid-template-columns: 1fr;
          }
        }
        .wheel-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 6px;
        }
        .wheel-title {
          font-size: 1.5rem;
          font-weight: 650;
          margin: 0 0 0.9rem;
          line-height: 1.15;
        }
        .wheel-copy {
          font-size: 0.92rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.55);
          margin: 0 0 1.4rem;
          max-width: 34ch;
        }
        .wheel-copy strong {
          color: #fff;
          font-weight: 600;
        }
        .wheel-stat-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 1.6rem;
        }
        .wheel-stat-n {
          font-size: 2.6rem;
          font-weight: 650;
          color: ${RED};
          line-height: 1;
          min-width: 2.4ch;
        }
        .wheel-stat-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
        }
        .wheel-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .wheel-legend-tag {
          font-size: 0.72rem;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(225,6,0,0.1);
          border: 1px solid rgba(225,6,0,0.35);
          color: rgba(255,255,255,0.75);
        }
        .wheel-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .wheel-svg-wrap {
          width: 100%;
          max-width: 340px;
          border-radius: 10px;
          background: radial-gradient(circle at 50% 40%, rgba(225,6,0,0.05), rgba(0,0,0,0) 70%);
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .wheel-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 1rem;
          width: 100%;
        }
        .wheel-nav-btn {
          appearance: none;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.8);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .wheel-nav-btn:hover:not(:disabled) {
          border-color: ${RED};
          color: #fff;
        }
        .wheel-nav-btn:disabled {
          opacity: 0.25;
          cursor: default;
        }
        .wheel-dots {
          display: flex;
          gap: 6px;
        }
        .wheel-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${DIM};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .wheel-dot.active {
          background: ${RED};
          transform: scale(1.3);
        }
        .wheel-stage-label {
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(225,6,0,0.75);
          margin-top: 0.9rem;
        }
      `}</style>

      <div className="chart-card wheel-root">
        <div className="wheel-copy-col">
          <h2 className="wheel-title">O volante virou um computador</h2>
          <p className="wheel-copy">
            Um volante moderno possui <strong>mais de vinte controles</strong> diferentes.
            É <strong>muito</strong> impactante.
          </p>

          <div className="wheel-stat-row">
            <span className="wheel-stat-n">{stage.stat}</span>
            <span className="wheel-stat-label">{stage.statLabel}</span>
          </div>

          {stage.legend && (
            <div className="wheel-legend">
              {stage.legend.map((item) => (
                <span key={item} className="wheel-legend-tag">{item}</span>
              ))}
            </div>
          )}
        </div>

        <div className="wheel-panel">
          <div className="wheel-svg-wrap">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
              <Wheel stage={stage} t={t} />
            </svg>
          </div>

          <div className="wheel-nav">
            <button className="wheel-nav-btn" onClick={goPrev} disabled={stageIndex === 0} aria-label="Anterior">‹</button>
            <div className="wheel-dots">
              {STAGES.map((s, i) => (
                <div
                  key={s.id}
                  className={`wheel-dot ${i === stageIndex ? "active" : ""}`}
                  onClick={() => setSelected(s.id)}
                />
              ))}
            </div>
            <button className="wheel-nav-btn" onClick={goNext} disabled={stageIndex === STAGES.length - 1} aria-label="Próximo">›</button>
          </div>
          <div className="wheel-stage-label">{stage.label}</div>
        </div>
      </div>
    </>
  );
}