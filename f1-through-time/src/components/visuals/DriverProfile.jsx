import useF1Data from "../../hooks/useF1Data";
import { getDriverProfile } from "../../utils/driverStats";

export default function DriverProfile({ selectedDriver }) {
  const {
    driverStandings,
    results,
    loading,
  } = useF1Data();

  if (loading) {
    return <div className="chart-card">Carregando...</div>;
  }

  if (!selectedDriver) {
    return (
      <div className="chart-card profile-empty">
        <h3>Selecione um piloto</h3>
        <p>
          Clique em um nome no gráfico anterior para visualizar
          suas estatísticas históricas.
        </p>
      </div>
    );
  }

  const profile = getDriverProfile(
    selectedDriver,
    driverStandings,
    results
  );

  const stats = [
    { label: "Títulos", value: profile.titles },
    { label: "Vitórias", value: profile.wins },
    { label: "Pódios", value: profile.podiums },
    { label: "Pontos", value: Math.round(profile.points) },
    { label: "Temporadas", value: profile.seasons },
  ];

  return (
    <div className="chart-card driver-profile">
      <div className="profile-header">
        <span>Piloto selecionado</span>
        <h2>{profile.label}</h2>
      </div>

      <div className="profile-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="profile-stat-card">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}