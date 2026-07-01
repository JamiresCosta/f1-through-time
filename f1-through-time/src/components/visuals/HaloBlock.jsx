import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const RED   = "#e10600";
const WHITE = "rgba(255,255,255,0.9)";
const MUTED = "rgba(255,255,255,0.35)";
const DIM   = "rgba(255,255,255,0.12)";
const TITANIUM = "#c8c8c8";

const INCIDENTS = [
  {
    year: 2020,
    pilot: "Romain Grosjean",
    team: "Haas",
    description: "O carro explodiu em chamas após perfurar a barreira metálica no Bahrein. O Halo dividiu a barreira ao meio e salvou sua cabeça.",
    type: "barrier",
  },
  {
    year: 2021,
    pilot: "Lewis Hamilton",
    team: "Mercedes",
    description: "O carro de Verstappen subiu por cima do de Hamilton no GP da Itália. O Halo impediu o contato direto com o capacete de Hamilton.",
    type: "overlap",
  },
  {
    year: 2022,
    pilot: "Zhou Guanyu",
    team: "Alfa Romeo",
    description: "Carro capotou e deslizou pelo asfalto e sobre a grade de proteção. O Halo tocou o chão antes do capacete, preservando a cabeça do piloto.",
    type: "rollover",
  },
];

/* Tab definitions — order = display order */
const TABS = [
  { id: "antes",     label: "Antes",     sublabel: "Sem Halo" },
  { id: "depois",    label: "Depois",    sublabel: "2018 · obrigatório" },
  { id: "grosjean",  label: "Grosjean",  sublabel: "2020" },
  { id: "hamilton",  label: "Hamilton",  sublabel: "2021" },
  { id: "zhou",      label: "Zhou",      sublabel: "2022" },
  { id: "legado",    label: "Legado",    sublabel: "Resumo" },
];

const ANIM_DURATION = { antes: 500, depois: 1400, grosjean: 2200, hamilton: 2200, zhou: 2200, legado: 900 };

/* ─────────────────────────────────────────────
   Simple F1 car SVG (top-down silhouette)
───────────────────────────────────────────── */
function F1CarSVG({
  cx = 200, cy = 110,
  showHalo = false,
  haloProgress = 0,
  highlightHalo = false,
  scale = 1,
  dimmed = false,
}) {
  const s = scale;
  const W = 160 * s, H = 72 * s;
  const x = cx - W / 2, y = cy - H / 2;

  const bodyColor = dimmed ? "rgba(180,180,180,0.3)" : "rgba(200,200,200,0.75)";
  const haloColor = highlightHalo
    ? d3.interpolateRgb(TITANIUM, "#ffe88a")(0.6)
    : TITANIUM;
  const haloGlow = highlightHalo ? "drop-shadow(0 0 6px rgba(255,220,80,0.6))" : "none";

  return (
    <g>
      <rect x={x} y={y + H * 0.25} width={W} height={H * 0.5} rx={8 * s}
        fill={bodyColor} />

      <polygon
        points={`${cx + W/2},${cy}  ${cx + W/2 - 10*s},${cy - 7*s}  ${cx + W/2 - 10*s},${cy + 7*s}`}
        fill={dimmed ? "rgba(120,120,120,0.3)" : "rgba(140,140,140,0.7)"}
      />

      <ellipse cx={cx - W*0.08} cy={cy} rx={22*s} ry={14*s}
        fill={dimmed ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.5)"}
        stroke={dimmed ? DIM : "rgba(255,255,255,0.1)"} strokeWidth={1}
      />

      <rect x={cx + W/2 - 4*s} y={cy - 30*s} width={8*s} height={60*s} rx={3*s}
        fill={dimmed ? "rgba(140,140,140,0.2)" : "rgba(160,160,160,0.6)"}
      />

      <rect x={cx - W/2 - 4*s} y={cy - 34*s} width={8*s} height={68*s} rx={3*s}
        fill={dimmed ? "rgba(140,140,140,0.2)" : "rgba(160,160,160,0.6)"}
      />

      {[
        [cx + W*0.28, cy - H*0.42],
        [cx + W*0.28, cy + H*0.42],
        [cx - W*0.28, cy - H*0.42],
        [cx - W*0.28, cy + H*0.42],
      ].map(([wx, wy], i) => (
        <ellipse key={i} cx={wx} cy={wy} rx={14*s} ry={10*s}
          fill={dimmed ? "rgba(20,20,20,0.3)" : "#1a1a1a"}
          stroke={dimmed ? DIM : "rgba(255,255,255,0.08)"} strokeWidth={1}
        />
      ))}

      {showHalo && (
        <g opacity={haloProgress} style={{ filter: haloGlow }}>
          <path
            d={`
              M ${cx - 38*s} ${cy}
              C ${cx - 38*s} ${cy - 46*s},
                ${cx + 38*s} ${cy - 46*s},
                ${cx + 38*s} ${cy}
            `}
            fill="none"
            stroke={haloColor}
            strokeWidth={9 * s}
            strokeLinecap="round"
          />
          <line
            x1={cx} y1={cy - 6*s}
            x2={cx} y2={cy - 40*s}
            stroke={haloColor} strokeWidth={6*s} strokeLinecap="round"
          />
          {[-38, 38].map((dx, i) => (
            <rect key={i}
              x={cx + dx*s - 5*s} y={cy - 4*s}
              width={10*s} height={8*s} rx={2*s}
              fill={haloColor}
            />
          ))}
        </g>
      )}
    </g>
  );
}

