import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function ConstructorNationalities({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const csv = await fetch("/data/f1_constructors.csv")
        .then((res) => res.text());

      const rows = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
      }).data;

      const grouped = d3.rollups(
        rows,
        (v) => v.length,
        (d) => d.nationality
      );

      const formatted = grouped
        .map(([nationality, total]) => ({
          nationality,
          total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setData(formatted);
    }

    loadData();
  }, []);

  const width = 760;
  const height = 520;

    const margin = {
    top: 50,
    right: 40,
    bottom: 50,
    left: 120,
    };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total) || 0])
      .nice()
      .range([0, boundsWidth]);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.nationality))
      .range([0, boundsHeight])
      .padding(0.22);
  }, [data, boundsHeight]);

  if (!data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  const leader = data[0];

  return (
    <div className="chart-card">
      <div className="chart-title">
        O berço das equipes da Fórmula 1
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="calendar-svg"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>

          {xScale.ticks(6).map((tick) => (
            <g
              key={tick}
              transform={`translate(${xScale(tick)},0)`}
            >
              <line
                y1={0}
                y2={boundsHeight}
                className="grid-line"
              />

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
            <g key={d.nationality}>

              <text
                x={-12}
                y={yScale(d.nationality) + yScale.bandwidth()/2 + 5}
                textAnchor="end"
                className="axis-label"
              >
                {d.nationality}
              </text>

              <rect
                x={0}
                y={yScale(d.nationality)}
                width={isActive ? xScale(d.total) : 0}
                height={yScale.bandwidth()}
                className={
                  index < 3
                    ? "nationality-bar nationality-bar-highlight"
                    : "nationality-bar"
                }
                style={{
                  transitionDelay: `${index * 80}ms`,
                }}
              >
                <title>
                  {d.nationality}: {d.total} construtores
                </title>
              </rect>

              <text
                x={isActive ? xScale(d.total) + 8 : 8}
                y={yScale(d.nationality) + yScale.bandwidth()/2 + 5}
                className="axis-label"
              >
                {d.total}
              </text>
            </g>
          ))}

          {leader && isActive && (
            <>
              <line
                x1={xScale(leader.total)}
                x2={boundsWidth - 130}
                y1={yScale(leader.nationality) + yScale.bandwidth()/2}
                y2={yScale(leader.nationality) - 18}
                className="annotation-line"
              />

              <text
                x={boundsWidth - 120}
                y={yScale(leader.nationality) - 22}
                className="annotation-text"
              >
                Mais que o dobro da Itália
              </text>
            </>
          )}

          <text
            x={boundsWidth/2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Número de construtores
          </text>
        </g>
      </svg>
    </div>
  );
}