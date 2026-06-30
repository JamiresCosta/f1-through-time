import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function ConstructorDynasties({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const csv = await fetch(
        "/data/f1_constructor_standings.csv"
      ).then((res) => res.text());

      const rows = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
      }).data;

      const champions = rows
        .filter((d) => Number(d.position) === 1)
        .map((d) => ({
          season: Number(d.season),
          constructor: d.constructor,
        }))
        .sort((a, b) => a.season - b.season);

      setData(champions);
    }

    loadData();
  }, []);

  const width = 820;
  const height = 520;

  const margin = {
    top: 40,
    right: 40,
    bottom: 60,
    left: 130,
  };

  const boundsWidth =
    width - margin.left - margin.right;

  const boundsHeight =
    height - margin.top - margin.bottom;

  const constructors = useMemo(() => {
    const counts = d3.rollups(
      data,
      (v) => v.length,
      (d) => d.constructor
    )
      .sort((a, b) => b[1] - a[1])
      .map(([constructor]) => constructor);

    return counts;
  }, [data]);

    const xScale = useMemo(() => {
    return d3
        .scaleLinear()
        .domain([
        1950,
        d3.max(data, (d) => d.season) + 3,
        ])
        .range([0, boundsWidth]);
    }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scalePoint()
      .domain(constructors)
      .range([0, boundsHeight])
      .padding(0.5);
  }, [constructors, boundsHeight]);

  if (!data.length) {
    return (
      <div className="chart-card">
        Carregando...
      </div>
    );
  }

  const decades = d3.range(1950, 2031, 10);

  return (
    <div className="chart-card">
      <div className="chart-title">
        A linha do tempo das dinastias
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="calendar-svg"
      >
        <g
          transform={`translate(${margin.left}, ${margin.top})`}
        >
          {decades.map((year) => (
            <g
              key={year}
              transform={`translate(${xScale(year)},0)`}
            >
              <line
                y1={0}
                y2={boundsHeight}
                className="grid-line"
              />

              <text
                y={boundsHeight + 25}
                textAnchor="middle"
                className="axis-label"
              >
                {year}
              </text>
            </g>
          ))}

          {constructors.map((constructor) => (
            <text
              key={constructor}
              x={-15}
              y={yScale(constructor) + 5}
              textAnchor="end"
              className="axis-label circuit-label"
            >
              {constructor}
            </text>
          ))}

          {data.map((d, index) => (
            <circle
              key={`${d.constructor}-${d.season}`}
              cx={xScale(d.season)}
              cy={yScale(d.constructor)}
              r={isActive ? 6 : 0}
              className={`dynasty-dot ${d.constructor
                .toLowerCase()
                .replaceAll(" ", "-")}`}
              style={{
                transition:
                  "r 0.5s ease",
                transitionDelay: `${index * 12}ms`,
              }}
            >
              <title>
                {d.constructor}
                {"\n"}
                Campeã em {d.season}
              </title>
            </circle>
          ))}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Temporada
          </text>
        </g>
      </svg>
    </div>
  );
}