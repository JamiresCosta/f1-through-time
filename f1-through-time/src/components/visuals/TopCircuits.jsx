import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function TopCircuits({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const csv = await fetch("/data/f1_races.csv").then((res) => res.text());

      const races = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
      }).data;

      const grouped = d3.rollups(
        races,
        (v) => v.length,
        (d) => d.circuit_id
      );

      const formatted = grouped
        .map(([circuit, races]) => ({
          circuit,
          races,
        }))
        .sort((a, b) => b.races - a.races)
        .slice(0, 10);

      setData(formatted);
    }

    loadData();
  }, []);

  const width = 760;
  const height = 430;
  const margin = { top: 30, right: 40, bottom: 30, left: 180 };

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
      .domain(data.map((d) => d.circuit))
      .range([0, boundsHeight])
      .padding(0.25);
  }, [data, boundsHeight]);

  if (!data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-title">Circuitos com mais Grandes Prêmios</div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {xScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(${xScale(tick)}, 0)`}>
              <line y1={0} y2={boundsHeight} className="grid-line" />
              <text
                y={boundsHeight + 22}
                textAnchor="middle"
                className="axis-label"
              >
                {tick}
              </text>
            </g>
          ))}

          {data.map((d, index) => (
            <g key={d.circuit}>
              <text
                x={-12}
                y={yScale(d.circuit) + yScale.bandwidth() / 2 + 4}
                textAnchor="end"
                className="axis-label circuit-label"
              >
                {d.circuit.replaceAll("_", " ")}
              </text>

              <rect
                x={0}
                y={yScale(d.circuit)}
                width={isActive ? xScale(d.races) : 0}
                height={yScale.bandwidth()}
                className="calendar-rect"
                className={
                index < 3
                ? "calendar-rect featured-bar"
                : "calendar-rect"
                }
              >
                <title>
                  {d.circuit.replaceAll("_", " ")}: {d.races} GPs
                </title>
              </rect>

              <text
                x={isActive ? xScale(d.races) + 8 : 8}
                y={yScale(d.circuit) + yScale.bandwidth() / 2 + 4}
                className="axis-label"
              >
                {d.races}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}