/* ─────────────────────────────────────────────
   Scene: Antes do Halo
───────────────────────────────────────────── */
function SceneAntes({ t }) {
  return (
    <g opacity={t}>
      <F1CarSVG cx={200} cy={115} showHalo={false} />
      <text x={200} y={175} textAnchor="middle" fontSize={11} fill={MUTED}>
        Sem Halo · antes de 2018
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────────
   Scene: Depois do Halo (estrutura + obrigatoriedade em 2018)
───────────────────────────────────────────── */
function SceneDepois({ t }) {
  const haloProgress  = Math.min(t / 0.45, 1);
  const badgeProgress = Math.max(0, (t - 0.45) / 0.55);
  const annotationOpacity = Math.max(0, Math.min((haloProgress - 0.6) / 0.4, 1)) * (1 - Math.min(badgeProgress / 0.3, 1));

  return (
    <g>
      <F1CarSVG cx={200} cy={95} showHalo={true} haloProgress={haloProgress} scale={0.85} />

      {annotationOpacity > 0 && (
        <g opacity={annotationOpacity}>
          <line x1={200} y1={62} x2={200} y2={78}
            stroke={TITANIUM} strokeWidth={1} strokeDasharray="3 3" />
          <text x={200} y={55} textAnchor="middle" fontSize={10}
            fill={TITANIUM} fontWeight="500">
            Estrutura de titânio
          </text>
          <text x={200} y={45} textAnchor="middle" fontSize={9} fill={MUTED}>
            Resiste a 125 kN de força
          </text>
        </g>
      )}

      <g opacity={badgeProgress} transform={`translate(0, ${(1 - badgeProgress) * 20})`}>
        <rect x={90} y={158} width={220} height={52} rx={8}
          fill="rgba(225,6,0,0.12)" stroke={RED} strokeWidth={1} />
        <text x={200} y={178} textAnchor="middle" fontSize={11} fill={MUTED}>
          A partir de
        </text>
        <text x={200} y={196} textAnchor="middle" fontSize={16}
          fontWeight="500" fill={WHITE}>
          2018 — Halo obrigatório na F1
        </text>
      </g>
    </g>
  );
}

/* ─────────────────────────────────────────────
   Incident animations
───────────────────────────────────────────── */
function GrosjeanAnimation({ t }) {
  const barrierX = 320;
  const carX = 80 + t * (barrierX - 150 - 80);
  const impactT = Math.max(0, (t - 0.6) / 0.4);
  const fireOpacity = impactT * 0.8;
  const haloGlow = impactT > 0.3;

  return (
    <g>
      <rect x={barrierX} y={70} width={16} height={80} rx={2}
        fill="rgba(120,120,120,0.6)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <rect x={barrierX + 16} y={80} width={60} height={60} rx={2}
        fill="rgba(80,80,80,0.5)" />
      <text x={barrierX + 38} y={118} textAnchor="middle"
        fontSize={9} fill={MUTED}>barreira</text>

      {impactT > 0.1 && (
        <g opacity={fireOpacity}>
          {[0,1,2,3,4].map(i => (
            <ellipse key={i}
              cx={barrierX - 10 + (i % 3) * 14}
              cy={90 + (i % 2) * 16 - impactT * i * 4}
              rx={8 + i * 3} ry={12 + i * 2}
              fill={i % 2 === 0 ? "#ff4400" : "#ff8800"}
              opacity={0.6 - i * 0.1}
            />
          ))}
        </g>
      )}

      <F1CarSVG cx={carX} cy={110} showHalo={true} haloProgress={1}
        highlightHalo={haloGlow} scale={0.7} />

      {impactT > 0.05 && (
        <g opacity={Math.min(impactT * 2, 1)}>
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI - Math.PI / 2;
            const r = 20 + impactT * 30;
            return (
              <line key={i}
                x1={barrierX - 2} y1={110}
                x2={barrierX - 2 + Math.cos(angle) * r}
                y2={110 + Math.sin(angle) * r}
                stroke="#ffaa00" strokeWidth={1.5} opacity={0.7}
              />
            );
          })}
        </g>
      )}

      {haloGlow && (
        <text x={200} y={168} textAnchor="middle" fontSize={10}
          fill="#ffe88a" fontWeight="500">
          Halo dividiu a barreira — piloto sobreviveu
        </text>
      )}
    </g>
  );
}

