import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   Theme
───────────────────────────────────────────── */
const RED      = "#e10600";
const WHITE    = "rgba(255,255,255,0.92)";
const MUTED    = "rgba(255,255,255,0.4)";
const DIM      = "rgba(255,255,255,0.14)";
const TITANIUM = "#c8c8c8";

/* ─────────────────────────────────────────────
   Eras — each one faster and more choreographed than the last
───────────────────────────────────────────── */
const ERAS = [
  { id: "1985", year: "1985", time: 20.0, mechanics: 6,  vibe: "Manual, arriscado, lento", duration: 2200, jitter: 10 },
  { id: "2010", year: "2010", time: 5.0,  mechanics: 14, vibe: "Pistolas de ar, mais gente", duration: 1300, jitter: 4 },
  { id: "2026", year: "2026", time: 2.0,  mechanics: 20, vibe: "Coreografia cronometrada",  duration: 550,  jitter: 0.5 },
];

/* Fixed slots for mechanics around the car — reused, just more get filled in */
const MECH_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const row = Math.floor(i / 5);
  const col = i % 5;
  const side = row % 2 === 0 ? -1 : 1;
  return {
    x: 200 + side * (185 - col * 17),
    y: 42 + row * 66,
  };
});

const WHEEL_POS = [
  { key: "fl", x: 300, y: 108, fly: [50, -38] },
  { key: "fr", x: 300, y: 202, fly: [50, 38] },
  { key: "rl", x: 190, y: 108, fly: [-50, -38] },
  { key: "rr", x: 190, y: 202, fly: [-50, 38] },
];

/* ─────────────────────────────────────────────
   Car + pit crew SVG
───────────────────────────────────────────── */
function PitScene({ era, t }) {
  const cx = 245, cy = 155;
  const s = 1.35;
  // wheel-change phase: out (0-0.4), gap (0.4-0.6), in (0.6-1)
  const outT = Math.min(t / 0.4, 1);
  const inT = Math.max(0, (t - 0.6) / 0.4);
  const gunT = Math.max(0, Math.min((t - 0.15) / 0.5, 1));

  return (
    <g>
      {/* Car body */}
      <rect x={cx - 78*s} y={cy - 16*s} width={156*s} height={32*s} rx={9*s} fill="rgba(210,210,210,0.85)" />
      <polygon points={`${cx + 78*s},${cy} ${cx + 68*s},${cy - 7*s} ${cx + 68*s},${cy + 7*s}`} fill="rgba(150,150,150,0.8)" />
      <ellipse cx={cx - 6*s} cy={cy} rx={20*s} ry={12*s} fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.1)" />
      <rect x={cx + 68*s} y={cy - 30*s} width={7*s} height={60*s} rx={3*s} fill="rgba(160,160,160,0.7)" />
      <rect x={cx - 75*s} y={cy - 34*s} width={7*s} height={68*s} rx={3*s} fill="rgba(160,160,160,0.7)" />

      {/* Wheels — fly out then fly back in */}
      {WHEEL_POS.map((w, i) => {
        const [fx, fy] = w.fly;
        const outX = w.x + fx * outT * 1.5;
        const outY = w.y + fy * outT * 1.5;
        const inX = w.x + fx * (1 - inT) * 1.5;
        const inY = w.y + fy * (1 - inT) * 1.5;
        const showOld = t < 0.5;
        const x = showOld ? outX : inX;
        const y = showOld ? outY : inY;
        const opacity = showOld ? 1 - outT * 0.9 : Math.max(inT, 0.15);
        const spin = showOld ? outT * 220 : (1 - inT) * -220;

        return (
          <g key={w.key} opacity={opacity} transform={`rotate(${spin}, ${x}, ${y})`}>
            <ellipse cx={x} cy={y} rx={17} ry={12} fill="#181818" stroke="rgba(255,255,255,0.15)" />
            <circle cx={x} cy={y} r={4} fill={showOld ? "rgba(120,120,120,0.6)" : RED} />
          </g>
        );
      })}

      {/* Air guns — pop in near the wheels mid-stop */}
      {WHEEL_POS.map((w, i) => (
        <g key={`gun-${w.key}`} opacity={gunT} transform={`translate(${w.x + w.fly[0] * 0.5}, ${w.y + w.fly[1] * 0.5}) scale(${0.8 + 0.5 * gunT})`}>
          <rect x={-10} y={-5} width={20} height={10} rx={2.5} fill={RED} />
          <rect x={-4} y={-10} width={8} height={8} rx={2} fill={TITANIUM} />
        </g>
      ))}

      {/* Jack lift indicator */}
      <g opacity={Math.min(outT * 2, 1) * (1 - Math.min(Math.max((t - 0.55) * 4, 0), 1))}>
        <rect x={cx - 4} y={cy + 26} width={8} height={20} fill={TITANIUM} />
      </g>
    </g>
  );
}

