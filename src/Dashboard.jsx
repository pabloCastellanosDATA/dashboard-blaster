import { useState, useMemo } from "react";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, PieChart, Pie, Cell } from "recharts";

const DAILY_DATA = [
  { fecha: "2026-04-01", fechaShort: "01 Abr", consumo: 2915487, minutos: 132522, leads: 1651, ventas: 30, ingreso: 4057920, roi: 1.39, costoMin: 1766 },
  { fecha: "2026-04-02", fechaShort: "02 Abr", consumo: 2041859, minutos: 92812, leads: 1082, ventas: 23, ingreso: 3111072, roi: 1.52, costoMin: 1887 },
  { fecha: "2026-04-04", fechaShort: "04 Abr", consumo: 479578, minutos: 21799, leads: 287, ventas: 1, ingreso: 135264, roi: 0.28, costoMin: 1671 },
  { fecha: "2026-04-06", fechaShort: "06 Abr", consumo: 3262680, minutos: 148304, leads: 1890, ventas: 50, ingreso: 6763200, roi: 2.07, costoMin: 1726 },
  { fecha: "2026-04-07", fechaShort: "07 Abr", consumo: 3293473, minutos: 149703, leads: 1792, ventas: 36, ingreso: 4869504, roi: 1.48, costoMin: 1838 },
  { fecha: "2026-04-08", fechaShort: "08 Abr", consumo: 3416538, minutos: 155297, leads: 1740, ventas: 38, ingreso: 5140032, roi: 1.50, costoMin: 1964 },
  { fecha: "2026-04-09", fechaShort: "09 Abr", consumo: 3133346, minutos: 142425, leads: 1749, ventas: 33, ingreso: 4463712, roi: 1.42, costoMin: 1792 },
];

const PROVIDER_DATA = [
  { fecha: "01 Abr", bestvoiper: 1208859, chock: 1706628 },
  { fecha: "02 Abr", bestvoiper: 845125, chock: 1196734 },
  { fecha: "04 Abr", bestvoiper: 384912, chock: 94666 },
  { fecha: "06 Abr", bestvoiper: 1189972, chock: 2072708 },
  { fecha: "07 Abr", bestvoiper: 985937, chock: 2307536 },
  { fecha: "08 Abr", bestvoiper: 907218, chock: 2509320 },
  { fecha: "09 Abr", bestvoiper: 807242, chock: 2326104 },
];

const TOTALS = {
  consumo: 18542961,
  ingreso: 28540704,
  leads: 10191,
  ventas: 211,
  roi: 1.54,
  costoLead: 1820,
  proyInversion: 23178701,
  proyConsumo: 57946753,
  diasLaborales: 25,
  diasTranscurridos: 8,
  agentes: 33,
  fte: 27.26,
  efectividad: 2.07,
};

const fmt = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
};

const fmtNum = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.95)",
      border: "1px solid rgba(99, 235, 175, 0.3)",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 12,
      color: "#e2e8f0",
      backdropFilter: "blur(8px)",
    }}>
      <p style={{ margin: 0, fontWeight: 700, color: "#63ebaf", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "3px 0", color: p.color }}>
          {p.name}: <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

