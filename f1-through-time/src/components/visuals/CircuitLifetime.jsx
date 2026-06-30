import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function CircuitLifetimes({ isActive }) {
  const [data, setData] = useState([]);
  const [view, setView] = useState("active");

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
          first: d3.min(v, (d) => Number(d.season)),
          last: d3.max(v, (d) => Number(d.season)),
          seasons: new Set(v.map((d) => d.season)).size,
        }),
        (d) => d.circuit_id
      );

      const formatted = grouped
        .map(([id, info]) => ({
          circuit: circuitsMap.get(id)?.name ?? id,
          country: circuitsMap.get(id)?.country ?? "",
          first: info.first,
          last: info.last,
          seasons: info.seasons,
          active: info.last >= 2025,
        }))
        .sort((a, b) => {
          if (a.active !== b.active) {
            return Number(b.active) - Number(a.active);
          }

          if (a.first !== b.first) {
            return a.first - b.first;
          }

          return b.seasons - a.seasons;
        });

      setData(formatted);
    }

    loadData();
  }, []);

  const displayedData = useMemo(() => {
    if (view === "active") {
      return data
        .filter((d) => d.active)
        .sort((a, b) => {
          if (a.first !== b.first) {
            return a.first - b.first;
          }

          return b.seasons - a.seasons;
        })
        .slice(0, 10);
    }

    return data
      .filter((d) => !d.active)
      .sort((a, b) => {
        if (a.last !== b.last) {
          return b.last - a.last;
        }

        return b.seasons - a.seasons;
      })
      .slice(0, 10);
  }, [data, view]);

  const width = 900;
  const height = 560;

  const margin = {
    top: 60,
    right: 80,
    bottom: 70,
    left: 240,
  };

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([1950, 2025])
      .range([0, boundsWidth]);
  }, [boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(displayedData.map((d) => d.circuit))
      .range([0, boundsHeight])
      .padding(0.7);
  }, [displayedData, boundsHeight]);

  if (!data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  return (
        <div className="chart-card">
      <div className="chart-title">
        {view === "active"
          ? "Os circuitos históricos que permanecem no calendário"
          : "Circuitos históricos que deixaram a Fórmula 1"}
      </div>

      <div className="circuit-toggle">
        <button
          className={view === "active" ? "active" : ""}
          onClick={() => setView("active")}
        >
          Ainda ativos
        </button>

        <button
          className={view === "retired" ? "active" : ""}
          onClick={() => setView("retired")}
        >
          Descontinuados
        </button>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="calendar-svg"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>

          {/* Grade vertical */}

          {d3.range(1950, 2030, 10).map((year) => (
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
                y={boundsHeight + 24}
                textAnchor="middle"
                className="axis-label"
              >
                {year}
              </text>
            </g>
          ))}

          {displayedData.map((d, index) => {

            const y =
              yScale(d.circuit) +
              yScale.bandwidth() / 2;

            const color = d.active
              ? "#e10600"
              : "#9a9a9a";

            return (
              <g key={d.circuit}>

                {/* Nome */}

                <text
                  x={-15}
                  y={y + 5}
                  textAnchor="end"
                  className="axis-label circuit-label"
                >
                  {d.circuit}
                </text>

                {/* Linha */}

                <line
                  x1={xScale(d.first)}
                  x2={
                    isActive
                      ? xScale(d.last)
                      : xScale(d.first)
                  }
                  y1={y}
                  y2={y}
                  stroke={color}
                  className="lifetime-line"
                  style={{
                    transition: "all .8s ease",
                    transitionDelay: `${index * 120}ms`,
                  }}
                />

                {/* Início */}

                <circle
                  cx={xScale(d.first)}
                  cy={y}
                  r={isActive ? 5 : 0}
                  fill={color}
                  style={{
                    transition: "all .4s ease",
                    transitionDelay: `${index * 120}ms`,
                  }}
                />

                {/* Final */}

                {d.active ? (
                  <polygon
                    points={`
                      ${xScale(d.last) + 10},${y}
                      ${xScale(d.last) - 6},${y - 6}
                      ${xScale(d.last) - 6},${y + 6}
                    `}
                    fill={color}
                    style={{
                      opacity: isActive ? 1 : 0,
                      transition: "opacity .4s ease",
                      transitionDelay: `${index * 120 + 300}ms`,
                    }}
                  />
                ) : (
                  <circle
                    cx={xScale(d.last)}
                    cy={y}
                    r={isActive ? 5 : 0}
                    fill={color}
                    style={{
                      transition: "all .4s ease",
                      transitionDelay: `${index * 120 + 300}ms`,
                    }}
                  />
                )}

                {/* Quantidade de temporadas */}

                <text
                  x={xScale(d.last) + 18}
                  y={y + 5}
                  className="axis-label"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: "opacity .4s ease",
                    transitionDelay: `${index * 120 + 450}ms`,
                  }}
                >
                  {d.seasons}
                </text>

                {/* Tooltip */}

                <title>
                  {`${d.circuit}

${d.country}

Primeira temporada: ${d.first}

Última temporada: ${d.last}

${d.seasons} temporadas

${d.active
  ? "Ainda integra o calendário"
  : "Não faz mais parte do calendário"}`}
                </title>

              </g>
            );

          })}

          <text
            x={boundsWidth / 2}
            y={boundsHeight + 50}
            textAnchor="middle"
            className="axis-title"
          >
            Temporadas
          </text>

        </g>
      </svg>
    </div>
  );
}