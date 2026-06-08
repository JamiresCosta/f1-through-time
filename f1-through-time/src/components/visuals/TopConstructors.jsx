import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function TopConstructors({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const csv = await fetch("/data/f1_constructor_standings.csv")
        .then((res) => res.text());

      const rows = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
      }).data;

      const champions = rows.filter((d) => Number(d.position) === 1);

      const grouped = d3.rollups(
        champions,
        (v) => v.length,
        (d) => d.constructor
      );

      const formatted = grouped
        .map(([constructor, titles]) => ({
          constructor: constructor.replaceAll("_", " "),
          titles,
        }))
        .sort((a, b) => b.titles - a.titles)
        .slice(0, 10);

      setData(formatted);
    }

    loadData();
  }, []);

  const width = 760;
  const height = 430;
  const margin = { top: 35, right: 60, bottom: 35, left: 190 };

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
      .domain(data.map((d) => d.constructor))
      .range([0, boundsHeight])
      .padding(0.25);
  }, [data, boundsHeight]);

  if (!data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-title">Construtores com mais títulos mundiais</div>

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

          {data.map((d, index) => (
            <g key={d.constructor}>
              <text
                x={-12}
                y={yScale(d.constructor) + yScale.bandwidth() / 2 + 5}
                textAnchor="end"
                className="axis-label circuit-label"
              >

                {d.constructor}
              </text>

              <rect
                x={0}
                y={yScale(d.constructor)}
                width={isActive ? xScale(d.titles) : 0}
                height={yScale.bandwidth()}
                className="calendar-rect"
              >
                <title>
                  {d.constructor}: {d.titles} título(s)
                </title>
              </rect>

              <text
                x={isActive ? xScale(d.titles) + 8 : 8}
                y={yScale(d.constructor) + yScale.bandwidth() / 2 + 5}
                className="axis-label"
              >
                {d.titles}
              </text>
            </g>
          ))}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 52}
            textAnchor="middle"
            className="axis-title"
          >
            Títulos mundiais
          </text>
        </g>
      </svg>
    </div>
  );
}