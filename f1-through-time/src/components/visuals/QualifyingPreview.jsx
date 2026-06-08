import * as d3 from "d3";
import { useMemo } from "react";

export default function QualifyingPreview({ isActive }) {
  const data = [
    { stage: "Q1", drivers: 20, description: "todos iniciam" },
    { stage: "Q2", drivers: 15, description: "avançam" },
    { stage: "Q3", drivers: 10, description: "disputam a fase final" },
    { stage: "Pole", drivers: 1, description: "conquista a pole" },
  ];

  const width = 760;
  const height = 430;

  const margin = {
    top: 45,
    right: 140,
    bottom: 40,
    left: 90,
  };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, 20])
      .range([0, boundsWidth]);
  }, [boundsWidth]);

  const yScale = useMemo(() => {
    return d3.scaleBand()
      .domain(data.map(d => d.stage))
      .range([0, boundsHeight])
      .padding(0.32);
  }, [boundsHeight]);

  return (
    <div className="chart-card">
      <div className="chart-title">
        Estrutura da Qualificação
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="calendar-svg"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {data.map((d, index) => {
            const finalWidth = xScale(d.drivers);
            const animatedWidth = isActive ? finalWidth : 0;

            const xPosition = (boundsWidth - finalWidth) / 2;
            const animatedXPosition = isActive
              ? xPosition
              : boundsWidth / 2;

            const label =
              d.drivers === 1
                ? "1 piloto"
                : `${d.drivers} pilotos`;

            return (
              <g key={d.stage}>
                <text
                  x={xPosition - 14}
                  y={yScale(d.stage) + yScale.bandwidth() / 2 + 5}
                  textAnchor="end"
                  className="axis-label circuit-label"
                >
                  {d.stage}
                </text>

                <rect
                  x={animatedXPosition}
                  y={yScale(d.stage)}
                  width={animatedWidth}
                  height={yScale.bandwidth()}
                  className="calendar-rect"
                  style={{
                    transitionDelay: `${index * 180}ms`,
                  }}
                >
                  <title>
                    {d.stage}: {label}
                  </title>
                </rect>

                <text
                  x={xPosition + finalWidth + 12}
                  y={yScale(d.stage) + yScale.bandwidth() / 2 + 5}
                  className="axis-label qualifying-label"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transitionDelay: `${index * 180 + 300}ms`,
                  }}
                >
                  {label}
                </text>

                <text
                  x={boundsWidth / 2}
                  y={yScale(d.stage) + yScale.bandwidth() + 20}
                  textAnchor="middle"
                  className="axis-label qualifying-description"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transitionDelay: `${index * 180 + 450}ms`,
                  }}
                >
                  {d.description}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}