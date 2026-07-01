import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   Theme
───────────────────────────────────────────── */
const RED   = "#e10600";
const WHITE = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.42)";
const DIM   = "rgba(255,255,255,0.14)";

/* ─────────────────────────────────────────────
   Circuits — simplified track outlines (stylized, not to scale)
   and a short story for each
───────────────────────────────────────────── */
const CIRCUITS = [
  {
    id: "monza",
    name: "Monza",
    country: "Itália",
    since: "1922",
    tag: "Quase inalterado",
    story: "Um dos primeiros autódromos do mundo. As retas longas e as curvas rápidas de Monza continuam praticamente as mesmas desde a década de 1950 — testemunhas de gerações inteiras de rivalidades.",
    path: "M40,120 L260,120 C300,120 300,80 260,80 L180,80 C160,80 160,60 180,60 L320,60 C340,60 340,100 320,100 L300,100 C280,100 280,140 300,140 L340,140 C360,140 360,170 340,170 L120,170 C90,170 80,150 60,150 C45,150 40,135 40,120 Z",
  },
  {
    id: "silverstone",
    name: "Silverstone",
    country: "Reino Unido",
    since: "1948",
    tag: "Berço da F1",
    story: "Sediou a primeira corrida da história do campeonato, em 1950. Construído sobre uma antiga base da Royal Air Force, o traçado foi remodelado várias vezes, mas nunca deixou o calendário.",
    path: "M60,90 C60,60 100,50 140,55 L220,65 C260,70 300,60 320,90 C335,112 320,140 290,145 L200,150 C170,152 150,170 120,165 C85,158 60,130 60,90 Z",
  },
  {
    id: "spa",
    name: "Spa-Francorchamps",
    country: "Bélgica",
    since: "1925",
    tag: "Traçado mudou",
    story: "O circuito original tinha mais de 14 km e cruzava estradas públicas nas Ardenas. A versão atual, bem mais curta, manteve apenas os trechos mais icônicos — como a temida subida de Eau Rouge.",
    path: "M45,60 L150,45 C190,40 210,60 200,90 L260,150 C280,170 320,165 330,140 C338,120 320,105 300,110 L230,120 C200,125 190,100 210,80 L120,70 C90,66 70,85 45,60 Z",
  },
  {
    id: "interlagos",
    name: "Interlagos",
    country: "Brasil",
    since: "1940",
    tag: "Casa de campeões",
    story: "Palco de títulos decisivos e viradas históricas, o traçado curto e sinuoso de São Paulo é um dos mais respeitados pelos pilotos — apesar de ser um dos circuitos mais compactos do calendário.",
    path: "M80,150 C50,140 45,110 70,95 L100,80 C90,60 110,45 135,55 L230,90 C260,100 270,130 250,150 C230,168 200,160 190,140 L160,120 C140,108 120,120 120,140 C120,155 100,158 80,150 Z",
  },
  {
    id: "zandvoort",
    name: "Zandvoort",
    country: "Holanda",
    since: "1948",
    tag: "Voltou em 2021",
    story: "Ficou fora do calendário por 36 anos. Entre dunas de areia perto do Mar do Norte, o circuito ganhou curvas com bancos acentuados e voltou para reacender a paixão local pela Fórmula 1.",
    path: "M55,110 C55,80 90,65 120,70 C150,75 150,50 180,50 C220,50 240,80 220,105 C260,100 300,120 295,150 C290,175 250,175 225,160 L150,140 C110,130 55,145 55,110 Z",
  },
];

const DRAW_DURATION = 1300;

