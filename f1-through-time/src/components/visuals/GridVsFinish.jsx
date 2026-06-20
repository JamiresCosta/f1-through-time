import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function GridVsFinish({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const csv = await fetch("/data/f1_results.csv")
        .then((res) => res.text());

      const rows = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
      }).data;

      const filtered = rows
        .filter(
          (d) =>
            Number(d.season) === 2026 &&
            Number(d.grid) > 0 &&
            Number(d.position) > 0
        )
        .map((d) => ({
          driver: d.driver_name,
          race: d.race_name,
          grid: Number(d.grid),
          finish: Number(d.position),
        }));

      setData(filtered);
    }

    loadData();
  }, []);

  const width = 760;
  const height = 440;
  const margin = { top: 40, right: 40, bottom: 60, left: 70 };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3.scaleLinear().domain([20, 1]).range([0, boundsWidth]);
  }, [boundsWidth]);

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([20, 1]).range([boundsHeight, 0]);
  }, [boundsHeight]);

  if (!data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-title">Grid de largada vs posição final</div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {[1, 5, 10, 15, 20].map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={boundsHeight}
                className="grid-line"
              />
              <text
                x={xScale(tick)}
                y={boundsHeight + 25}
                textAnchor="middle"
                className="axis-label"
              >
                {tick}
              </text>
            </g>
          ))}

          {[1, 5, 10, 15, 20].map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={0}
                x2={boundsWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                className="grid-line"
              />
              <text
                x={-14}
                y={yScale(tick) + 4}
                textAnchor="end"
                className="axis-label"
              >
                {tick}
              </text>
            </g>
          ))}

          <line
            x1={xScale(1)}
            y1={yScale(1)}
            x2={xScale(20)}
            y2={yScale(20)}
            className="diagonal-line"
          />

          {data.map((d, index) => (
            <circle
              key={`${d.race}-${d.driver}-${index}`}
              cx={xScale(d.grid)}
              cy={yScale(d.finish)}
              r={isActive ? 7 : 0}
              className="scatter-dot"
              style={{
            transitionDelay: `${index * 12}ms`,
                }}
            >
              <title>
                {d.driver} — {d.race}
                {"\n"}Largou: {d.grid}
                {"\n"}Chegou: {d.finish}
              </title>
            </circle>
          ))}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Posição de largada
          </text>

          <text
            transform={`translate(-48, ${boundsHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            className="axis-title"
          >
            Posição final
          </text>
        </g>
      </svg>
    </div>
  );
}