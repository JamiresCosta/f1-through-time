import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function HistoricCircuits({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [circuitsCsv, racesCsv] = await Promise.all([
        fetch("/data/f1_circuits.csv").then((r) => r.text()),
        fetch("/data/f1_races.csv").then((r) => r.text()),
      ]);

      const circuits = Papa.parse(circuitsCsv, {
        header: true,
        skipEmptyLines: true,
      }).data;

      const races = Papa.parse(racesCsv, {
        header: true,
        skipEmptyLines: true,
      }).data;

      const circuitsMap = new Map();

      circuits.forEach((c) => {
        circuitsMap.set(c.circuit_id, {
          name: c.circuit_name,
          country: c.country,
        });
      });

      const grouped = d3.rollups(
        races,
        (v) => ({
          seasons: new Set(v.map((d) => d.season)).size,
          first: d3.min(v, (d) => Number(d.season)),
          last: d3.max(v, (d) => Number(d.season)),
        }),
        (d) => d.circuit_id
      );

      const formatted = grouped
        .map(([id, info]) => ({
          circuit: circuitsMap.get(id)?.name ?? id,
          country: circuitsMap.get(id)?.country ?? "",
          seasons: info.seasons,
          first: info.first,
          last: info.last,
        }))
        .sort((a, b) => b.seasons - a.seasons)
        .slice(0, 10);

      setData(formatted);
    }

    loadData();
  }, []);

  const width = 840;
  const height = 520;

  const margin = {
    top: 60,
    right: 120,
    bottom: 70,
    left: 235,
  };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.seasons) || 0])
      .nice()
      .range([0, boundsWidth]);
  }, [data]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.circuit))
      .range([0, boundsHeight])
      .padding(0.9);
  }, [data]);

  if (!data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  return (
    <div className="chart-card">
      <div className="chart-title">
        Os circuitos mais tradicionais da Fórmula 1
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="calendar-svg"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>

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

          {data.map((d, index) => {

            const color =
              index < 5
                ? "#e10600"
                : "#9a9a9a";

            const radius =
              5 + (d.seasons / data[0].seasons) * 5;

            return (
              <g key={d.circuit}>

                <text
                  x={-12}
                  y={yScale(d.circuit) + 5}
                  textAnchor="end"
                  className="axis-label circuit-label"
                >
                  {d.circuit}
                </text>

                <line
                  x1={0}
                  x2={isActive ? xScale(d.seasons) : 0}
                  y1={yScale(d.circuit)}
                  y2={yScale(d.circuit)}
                  stroke={color}
                  strokeWidth={3}
                  style={{
                    transition:
                      "all .8s ease",
                    transitionDelay: `${index * 120}ms`,
                  }}
                />

                <circle
                  cx={isActive ? xScale(d.seasons) : 0}
                  cy={yScale(d.circuit)}
                  r={isActive ? radius : 0}
                  fill={color}
                  style={{
                    transition:
                      "all .5s ease",
                    transitionDelay: `${index * 120 + 450}ms`,
                  }}
                >
                  <title>
                    {`${d.circuit}

${d.country}

Primeira temporada: ${d.first}

Última temporada: ${d.last}

Temporadas disputadas: ${d.seasons}`}
                  </title>
                </circle>

                <text
                  x={
                    isActive
                      ? xScale(d.seasons) + 18
                      : 18
                  }
                  y={yScale(d.circuit) + 5}
                  className="axis-label"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition:
                      "opacity .5s ease",
                    transitionDelay: `${index * 120 + 600}ms`,
                  }}
                >
                  {d.seasons}
                </text>

              </g>
            );
          })}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Temporadas no calendário
          </text>

        </g>
      </svg>
    </div>
  );
}