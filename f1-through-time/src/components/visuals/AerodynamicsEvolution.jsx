import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

const ERAS = [
  {
    year: 1980,
    label: "Era Clássica",
    description: "Carros estreitos, asas pequenas e simples. Aerodinâmica ainda era secundária — o motor mandava.",
    changes: ["Motor dominante", "Asas simples", "Carros estreitos"],
    bodyWidth: 120, bodyHeight: 28, bodyY: -14,
    noseLength: 55, noseWidth: 12,
    cockpitWidth: 38, cockpitHeight: 20,
    fwWidth: 90,  fwHeight: 6,  fwY: 12, fwEndplateH: 8,
    rwWidth: 80,  rwHeight: 7,  rwY: -46, rwPillarH: 24,
    diffuserWidth: 60,  diffuserHeight: 6,
    sidepodWidth: 42, sidepodHeight: 20, sidepodY: -2,
    wheelRadius: 22, wheelWidth: 14,
    underfloorCurve: 2,
  },
  {
    year: 1998,
    label: "Era dos Groove",
    description: "Pneus com ranhuras para reduzir aderência. Asas dianteiras mais largas, barge boards proliferaram.",
    changes: ["Pneus ranhurados", "Barge boards", "Downforce mecânica"],
    bodyWidth: 130, bodyHeight: 26, bodyY: -13,
    noseLength: 65, noseWidth: 10,
    cockpitWidth: 36, cockpitHeight: 22,
    fwWidth: 130, fwHeight: 7,  fwY: 14, fwEndplateH: 14,
    rwWidth: 95,  rwHeight: 9,  rwY: -52, rwPillarH: 28,
    diffuserWidth: 70,  diffuserHeight: 9,
    sidepodWidth: 48, sidepodHeight: 22, sidepodY: -3,
    wheelRadius: 22, wheelWidth: 12,
    underfloorCurve: 3,
  },
  {
    year: 2009,
    label: "Era do Difusor Duplo",
    description: "Revolução aerodinâmica: asas dianteiras enormes, asa traseira estreita e alta, difusor duplo controverso.",
    changes: ["Difusor duplo", "Asa dianteira larga", "Asa traseira alta"],
    bodyWidth: 140, bodyHeight: 28, bodyY: -14,
    noseLength: 70, noseWidth: 8,
    cockpitWidth: 34, cockpitHeight: 24,
    fwWidth: 170, fwHeight: 8,  fwY: 16, fwEndplateH: 20,
    rwWidth: 75,  rwHeight: 14, rwY: -60, rwPillarH: 32,
    diffuserWidth: 90,  diffuserHeight: 18,
    sidepodWidth: 44, sidepodHeight: 24, sidepodY: -4,
    wheelRadius: 22, wheelWidth: 12,
    underfloorCurve: 4,
  },
  {
    year: 2017,
    label: "Era dos Carros Largos",
    description: "Carros 200mm mais largos, pneus enormes, downforce recorde. Os carros mais rápidos da história até então.",
    changes: ["200mm mais largo", "Pneus enormes", "Downforce recorde"],
    bodyWidth: 160, bodyHeight: 30, bodyY: -15,
    noseLength: 75, noseWidth: 9,
    cockpitWidth: 40, cockpitHeight: 26,
    fwWidth: 185, fwHeight: 9,  fwY: 18, fwEndplateH: 24,
    rwWidth: 105, rwHeight: 13, rwY: -58, rwPillarH: 30,
    diffuserWidth: 100, diffuserHeight: 16,
    sidepodWidth: 56, sidepodHeight: 26, sidepodY: -5,
    wheelRadius: 26, wheelWidth: 18,
    underfloorCurve: 5,
  },
  {
    year: 2022,
    label: "Era do Efeito Solo",
    description: "Retorno do efeito solo: fundo plano com túneis de Venturi geram enorme downforce sem depender de asas.",
    changes: ["Efeito solo", "Túneis Venturi", "Menos turbulência"],
    bodyWidth: 158, bodyHeight: 32, bodyY: -16,
    noseLength: 68, noseWidth: 11,
    cockpitWidth: 42, cockpitHeight: 28,
    fwWidth: 175, fwHeight: 10, fwY: 20, fwEndplateH: 22,
    rwWidth: 95,  rwHeight: 16, rwY: -62, rwPillarH: 34,
    diffuserWidth: 110, diffuserHeight: 22,
    sidepodWidth: 52, sidepodHeight: 28, sidepodY: -6,
    wheelRadius: 28, wheelWidth: 20,
    underfloorCurve: 12,
  },
];


