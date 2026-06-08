import AnimatedCounter from "./AnimatedCounter";
export default function StatCard({
  value,
  label
}) {
  return (
    <div className="stat-card">

    <div className="stat-value">
    <AnimatedCounter value={value} />
    </div>
      <div className="stat-label">
        {label}
      </div>

    </div>
  );
}