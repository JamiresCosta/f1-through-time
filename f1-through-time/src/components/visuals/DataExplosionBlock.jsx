import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/* ─────────────────────────────────────────────
   Theme
───────────────────────────────────────────── */
const RED   = "#e10600";
const WHITE = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.4)";
const DIM   = "rgba(255,255,255,0.14)";

const SVG_W = 420;
const SVG_H = 340;

/* ─────────────────────────────────────────────
   Stage graphs — nodes + links (source/target are node ids)
───────────────────────────────────────────── */
function buildGraph(stageId) {
  const carro = { id: "carro", label: "Carro", x: 210, y: 26, kind: "label" };
  const equipe = { id: "equipe", label: "Equipe", x: 210, y: 300, kind: "label" };
  const sensores = { id: "sensores", label: "300 sensores", x: 210, y: 150, kind: "big" };
  const boxes = { id: "boxes", label: "Boxes", x: 210, y: 235, kind: "label" };

  if (stageId === "simples") {
    return {
      nodes: [carro, { ...equipe, y: 300 }],
      links: [{ source: carro, target: { ...equipe, y: 300 }, kind: "straight" }],
    };
  }

  // fan points between "carro" and "sensores" — the exploding sensor count
  const fanY = 95;
  const fanXs = d3.range(11).map((i) => 50 + (i * (SVG_W - 100)) / 10);
  const fanNodes = fanXs.map((x, i) => ({ id: `fan-${i}`, x, y: fanY, kind: "dot" }));

  const fanLinksIn = fanNodes.map((f) => ({ source: carro, target: f, kind: "thin" }));
  const fanLinksOut = fanNodes.map((f) => ({ source: f, target: sensores, kind: "thin" }));

  if (stageId === "sensores") {
    return {
      nodes: [carro, ...fanNodes, sensores, boxes],
      links: [...fanLinksIn, ...fanLinksOut, { source: sensores, target: boxes, kind: "straight" }],
    };
  }

  // downstream fan — where all that data actually goes
  const downstream = [
    { id: "ia", label: "IA", x: 60, y: 320 },
    { id: "estrategia", label: "Estratégia", x: 165, y: 320 },
    { id: "simulador", label: "Simulador", x: 275, y: 320 },
    { id: "engenheiros", label: "Engenheiros", x: 385, y: 320 },
  ].map((d) => ({ ...d, kind: "label" }));

  const downstreamLinks = downstream.map((d) => ({ source: boxes, target: d, kind: "curve" }));

  return {
    nodes: [carro, ...fanNodes, sensores, boxes, ...downstream],
    links: [...fanLinksIn, ...fanLinksOut, { source: sensores, target: boxes, kind: "straight" }, ...downstreamLinks],
  };
}

const STAGES = [
  { id: "simples", label: "Antes", stat: "1", statLabel: "canal de dados: carro → equipe" },
  { id: "sensores", label: "Hoje", stat: "300", statLabel: "sensores transmitindo em tempo real" },
  { id: "destino", label: "E depois?", stat: "4+", statLabel: "destinos: IA, estratégia, simulador, engenheiros" },
];

