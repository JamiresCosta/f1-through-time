import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as d3 from "d3";

export default function DriverConstructorNetwork({ isActive }) {
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [selected, setSelected] = useState(null); // { id, type }

  const width = 1100;
  const height = 640;
  const margin = { top: 60, right: 160, bottom: 40, left: 160 };
  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  // ── Derivações ordenadas por total de títulos ──────────────────────────
  const drivers = useMemo(() => {
    const totals = new Map();
    graph.links.forEach((l) => {
      totals.set(l.source, (totals.get(l.source) ?? 0) + l.value);
    });
    return graph.nodes
      .filter((d) => d.type === "driver")
      .sort((a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0));
  }, [graph]);

  const constructors = useMemo(() => {
    const totals = new Map();
    graph.links.forEach((l) => {
      totals.set(l.target, (totals.get(l.target) ?? 0) + l.value);
    });
    return graph.nodes
      .filter((d) => d.type === "constructor")
      .sort((a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0));
  }, [graph]);

  // ── Escalas ───────────────────────────────────────────────────────────
  const driverScale = useMemo(
    () =>
      d3
        .scalePoint()
        .domain(drivers.map((d) => d.id))
        .range([0, boundsHeight])
        .padding(0.4),
    [drivers, boundsHeight]
  );

  const constructorScale = useMemo(
    () =>
      d3
        .scalePoint()
        .domain(constructors.map((d) => d.id))
        .range([0, boundsHeight])
        .padding(0.4),
    [constructors, boundsHeight]
  );

  const linkScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([1, d3.max(graph.links, (d) => d.value) ?? 1])
        .range([1.5, 8]),
    [graph.links]
  );

  // ── Lógica de seleção ─────────────────────────────────────────────────
  const relevantLinks = useMemo(() => {
    if (!selected) return new Set();
    return new Set(
      graph.links
        .filter((l) =>
          selected.type === "driver"
            ? l.source === selected.id
            : l.target === selected.id
        )
        .map((l) => `${l.source}--${l.target}`)
    );
  }, [selected, graph.links]);

  const relevantNodes = useMemo(() => {
    if (!selected) return new Set();
    const ids = new Set([selected.id]);
    graph.links.forEach((l) => {
      if (selected.type === "driver" && l.source === selected.id)
        ids.add(l.target);
      if (selected.type === "constructor" && l.target === selected.id)
        ids.add(l.source);
    });
    return ids;
  }, [selected, graph.links]);

  // ── Estatísticas do painel lateral ───────────────────────────────────
  const panelStats = useMemo(() => {
    if (!selected) return null;
    const links = graph.links.filter((l) =>
      selected.type === "driver"
        ? l.source === selected.id
        : l.target === selected.id
    );
    const totalTitles = links.reduce((s, l) => s + l.value, 0);
    const partners = links
      .map((l) => ({
        name: (selected.type === "driver" ? l.target : l.source).replaceAll(
          "_",
          " "
        ),
        titles: l.value,
      }))
      .sort((a, b) => b.titles - a.titles);

    return {
      name: selected.id.replaceAll("_", " "),
      type: selected.type,
      totalTitles,
      partners,
    };
  }, [selected, graph.links]);

  // ── Caminho SVG ───────────────────────────────────────────────────────
  function path(link) {
    const x1 = 0;
    const x2 = boundsWidth;
    const y1 = driverScale(link.source);
    const y2 = constructorScale(link.target);
    const mid = boundsWidth / 2;
    return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
  }

  // ── Carregamento dos dados ────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
    const [driversCSV, resultsCSV] = await Promise.all([
        fetch("/data/f1_driver_standings.csv").then((r) => r.text()),
        fetch("/data/f1_results.csv").then((r) => r.text()),
    ]);

    const standingsRows = Papa.parse(driversCSV, {
        header: true,
        skipEmptyLines: true,
    }).data;

    const resultsRows = Papa.parse(resultsCSV, {
        header: true,
        skipEmptyLines: true,
    }).data;

    // ── 1. Campeão de cada season = maior pontuação acumulada ─────────────
    // Como não há `round`, assumimos que o CSV já tem o acumulado final.
    // Pegamos o driver_id com max(points) por season.
    const champBySeason = new Map(); // season → { driver_id, points }

    standingsRows.forEach((row) => {
        const season = +row.season;
        const points = +row.points;
        const current = champBySeason.get(season);
        if (!current || points > current.points) {
        champBySeason.set(season, { driver_id: row.driver_id, points });
        }
    });

    // ── 2. Equipe principal do campeão em cada season (via f1_results) ────
    // Conta corridas por equipe para aquele piloto naquela temporada
    // e pega a equipe com mais corridas (cobre trocas mid-season)
    const teamCounts = new Map(); // `${season}-${driver_id}` → Map(constructor → count)

    resultsRows.forEach((row) => {
        const season = +row.season;
        const champ = champBySeason.get(season);
        if (!champ || row.driver_id !== champ.driver_id) return;

        const key = `${season}-${row.driver_id}`;
        if (!teamCounts.has(key)) teamCounts.set(key, new Map());
        const counts = teamCounts.get(key);
        counts.set(row.constructor, (counts.get(row.constructor) ?? 0) + 1);
    });

    // ── 3. Monta lista final de championships ─────────────────────────────
    const championships = [];

    champBySeason.forEach(({ driver_id }, season) => {
        const key = `${season}-${driver_id}`;
        const counts = teamCounts.get(key);
        if (!counts) return;

        // Equipe com mais corridas disputadas naquela temporada
        const constructor = [...counts.entries()].reduce((best, curr) =>
        curr[1] > best[1] ? curr : best
        )[0];

        championships.push({ season, driver: driver_id, constructor });
    });

    // ── 4. Agrupa por piloto → equipe e filtra ≥ 2 títulos ───────────────
    const grouped = d3.rollups(
        championships,
        (values) => values.length,
        (d) => d.driver,
        (d) => d.constructor
    );

    const links = [];
    const driverTotals = new Map();

    grouped.forEach(([driver, constructorsList]) => {
        let total = 0;
        constructorsList.forEach(([constructor, titles]) => {
        links.push({ source: driver, target: constructor, value: titles });
        total += titles;
        });
        driverTotals.set(driver, total);
    });

    const validDrivers = new Set(
        [...driverTotals.entries()]
        .filter(([_, total]) => total >= 2)
        .map(([driver]) => driver)
    );

    const filteredLinks = links.filter((l) => validDrivers.has(l.source));

    const constructorSet = new Set();
    filteredLinks.forEach((l) => constructorSet.add(l.target));

    const nodes = [];
    [...validDrivers].forEach((driver) => {
        nodes.push({
        id: driver,
        label: driver.replaceAll("_", " "),
        type: "driver",
        });
    });
    [...constructorSet].forEach((team) => {
        nodes.push({ id: team, label: team, type: "constructor" });
    });

    setGraph({ nodes, links: filteredLinks });
    }
    loadData();
  }, []);

  if (!graph.nodes.length) {
    return <div className="chart-card">Carregando...</div>;
  }

  // ── Helpers de estado visual ──────────────────────────────────────────
  const isLinkActive = (link) => {
    if (!isActive) return false;
    if (!selected) return true;
    return relevantLinks.has(`${link.source}--${link.target}`);
  };

  const isNodeActive = (id) => {
    if (!isActive) return false;
    if (!selected) return true;
    return relevantNodes.has(id);
  };

  const labelOpacity = (id) => {
    if (!isActive) return 0;
    if (!selected) return 1;
    return relevantNodes.has(id) ? 1 : 0.15;
  };

  return (
    <div className="chart-card" style={{ position: "relative" }}>
      <div className="chart-title">Pilotos × Equipes Campeãs</div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        {/* ── SVG principal ── */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="calendar-svg"
          style={{ flex: 1, cursor: selected ? "default" : "auto" }}
          onClick={() => setSelected(null)}
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Ligações */}
            {graph.links.map((link, index) => (
              <path
                key={`${link.source}-${link.target}`}
                d={path(link)}
                fill="none"
                stroke={isLinkActive(link) ? "#e8202b" : "#d0d0d0"}
                strokeWidth={
                  isLinkActive(link) ? linkScale(link.value) : linkScale(link.value) * 0.4
                }
                opacity={isLinkActive(link) ? (selected ? 0.8 : 0.45) : 0.15}
                style={{
                  transition:
                    "stroke-width 600ms ease, opacity 600ms ease, stroke 400ms ease",
                  transitionDelay: selected ? "0ms" : `${index * 40}ms`,
                }}
              >
                <title>
                  {link.source.replaceAll("_", " ")} → {link.target}
                  {"\n"}
                  {link.value} título(s)
                </title>
              </path>
            ))}

            {/* Nós dos pilotos */}
            {drivers.map((driver, index) => (
              <g
                key={driver.id}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(
                    selected?.id === driver.id
                      ? null
                      : { id: driver.id, type: "driver" }
                  );
                }}
              >
                <circle
                  cx={0}
                  cy={driverScale(driver.id)}
                  r={isActive ? (selected?.id === driver.id ? 10 : 7) : 0}
                  fill={
                    selected?.id === driver.id
                      ? "#e8202b"
                      : isNodeActive(driver.id)
                      ? "#333"
                      : "#ccc"
                  }
                  style={{
                    transition:
                      "r 500ms ease, fill 400ms ease, opacity 400ms ease",
                    transitionDelay: `${index * 40}ms`,
                  }}
                />
                <text
                  x={-16}
                  y={driverScale(driver.id) + 5}
                  textAnchor="end"
                  className="network-label"
                  opacity={labelOpacity(driver.id)}
                  fontWeight={selected?.id === driver.id ? 700 : 400}
                  style={{ transition: "opacity 400ms ease" }}
                >
                  {driver.label}
                </text>
              </g>
            ))}

            {/* Nós das equipes */}
            {constructors.map((constructor, index) => (
              <g
                key={constructor.id}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(
                    selected?.id === constructor.id
                      ? null
                      : { id: constructor.id, type: "constructor" }
                  );
                }}
              >
                <circle
                  cx={boundsWidth}
                  cy={constructorScale(constructor.id)}
                  r={
                    isActive
                      ? selected?.id === constructor.id
                        ? 10
                        : 7
                      : 0
                  }
                  fill={
                    selected?.id === constructor.id
                      ? "#e8202b"
                      : isNodeActive(constructor.id)
                      ? "#333"
                      : "#ccc"
                  }
                  style={{
                    transition:
                      "r 500ms ease, fill 400ms ease, opacity 400ms ease",
                    transitionDelay: `${index * 40 + 200}ms`,
                  }}
                />
                <text
                  x={boundsWidth + 16}
                  y={constructorScale(constructor.id) + 5}
                  className="network-label"
                  opacity={labelOpacity(constructor.id)}
                  fontWeight={selected?.id === constructor.id ? 700 : 400}
                  style={{ transition: "opacity 400ms ease" }}
                >
                  {constructor.label}
                </text>
              </g>
            ))}

            {/* Títulos das colunas */}
            <text x={0} y={-20} textAnchor="middle" className="axis-title">
              Pilotos
            </text>
            <text
              x={boundsWidth}
              y={-20}
              textAnchor="middle"
              className="axis-title"
            >
              Equipes
            </text>
          </g>
        </svg>

        {/* ── Painel lateral ── */}
        <div
          style={{
            width: "200px",
            minWidth: "200px",
            opacity: selected ? 1 : 0,
            transform: selected ? "translateX(0)" : "translateX(12px)",
            transition: "opacity 400ms ease, transform 400ms ease",
            pointerEvents: selected ? "auto" : "none",
            paddingTop: "2.5rem",
          }}
        >
          {panelStats && (
            <div
              style={{
                background: "#f9f9f9",
                border: "1px solid #e8e8e8",
                borderRadius: "10px",
                padding: "1rem",
                fontSize: "13px",
              }}
            >
              {/* Cabeçalho */}
              <div
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#999",
                  marginBottom: "4px",
                }}
              >
                {panelStats.type === "driver" ? "Piloto" : "Equipe"}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: "12px",
                  lineHeight: 1.2,
                }}
              >
                {panelStats.name}
              </div>

              {/* Total de títulos */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                  marginBottom: "14px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                }}
              >
                <span
                  style={{ fontSize: "28px", fontWeight: 700, color: "#e8202b" }}
                >
                  {panelStats.totalTitles}
                </span>
                <span style={{ color: "#666", fontSize: "12px" }}>
                  título{panelStats.totalTitles !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Lista de parceiros */}
              <div
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#999",
                  marginBottom: "8px",
                }}
              >
                {panelStats.type === "driver"
                  ? "Com as equipes"
                  : "Com os pilotos"}
              </div>
              {panelStats.partners.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <span style={{ color: "#333" }}>{p.name}</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#e8202b",
                      minWidth: "20px",
                      textAlign: "right",
                    }}
                  >
                    {p.titles}×
                  </span>
                </div>
              ))}

              {/* Botão limpar */}
              <button
                onClick={() => setSelected(null)}
                style={{
                  marginTop: "14px",
                  width: "100%",
                  padding: "6px 0",
                  fontSize: "12px",
                  color: "#666",
                  background: "none",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Limpar seleção
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}