function OverlapAnimation({ t }) {
  const hamX = 160;
  const verX = 240;
  const verY_base = 135;
  const overlapT = Math.max(0, (t - 0.5) / 0.5);

  return (
    <g>
      <F1CarSVG cx={hamX} cy={120} showHalo={true} haloProgress={1}
        highlightHalo={overlapT > 0.3} scale={0.65} />
      <text x={hamX} y={170} textAnchor="middle" fontSize={9} fill={MUTED}>
        Hamilton
      </text>

      <g transform={`translate(0, ${-t * 38}) rotate(${t * 14}, ${verX}, ${verY_base})`}>
        <F1CarSVG cx={verX} cy={verY_base} showHalo={true} haloProgress={1}
          scale={0.65} dimmed={false} />
      </g>
      <text x={verX} y={170} textAnchor="middle" fontSize={9} fill={MUTED}>
        Verstappen
      </text>

      {overlapT > 0.2 && (
        <g opacity={(overlapT - 0.2) / 0.8}>
          <line x1={195} y1={95} x2={195} y2={108}
            stroke={TITANIUM} strokeWidth={1} strokeDasharray="2 2" />
          <text x={195} y={90} textAnchor="middle" fontSize={9}
            fill="#ffe88a" fontWeight="500">
            Halo absorve impacto
          </text>
        </g>
      )}
    </g>
  );
}

function RolloverAnimation({ t }) {
  const angle = t * 185;
  const slideX = t * 120;
  const groundContact = angle > 90;

  return (
    <g>
      <rect x={60} y={148} width={280} height={12} rx={2}
        fill="rgba(255,255,255,0.06)" />
      <text x={200} y={178} textAnchor="middle" fontSize={9} fill={MUTED}>
        asfalto
      </text>

      <g transform={`translate(${60 + slideX}, 148) rotate(${angle}, 80, 0)`}>
        <F1CarSVG cx={80} cy={-24} showHalo={true} haloProgress={1}
          highlightHalo={groundContact} scale={0.65} />
      </g>

      {groundContact && (
        <g opacity={Math.min((angle - 90) / 60, 1)}>
          <text x={200} y={145} textAnchor="middle" fontSize={9}
            fill="#ffe88a" fontWeight="500">
            Halo toca o chão antes do capacete
          </text>
        </g>
      )}
    </g>
  );
}

/* ─────────────────────────────────────────────
   Incident card
───────────────────────────────────────────── */
function IncidentCard({ incident, t }) {
  const progress = Math.min(t * 2.5, 1);
  const anim = {
    barrier: <GrosjeanAnimation t={t} />,
    overlap: <OverlapAnimation t={t} />,
    rollover: <RolloverAnimation t={t} />,
  }[incident.type];

  return (
    <g>
      <text x={30} y={32} fontSize={28} fontWeight="500"
        fill={WHITE} opacity={progress}>
        {incident.year}
      </text>
      <text x={30} y={50} fontSize={10} fill={MUTED} opacity={progress}>
        {incident.pilot} · {incident.team}
      </text>

      <g opacity={progress}>
        {anim}
      </g>

      <g opacity={progress}>
        <foreignObject x={10} y={185} width={380} height={55}>
          <div style={{
            fontSize: 11,
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.45)",
            fontFamily: "inherit",
          }}>
            {incident.description}
          </div>
        </foreignObject>
      </g>
    </g>
  );
}

