
import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import useF1Data from "../../hooks/useF1Data";
import { getChampionCountries } from "../../utils/driverStats";

export default function ChampionsMap({ isActive }) {
  const { driverStandings, drivers, loading } = useF1Data();
  const [world, setWorld] = useState(null);

  useEffect(() => {
    fetch("/data/world.json")
      .then((res) => res.json())
      .then(setWorld);
  }, []);

  const data = useMemo(() => {
    if (loading) return [];
    return getChampionCountries(driverStandings, drivers);
  }, [driverStandings, drivers, loading]);

  const titleMap = new Map(
    data.map((d) => [d.country, d.titles])
  );

  const width = 900;
  const height = 480;

  if (loading || !world) {
    return <div className="chart-card">Carregando mapa...</div>;
  }

  const projection = d3
    .geoNaturalEarth1()
    .fitSize([width, height], world);

  const path = d3.geoPath(projection);

  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.titles) || 1])
    .range(["#222", "#e10600"]);

  return (
    <div className="chart-card">
      <div className="chart-title">Países com campeões mundiais</div>

      <svg viewBox={`0 0 ${width} ${height}`} className="calendar-svg">
        {world.features.map((feature) => {
          const country =
            feature.properties.name_en ||
            feature.properties.name ||
            feature.properties.brk_name ||
            feature.properties.admin;
            if (titleMap.has(country)) {
  console.log(country);
}

          const titles = titleMap.get(country) || 0;
          return (
            <path
              key={country}
              d={path(feature)}
              className="map-country"
              fill={titles > 0 ? colorScale(titles) : "#151515"}
              style={{
                opacity: isActive ? 1 : 0,
              }}
            >
              <title>
                {country}: {titles} título(s)
              </title>
            </path>
          );
        })}
      </svg>
    </div>
  );
  console.table(data);
}