function MechanicsSwarm({ era, t }) {
  const n = era.mechanics;
  return (
    <g>
      {MECH_SLOTS.slice(0, n).map((slot, i) => {
        const delay = (i / n) * 0.55;
        const localT = Math.max(0, Math.min((t - delay) / 0.35, 1));
        const jitterX = (Math.sin(i * 12.9) * era.jitter);
        const jitterY = (Math.cos(i * 7.3) * era.jitter);
        const enterDx = (slot.x < 200 ? -1 : 1) * (1 - localT) * 40;
        return (
          <g key={i} opacity={localT} transform={`translate(${enterDx + jitterX}, ${jitterY})`}>
            <circle cx={slot.x} cy={slot.y} r={5} fill="rgba(255,255,255,0.12)" stroke={i % 5 === 0 ? RED : "rgba(255,255,255,0.35)"} strokeWidth={1.4} />
          </g>
        );
      })}
    </g>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const SVG_W = 400;
const SVG_H = 300;

export default function PitStopBlock({ isActive }) {
  const [selected, setSelected] = useState(ERAS[0].id);
  const [t, setT] = useState(0);
  const animRef = useRef(null);
  const startRef = useRef(null);

  const eraIndex = ERAS.findIndex((e) => e.id === selected);
  const era = ERAS[eraIndex];

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    startRef.current = null;
    setT(0);

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / era.duration, 1);
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
    setSelected(ERAS[Math.min(eraIndex + 1, ERAS.length - 1)].id);
  }
  function goPrev() {
    setSelected(ERAS[Math.max(eraIndex - 1, 0)].id);
  }

  const displayedTime = (era.time * Math.min(t * 1.15, 1)).toFixed(1);

  return (
    <>
      <style>{`
        .ps-root {
          font-family: inherit;
          color: #fff;
          padding: 1.4rem 1.5rem;
        }
        .ps-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 4px;
        }
        .ps-title {
          font-size: 1.5rem;
          font-weight: 650;
          margin: 0 0 1rem;
        }
        .ps-layout {
          display: grid;
          grid-template-columns: 0.85fr 1.3fr;
          gap: 1.25rem;
          align-items: stretch;
        }
        @media (max-width: 640px) {
          .ps-layout { grid-template-columns: 1fr; }
        }
        .ps-clock-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
        }
        .ps-year {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .ps-time {
          font-family: 'SF Mono', Menlo, monospace;
          font-size: 3.4rem;
          font-weight: 700;
          color: ${RED};
          line-height: 1;
        }
        .ps-time-unit {
          font-size: 1.4rem;
          color: rgba(255,255,255,0.4);
          margin-left: 4px;
        }
        .ps-vibe {
          margin-top: 0.6rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
        }
        .ps-mech-count {
          margin-top: 1.1rem;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.4);
        }
        .ps-mech-count strong {
          color: #fff;
          font-size: 1rem;
        }
        .ps-svg-wrap {
          width: 100%;
          min-height: 320px;
          border-radius: 10px;
          background: radial-gradient(circle at 50% 45%, rgba(225,6,0,0.06), rgba(0,0,0,0) 70%);
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .ps-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 1.4rem;
        }
        .ps-nav-btn {
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
        .ps-nav-btn:hover:not(:disabled) {
          border-color: ${RED};
          color: #fff;
        }
        .ps-nav-btn:disabled { opacity: 0.25; cursor: default; }
        .ps-dots { display: flex; gap: 6px; }
        .ps-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: ${DIM}; cursor: pointer; transition: all 0.2s ease;
        }
        .ps-dot.active { background: ${RED}; transform: scale(1.3); }
      `}</style>

      <div className="chart-card ps-root">
        <h2 className="ps-title">Um pit stop virou uma coreografia</h2>

        <div className="ps-layout">
          <div className="ps-clock-wrap">
            <div className="ps-year">{era.year}</div>
            <div>
              <span className="ps-time">{displayedTime}</span>
              <span className="ps-time-unit">s</span>
            </div>
            <p className="ps-vibe">{era.vibe}</p>
            <p className="ps-mech-count">
              <strong>{era.mechanics}</strong> mecânicos na coreografia
            </p>

            <div className="ps-nav" style={{ justifyContent: "flex-start", marginTop: "1rem" }}>
              <button className="ps-nav-btn" onClick={goPrev} disabled={eraIndex === 0} aria-label="Anterior">‹</button>
              <div className="ps-dots">
                {ERAS.map((e, i) => (
                  <div key={e.id} className={`ps-dot ${i === eraIndex ? "active" : ""}`} onClick={() => setSelected(e.id)} />
                ))}
              </div>
              <button className="ps-nav-btn" onClick={goNext} disabled={eraIndex === ERAS.length - 1} aria-label="Próximo">›</button>
            </div>
          </div>

          <div className="ps-svg-wrap">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
              <MechanicsSwarm era={era} t={t} />
              <PitScene era={era} t={t} />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}