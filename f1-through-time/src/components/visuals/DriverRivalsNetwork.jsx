import { useMemo } from "react";
import * as d3 from "d3";
import useF1Data from "../../hooks/useF1Data";
import { getDriverRivals } from "../../utils/driverStats";

export default function DriverRivalsNetwork({ selectedDriver, isActive }) {
  const { driverStandings, loading } = useF1Data();

  const rivals = useMemo(() => {
    if (loading || !selectedDriver) return [];
    return getDriverRivals(selectedDriver, driverStandings, 6);
  }, [selectedDriver, driverStandings, loading]);

  const width = 760;
  const height = 460;

  const center = {
    x: width / 2,
    y: height / 2,
  };

  const radiusScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, d3.max(rivals, (d) => d.count) || 1])
      .range([30, 58]);
  }, [rivals]);

  const nodes = useMemo(() => {
    const angleStep = (2 * Math.PI) / Math.max(rivals.length, 1);
    const orbitRadius = 160;

    return rivals.map((rival, index) => {
      const angle = index * angleStep - Math.PI / 2;

      return {
        ...rival,
        x: center.x + Math.cos(angle) * orbitRadius,
        y: center.y + Math.sin(angle) * orbitRadius,
      };
    });
  }, [rivals]);

  if (loading) {
    return <div className="chart-card">Carregando...</div>;
  }

  if (!selectedDriver) {
    return (
      <div className="chart-card profile-empty">
        <h3>Selecione um piloto</h3>
        <p>Clique em um nome no ranking para visualizar suas rivalidades.</p>
      </div>
    );
  }

  if (!rivals.length) {
    return (
      <div className="chart-card profile-empty">
        <h3>Sem rivalidades suficientes</h3>
        <p>Não há dados suficientes para construir a rede deste piloto.</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-title">
        Rivalidades de {selectedDriver.replaceAll("_", " ")}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        {nodes.map((node, index) => (
          <line
            key={`line-${node.driver}`}
            x1={center.x}
            y1={center.y}
            x2={isActive ? node.x : center.x}
            y2={isActive ? node.y : center.y}
            className="rival-line"
            style={{
              transitionDelay: `${index * 120}ms`,
            }}
          />
        ))}

        <g>
          <circle
            cx={center.x}
            cy={center.y}
            r={isActive ? 70 : 0}
            className="rival-center-node"
          />

          <text
            x={center.x}
            y={center.y - 5}
            textAnchor="middle"
            className="rival-center-name"
            style={{ opacity: isActive ? 1 : 0 }}
          >
            {selectedDriver.replaceAll("_", " ")}
          </text>

          <text
            x={center.x}
            y={center.y + 20}
            textAnchor="middle"
            className="rival-center-label"
            style={{ opacity: isActive ? 1 : 0 }}
          >
            piloto selecionado
          </text>
        </g>

        {nodes.map((node, index) => (
          <g
            key={node.driver}
            transform={`translate(${node.x}, ${node.y})`}
            style={{
              opacity: isActive ? 1 : 0,
              transition: "opacity 0.6s ease",
              transitionDelay: `${index * 120 + 250}ms`,
            }}
          >
            <circle
              r={isActive ? radiusScale(node.count) : 0}
              className="rival-node"
            >
              <title>
                {node.label}
                {"\n"}Temporadas próximas no campeonato: {node.count}
              </title>
            </circle>

            <text
              y={-5}
              textAnchor="middle"
              className="rival-count"
            >
              {node.count}
            </text>

            <text
              y={18}
              textAnchor="middle"
              className="rival-name"
            >
              {node.label.length > 14
                ? `${node.label.slice(0, 12)}…`
                : node.label}
            </text>
          </g>
        ))}
      </svg>

      <p className="chart-hint">
        A rede aproxima rivalidades a partir de pilotos que terminaram próximos no campeonato.
      </p>
    </div>
  );
}