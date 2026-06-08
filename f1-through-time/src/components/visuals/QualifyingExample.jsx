import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function QualifyingExample() {

  const [drivers, setDrivers] = useState([]);
  const [race, setRace] = useState(null);

  useEffect(() => {

    async function loadData() {

      const csv = await fetch("/data/f1_qualifying.csv")
        .then(res => res.text());

      const parsed =
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true
        }).data;

    const racesCsv = await fetch("/data/f1_races.csv")
        .then(res => res.text());
    
    const races =
  Papa.parse(racesCsv, {
    header: true,
    skipEmptyLines: true
  }).data;

      const latestSeason =
        Math.max(...parsed.map(d => Number(d.season)));

      const latestRound =
        Math.max(
          ...parsed
            .filter(d => Number(d.season) === latestSeason)
            .map(d => Number(d.round))
        );

        const raceInfo = races.find(
  race =>
    Number(race.season) === latestSeason &&
    Number(race.round) === latestRound
);

setRace(raceInfo);
      const latestQualifying =
        parsed
          .filter(
            d =>
              Number(d.season) === latestSeason &&
              Number(d.round) === latestRound
          )
          .sort(
            (a, b) =>
              Number(a.position) -
              Number(b.position)
          );

      setDrivers(
        latestQualifying.slice(0, 10)
      );
    }

    loadData();

  }, []);

  if (!drivers.length) {
    return <p>Carregando...</p>;
  }

  const pole = drivers[0];

  return (
    <div className="qualifying-example">
        <div className="race-header">

            <span className="race-season">
                {race?.season}
            </span>

            <h2>
                {race?.race_name}
            </h2>

            <p>
                {race?.date}
            </p>

    </div>

      <div className="pole-card">

        <span className="pole-badge">
          🏆 Pole Position
        </span>

        <h2>{pole.driver_id}</h2>

        <p>{pole.constructor_id}</p>

        <h3>{pole.q3}</h3>

      </div>

      <table className="qualifying-table">

        <thead>
          <tr>
            <th>Pos</th>
            <th>Piloto</th>
            <th>Equipe</th>
            <th>Q3</th>
          </tr>
        </thead>

        <tbody>

          {drivers.map(driver => (

            <tr key={driver.position}>

              <td>{driver.position}</td>

              <td>{driver.driver_id}</td>

              <td>{driver.constructor_id}</td>

              <td>{driver.q3}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}