function lerpEra(a, b, t) {
  const out = {};
  for (const k of Object.keys(a)) {
    out[k] = typeof a[k] === "number"
      ? a[k] + (b[k] - a[k]) * t
      : a[k];
  }
  return out;
}

/* ─────────────────────────────────────────────
   Car SVG — pure red palette
───────────────────────────────────────────── */
const RED       = "#e10600";
const RED_DARK  = "#8a0400";
const RED_DIM   = "#3d0200";
const DARK      = "#111";

function CarSVG({ shape }) {
  const e = shape;
  const W = 520, H = 210;
  const cx = W / 2 - 20;
  const groundY = H - 46;
  const wheelY  = groundY - e.wheelRadius;
  const fwheelX = cx + e.noseLength - 10;
  const rwheelX = cx - e.bodyWidth / 2 + 28;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="cg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={RED}      stopOpacity="0.95" />
          <stop offset="100%" stopColor={RED_DARK}  stopOpacity="1"    />
        </linearGradient>
        <linearGradient id="cg-wing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={RED}      stopOpacity="0.9"  />
          <stop offset="100%" stopColor={RED_DARK}  stopOpacity="1"    />
        </linearGradient>
        <radialGradient id="cg-wheel" cx="38%" cy="32%">
          <stop offset="0%"   stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx={cx - e.bodyWidth / 6} cy={groundY + 6}
        rx={e.bodyWidth * 0.75} ry={7}
        fill="rgba(0,0,0,0.4)" />

      {/* Underfloor */}
      <path d={`
        M ${cx - e.bodyWidth/2} ${groundY - 8}
        Q ${cx} ${groundY - 8 - e.underfloorCurve} ${cx + e.noseLength - 10} ${groundY - 8}
        L ${cx + e.noseLength - 10} ${groundY - 4}
        Q ${cx} ${groundY - 4 + e.underfloorCurve*0.3} ${cx - e.bodyWidth/2} ${groundY - 4}
        Z`}
        fill={RED_DIM} opacity={0.9} />

      {/* Diffuser */}
      <path d={`
        M ${cx - e.bodyWidth/2} ${groundY - 8}
        L ${cx - e.bodyWidth/2 - e.diffuserWidth*0.3} ${groundY - 8 - e.diffuserHeight}
        L ${cx - e.bodyWidth/2 + e.diffuserWidth*0.7} ${groundY - 8 - e.diffuserHeight*0.3}
        L ${cx - e.bodyWidth/2 + e.diffuserWidth*0.7} ${groundY - 8}
        Z`}
        fill={RED} opacity={0.8} />

      {/* Sidepods */}
      {[-1, 1].map(s => (
        <rect key={s}
          x={s === -1
            ? cx - e.bodyWidth/2 - e.sidepodWidth + 10
            : cx + e.bodyWidth/2 - 10}
          y={groundY + e.sidepodY - e.sidepodHeight}
          width={e.sidepodWidth} height={e.sidepodHeight} rx={5}
          fill="url(#cg-body)" opacity={0.8} />
      ))}

      {/* Main body */}
      <rect
        x={cx - e.bodyWidth/2} y={groundY + e.bodyY - e.bodyHeight}
        width={e.bodyWidth} height={e.bodyHeight} rx={6}
        fill="url(#cg-body)" />

      {/* Nose */}
      <path d={`
        M ${cx + e.bodyWidth/2 - 4} ${groundY + e.bodyY - e.bodyHeight*0.7}
        L ${cx + e.bodyWidth/2 + e.noseLength} ${groundY - 8}
        L ${cx + e.bodyWidth/2 + e.noseLength} ${groundY - 8 + e.noseWidth}
        L ${cx + e.bodyWidth/2 - 4} ${groundY + e.bodyY - e.bodyHeight*0.15}
        Z`}
        fill={RED_DARK} />

      {/* Cockpit */}
      <ellipse
        cx={cx + e.bodyWidth/6} cy={groundY + e.bodyY - e.bodyHeight - e.cockpitHeight*0.5}
        rx={e.cockpitWidth/2} ry={e.cockpitHeight/2}
        fill={DARK} stroke={RED_DARK} strokeWidth={1.5} />

      {/* Engine intake */}
      <rect
        x={cx + e.bodyWidth/6 - 8} y={groundY + e.bodyY - e.bodyHeight - e.cockpitHeight*0.8 - 14}
        width={16} height={14} rx={3}
        fill={DARK} stroke={RED_DARK} strokeWidth={1} />

      {/* Rear wing pillar */}
      <rect
        x={cx - e.bodyWidth/2 + 14} y={groundY + e.bodyY - e.bodyHeight + e.rwY}
        width={8} height={e.rwPillarH} rx={2} fill={RED_DARK} />

      {/* Rear wing main plane */}
      <rect
        x={cx - e.bodyWidth/2 + 18 - e.rwWidth/2}
        y={groundY + e.bodyY - e.bodyHeight + e.rwY - e.rwHeight}
        width={e.rwWidth} height={e.rwHeight} rx={3}
        fill="url(#cg-wing)" />

      {/* Rear wing DRS flap */}
      <rect
        x={cx - e.bodyWidth/2 + 18 - e.rwWidth/2 + 4}
        y={groundY + e.bodyY - e.bodyHeight + e.rwY - e.rwHeight - 5}
        width={e.rwWidth - 8} height={4} rx={2}
        fill={RED} opacity={0.6} />

      {/* Rear wing endplates */}
      {[-1, 1].map(s => (
        <rect key={s}
          x={cx - e.bodyWidth/2 + 18 + s*e.rwWidth/2 - (s===1?4:0)}
          y={groundY + e.bodyY - e.bodyHeight + e.rwY - e.rwHeight - 2}
          width={4} height={e.rwHeight + e.rwPillarH*0.4} rx={1}
          fill={RED_DARK} />
      ))}

      {/* Front wing main plane */}
      <rect
        x={cx + e.bodyWidth/2 + e.noseLength - e.fwWidth/2 + e.fwWidth*0.1}
        y={groundY - e.fwY - e.fwHeight}
        width={e.fwWidth*0.8} height={e.fwHeight} rx={2}
        fill="url(#cg-wing)" />

      {/* Front wing second element */}
      <rect
        x={cx + e.bodyWidth/2 + e.noseLength - e.fwWidth/2 + e.fwWidth*0.15}
        y={groundY - e.fwY - e.fwHeight - 4}
        width={e.fwWidth*0.6} height={3} rx={1}
        fill={RED} opacity={0.5} />

      {/* Front wing endplates */}
      {[-1, 1].map(s => (
        <rect key={s}
          x={cx + e.bodyWidth/2 + e.noseLength + s*(e.fwWidth*0.4) - (s===1?3:0)}
          y={groundY - e.fwY - e.fwHeight - 2}
          width={3} height={e.fwEndplateH} rx={1}
          fill={RED_DARK} />
      ))}

      {/* Wheels */}
      {[{ x: fwheelX }, { x: rwheelX }].map(({ x }, i) => (
        <g key={i}>
          <ellipse cx={x} cy={wheelY} rx={e.wheelWidth/2} ry={e.wheelRadius}
            fill="url(#cg-wheel)" stroke="#1a1a1a" strokeWidth={1} />
          <ellipse cx={x} cy={wheelY} rx={e.wheelWidth/2-2} ry={e.wheelRadius*0.55}
            fill="#1a1a1a" stroke={RED_DARK} strokeWidth={1.5} />
          <ellipse cx={x} cy={wheelY} rx={e.wheelWidth/2-3} ry={e.wheelRadius*0.2}
            fill={RED} opacity={0.7} />
        </g>
      ))}

      {/* Center stripe */}
      <line
        x1={cx - e.bodyWidth/2} y1={groundY + e.bodyY - e.bodyHeight/2}
        x2={cx + e.bodyWidth/2 + e.noseLength*0.7} y2={groundY + e.bodyY - e.bodyHeight/2}
        stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="8 6" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Animated car — interpolates on era change
───────────────────────────────────────────── */
const ANIM_MS = 600;

function AnimatedCar({ fromEra, toEra, animT }) {
  const shape = animT >= 1 ? toEra : lerpEra(fromEra, toEra, d3.easeCubicInOut(animT));
  return <CarSVG shape={shape} />;
}

/* ─────────────────────────────────────────────
   Era selector buttons
───────────────────────────────────────────── */
function EraSelector({ selectedIdx, onChange }) {
  return (
    <div style={{
      display: "flex",
      gap: 0,
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: "1.5rem",
    }}>
      {ERAS.map((era, i) => {
        const active = i === selectedIdx;
        return (
          <button
            key={era.year}
            onClick={() => onChange(i)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: active ? RED : "transparent",
              border: "none",
              borderRight: i < ERAS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              color: active ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 13,
              fontWeight: active ? 700 : 400,
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
              fontFamily: "inherit",
            }}
          >
            {era.year}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function AerodynamicsEvolution({ isActive }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [fromIdx, setFromIdx]         = useState(0);
  const [animT, setAnimT]             = useState(1);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  function selectEra(i) {
    if (i === selectedIdx) return;
    // Cancel any running animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setFromIdx(selectedIdx);
    setSelectedIdx(i);
    setAnimT(0);
    startRef.current = null;

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / ANIM_MS, 1);
      setAnimT(t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const era = ERAS[selectedIdx];
  const fromEra = ERAS[fromIdx];

  return (
    <>
      <style>{`
        .aero-root {
          font-family: inherit;
          padding: 1.75rem;
          color: #fff;
        }
        .aero-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 4px;
        }
        .aero-title {
          font-size: 1.35rem;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .aero-subtitle {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
          margin: 0 0 1.5rem;
        }
        .aero-era-header {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 4px;
        }
        .aero-year {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1;
          color: ${RED};
          font-variant-numeric: tabular-nums;
        }
        .aero-era-name {
          font-size: 0.88rem;
          opacity: 0.55;
          font-weight: 500;
        }
        .aero-description {
          font-size: 0.82rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.45);
          min-height: 2.8em;
          margin: 0 0 1rem;
        }
        .aero-car-wrap {
          width: 100%;
        }
        .aero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 0.75rem;
        }
        .aero-tag {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid ${RED};
          color: ${RED};
          opacity: 0.75;
        }
      `}</style>

      <div className="chart-card aero-root">
        <h2 className="aero-title">A revolução da aerodinâmica</h2>
        <p className="aero-subtitle"> </p>

        <EraSelector selectedIdx={selectedIdx} onChange={selectEra} />

        <div className="aero-era-header">
          <span className="aero-year">{era.year}</span>
          <span className="aero-era-name">{era.label}</span>
        </div>

        <p className="aero-description">{era.description}</p>

        <div className="aero-car-wrap">
          <AnimatedCar fromEra={fromEra} toEra={era} animT={animT} />
        </div>

        <div className="aero-tags">
          {era.changes.map(tag => (
            <span key={tag} className="aero-tag">{tag}</span>
          ))}
        </div>
      </div>
    </>
  );
}