/* ─────────────────────────────────────────────
   Track outline that draws itself in on selection
───────────────────────────────────────────── */
function TrackOutline({ circuit }) {
  const pathRef = useRef(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const length = el.getTotalLength();
    el.style.transition = "none";
    el.style.strokeDasharray = `${length} ${length}`;
    el.style.strokeDashoffset = `${length}`;
    // next frame, animate
    requestAnimationFrame(() => {
      el.style.transition = `stroke-dashoffset ${DRAW_DURATION}ms cubic-bezier(0.4,0,0.2,1)`;
      el.style.strokeDashoffset = "0";
    });
  }, [circuit.id]);

  return (
    <svg viewBox="0 0 380 220" style={{ width: "100%", height: "auto", display: "block" }}>
      <path
        ref={pathRef}
        d={circuit.path}
        fill="none"
        stroke={RED}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* start/finish marker */}
      <circle cx={parseFloat(circuit.path.slice(1).split(",")[0])} cy={parseFloat(circuit.path.split(",")[1])} r={4} fill={WHITE} opacity={0.7} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function CircuitsBlock({ isActive }) {
  const [selected, setSelected] = useState(CIRCUITS[0].id);
  const index = CIRCUITS.findIndex((c) => c.id === selected);
  const circuit = CIRCUITS[index];

  function goNext() {
    setSelected(CIRCUITS[(index + 1) % CIRCUITS.length].id);
  }
  function goPrev() {
    setSelected(CIRCUITS[(index - 1 + CIRCUITS.length) % CIRCUITS.length].id);
  }

  return (
    <>
      <style>{`
        .ct-root {
          font-family: inherit;
          color: #fff;
          padding: 1.75rem 2rem 1.5rem;
        }
        .ct-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 6px;
        }
        .ct-title {
          font-size: 1.5rem;
          font-weight: 650;
          margin: 0 0 0.9rem;
        }
        .ct-intro {
          font-size: 0.88rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.5);
          max-width: 70ch;
          margin: 0 0 1.75rem;
        }
        .ct-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: center;
        }
        @media (max-width: 640px) {
          .ct-layout { grid-template-columns: 1fr; }
        }
        .ct-track-wrap {
          border-radius: 10px;
          background: radial-gradient(circle at 50% 45%, rgba(225,6,0,0.06), rgba(0,0,0,0) 70%);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 1rem;
        }
        .ct-tag {
          display: inline-block;
          font-size: 0.7rem;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.8);
          background: rgba(225,6,0,0.12);
          border: 1px solid rgba(225,6,0,0.4);
          padding: 3px 11px;
          border-radius: 999px;
          margin-bottom: 0.7rem;
        }
        .ct-name {
          font-size: 1.6rem;
          font-weight: 650;
          margin: 0 0 2px;
        }
        .ct-meta {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin: 0 0 1rem;
        }
        .ct-story {
          font-size: 0.92rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.62);
          margin: 0;
          min-height: 5.5em;
        }
        .ct-nav {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 1.4rem;
        }
        .ct-nav-btn {
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
        .ct-nav-btn:hover {
          border-color: ${RED};
          color: #fff;
        }
        .ct-dots { display: flex; gap: 6px; }
        .ct-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: ${DIM}; cursor: pointer; transition: all 0.2s ease;
        }
        .ct-dot.active { background: ${RED}; transform: scale(1.3); }
      `}</style>

      <div className="chart-card ct-root">
        <h2 className="ct-title">Cada circuito conta uma história</h2>
        <p className="ct-intro">
          Ao longo de mais de sete décadas, os circuitos da Fórmula 1 testemunharam conquistas históricas,
          rivalidades inesquecíveis e momentos que definiram gerações de fãs e pilotos. Alguns permaneceram
          praticamente inalterados desde as primeiras temporadas; outros desapareceram, deram lugar a novas
          pistas ou retornaram após longos períodos de ausência.
        </p>

        <div className="ct-layout">
          <div className="ct-track-wrap">
            <TrackOutline circuit={circuit} />
          </div>

          <div>
            <span className="ct-tag">{circuit.tag}</span>
            <h3 className="ct-name">{circuit.name}</h3>
            <p className="ct-meta">{circuit.country} · desde {circuit.since}</p>
            <p className="ct-story">{circuit.story}</p>

            <div className="ct-nav">
              <button className="ct-nav-btn" onClick={goPrev} aria-label="Circuito anterior">‹</button>
              <div className="ct-dots">
                {CIRCUITS.map((c, i) => (
                  <div key={c.id} className={`ct-dot ${i === index ? "active" : ""}`} onClick={() => setSelected(c.id)} />
                ))}
              </div>
              <button className="ct-nav-btn" onClick={goNext} aria-label="Próximo circuito">›</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}