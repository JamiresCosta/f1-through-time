import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function DriverEras({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const csv = await fetch("/data/f1_driver_standings.csv")
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
        (d) => d.driver_id
      );

      const formatted = grouped
        .map(([decade, drivers]) => ({
          decade,
          drivers: drivers
            .map(([driver, titles]) => ({
              driver: driver.replaceAll("_", " "),
              titles,
            }))
            .sort((a, b) => b.titles - a.titles)
            .slice(0, 3),
        }))
        .sort(
          (a, b) =>
            Number(a.decade.replace("s", "")) -
            Number(b.decade.replace("s", ""))
        );

      setData(formatted);
    }

    loadData();
  }, []);

  const width = 760;
  const height = 440;
  const margin = {
    top: 40,
    right: 140,
    bottom: 50,
    left: 80,
  };

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
      <div className="chart-title">Pilotos campeões por década</div>

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
                {decade.drivers.map((driver, index) => {
                  const barHeight = boundsHeight - yScale(driver.titles);

                  currentY -= barHeight;

                  return (
                    <rect
                      key={driver.driver}
                      x={xScale(decade.decade)}
                      y={isActive ? currentY : boundsHeight}
                      width={xScale.bandwidth()}
                      height={isActive ? barHeight : 0}
                      className={`era-bar era-bar-${index}`}
                    >
                      <title>
                        {decade.decade} — {driver.driver}: {driver.titles} título(s)
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

          <g transform={`translate(${boundsWidth + 25}, 30)`}>
            <text className="axis-title">Legenda</text>

            <rect y={20} width={14} height={14} className="era-bar-0" />
            <text x={22} y={32} className="axis-label">
              Mais títulos
            </text>

            <rect y={48} width={14} height={14} className="era-bar-1" />
            <text x={22} y={60} className="axis-label">
              2º lugar
            </text>

            <rect y={76} width={14} height={14} className="era-bar-2" />
            <text x={22} y={88} className="axis-label">
              3º lugar
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}