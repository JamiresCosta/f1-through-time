import * as d3 from "d3";

export function getTopDriversByTitles(driverStandings, limit = 10) {
  const champions = driverStandings.filter(
    (d) => Number(d.position) === 1
  );

  const grouped = d3.rollups(
    champions,
    (v) => v.length,
    (d) => d.driver_id
  );

  return grouped
    .map(([driver, titles]) => ({
      driver,
      label: driver.replaceAll("_", " "),
      titles,
    }))
    .sort((a, b) => b.titles - a.titles)
    .slice(0, limit);
}

export function getDriverTimeline(driverId, driverStandings, results) {
  if (!driverId) return [];

  const rows = driverStandings
    .filter((d) => d.driver_id === driverId)
    .map((standing) => {
      const season = Number(standing.season);
      const position = Number(standing.position);

      const seasonResults = results.filter(
        (r) =>
          Number(r.season) === season &&
          (r.driver_name === driverId || r.driver_id === driverId)
      );

      return {
        season,
        position,
        points: Number(standing.points) || 0,
        wins: seasonResults.filter((r) => Number(r.position) === 1).length,
        podiums: seasonResults.filter(
          (r) => Number(r.position) >= 1 && Number(r.position) <= 3
        ).length,
        constructor: standing.constructor,
      };
    })
    .filter(
      (d) =>
        Number.isFinite(d.season) &&
        Number.isFinite(d.position) &&
        d.position > 0
    );

  const uniqueBySeason = Array.from(
    d3.group(rows, (d) => d.season),
    ([season, values]) => {
      return values.sort((a, b) => a.position - b.position)[0];
    }
  );

  return uniqueBySeason.sort((a, b) => a.season - b.season);
}

export function getDriverProfile(driverId, driverStandings, results) {
  if (!driverId) return null;

  const timeline = getDriverTimeline(driverId, driverStandings, results);

  const resultRows = results.filter(
    (d) => d.driver_name === driverId || d.driver_id === driverId
  );

  const titles = timeline.filter((d) => Number(d.position) === 1).length;

  const wins = resultRows.filter((d) => Number(d.position) === 1).length;

  const podiums = resultRows.filter(
    (d) => Number(d.position) >= 1 && Number(d.position) <= 3
  ).length;

  const points = d3.sum(resultRows, (d) => Number(d.points) || 0);

  return {
    driver: driverId,
    label: driverId.replaceAll("_", " "),
    titles,
    wins,
    podiums,
    points,
    seasons: timeline.length,
  };
}
export function getDriverTeams(driverId, results) {
  if (!driverId) return [];

  const driverResults = results.filter(
    (d) => d.driver_name === driverId || d.driver_id === driverId
  );

  const grouped = d3.rollups(
    driverResults,
    (rows) => ({
      races: rows.length,
      wins: rows.filter((d) => Number(d.position) === 1).length,
      podiums: rows.filter(
        (d) => Number(d.position) >= 1 && Number(d.position) <= 3
      ).length,
      points: d3.sum(rows, (d) => Number(d.points) || 0),
    }),
    (d) => d.constructor
  );

  return grouped
    .map(([constructor, stats]) => ({
      constructor: constructor || "Desconhecido",
      label: (constructor || "Desconhecido").replaceAll("_", " "),
      ...stats,
    }))
    .sort((a, b) => b.races - a.races);
}
export function getDriverHeader(driverId, driverStandings, results) {
  if (!driverId) return null;

  const profile = getDriverProfile(driverId, driverStandings, results);

  if (!profile) return null;

  return {
    ...profile,
    label: driverId.replaceAll("_", " "),
  };
}
export function getDriverFavoriteCircuits(driverId, results, limit = 12) {
  if (!driverId) return [];

  const wins = results.filter(
    (d) =>
      (d.driver_name === driverId || d.driver_id === driverId) &&
      Number(d.position) === 1
  );

  const totalWins = wins.length;

  const grouped = d3.rollups(
    wins,
    (rows) => {
      const seasons = rows.map((r) => Number(r.season));

      return {
        wins: rows.length,
        firstWin: d3.min(seasons),
        lastWin: d3.max(seasons),
      };
    },
    (d) => d.race_name
  );

  return grouped
    .map(([circuit, stats]) => ({
      circuit,
      label: circuit.replaceAll("_", " "),
      wins: stats.wins,
      firstWin: stats.firstWin,
      lastWin: stats.lastWin,
      span: stats.lastWin - stats.firstWin,
      percentage: totalWins
        ? (stats.wins / totalWins) * 100
        : 0,
    }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, limit)
    .map((d, index) => ({
      ...d,
      rank: index + 1,
    }));
}

export function getAllDriversWithTitles(driverStandings) {
  const champions = driverStandings.filter(
    (d) => Number(d.position) === 1
  );

  const grouped = d3.rollups(
    champions,
    (v) => v.length,
    (d) => d.driver_id
  );

  return grouped
    .map(([driver, titles]) => ({
      driver,
      label: driver.replaceAll("_", " "),
      titles,
    }))
    .sort((a, b) => b.titles - a.titles);
}

export function getDriverRivals(driverId, driverStandings, limit = 6) {
  if (!driverId) return [];

  const selectedRows = driverStandings.filter(
    (d) => d.driver_id === driverId
  );

  const rivalCounts = {};

  selectedRows.forEach((selected) => {
    const season = selected.season;
    const selectedPosition = Number(selected.position);

    if (!selectedPosition) return;

    const sameSeasonRows = driverStandings.filter(
      (d) => d.season === season && d.driver_id !== driverId
    );

    sameSeasonRows.forEach((rival) => {
      const rivalPosition = Number(rival.position);

      if (!rivalPosition) return;

      const distance = Math.abs(rivalPosition - selectedPosition);

      if (distance <= 2) {
        rivalCounts[rival.driver_id] =
          (rivalCounts[rival.driver_id] || 0) + 1;
      }
    });
  });

  return Object.entries(rivalCounts)
    .map(([driver, count]) => ({
      driver,
      label: driver.replaceAll("_", " "),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const nationalityToCountry = {
  British: "United Kingdom",
  German: "Germany",
  Brazilian: "Brazil",
  Italian: "Italy",
  French: "France",
  Spanish: "Spain",
  Dutch: "Netherlands",
  Belgian: "Belgium",
  Austrian: "Austria",
  Finnish: "Finland",
  Swedish: "Sweden",
  Swiss: "Switzerland",
  Australian: "Australia",
  New_Zealander: "New Zealand",
  Argentine: "Argentina",
  American: "United States of America",
  Canadian: "Canada",
  Mexican: "Mexico",
  South_African: "South Africa",
  Irish: "Ireland",
  Portuguese: "Portugal",
  Japanese: "Japan",
  Venezuelan: "Venezuela",
  Monegasque: "Monaco",
  Thai: "Thailand",
  Polish: "Poland",
  Czech: "Czechia",
  Danish: "Denmark",
  Hungarian: "Hungary",
  Indian: "India",
  Chinese: "China",
  Russian: "Russia"
};

export function getChampionCountries(driverStandings, drivers) {

  const champions = driverStandings.filter(
    d => Number(d.position) === 1
  );

  const driverCountryMap = new Map(
    drivers.map(d => [
      d.driver_id,
      nationalityToCountry[d.nationality] || d.nationality
    ])
  );

  const grouped = d3.rollups(
    champions,
    rows => rows.length,
    d => driverCountryMap.get(d.driver_id)
  );

  return grouped.map(([country, titles]) => ({
    country,
    titles
  }));
}