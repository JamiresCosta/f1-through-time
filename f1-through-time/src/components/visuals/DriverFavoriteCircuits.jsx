import { useMemo, useState } from "react";
import * as d3 from "d3";
import useF1Data from "../../hooks/useF1Data";
import { getDriverFavoriteCircuits } from "../../utils/driverStats";

export default function DriverFavoriteCircuits({ selectedDriver, isActive }) {
  const { results, loading } = useF1Data();
  const [selectedCircuit, setSelectedCircuit] = useState(null);

  const data = useMemo(() => {
    if (loading || !selectedDriver) return [];
    return getDriverFavoriteCircuits(selectedDriver, results, 10);
  }, [selectedDriver, results, loading]);

const width = 940;
const height = 560;

const bubblesCenterX = 300;
const bubblesCenterY = 290;
const panelX = 640;
const panelY = 110;

  const radiusScale = useMemo(() => {
    return d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.wins) || 1])
      .range([34, 64]);
  }, [data]);

  const selected =
    selectedCircuit || data[0];

  const simulationData = useMemo(() => {
    const nodes = data.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX(bubblesCenterX).strength(0.09))
      .force("y", d3.forceY(bubblesCenterY).strength(0.09))
      .force(
        "collide",
        d3.forceCollide((d) => radiusScale(d.wins) + 16)
      )
      .stop();

    for (let i = 0; i < 180; i++) {
      simulation.tick();
    }

    return nodes;
  }, [data, radiusScale]);

  if (loading) {
    return <div className="chart-card">Carregando...</div>;
  }

  if (!selectedDriver) {
    return (
      <div className="chart-card profile-empty">
        <h3>Selecione um piloto</h3>
        <p>Clique em um nome no ranking para visualizar seus Grandes Prêmios.</p>
      </div> 
    );
  }

  if (!data.length) {
    return (
      <div className="chart-card profile-empty">
        <h3>Sem vitórias registradas</h3>
        <p>Não há vitórias suficientes para este piloto no dataset.</p>
      </div>
    );
  }

  function splitLabel(label) {
    const words = label.split(" ");
    if (words.length <= 2) return [label];

    const middle = Math.ceil(words.length / 2);

    return [
      words.slice(0, middle).join(" "),
      words.slice(middle).join(" "),
    ];
  }

  return (
    <div className="chart-card favorite-circuits-card">
      <div className="chart-title">
        Grandes Prêmios que {selectedDriver.replaceAll("_", " ")} mais venceu
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        <g>
          {simulationData.map((d, index) => {
            const isSelected = selected?.circuit === d.circuit;
            const hasSelection = Boolean(selected);

            const radius = radiusScale(d.wins);
            const finalRadius = isSelected ? radius * 1.25 : radius;

            const labelLines = splitLabel(d.label);

            return (
              <g
                key={d.circuit}
                transform={`translate(${d.x}, ${d.y})`}
                className="bubble-group"
                onClick={() => setSelectedCircuit(d)}
                style={{
                  opacity: isActive
                    ? hasSelection && !isSelected
                      ? 0.28
                      : 1
                    : 0,
                  transitionDelay: `${index * 70}ms`,
                  cursor: "pointer",
                }}
              >
                <circle
                  r={isActive ? finalRadius : 0}
                  className={
                    isSelected
                      ? "bubble-circle selected-bubble"
                      : "bubble-circle"
                  }
                />

                <text
                  textAnchor="middle"
                  y={labelLines.length === 1 ? -4 : -10}
                  className="bubble-value"
                >
                  {d.wins}
                </text>

                {labelLines.map((line, lineIndex) => (
                  <text
                    key={line}
                    textAnchor="middle"
                    y={labelLines.length === 1 ? 16 : 10 + lineIndex * 13}
                    className="bubble-label"
                  >
                    {line}
                  </text>
                ))}

                <title>
                  {d.label}: {d.wins} vitória(s)
                </title>
              </g>
            );
          })}
        </g>

          {selected && (
  (() => {
    const selectedNode = simulationData.find(
      (d) => d.circuit === selected.circuit
    );

    if (!selectedNode) return null;

    return (
      <line
        x1={selectedNode.x + radiusScale(selectedNode.wins)}
        y1={selectedNode.y}
        x2={panelX - 35}
        y2={panelY + 55}
        className="bubble-leader-line"
      />
    );
  })()
)}

{selected && (
  <g transform={`translate(${panelX}, ${panelY})`}>
    <line
      x1="-25"
      y1="-20"
      x2="-25"
      y2="310"
      className="bubble-panel-line"
    />

    <text className="bubble-panel-kicker" y="0">
      Grande Prêmio 
    </text>

    <text className="bubble-panel-title" y="52">
      {selected.label}
    </text>

    <text className="bubble-panel-number" y="115">
      {selected.wins}
    </text>

    <text className="bubble-panel-label" y="145">
      vitórias
    </text>

    <text className="bubble-panel-description" y="195">
      Primeira vitória: {selected.firstWin}
    </text>

    <text className="bubble-panel-description" y="222">
      Última vitória: {selected.lastWin}
    </text>

    <text className="bubble-panel-description" y="249">
      Intervalo entre vitórias: {selected.span} ano(s)
    </text>

    <text className="bubble-panel-description" y="276">
      Representam {selected.percentage.toFixed(1)}% de todas as vitórias 
    </text>
    <text className="bubble-panel-description" y="303">
       da carreira deste piloto
    </text>
    <text className="bubble-panel-description" y="328">
      #{selected.rank} Grande Prêmio com mais vitórias
    </text>
  </g>
)}
      </svg>
      {data.length > 0 && (
  <div className="bubble-legend compact-bubble-legend">
    <span>
      Tamanho da bolha = número de vitórias
    </span>

    <div className="legend-scale">
      <span className="legend-dot small-dot" />
      <span className="legend-line" />
      <span className="legend-dot big-dot" />

      <small>
        1 vitória
      </small>

      <small>
        {d3.max(data, (d) => d.wins)} vitórias
      </small>
    </div>
  </div>
)}

      <p className="chart-hint">
        Clique em uma bolha para destacar o Grande Prêmio.
      </p>
    </div>
  );
}