/* ─────────────────────────────────────────────
   Scene: Legado (resumo final)
───────────────────────────────────────────── */
function SceneLegado({ t }) {
  const progress = Math.min(t * 1.6, 1);
  return (
    <g>
      {[
        { n: "3", label: "acidentes gravíssimos", y: 60 },
        { n: "3", label: "vidas preservadas", y: 120 },
      ].map(({ n, label, y }) => (
        <g key={label} opacity={progress}
          transform={`translate(0, ${(1 - progress) * 15})`}>
          <text x={200} y={y} textAnchor="middle"
            fontSize={42} fontWeight="500" fill={RED}>
            {n}
          </text>
          <text x={200} y={y + 20} textAnchor="middle"
            fontSize={13} fill={MUTED}>
            {label}
          </text>
        </g>
      ))}

      <line x1={120} y1={150} x2={280} y2={150}
        stroke={DIM} strokeWidth={1} opacity={progress} />

      <g opacity={progress}>
        <rect x={110} y={162} width={180} height={64} rx={8}
          fill="rgba(225,6,0,0.08)" stroke={RED} strokeWidth={1} />
        <text x={200} y={184} textAnchor="middle"
          fontSize={20} fontWeight="500" fill={WHITE}>
          HALO
        </text>
        <text x={200} y={201} textAnchor="middle" fontSize={10} fill={MUTED}>
          Obrigatório desde 2018
        </text>
        <text x={200} y={218} textAnchor="middle" fontSize={10} fill={RED}>
          ✓ Aprovado pela FIA
        </text>
      </g>
    </g>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const SVG_W = 400;
const SVG_H = 245;

export default function HaloBlock({ isActive }) {
  const [selected, setSelected] = useState("antes");
  const [t, setT] = useState(0);
  const animRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    startRef.current = null;
    setT(0);

    const duration = ANIM_DURATION[selected] ?? 900;

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      setT(p);
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    }
    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [selected]);

  function renderScene() {
    switch (selected) {
      case "antes":
        return <SceneAntes t={t} />;
      case "depois":
        return <SceneDepois t={t} />;
      case "grosjean":
        return <IncidentCard incident={INCIDENTS[0]} t={t} />;
      case "hamilton":
        return <IncidentCard incident={INCIDENTS[1]} t={t} />;
      case "zhou":
        return <IncidentCard incident={INCIDENTS[2]} t={t} />;
      case "legado":
        return <SceneLegado t={t} />;
      default:
        return null;
    }
  }

  const activeTab = TABS.find((tb) => tb.id === selected);

  return (
    <>
      <style>{`
        .halo-root {
          font-family: inherit;
          color: #fff;
          position: relative;
          padding: 1.5rem 1.75rem 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .halo-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 4px;
        }
        .halo-title {
          font-size: 1.35rem;
          font-weight: 600;
          margin: 0 0 1rem;
        }
        .halo-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 1rem;
        }
        .halo-tab {
          appearance: none;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.55);
          font-size: 0.75rem;
          font-family: inherit;
          padding: 7px 13px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
          line-height: 1.1;
        }
        .halo-tab:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.8);
        }
        .halo-tab.active {
          background: rgba(225,6,0,0.14);
          border-color: ${RED};
          color: #fff;
        }
        .halo-sublabel {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(225,6,0,0.7);
          margin-bottom: 4px;
          min-height: 14px;
        }
        .halo-svg-wrap {
          flex: 1;
          min-height: 260px;
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          position: relative;
        }
      `}</style>

      <div className="chart-card halo-root">
        <h2 className="halo-title">O Halo que salva vidas</h2>

        <div className="halo-tabs" role="tablist">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              role="tab"
              aria-selected={selected === tb.id}
              className={`halo-tab ${selected === tb.id ? "active" : ""}`}
              onClick={() => setSelected(tb.id)}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="halo-sublabel">{activeTab?.sublabel}</div>

        <div className="halo-svg-wrap">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <defs>
              <radialGradient id="halo-bg" cx="50%" cy="50%">
                <stop offset="0%" stopColor="rgba(225,6,0,0.04)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <rect width={SVG_W} height={SVG_H} fill="url(#halo-bg)" />
            {renderScene()}
          </svg>
        </div>
      </div>
    </>
  );
}