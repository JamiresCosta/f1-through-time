import { useMemo } from "react";
import * as d3 from "d3";
import useF1Data from "../../hooks/useF1Data";
import { getDriverTeams } from "../../utils/driverStats";

export default function DriverTeams({ selectedDriver, isActive }) {
  const { results, loading } = useF1Data();

  const data = useMemo(() => {
    if (loading || !selectedDriver) return [];
    return getDriverTeams(selectedDriver, results);
  }, [selectedDriver, results, loading]);

  const width = 760;
  const height = 430;
  const margin = { top: 35, right: 80, bottom: 60, left: 170 };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.races) || 0])
      .nice()
      .range([0, boundsWidth]);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.constructor))
      .range([0, boundsHeight])
      .padding(0.25);
  }, [data, boundsHeight]);

  if (loading) {
    return <div className="chart-card">Carregando...</div>;
  }

  if (!selectedDriver) {
    return (
      <div className="chart-card profile-empty">
        <h3>Selecione um piloto</h3>
        <p>Clique em um nome no ranking para visualizar suas equipes.</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="chart-card profile-empty">
        <h3>Sem dados</h3>
        <p>Não há registros de equipes para este piloto.</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-title">
        Equipes de {selectedDriver.replaceAll("_", " ")}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {xScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(${xScale(tick)}, 0)`}>
              <line y1={0} y2={boundsHeight} className="grid-line" />
              <text
                y={boundsHeight + 24}
                textAnchor="middle"
                className="axis-label"
              >
                {tick}
              </text>
            </g>
          ))}

          {data.map((d) => (
            <g key={d.constructor}>
              <text
                x={-12}
                y={yScale(d.constructor) + yScale.bandwidth() / 2 + 5}
                textAnchor="end"
                className="axis-label circuit-label"
              >
                {d.label}
              </text>

              <rect
                x={0}
                y={yScale(d.constructor)}
                width={isActive ? xScale(d.races) : 0}
                height={yScale.bandwidth()}
                className="calendar-rect"
              >
                <title>
                  {d.label}
                  {"\n"}Corridas: {d.races}
                  {"\n"}Vitórias: {d.wins}
                  {"\n"}Pódios: {d.podiums}
                  {"\n"}Pontos: {Math.round(d.points)}
                </title>
              </rect>

              <text
                x={isActive ? xScale(d.races) + 8 : 8}
                y={yScale(d.constructor) + yScale.bandwidth() / 2 + 5}
                className="axis-label"
              >
                {d.races}
              </text>
            </g>
          ))}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Corridas disputadas
          </text>
        </g>
      </svg>
    </div>
  );
}