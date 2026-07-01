import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function CalendarExpansion({ isActive }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function load() {
      const csv = await fetch("/data/f1_races.csv").then(r => r.text());

      const races = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
      }).data;

      const grouped = d3.rollups(
        races,
        v => v.length,
        d => Number(d.season)
      )
      .map(([season, races]) => ({
        season,
        races
      }))
      .sort((a,b)=>a.season-b.season);

      setData(grouped);
    }

    load();
  }, []);

  const current = useMemo(() => {
    return isActive
      ? data[data.length-1]
      : data[0];
  }, [data, isActive]);

  if(!current) return null;

  return(

    <div className={`calendar-expansion ${isActive ? "active":""}`}>

      <div className="calendar-year">

        {current.season}

      </div>

      <div className="calendar-grid">

        {Array.from({length:current.races}).map((_,i)=>(
          <div
            key={i}
            className="calendar-block"
            style={{
              animationDelay:`${i*60}ms`
            }}
          />
        ))}

      </div>

      <div className="calendar-counter">

        <span>{current.races}</span>

        <small>Grandes Prêmios</small>

      </div>

    </div>

  );

}