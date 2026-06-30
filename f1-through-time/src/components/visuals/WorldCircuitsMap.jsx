import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

export default function WorldCircuitsMap({ isActive }) {
  const [world, setWorld] = useState(null);
  const [data, setData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      const [worldGeo, circuitsCsv, racesCsv] = await Promise.all([
        fetch("/data/world.geojson").then((r) => r.json()),
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

      // Primeira temporada em que cada circuito apareceu
      const firstAppearance = d3.rollup(
        races,
        (v) => d3.min(v, (d) => Number(d.season)),
        (d) => d.circuit_id
      );

      const formatted = circuits
        .map((d) => ({
          id: d.circuit_id,
          circuit: d.circuit_name,
          locality: d.locality,
          country: d.country,
          lat: +d.lat,
          lng: +d.lng,
          firstSeason: firstAppearance.get(d.circuit_id) ?? 9999,
        }))
        .filter((d) => d.firstSeason !== 9999)
        .sort((a, b) => a.firstSeason - b.firstSeason);

      setWorld(worldGeo);
      setData(formatted);
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!isActive || !data.length) return;

    setVisibleCount(0);

    let current = 0;

    const interval = setInterval(() => {
      current++;

      setVisibleCount(current);

      if (current >= data.length) {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isActive, data]);

  const width = 760;
  const height = 440;

  const projection = useMemo(() => {
    return d3
      .geoNaturalEarth1()
      .fitSize([width, height], world || { type: "Sphere" });
  }, [world]);

  const path = d3.geoPath(projection);

  if (!world || !data.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  const currentSeason =
    visibleCount > 0
      ? data[Math.min(visibleCount - 1, data.length - 1)].firstSeason
      : 1950;

  return (
    <div className="chart-card">
      <div className="chart-title">
        Onde a Fórmula 1 correu?
      </div>

      <div className="map-year">
        {currentSeason}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="world-svg"
      >
        {/* Continentes */}

        <g>
          {world.features.map((country) => (
            <path
              key={country.properties.name}
              d={path(country)}
              className="world-country"
            />
          ))}
        </g>

        {/* Circuitos */}

        <g>
          {data.slice(0, visibleCount).map((circuit) => {
            const point = projection([
              circuit.lng,
              circuit.lat,
            ]);

            if (!point) return null;

            return (
              <circle
                key={circuit.id}
                cx={point[0]}
                cy={point[1]}
                r={4}
                className="map-point"
              >
                <title>
                  {`${circuit.circuit}

${circuit.locality}

${circuit.country}

Primeira temporada: ${circuit.firstSeason}`}
                </title>
              </circle>
            );
          })}
        </g>
      </svg>
    </div>
  );
}