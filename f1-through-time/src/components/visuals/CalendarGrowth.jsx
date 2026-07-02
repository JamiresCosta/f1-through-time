import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function CalendarGrowth({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const csv = await fetch("/data/f1_races.csv").then((res) =>
        res.text()
      );

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
        .map(([season, races]) => ({
          season,
          races,
        }))
        .sort((a, b) => a.season - b.season);

      setData(formatted);
    }

    loadData();
  }, []);

  const width = 760;
  const height = 420;

  const margin = {
    top: 35,
    right: 120,
    bottom: 55,
    left: 55,
  };

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


  const xTicks = data.filter((d) => d.season % 10 === 0);

  return (
    <div className="chart-card">
      <div className="chart-title">
        Grandes Prêmios por temporada
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="calendar-svg"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {yScale.ticks(5).map((tick) => (
            <g
              key={tick}
              transform={`translate(0, ${yScale(tick)})`}
            >
              <line
                x1={0}
                x2={boundsWidth}
                className="grid-line"
              />

              <text
                x={-12}
                y={4}
                textAnchor="end"
                className="axis-label"
              >
                {tick}
              </text>
            </g>
          ))}
{data.map((d) => {
  const isFirst = d.season === 1950;
  const isCovid = d.season === 2020;
  const isLatest = d.season === 2026;

  return (
<rect
  key={d.season}
  x={xScale(d.season)}
  y={isActive ? yScale(d.races) : boundsHeight}
  width={xScale.bandwidth()}
  height={isActive ? boundsHeight - yScale(d.races) : 0}
  className="calendar-rect"
  style={{
    fill:
      d.season === 1950 ||
      d.season === 2020 ||
      d.season === 2026
        ? "#FFD54A"
        : "#E10600",
  }}
>
      <title>
        {isFirst &&
          `1950

Primeira temporada do Campeonato Mundial de Fórmula 1.`}

        {isCovid &&
          `2020 — Pandemia de COVID-19

Em outubro de 2019 a FIA previa o maior calendário da história da Fórmula 1.

22 corridas haviam sido planejadas.

Entretanto, 13 Grandes Prêmios foram cancelados emergencialmente, incluindo Interlagos e Mônaco.

Outras 8 corridas, fora do calendário inicial, foram adicionadas para viabilizar a temporada.

Calendário final: ${d.races} corridas.`}

        {isLatest &&
          `2026

Campeonato atual.`}

        {!isFirst &&
          !isCovid &&
          !isLatest &&
          `${d.season}: ${d.races} corridas`}
      </title>
    </rect>
  );
})}

          {xTicks.map((d) => (
            <text
              key={d.season}
              x={
                xScale(d.season) +
                xScale.bandwidth() / 2
              }
              y={boundsHeight + 30}
              textAnchor="middle"
              className="axis-label"
            >
              {d.season}
            </text>
          ))}
          
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