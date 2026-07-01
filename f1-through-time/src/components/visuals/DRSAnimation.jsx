import { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const W = 600;
const H = 160;
const TRACK_Y = 100;
const TRACK_TOP = TRACK_Y - 22;
const TRACK_BOT = TRACK_Y + 22;

// Car dimensions
const CAR_W = 72;
const CAR_H = 18;
const WHEEL_R = 6;

// Detection zone x position (DRS trigger line)
const DETECTION_X = W * 0.35;
// DRS activation zone
const ACTIVATION_X = W * 0.48;

const RED = "#e10600";
const RED_DARK = "#8a0400";
const WHITE = "rgba(255,255,255,0.9)";
const GRAY = "rgba(255,255,255,0.15)";
const MUTED = "rgba(255,255,255,0.35)";

/* ─────────────────────────────────────────────
   Scenario definitions
───────────────────────────────────────────── */
const SCENARIOS = {
  noDRS: {
    label: "Sem DRS",
    description: "Sem DRS, a turbulência do carro da frente prejudica a aderência do carro de trás — ele não consegue se aproximar o suficiente para ultrapassar.",
    // Car positions over time [t=0..1] → x
    // Both cars: leader ahead, follower ~1.2 car lengths behind
    leader: (t) => 80 + t * 300,
    follower: (t) => 80 + t * 300 - CAR_W - 28,
    // No DRS open
    drsOpen: () => false,
    // Gap stays constant — no overtake
    gap: (t) => CAR_W + 28,
    overtakes: false,
  },
  withDRS: {
    label: "Com DRS",
    description: "Com DRS, o carro de trás detecta estar a menos de 1 segundo. A asa traseira abre, reduzindo o arrasto — o carro acelera e ultrapassa.",
    leader: (t) => 80 + t * 300,
    follower: (t) => {
      if (t < 0.3) return 80 + t * 300 - CAR_W - 28;          // closing gap
      if (t < 0.55) return 80 + t * 300 - CAR_W - 28 + d3.easeCubicIn((t - 0.3) / 0.25) * 32; // accelerating
      if (t < 0.75) return 80 + t * 300 - CAR_W + 4 + (t - 0.55) * 200; // overtaking
      return 80 + t * 300 + CAR_W * 0.6 + (t - 0.75) * 260;   // ahead
    },
    drsOpen: (t) => t > 0.3 && t < 0.75,
    overtakes: true,
  },
};

/* ─────────────────────────────────────────────
   Car SVG shape — rendered at (x, y) center
───────────────────────────────────────────── */
function drawCar(cx, cy, color, drsOpen = false, flip = false) {
  const dark = d3.color(color)?.darker(0.7)?.toString() ?? "#333";
  const x = cx - CAR_W / 2;
  const y = cy - CAR_H / 2;
  const dir = flip ? -1 : 1;

  return (
    <g key={`car-${cx}`}>
      {/* Body */}
      <rect x={x} y={y} width={CAR_W} height={CAR_H} rx={4}
        fill={color} />

      {/* Nose */}
      <polygon
        points={`
          ${x + (flip ? 0 : CAR_W)},${cy - 5}
          ${x + (flip ? 0 : CAR_W)},${cy + 5}
          ${x + (flip ? -14 : CAR_W + 14)},${cy}
        `}
        fill={dark}
      />

      {/* Cockpit */}
      <ellipse cx={cx - dir * 6} cy={cy - CAR_H / 2 - 5}
        rx={10} ry={6} fill="rgba(0,0,0,0.6)" stroke={dark} strokeWidth={1} />

      {/* Front wing */}
      <rect
        x={x + (flip ? -2 : CAR_W - 2)} y={cy + 4}
        width={flip ? -18 : 18} height={4} rx={1}
        fill={dark} />

      {/* Rear wing — opens when DRS active */}
      <g transform={`translate(${x + (flip ? CAR_W + 2 : -2)}, ${cy - CAR_H / 2 - 3})`}>
        {/* Pillar */}
        <rect x={-2} y={0} width={4} height={10} rx={1} fill={dark} />
        {/* Wing plane */}
        <rect
          x={-10} y={-4} width={20} height={5} rx={2}
          fill={dark}
          transform={drsOpen ? `rotate(-18, 0, -2)` : "rotate(0)"}
          style={{ transition: "transform 0.3s ease" }}
        />
        {drsOpen && (
          <rect x={-8} y={-9} width={16} height={3} rx={1}
            fill={color} opacity={0.7}
            style={{ animation: "none" }}
          />
        )}
      </g>

      {/* Wheels */}
      {[
        { side: flip ? -0.6 : 0.6, lane: -1 },
        { side: flip ? -0.6 : 0.6, lane: 1 },
        { side: flip ? 0.6 : -0.6, lane: -1 },
        { side: flip ? 0.6 : -0.6, lane: 1 },
      ].map(({ side, lane }, i) => (
        <ellipse key={i}
          cx={cx + side * (CAR_W / 2 - 8)}
          cy={cy + lane * (CAR_H / 2 + 3)}
          rx={WHEEL_R - 1} ry={WHEEL_R}
          fill="#1a1a1a" stroke="rgba(255,255,255,0.15)" strokeWidth={1}
        />
      ))}
    </g>
  );
}

/* ─────────────────────────────────────────────
   Track SVG — static background
───────────────────────────────────────────── */
function Track({ showDetectionZone, showActivationZone, t, scenario }) {
  const isDRS = scenario === "withDRS";

  return (
    <>
      {/* Track surface */}
      <rect x={0} y={TRACK_TOP} width={W} height={TRACK_BOT - TRACK_TOP}
        fill="rgba(255,255,255,0.04)" rx={4} />

      {/* Track edge lines */}
      <line x1={0} y1={TRACK_TOP} x2={W} y2={TRACK_TOP}
        stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <line x1={0} y1={TRACK_BOT} x2={W} y2={TRACK_BOT}
        stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

      {/* Center dashes */}
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={i}
          x1={i * 44 + 10} y1={TRACK_Y}
          x2={i * 44 + 28} y2={TRACK_Y}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}

      {/* DRS Detection zone line */}
      {isDRS && (
        <g>
          <line
            x1={DETECTION_X} y1={TRACK_TOP - 18}
            x2={DETECTION_X} y2={TRACK_BOT + 8}
            stroke={t > 0.15 ? RED : MUTED}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            style={{ transition: "stroke 0.4s" }}
          />
          <text x={DETECTION_X} y={TRACK_TOP - 22}
            textAnchor="middle" fontSize={9} fill={t > 0.15 ? RED : MUTED}
            style={{ transition: "fill 0.4s" }}>
            Zona de detecção
          </text>
        </g>
      )}

      {/* DRS Activation zone line */}
      {isDRS && (
        <g>
          <line
            x1={ACTIVATION_X} y1={TRACK_TOP - 18}
            x2={ACTIVATION_X} y2={TRACK_BOT + 8}
            stroke={t > 0.3 ? "#00d97e" : MUTED}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            style={{ transition: "stroke 0.4s" }}
          />
          <text x={ACTIVATION_X} y={TRACK_TOP - 22}
            textAnchor="middle" fontSize={9} fill={t > 0.3 ? "#00d97e" : MUTED}
            style={{ transition: "fill 0.4s" }}>
            DRS ativo
          </text>
        </g>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   Gap indicator between cars
───────────────────────────────────────────── */
function GapIndicator({ leaderX, followerX, t, scenario }) {
  const isDRS = scenario === "withDRS";
  const gap = leaderX - followerX - CAR_W;
  if (gap <= 0 || gap > 120) return null;

  const midX = followerX + CAR_W / 2 + gap / 2;
  const gapMs = isDRS
    ? Math.max(0, Math.round(1000 - t * 1400))
    : 1200;
  const label = gapMs > 0 ? `${(gapMs / 1000).toFixed(2)}s` : "Ultrapassagem!";
  const color = gapMs < 1000 ? "#00d97e" : MUTED;

  return (
    <g>
      <line
        x1={followerX + CAR_W / 2} y1={TRACK_Y + 30}
        x2={leaderX - CAR_W / 2}   y2={TRACK_Y + 30}
        stroke={color} strokeWidth={1}
      />
      <line x1={followerX + CAR_W / 2} y1={TRACK_Y + 26}
        x2={followerX + CAR_W / 2} y2={TRACK_Y + 34}
        stroke={color} strokeWidth={1} />
      <line x1={leaderX - CAR_W / 2} y1={TRACK_Y + 26}
        x2={leaderX - CAR_W / 2} y2={TRACK_Y + 34}
        stroke={color} strokeWidth={1} />
      <text x={midX} y={TRACK_Y + 44}
        textAnchor="middle" fontSize={10} fill={color}
        fontWeight="500">
        {label}
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────────
   DRS status badge
───────────────────────────────────────────── */
function DRSBadge({ open }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 12px",
      borderRadius: 20,
      border: `1px solid ${open ? "#00d97e" : "rgba(255,255,255,0.15)"}`,
      color: open ? "#00d97e" : "rgba(255,255,255,0.3)",
      fontSize: 12,
      fontWeight: open ? 600 : 400,
      transition: "all 0.3s ease",
      letterSpacing: "0.05em",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: open ? "#00d97e" : "rgba(255,255,255,0.2)",
        transition: "background 0.3s",
        boxShadow: open ? "0 0 6px #00d97e" : "none",
      }} />
      DRS {open ? "ABERTO" : "FECHADO"}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const ANIM_DURATION = 3200; // ms for one full pass

export default function DRSAnimation({ isActive }) {
  const [scenario, setScenario] = useState("noDRS");
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const pausedAtRef = useRef(0);

  const sc = SCENARIOS[scenario];

  const animate = useCallback((ts) => {
    if (!startRef.current) startRef.current = ts - pausedAtRef.current * ANIM_DURATION;
    const elapsed = ts - startRef.current;
    const newT = Math.min(elapsed / ANIM_DURATION, 1);
    setT(newT);
    if (newT < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setPlaying(false);
      pausedAtRef.current = 0;
    }
  }, []);

  function play() {
    if (playing) return;
    if (t >= 1) { setT(0); pausedAtRef.current = 0; }
    startRef.current = null;
    setPlaying(true);
    rafRef.current = requestAnimationFrame(animate);
  }

  function pause() {
    if (!playing) return;
    cancelAnimationFrame(rafRef.current);
    pausedAtRef.current = t;
    setPlaying(false);
  }

  function reset() {
    cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    pausedAtRef.current = 0;
    setT(0);
    setPlaying(false);
  }

  function switchScenario(s) {
    reset();
    setScenario(s);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Compute positions
  const leaderX  = Math.min(sc.leader(t), W - CAR_W / 2 - 10);
  const followerX = Math.min(sc.follower(t), W - CAR_W / 2 - 10);
  const isDRSOpen = sc.drsOpen(t);
  const isOvertaken = scenario === "withDRS" && t > 0.75;

  return (
    <>
      <style>{`
        .drs-root { font-family: inherit; padding: 1.75rem; color: #fff; }
        .drs-eyebrow { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin: 0 0 4px; }
        .drs-title { font-size: 1.35rem; font-weight: 600; margin: 0 0 4px; }
        .drs-subtitle { font-size: 0.82rem; color: rgba(255,255,255,0.4); margin: 0 0 1.5rem; }
        .drs-tabs { display: flex; gap: 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; margin-bottom: 1.25rem; }
        .drs-tab { flex: 1; padding: 9px 0; background: transparent; border: none; border-right: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); font-size: 13px; font-family: inherit; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .drs-tab:last-child { border-right: none; }
        .drs-tab.active { background: #e10600; color: #fff; font-weight: 600; }
        .drs-description { font-size: 0.82rem; line-height: 1.6; color: rgba(255,255,255,0.45); min-height: 3em; margin-bottom: 1.25rem; }
        .drs-svg-wrap { width: 100%; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); margin-bottom: 1rem; }
        .drs-controls { display: flex; align-items: center; gap: 10px; }
        .drs-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; background: transparent; color: rgba(255,255,255,0.75); font-size: 13px; font-family: inherit; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
        .drs-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.3); }
        .drs-btn.primary { background: #e10600; border-color: #e10600; color: #fff; }
        .drs-btn.primary:hover { background: #c00500; }
        .drs-progress { flex: 1; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .drs-progress-fill { height: 100%; border-radius: 2px; background: #e10600; transition: width 0.05s linear; }
        .drs-legend { display: flex; align-items: center; gap: 16px; margin-top: 1rem; }
        .drs-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.4); }
        .drs-legend-dot { width: 8px; height: 8px; border-radius: 50%; }
      `}</style>

      <div className="chart-card drs-root">
        <h2 className="drs-title">O DRS mudou as ultrapassagens</h2>
        <p className="drs-subtitle">Compare a diferença com e sem o sistema de redução de arrasto</p>

        {/* Scenario tabs */}
        <div className="drs-tabs">
          {Object.entries(SCENARIOS).map(([key, sc]) => (
            <button key={key}
              className={`drs-tab ${scenario === key ? "active" : ""}`}
              onClick={() => switchScenario(key)}>
              {sc.label}
            </button>
          ))}
        </div>

        <p className="drs-description">{sc.description}</p>

        {/* Status badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <DRSBadge open={isDRSOpen} />
          {isOvertaken && (
            <div style={{
              padding: "4px 12px", borderRadius: 20,
              background: "rgba(225,6,0,0.15)",
              border: "1px solid rgba(225,6,0,0.4)",
              color: RED, fontSize: 12, fontWeight: 600,
            }}>
              Ultrapassagem realizada!
            </div>
          )}
        </div>

        {/* Animation SVG */}
        <div className="drs-svg-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>

            <Track
              showDetectionZone={scenario === "withDRS"}
              showActivationZone={scenario === "withDRS"}
              t={t}
              scenario={scenario}
            />

            {/* Leader car (white/silver) */}
            {drawCar(leaderX, TRACK_Y, "rgba(200,200,200,0.85)", false)}

            {/* Follower car (red) */}
            {drawCar(followerX, TRACK_Y, RED, isDRSOpen)}

            {/* Gap indicator */}
            <GapIndicator
              leaderX={leaderX}
              followerX={followerX}
              t={t}
              scenario={scenario}
            />

            {/* Turbulence visual behind leader — only without DRS */}
            {scenario === "noDRS" && t > 0.05 && (
              <g opacity={0.4}>
                {[0, 1, 2].map(i => (
                  <ellipse key={i}
                    cx={leaderX - CAR_W / 2 - 10 - i * 14}
                    cy={TRACK_Y + (i % 2 === 0 ? -5 : 5)}
                    rx={6 + i * 2} ry={3 + i}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={1}
                  />
                ))}
              </g>
            )}

            {/* DRS airflow lines — when open */}
            {isDRSOpen && (
              <g>
                {[-4, 0, 4].map((dy, i) => (
                  <line key={i}
                    x1={followerX + CAR_W / 2}
                    y1={TRACK_Y + dy}
                    x2={followerX + CAR_W / 2 + 30 + i * 4}
                    y2={TRACK_Y + dy}
                    stroke="rgba(0, 217, 126, 0.4)"
                    strokeWidth={1}
                    strokeDasharray={`${4 + i} 4`}
                  />
                ))}
              </g>
            )}

            {/* Car labels */}
            <text x={leaderX} y={TRACK_Y - CAR_H / 2 - 12}
              textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.5)">
              {isOvertaken ? "P2" : "P1"}
            </text>
            <text x={followerX} y={TRACK_Y - CAR_H / 2 - 12}
              textAnchor="middle" fontSize={9} fill={isOvertaken ? RED : "rgba(255,255,255,0.5)"}>
              {isOvertaken ? "P1 ✓" : "P2"}
            </text>

          </svg>
        </div>

        {/* Controls */}
        <div className="drs-controls">
          <button
            className={`drs-btn ${!playing ? "primary" : ""}`}
            onClick={playing ? pause : play}
          >
            {playing ? "⏸ Pausar" : t >= 1 ? "↺ Repetir" : t === 0 ? "▶ Simular" : "▶ Continuar"}
          </button>
          <button className="drs-btn" onClick={reset}>↺ Resetar</button>
          <div className="drs-progress">
            <div className="drs-progress-fill" style={{ width: `${t * 100}%` }} />
          </div>
        </div>

        {/* Legend */}
        <div className="drs-legend">
          <div className="drs-legend-item">
            <div className="drs-legend-dot" style={{ background: "rgba(200,200,200,0.85)" }} />
            Carro à frente
          </div>
          <div className="drs-legend-item">
            <div className="drs-legend-dot" style={{ background: RED }} />
            Carro com DRS disponível
          </div>
          {scenario === "withDRS" && (
            <div className="drs-legend-item">
              <div className="drs-legend-dot" style={{ background: "#00d97e" }} />
              DRS ativo / intervalo &lt;1s
            </div>
          )}
        </div>
      </div>
    </>
  );
}