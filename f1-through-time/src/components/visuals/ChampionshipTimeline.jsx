import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

export default function ChampionshipTimeline({ isActive }) {
  const [series, setSeries] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const width = 900;
  const height = 500;

  const margin = {
    top: 50,
    right: 140,
    bottom: 60,
    left: 70,
  };

  const boundsWidth =
    width - margin.left - margin.right;

  const boundsHeight =
    height - margin.top - margin.bottom;

  useEffect(() => {
    async function loadData() {

      const csv = await fetch("/data/f1_results.csv")
        .then(res => res.text());

      const rows = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
      }).data;

      //------------------------------------
      // somente temporada atual
      //------------------------------------

      const season = rows.filter(
        d => Number(d.season) === 2026
      );

      //------------------------------------
      // corridas
      //------------------------------------

      const orderedRaces =
        [...new Set(
          season
            .sort(
              (a,b)=>Number(a.round)-Number(b.round)
            )
            .map(d=>d.race_name)
        )];

      setRaces(orderedRaces);

      //------------------------------------
      // pilotos
      //------------------------------------

      const drivers =
        [...new Set(
          season.map(d=>d.driver_name)
        )];

      //------------------------------------
      // pontos acumulados
      //------------------------------------

      const cumulative = [];

      drivers.forEach(driver=>{

        let total = 0;

        orderedRaces.forEach((race,index)=>{

          const result =
            season.find(
              d=>
                d.driver_name===driver &&
                d.race_name===race
            );

          if(result){

            total += Number(result.points);

          }

          cumulative.push({

            driver,

            race,

            round:index+1,

            points:total

          });

        });

      });

      //------------------------------------
      // top5
      //------------------------------------

      const standings =
        d3.rollups(

          cumulative.filter(
            d=>d.round===orderedRaces.length
          ),

          v=>v[0].points,

          d=>d.driver

        )

        .sort((a,b)=>b[1]-a[1])

        .slice(0,5)

        .map(d=>d[0]);

      //------------------------------------
      // estrutura final
      //------------------------------------

      const finalSeries = standings.map(driver=>({

        driver,

        values:

          cumulative.filter(
            d=>d.driver===driver
          )

      }));

      setSeries(finalSeries);

      setLoading(false);

    }

    loadData();

  }, []);

  //------------------------------------
  // escalas
  //------------------------------------

  const maxPoints = useMemo(() => {

    return d3.max(

      series.flatMap(
        d=>d.values.map(v=>v.points)
      )

    ) || 0;

  },[series]);

  const xScale = useMemo(()=>{

    return d3

      .scalePoint()

      .domain(races)

      .range([0,boundsWidth]);

  },[races,boundsWidth]);

  const yScale = useMemo(()=>{

    return d3

      .scaleLinear()

      .domain([0,maxPoints])

      .nice()

      .range([boundsHeight,0]);

  },[maxPoints,boundsHeight]);

  //------------------------------------
  // cores
  //------------------------------------

  const color = useMemo(()=>{

    return d3

      .scaleOrdinal()

      .domain(series.map(d=>d.driver))

      .range([

        "#E10600",

        "#00D2BE",

        "#3671C6",

        "#FF8700",

        "#229971"

      ]);

  },[series]);

  //------------------------------------
  // line generator
  //------------------------------------

  const line = d3

    .line()

    .x(d=>xScale(d.race))

    .y(d=>yScale(d.points))

    .curve(d3.curveMonotoneX);

  if(loading){

    return (

      <div className="chart-card">

        Carregando...

      </div>

    );

  }
    //------------------------------------
  // interação
  //------------------------------------

  const [hoveredDriver, setHoveredDriver] = useState(null);

  return (
    <div className="chart-card">

      <div className="chart-title">
        O campeonato ganha forma
      </div>

      <div className="chart-subtitle">
        Evolução dos pontos acumulados dos cinco primeiros pilotos da temporada 2026.
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="timeline-svg"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>

          {/* GRID */}

          {yScale.ticks(6).map((tick) => (

            <g
              key={tick}
              transform={`translate(0,${yScale(tick)})`}
            >

              <line
                x1={0}
                x2={boundsWidth}
                className="grid-line"
              />

              <text
                x={-12}
                y={5}
                className="axis-label"
                textAnchor="end"
              >
                {tick}
              </text>

            </g>

          ))}

          {/* EIXO X */}

          {races.map((race) => (

            <text
              key={race}
              x={xScale(race)}
              y={boundsHeight + 30}
              className="axis-label"
              textAnchor="middle"
            >
              {race.replace(" Grand Prix","")}
            </text>

          ))}

          {/* LINHAS */}

          {series.map((driver) => {

            const path = line(driver.values);

            return (

              <g
                key={driver.driver}
                onMouseEnter={() =>
                  setHoveredDriver(driver.driver)
                }
                onMouseLeave={() =>
                  setHoveredDriver(null)
                }
              >

                <path
                  d={path}
                  fill="none"
                  stroke={color(driver.driver)}
                  strokeWidth={
                    hoveredDriver === driver.driver
                      ? 5
                      : 3
                  }
                  opacity={
                    hoveredDriver
                      ? hoveredDriver === driver.driver
                        ? 1
                        : 0.15
                      : 1
                  }
                  style={{
                    strokeDasharray: isActive ? 2500 : 2500,
                    strokeDashoffset: isActive ? 0 : 2500,
                    transition:
                      "stroke-dashoffset 2.5s ease, opacity .3s ease, stroke-width .3s ease",
                  }}
                />

                {driver.values.map((d, i) => (

                  <g key={i}>

                    <circle
                      cx={xScale(d.race)}
                      cy={yScale(d.points)}
                      r={
                        hoveredDriver === driver.driver
                          ? 6
                          : 4
                      }
                      fill={color(driver.driver)}
                      opacity={
                        hoveredDriver
                          ? hoveredDriver === driver.driver
                            ? 1
                            : 0.15
                          : 1
                      }
                    >

                      <title>

                        {driver.driver}

                        {"\n"}

                        {d.race}

                        {"\n"}

                        {d.points} pts

                      </title>

                    </circle>

                  </g>

                ))}

              </g>

            );

          })}

          {/* LEGENDA */}

          {series.map((driver, index) => (

            <g
              key={driver.driver}
              transform={`translate(${boundsWidth + 20}, ${index * 28})`}
              style={{
                cursor: "pointer",
              }}
              onMouseEnter={() =>
                setHoveredDriver(driver.driver)
              }
              onMouseLeave={() =>
                setHoveredDriver(null)
              }
            >

              <rect

                width={14}

                height={14}

                rx={3}

                fill={color(driver.driver)}

              />

              <text

                x={22}

                y={11}

                className="legend-label"

              >

                {driver.driver}

              </text>

            </g>

          ))}

          {/* TÍTULO EIXO Y */}

          <text

            transform={`translate(-48,${boundsHeight / 2}) rotate(-90)`}

            className="axis-title"

            textAnchor="middle"

          >

            Pontos acumulados

          </text>

          {/* TÍTULO EIXO X */}

          <text

            x={boundsWidth / 2}

            y={boundsHeight + 55}

            className="axis-title"

            textAnchor="middle"

          >

            Grandes Prêmios

          </text>

        </g>

      </svg>

    </div>

  );

}