import useF1Data from "../../hooks/useF1Data";
import StatCard from "./StatCard";
import AnimatedCounter from "./AnimatedCounter";
export default function GlobalStats() {
  const {
    drivers,
    constructors,
    circuits,
    races,
    loading,
  } = useF1Data();

  if (loading) {
    return (
      <div className="placeholder">
        Carregando...
      </div>
    );
  }

  return (
    <div className="placeholder stats-panel">

      <div className="year-range">
        1950 → 2026
      </div>

      <div className="main-stat">
        <AnimatedCounter value={75} />
      </div>

      <div className="main-label">
        ANOS DE HISTÓRIA
      </div>

      <div className="stats-grid">

        <StatCard
          value={races.length}
          label="Grandes Prêmios"
        />

        <StatCard
          value={drivers.length}
          label="Pilotos"
        />

        <StatCard
          value={constructors.length}
          label="Construtores"
        />

        <StatCard
          value={circuits.length}
          label="Circuitos"
        />

      </div>

    </div>
  );
}