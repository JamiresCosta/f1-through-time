import { useMemo } from "react";
import * as d3 from "d3";
import useF1Data from "../../hooks/useF1Data";
import { getTopDriversByTitles } from "../../utils/driverStats";

export default function TopDrivers({
  isActive,
  selectedDriver,
  setSelectedDriver,
}) {
  const { driverStandings, loading } = useF1Data();

  const data = useMemo(() => {
    if (loading) return [];
    return getTopDriversByTitles(driverStandings, 10);
  }, [driverStandings, loading]);


const width = 760;
const height = 470;
const margin = { top: 35, right: 80, bottom: 70, left: 210 };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.titles) || 0])
      .nice()
      .range([0, boundsWidth]);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.driver))
      .range([0, boundsHeight])
      .padding(0.25);
  }, [data, boundsHeight]);

  if (!data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-title">
        Top pilotos por títulos mundiais
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {xScale.ticks(7).map((tick) => (
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

          {data.map((d, index) => {
            const isSelected = selectedDriver === d.driver;

            return (
              <g
                key={d.driver}
                onClick={() => setSelectedDriver(d.driver)}
                style={{ cursor: "pointer" }}
              >
                <text
                  x={-12}
                  y={yScale(d.driver) + yScale.bandwidth() / 2 + 5}
                  textAnchor="end"
                  className={`axis-label driver-label ${
                    isSelected ? "selected-label" : ""
                  }`}
                >
                  {index === 0 && "🥇 "}
                  {index === 1 && "🥈 "}
                  {index === 2 && "🥉 "}
                  {d.label}
                </text>

                <rect
                  x={0}
                  y={yScale(d.driver)}
                  width={isActive ? xScale(d.titles) : 0}
                  height={yScale.bandwidth()}
                  className={
                    isSelected
                      ? "calendar-rect selected-bar"
                      : "calendar-rect"
                  }
                >
                  <title>
                    {d.label}: {d.titles} título(s)
                  </title>
                </rect>

                <text
                  x={isActive ? xScale(d.titles) + 8 : 8}
                  y={yScale(d.driver) + yScale.bandwidth() / 2 + 5}
                  className="axis-label"
                >
                  {d.titles}
                </text>
              </g>
            );
          })}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Títulos mundiais
          </text>
        </g>
      </svg>

      <p className="chart-hint">
        Clique em um piloto para selecioná-lo.
      </p>
    </div>
  );
}