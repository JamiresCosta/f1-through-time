import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function ConstructorEras({ isActive }) {
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
        (d) => `${Math.floor(Number(d.season) / 10) * 10}s`,
        (d) => d.constructor
      );

      const formatted = grouped.map(([decade, constructors]) => ({
        decade,
        constructors: constructors
          .map(([constructor, titles]) => ({
            constructor: constructor.replaceAll("_", " "),
            titles,
          }))
          .sort((a, b) => b.titles - a.titles)
          .slice(0, 3),
      }));

      setData(formatted);
    }

    loadData();
  }, []);

  const width = 760;
  const height = 440;
  const margin = { top: 40, right: 40, bottom: 50, left: 80 };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.decade))
      .range([0, boundsWidth])
      .padding(0.25);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, 10])
      .range([boundsHeight, 0]);
  }, [boundsHeight]);

  if (!data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-title">Construtores campeões por década</div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {yScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
              <line x1={0} x2={boundsWidth} className="grid-line" />
              <text x={-12} y={4} textAnchor="end" className="axis-label">
                {tick}
              </text>
            </g>
          ))}

          {data.map((decade) => {
            let currentY = boundsHeight;

            return (
              <g key={decade.decade}>
                {decade.constructors.map((team, index) => {
                  const barHeight = boundsHeight - yScale(team.titles);
                  currentY -= barHeight;

                  return (
                    <rect
                      key={team.constructor}
                      x={xScale(decade.decade)}
                      y={isActive ? currentY : boundsHeight}
                      width={xScale.bandwidth()}
                      height={isActive ? barHeight : 0}
                      className={`era-bar era-bar-${index}`}
                    >
                      <title>
                        {decade.decade} — {team.constructor}: {team.titles} título(s)
                      </title>
                    </rect>
                  );
                })}

                <text
                  x={xScale(decade.decade) + xScale.bandwidth() / 2}
                  y={boundsHeight + 28}
                  textAnchor="middle"
                  className="axis-label"
                >
                  {decade.decade}
                </text>
              </g>
            );
          })}

          <text
            transform={`translate(-45, ${boundsHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            className="axis-title"
          >
            Títulos
          </text>
        </g>
      </svg>
    </div>
  );
}