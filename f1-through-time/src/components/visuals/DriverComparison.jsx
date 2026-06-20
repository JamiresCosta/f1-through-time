import { useMemo, useState } from "react";
import useF1Data from "../../hooks/useF1Data";
import {
  getDriverProfile,
  getAllDriversWithTitles,
} from "../../utils/driverStats";

export default function DriverComparison({ selectedDriver }) {
  const { driverStandings, results, loading } = useF1Data();
  const [comparisonDriver, setComparisonDriver] = useState("");

  const drivers = useMemo(() => {
    if (loading) return [];
    return getAllDriversWithTitles(driverStandings);
  }, [driverStandings, loading]);

  if (loading) {
    return <div className="chart-card">Carregando...</div>;
  }

  if (!selectedDriver) {
    return (
      <div className="chart-card profile-empty">
        <h3>Selecione um piloto</h3>
        <p>Escolha um piloto no ranking para iniciar a comparação.</p>
      </div>
    );
  }

  const selectedProfile = getDriverProfile(
    selectedDriver,
    driverStandings,
    results
  );

  const comparisonId = comparisonDriver || drivers[1]?.driver;

  const comparisonProfile = getDriverProfile(
    comparisonId,
    driverStandings,
    results
  );

  const metrics = [
    { label: "Títulos", key: "titles" },
    { label: "Vitórias", key: "wins" },
    { label: "Pódios", key: "podiums" },
    { label: "Pontos", key: "points" },
    { label: "Temporadas", key: "seasons" },
  ];

  return (
    <div className="chart-card comparison-card">
      <div className="chart-title">Comparação entre pilotos</div>

      <select
        className="comparison-select"
        value={comparisonId}
        onChange={(e) => setComparisonDriver(e.target.value)}
      >
        {drivers
          .filter((d) => d.driver !== selectedDriver)
          .map((driver) => (
            <option key={driver.driver} value={driver.driver}>
              {driver.label}
            </option>
          ))}
      </select>

      <div className="comparison-header">
        <h3>{selectedProfile.label}</h3>
        <span>vs</span>
        <h3>{comparisonProfile.label}</h3>
      </div>

      <div className="comparison-list">
        {metrics.map((metric) => (
          <div key={metric.key} className="comparison-row">
            <strong>
              {Math.round(selectedProfile[metric.key])}
            </strong>

            <span>{metric.label}</span>

            <strong>
              {Math.round(comparisonProfile[metric.key])}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}