function KPICard({ title, value, subtitle, accent, icon, trend }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)",
      border: `1px solid ${accent}33`,
      borderRadius: 16,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      minWidth: 0,
    }}>
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
        borderRadius: "50%",
      }} />
      <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, letterSpacing: 0.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>{icon}</span> {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1.1, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          {trend && <span style={{ color: trend === "up" ? "#63ebaf" : "#f87171", fontSize: 10 }}>{trend === "up" ? "▲" : "▼"}</span>}
          {subtitle}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ current, target, label, color }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 5 }}>
        <span>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(51, 65, 85, 0.6)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: `0 0 12px ${color}44`,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginTop: 3 }}>
        <span>{fmt(current)}</span>
        <span>Meta: {fmt(target)}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState("general");

  const providerTotals = useMemo(() => {
    const bv = PROVIDER_DATA.reduce((s, d) => s + d.bestvoiper, 0);
    const ch = PROVIDER_DATA.reduce((s, d) => s + d.chock, 0);
    return [
      { name: "Bestvoiper", value: bv, color: "#63ebaf" },
      { name: "Chock", value: ch, color: "#818cf8" },
    ];
  }, []);

  const tabs = [
    { id: "general", label: "General", icon: "◉" },
    { id: "financiero", label: "Financiero", icon: "◈" },
    { id: "operativo", label: "Operativo", icon: "◆" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0f1e 0%, #0f172a 40%, #1a1033 100%)",
      color: "#e2e8f0",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      padding: "24px 20px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#63ebaf", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
            Blaster · Best CRM
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 800, margin: 0, lineHeight: 1.1,
            background: "linear-gradient(135deg, #e2e8f0 0%, #63ebaf 50%, #818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Dashboard Consumo Troncales
          </h1>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Abril 2026 · Portabilidad · Campaña Blaster
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, background: "rgba(15, 23, 42, 0.7)", borderRadius: 10, padding: 3, border: "1px solid rgba(99, 235, 175, 0.15)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveView(t.id)} style={{
              padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, transition: "all 0.3s",
              background: activeView === t.id ? "linear-gradient(135deg, #63ebaf22, #818cf822)" : "transparent",
              color: activeView === t.id ? "#63ebaf" : "#64748b",
              boxShadow: activeView === t.id ? "0 0 12px rgba(99,235,175,0.1)" : "none",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 24 }}>
        <KPICard icon="💰" title="Inversión Total" value={fmt(TOTALS.consumo)} subtitle={`Proy: ${fmt(TOTALS.proyInversion)}`} accent="#63ebaf" trend="up" />
        <KPICard icon="📊" title="Ingreso Facturado" value={fmt(TOTALS.ingreso)} subtitle={`${TOTALS.diasTranscurridos}/${TOTALS.diasLaborales} días`} accent="#818cf8" trend="up" />
        <KPICard icon="🎯" title="ROI Global" value={`${TOTALS.roi}x`} subtitle="Ingreso / Inversión" accent={TOTALS.roi >= 1.5 ? "#63ebaf" : "#fbbf24"} trend="up" />
        <KPICard icon="📞" title="Leads Totales" value={fmtNum(TOTALS.leads)} subtitle={`Costo/Lead: ${fmt(TOTALS.costoLead)}`} accent="#38bdf8" />
        <KPICard icon="✅" title="Ventas" value={TOTALS.ventas} subtitle={`Efectividad: ${TOTALS.efectividad}%`} accent="#f472b6" trend="up" />
        <KPICard icon="👥" title="Agentes / FTE" value={`${TOTALS.agentes} / ${TOTALS.fte}`} subtitle="Fact/FTE: $1.05M" accent="#fbbf24" />
      </div>

      {/* Progress Section */}
      <div style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)",
        border: "1px solid rgba(99, 235, 175, 0.12)", borderRadius: 16, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#63ebaf" }}>⟐</span> Progreso del Mes — {TOTALS.diasTranscurridos} de {TOTALS.diasLaborales} días laborales
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <ProgressBar current={TOTALS.consumo} target={TOTALS.proyInversion} label="Inversión vs Proyección" color="#63ebaf" />
          <ProgressBar current={TOTALS.ingreso} target={57946753} label="Ingreso vs Proyección" color="#818cf8" />
          <ProgressBar current={TOTALS.diasTranscurridos} target={TOTALS.diasLaborales} label="Avance del Mes" color="#38bdf8" />
        </div>
      </div>

      {/* Charts Grid */}
      {(activeView === "general" || activeView === "financiero") && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginBottom: 20 }}>
          {/* Consumo vs Ingreso */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)",
            border: "1px solid rgba(99, 235, 175, 0.1)", borderRadius: 16, padding: "20px 16px 12px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
              <span style={{ color: "#63ebaf" }}>◉</span> Consumo vs Ingreso Diario
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={DAILY_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradConsumo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#63ebaf" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#63ebaf" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="fechaShort" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="consumo" name="Consumo" fill="url(#gradConsumo)" stroke="#63ebaf" strokeWidth={2} />
                <Line type="monotone" dataKey="ingreso" name="Ingreso" stroke="#818cf8" strokeWidth={2.5} dot={{ fill: "#818cf8", r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* ROI Diario */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)",
            border: "1px solid rgba(129, 140, 248, 0.1)", borderRadius: 16, padding: "20px 16px 12px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
              <span style={{ color: "#818cf8" }}>◈</span> ROI Diario
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={DAILY_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="fechaShort" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[0, "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="roi" name="ROI" radius={[6, 6, 0, 0]} fill="#818cf8" barSize={32}>
                  {DAILY_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.roi >= 1.5 ? "#63ebaf" : entry.roi >= 1 ? "#fbbf24" : "#f87171"} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey={() => 1} name="Punto equilibrio" stroke="#f8717188" strokeDasharray="6 4" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
              {[{ c: "#63ebaf", l: "≥ 1.5x" }, { c: "#fbbf24", l: "1.0–1.5x" }, { c: "#f87171", l: "< 1.0x" }].map(({ c, l }) => (
                <span key={l} style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} /> {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {(activeView === "general" || activeView === "operativo") && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginBottom: 20 }}>
          {/* Costo por Proveedor */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.1)", borderRadius: 16, padding: "20px 16px 12px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
              <span style={{ color: "#38bdf8" }}>◆</span> Costo por Proveedor (Diario)
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={PROVIDER_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bestvoiper" name="Bestvoiper" stackId="a" fill="#63ebaf" radius={[0, 0, 0, 0]} />
                <Bar dataKey="chock" name="Chock" stackId="a" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8 }}>
              {providerTotals.map(p => (
                <span key={p.name} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color, display: "inline-block" }} />
                  <span style={{ color: "#94a3b8" }}>{p.name}:</span>
                  <span style={{ color: p.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(p.value)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Leads & Ventas */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)",
            border: "1px solid rgba(244, 114, 182, 0.1)", borderRadius: 16, padding: "20px 16px 12px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
              <span style={{ color: "#f472b6" }}>◉</span> Leads vs Ventas (Diario)
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={DAILY_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="fechaShort" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="leads" name="Leads" fill="url(#gradLeads)" stroke="#38bdf8" strokeWidth={2} />
                <Bar yAxisId="right" dataKey="ventas" name="Ventas" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={24} fillOpacity={0.85} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Distribution + Table */}
      {(activeView === "general" || activeView === "financiero") && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginBottom: 20 }}>
          {/* Pie Chart */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)",
            border: "1px solid rgba(99, 235, 175, 0.1)", borderRadius: 16, padding: "20px 16px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>
              <span style={{ color: "#63ebaf" }}>◈</span> Distribución de Costos por Proveedor
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={providerTotals} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" nameKey="name" stroke="none" paddingAngle={4}>
                    {providerTotals.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val) => fmt(val)} contentStyle={{
                    background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(99,235,175,0.3)",
                    borderRadius: 8, fontSize: 12, color: "#e2e8f0",
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
              {providerTotals.map(p => {
                const pct = ((p.value / TOTALS.consumo) * 100).toFixed(1);
                return (
                  <div key={p.name} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{fmt(p.value)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Table */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)",
            border: "1px solid rgba(129, 140, 248, 0.1)", borderRadius: 16, padding: "20px 16px", overflow: "auto",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>
              <span style={{ color: "#818cf8" }}>◆</span> Detalle Diario
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  {["Fecha", "Consumo", "Ingreso", "ROI", "Leads", "Ventas"].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Fecha" ? "left" : "right",
                      padding: "8px 6px", borderBottom: "1px solid rgba(99,235,175,0.15)",
                      color: "#63ebaf", fontWeight: 600, fontSize: 10, letterSpacing: 0.5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAILY_DATA.map((d, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(99,235,175,0.03)" }}>
                    <td style={{ padding: "7px 6px", color: "#94a3b8", fontWeight: 500 }}>{d.fechaShort}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0" }}>{fmt(d.consumo)}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#818cf8" }}>{fmt(d.ingreso)}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: d.roi >= 1.5 ? "#63ebaf" : d.roi >= 1 ? "#fbbf24" : "#f87171", fontWeight: 700 }}>{d.roi}x</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8" }}>{fmtNum(d.leads)}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#f472b6", fontWeight: 700 }}>{d.ventas}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid rgba(99,235,175,0.2)" }}>
                  <td style={{ padding: "9px 6px", color: "#63ebaf", fontWeight: 800, fontSize: 11 }}>TOTAL</td>
                  <td style={{ padding: "9px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#63ebaf", fontWeight: 800 }}>{fmt(TOTALS.consumo)}</td>
                  <td style={{ padding: "9px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#818cf8", fontWeight: 800 }}>{fmt(TOTALS.ingreso)}</td>
                  <td style={{ padding: "9px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#63ebaf", fontWeight: 800 }}>{TOTALS.roi}x</td>
                  <td style={{ padding: "9px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8", fontWeight: 800 }}>{fmtNum(TOTALS.leads)}</td>
                  <td style={{ padding: "9px 6px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#f472b6", fontWeight: 800 }}>{TOTALS.ventas}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "16px 0 4px", fontSize: 10, color: "#334155",
        borderTop: "1px solid rgba(99,235,175,0.08)", marginTop: 8,
      }}>
        Dashboard Blaster · Best CRM · Abril 2026 · Datos actualizados al 09/04/2026
      </div>
    </div>
  );
}