/* ─────────────────────────────────────────────
   Path generator per link kind
───────────────────────────────────────────── */
function linkPath(link) {
  const { source, target, kind } = link;
  if (kind === "curve") {
    const gen = d3.linkVertical().x((d) => d.x).y((d) => d.y);
    return gen({ source, target });
  }
  // straight / thin
  return `M${source.x},${source.y} L${target.x},${target.y}`;
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function DataExplosionBlock({ isActive }) {
  const [selected, setSelected] = useState(STAGES[0].id);
  const svgRef = useRef(null);
  const stageIndex = STAGES.findIndex((s) => s.id === selected);
  const stage = STAGES[stageIndex];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const graph = buildGraph(selected);

    const defs = svg.append("defs");
    const grad = defs.append("radialGradient").attr("id", "de-bg").attr("cx", "50%").attr("cy", "20%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "rgba(225,6,0,0.05)");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0,0,0,0)");
    svg.append("rect").attr("width", SVG_W).attr("height", SVG_H).attr("fill", "url(#de-bg)");

    const linkGroup = svg.append("g");
    const nodeGroup = svg.append("g");

    // ── Links: draw them in with stroke-dashoffset, staggered ──
    const linkSel = linkGroup
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", linkPath)
      .attr("fill", "none")
      .attr("stroke", (d) => (d.kind === "curve" ? RED : d.kind === "thin" ? "rgba(255,255,255,0.22)" : TITANIUM_LINE()))
      .attr("stroke-width", (d) => (d.kind === "thin" ? 1 : d.kind === "curve" ? 1.6 : 2))
      .attr("stroke-linecap", "round")
      .attr("opacity", (d) => (d.kind === "curve" ? 0.85 : d.kind === "thin" ? 0.5 : 0.9));

    linkSel.each(function (d, i) {
      const el = d3.select(this);
      const length = this.getTotalLength();
      el.attr("stroke-dasharray", `${length} ${length}`).attr("stroke-dashoffset", length);
      el.transition()
        .delay(120 + i * (d.kind === "thin" ? 22 : 60))
        .duration(d.kind === "thin" ? 380 : 550)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);
    });

    // ── Nodes: fade + scale in, after their links start ──
    const realNodes = graph.nodes.filter((n) => n.kind !== "dot");

    const nodeSel = nodeGroup
      .selectAll("g.node")
      .data(realNodes, (d) => d.id)
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .style("opacity", 0);

    nodeSel.each(function (d, i) {
      const g = d3.select(this);

      if (d.kind === "big") {
        g.append("circle").attr("r", 3).attr("fill", RED);
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -14)
          .attr("font-size", 22)
          .attr("font-weight", 700)
          .attr("fill", WHITE)
          .text(d.label);
      } else {
        g.append("circle").attr("r", 3.5).attr("fill", d.id === "boxes" || d.id === "carro" ? WHITE : RED);
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", d.id === "carro" ? -12 : 20)
          .attr("font-size", 13)
          .attr("fill", WHITE)
          .text(d.label);
      }

      g.transition()
        .delay(300 + i * 90)
        .duration(400)
        .style("opacity", 1);
    });

    function TITANIUM_LINE() {
      return "rgba(200,200,200,0.7)";
    }
  }, [selected]);

  function goNext() {
    setSelected(STAGES[Math.min(stageIndex + 1, STAGES.length - 1)].id);
  }
  function goPrev() {
    setSelected(STAGES[Math.max(stageIndex - 1, 0)].id);
  }

  return (
    <>
      <style>{`
        .de-root {
          font-family: inherit;
          color: #fff;
          padding: 1.75rem 2rem 1.5rem;
        }
        .de-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 6px;
        }
        .de-title {
          font-size: 1.55rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 1.1rem;
        }
        .de-hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.12);
          margin: 0 0 1.25rem;
        }
        .de-stat-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 1.1rem;
        }
        .de-stat-n {
          font-size: 2.4rem;
          font-weight: 700;
          color: ${RED};
          line-height: 1;
        }
        .de-stat-label {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.45);
          max-width: 34ch;
        }
        .de-svg-wrap {
          width: 100%;
          max-width: 460px;
          margin: 0 auto;
        }
        .de-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 0.5rem;
        }
        .de-nav-btn {
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
        .de-nav-btn:hover:not(:disabled) {
          border-color: ${RED};
          color: #fff;
        }
        .de-nav-btn:disabled {
          opacity: 0.25;
          cursor: default;
        }
        .de-dots {
          display: flex;
          gap: 6px;
        }
        .de-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${DIM};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .de-dot.active {
          background: ${RED};
          transform: scale(1.3);
        }
        .de-stage-label {
          text-align: center;
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(225,6,0,0.75);
          margin-top: 0.6rem;
        }
      `}</style>

      <div className="chart-card de-root">
        <h2 className="de-title">A quantidade de dados explodiu</h2>
        <hr className="de-hr" />

        <div className="de-stat-row">
          <span className="de-stat-n">{stage.stat}</span>
          <span className="de-stat-label">{stage.statLabel}</span>
        </div>

        <div className="de-svg-wrap">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <div className="de-nav">
            <button className="de-nav-btn" onClick={goPrev} disabled={stageIndex === 0} aria-label="Anterior">‹</button>
            <div className="de-dots">
              {STAGES.map((s, i) => (
                <div
                  key={s.id}
                  className={`de-dot ${i === stageIndex ? "active" : ""}`}
                  onClick={() => setSelected(s.id)}
                />
              ))}
            </div>
            <button className="de-nav-btn" onClick={goNext} disabled={stageIndex === STAGES.length - 1} aria-label="Próximo">›</button>
          </div>
          <div className="de-stage-label">{stage.label}</div>
        </div>
      </div>
    </>
  );
}