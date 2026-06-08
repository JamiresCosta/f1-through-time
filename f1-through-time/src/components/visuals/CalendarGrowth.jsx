import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function CalendarGrowth({ isActive })  {
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
        (d) => Number(d.season)
      );

      const formatted = grouped
        .map(([season, races]) => ({ season, races }))
        .sort((a, b) => a.season - b.season);

      setData(formatted);
    }

    loadData();
  }, []);

  const width = 760;
  const height = 420;
  const margin = { top: 30, right: 120, bottom: 55, left: 55 };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.season))
      .range([0, boundsWidth])
      .padding(0.15);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.races) || 0])
      .nice()
      .range([boundsHeight, 0]);
  }, [data, boundsHeight]);

  if (!data.length) {
    return <div className="placeholder">Carregando...</div>;
  }
      const firstSeason = data[0];
      const lastSeason = data[data.length - 1];
  const xTicks = data.filter((d) => d.season % 10 === 0);

  return (
    <div className="chart-card">
      <div className="chart-title">Grandes Prêmios por temporada</div>

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

          {data.map((d) => (
            <rect
            key={d.season}
            x={xScale(d.season)}
            y={isActive ? yScale(d.races) : boundsHeight}
            width={xScale.bandwidth()}
            height={isActive ? boundsHeight - yScale(d.races) : 0}
            className="calendar-rect"
            >
              <title>
                {d.season}: {d.races} corridas
              </title>
            </rect>
          ))}

          {xTicks.map((d) => (
            <text
              key={d.season}
              x={xScale(d.season) + xScale.bandwidth() / 2}
              y={boundsHeight + 30}
              textAnchor="middle"
              className="axis-label"
            >
              {d.season}
            </text>
          ))}
{firstSeason && (
  <>
    <circle
      cx={xScale(firstSeason.season) + xScale.bandwidth()/2}
      cy={yScale(firstSeason.races)}
      r={6}
      fill="#ffd700"
    />

    <text
      x={xScale(firstSeason.season) + 10}
      y={yScale(firstSeason.races) - 75}
      className="annotation-text"
    >
      Primeira temporada
    </text>
  </>
)}
{lastSeason && (
  <>
    <circle
      cx={xScale(lastSeason.season) + xScale.bandwidth()/2}
      cy={yScale(lastSeason.races)}
      r={6}
      fill="#e10600"
    />

    <text
      x={xScale(lastSeason.season) - 150}
      y={yScale(lastSeason.races) - 35}
      className="annotation-text"
    >
      Maior calendário da história
    </text>
  </>
)}
          <text
            x={boundsWidth / 2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Temporada
          </text>

          <text
            transform={`translate(-42, ${boundsHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            className="axis-title"
          >
            Corridas
          </text>
        </g>
      </svg>
    </div>
  );
}