import { useMemo } from "react";
import * as d3 from "d3";
import useF1Data from "../../hooks/useF1Data";
import { getDriverTimeline } from "../../utils/driverStats";

export default function CareerTimeline({ selectedDriver, isActive }) {
  const { driverStandings, results, loading } = useF1Data();

  const data = useMemo(() => {
    if (loading || !selectedDriver) return [];
    return getDriverTimeline(selectedDriver, driverStandings, results);
  }, [selectedDriver, driverStandings, results, loading]);

  const width = 760;
  const height = 430;
  const margin = { top: 40, right: 40, bottom: 60, left: 70 };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.season))
      .range([0, boundsWidth]);
  }, [data, boundsWidth]);

const maxPosition = useMemo(() => {
  return Math.max(20, d3.max(data, (d) => d.position) || 20);
}, [data]);

const yScale = useMemo(() => {
  return d3
    .scaleLinear()
    .domain([maxPosition, 1])
    .nice()
    .range([boundsHeight, 0]);
}, [boundsHeight, maxPosition]);

const validData = useMemo(() => {
  return data.filter(
    (d) =>
      Number.isFinite(d.season) &&
      Number.isFinite(d.position)
  );
}, [data]);

const linePath = useMemo(() => {
  const line = d3
    .line()
    .defined(
      (d) =>
        Number.isFinite(d.season) &&
        Number.isFinite(d.position)
    )
    .x((d) => xScale(d.season))
    .y((d) => yScale(d.position))
    .curve(d3.curveLinear);

  return line(validData);
}, [validData, xScale, yScale]);

  if (loading) {
    return <div className="chart-card">Carregando...</div>;
  }

  if (!selectedDriver) {
    return (
      <div className="chart-card profile-empty">
        <h3>Selecione um piloto</h3>
        <p>
          Clique em um nome no ranking para visualizar a evolução da carreira.
        </p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="chart-card profile-empty">
        <h3>Sem dados suficientes</h3>
        <p>Não há histórico de temporadas para este piloto.</p>
      </div>
    );
  }

const xTicks = validData.filter(
  (d, index) =>
    index === 0 ||
    index === validData.length - 1 ||
    d.season % 5 === 0
);

  return (
    <div className="chart-card">
      <div className="chart-title">
        Evolução da carreira — {selectedDriver.replaceAll("_", " ")}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {[1, 5, 10, 15, 20, 25].filter(tick => tick <= maxPosition).map((tick) => (
            <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
              <line x1={0} x2={boundsWidth} className="grid-line" />
              <text x={-12} y={4} textAnchor="end" className="axis-label">
                P{tick}
              </text>
            </g>
          ))}

          {xTicks.map((d) => (
            <text
              key={d.season}
              x={xScale(d.season)}
              y={boundsHeight + 28}
              textAnchor="middle"
              className="axis-label"
            >
              {d.season}
            </text>
          ))}

          {linePath && (
  <path
    d={linePath}
    pathLength="1"
    className="career-line"
    style={{
      strokeDasharray: 1,
      strokeDashoffset: isActive ? 0 : 1,
    }}
  />
)}

          {validData.map((d, index) => (
            <circle
              key={d.season}
              cx={xScale(d.season)}
              cy={yScale(d.position)}
              r={isActive ? (d.position === 1 ? 7 : 5) : 0}
              className={d.position === 1 ? "career-dot champion-dot" : "career-dot"}
              style={{
                transitionDelay: `${index * 60}ms`,
              }}
            >
              <title>
                {d.season}
                {"\n"}Posição final: P{d.position}
                {"\n"}Pontos: {d.points}
                {"\n"}Vitórias: {d.wins}
                {"\n"}Pódios: {d.podiums}
                {"\n"}Equipe: {d.constructor}
              </title>
            </circle>
          ))}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Temporada
          </text>

          <text
            transform={`translate(-48, ${boundsHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            className="axis-title"
          >
            Posição no campeonato
          </text>
        </g>
      </svg>
    </div>
  );
}