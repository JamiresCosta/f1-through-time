import * as d3 from "d3";
import { useMemo } from "react";

export default function PointsSystem({ isActive }) {
  const data = [
    { position: "1º", points: 25 },
    { position: "2º", points: 18 },
    { position: "3º", points: 15 },
    { position: "4º", points: 12 },
    { position: "5º", points: 10 },
    { position: "6º", points: 8 },
    { position: "7º", points: 6 },
    { position: "8º", points: 4 },
    { position: "9º", points: 2 },
    { position: "10º", points: 1 },
  ];

  const width = 760;
  const height = 430;
  const margin = { top: 35, right: 60, bottom: 40, left: 90 };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, 25])
      .range([0, boundsWidth]);
  }, [boundsWidth]);

  const yScale = useMemo(() => {
    return d3.scaleBand()
      .domain(data.map(d => d.position))
      .range([0, boundsHeight])
      .padding(0.25);
  }, [boundsHeight]);

  return (
    <div className="chart-card">
      <div className="chart-title">Sistema de pontuação da Fórmula 1</div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {xScale.ticks(5).map(tick => (
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

          {data.map((d, index) => (
            <g key={d.position}>
              <text
                x={-15}
                y={yScale(d.position) + yScale.bandwidth() / 2 + 5}
                textAnchor="end"
                className="axis-label circuit-label"
              >

                {d.position}
              </text>

              <rect
                x={0}
                y={yScale(d.position)}
                width={isActive ? xScale(d.points) : 0}
                height={yScale.bandwidth()}
                className="calendar-rect"
              >
                <title>
                  {d.position}: {d.points} pontos
                </title>
              </rect>

              <text
                x={isActive ? xScale(d.points) + 8 : 8}
                y={yScale(d.position) + yScale.bandwidth() / 2 + 5}
                className="axis-label"
              >
                {d.points} pts
              </text>
            </g>
          ))}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 52}
            textAnchor="middle"
            className="axis-title"
          >
            Pontos
          </text>
        </g>
      </svg>
    </div>
  );
}