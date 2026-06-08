import useF1Data from "../../hooks/useF1Data";

export default function F1Ecosystem({ isActive }) {
  const {
    drivers,
    constructors,
    circuits,
    loading,
  } = useF1Data();

  if (loading) {
    return <div className="chart-card">Carregando...</div>;
  }

  const width = 760;
  const height = 430;

  const center = {
    x: width / 2,
    y: 105,
  };

  const nodes = [
    {
      id: "drivers",
      label: "Pilotos",
      value: drivers.length,
      x: 170,
      y: 300,
    },
    {
      id: "constructors",
      label: "Construtores",
      value: constructors.length,
      x: width / 2,
      y: 300,
    },
    {
      id: "circuits",
      label: "Circuitos",
      value: circuits.length,
      x: 590,
      y: 300,
    },
  ];

  return (
    <div className="chart-card">
      <div className="chart-title">
        Os três pilares da Fórmula 1
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="calendar-svg"
      >
        <g>
          {nodes.map((node, index) => (
            <line
              key={`line-${node.id}`}
              x1={center.x}
              y1={center.y + 45}
              x2={isActive ? node.x : center.x}
              y2={isActive ? node.y - 60 : center.y + 45}
              className="network-line"
              style={{
                transitionDelay: `${index * 180}ms`,
              }}
            />
          ))}

          <circle
            cx={center.x}
            cy={center.y}
            r={isActive ? 58 : 0}
            className="network-center"
          />

          <text
            x={center.x}
            y={center.y + 8}
            textAnchor="middle"
            className="network-center-label"
            style={{
              opacity: isActive ? 1 : 0,
            }}
          >
            F1
          </text>

          {nodes.map((node, index) => (
          <g
            key={node.id}
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive
                ? "scale(1)"
                : "scale(0.5)",
              transformOrigin: `${node.x}px ${node.y}px`,
              transition: "all 0.7s ease",
              transitionDelay: `${index * 180 + 250}ms`,
            }}
          >
              <circle
                cx={node.x}
                cy={node.y}
                r={48}
                className="network-node"
              />

              <text
                x={node.x}
                y={node.y - 8}
                textAnchor="middle"
                className="network-value"
              >
                {node.value}
              </text>

              <text
                x={node.x}
                y={node.y + 18}
                textAnchor="middle"
                className="network-label"
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}