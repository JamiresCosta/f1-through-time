import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function useF1Data() {
  const [data, setData] = useState({
    drivers: [],
    constructors: [],
    circuits: [],
    races: [],
    results: [],
    qualifying: [],
    driverStandings: [],
    constructorStandings: [],
    loading: true,
  });

  useEffect(() => {
    async function loadCSV(path) {
      const text = await fetch(path).then((res) => res.text());

      return Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      }).data;
    }

    async function loadData() {
      try {
        const [
          drivers,
          constructors,
          circuits,
          races,
          results,
          qualifying,
          driverStandings,
          constructorStandings,
        ] = await Promise.all([
          loadCSV("/data/f1_drivers.csv"),
          loadCSV("/data/f1_constructors.csv"),
          loadCSV("/data/f1_circuits.csv"),
          loadCSV("/data/f1_races.csv"),
          loadCSV("/data/f1_results.csv"),
          loadCSV("/data/f1_qualifying.csv"),
          loadCSV("/data/f1_driver_standings.csv"),
          loadCSV("/data/f1_constructor_standings.csv"),
        ]);

        setData({
          drivers,
          constructors,
          circuits,
          races,
          results,
          qualifying,
          driverStandings,
          constructorStandings,
          loading: false,
        });
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      }
    }

    loadData();
  }, []);

  return data;
}