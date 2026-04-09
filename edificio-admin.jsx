import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── INITIAL DATA ──────────────────────────────────────────────────────────────
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const CURRENT_MONTH = 2; // March (0-indexed)
const CURRENT_YEAR = 2026;
const MAINTENANCE_FEE = 850;

const generateResidents = () => {
  const names = [
    "Ana García","Carlos López","María Martínez","Juan Hernández","Laura Sánchez",
    "Pedro Ramírez","Sofia Torres","Miguel Flores","Elena Díaz","Roberto Morales",
    "Carmen Jiménez","Luis Ruiz","Patricia Reyes","Andrés Vargas","Isabela Castro",
    "Fernando Guzmán","Claudia Ramos","Héctor Mendoza","Valeria Cruz","Jorge Ortiz",
    "Daniela Rojas","Ernesto Medina","Gloria Núñez","Ricardo Vega","Alejandra Soto",
    "Marcos Cabrera","Lucía Espinoza","Arturo Delgado","Natalia Fuentes","Sergio Ponce",
    "Adriana Leal","Óscar Guerrero","Gabriela Paredes","Raúl Aguilar","Melissa Serrano",
    "Tomás Ríos","Verónica Alvarado","Eduardo Sandoval","Silvia Muñoz","Pablo Castillo",
  ];
  return names.map((name, i) => ({
    id: i + 1,
    name,
    unit: `${Math.floor(i / 8) + 1}${String.fromCharCode(65 + (i % 8))}`,
    email: `${name.split(" ")[0].toLowerCase()}@email.com`,
    phone: `55${Math.floor(10000000 + Math.random() * 89999999)}`,
    type: i % 5 === 0 ? "Propietario" : "Inquilino",
    payments: Array.from({ length: 12 }, (_, m) => ({
      month: m,
      year: CURRENT_YEAR,
      paid: m < CURRENT_MONTH
        ? Math.random() > 0.08
        : m === CURRENT_MONTH
          ? Math.random() > 0.35
          : false,
      date: m < CURRENT_MONTH || (m === CURRENT_MONTH && Math.random() > 0.5)
        ? `${Math.floor(1 + Math.random() * 10)}/0${m + 1}/${CURRENT_YEAR}`
        : null,
      amount: MAINTENANCE_FEE,
    })),
  }));
};

const generateExpenses = () => [
  { id: 1, concept: "Recolección de Basura - Enero", category: "Basura", amount: 2400, date: "05/01/2026", month: 0 },
  { id: 2, concept: "Recolección de Basura - Febrero", category: "Basura", amount: 2400, date: "03/02/2026", month: 1 },
  { id: 3, concept: "Recolección de Basura - Marzo", category: "Basura", amount: 2400, date: "04/03/2026", month: 2 },
  { id: 4, concept: "Mantenimiento Elevador", category: "Mantenimiento", amount: 3500, date: "15/01/2026", month: 0 },
  { id: 5, concept: "Limpieza Áreas Comunes", category: "Limpieza", amount: 1800, date: "01/02/2026", month: 1 },
  { id: 6, concept: "Plomería - Fugas Planta Baja", category: "Reparaciones", amount: 900, date: "20/02/2026", month: 1 },
  { id: 7, concept: "Jardinería", category: "Limpieza", amount: 600, date: "10/03/2026", month: 2 },
  { id: 8, concept: "Electricidad Áreas Comunes", category: "Servicios", amount: 1200, date: "05/03/2026", month: 2 },
];

// ─── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  residents: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  payments: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  reports: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  plus: "M12 5v14 M5 12h14",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18 M6 6l12 12",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4",
  expense: "M2 17l10 5 10-5 M2 12l10 5 10-5 M2 7l10-5 10 5-10 5z",
};

// ─── STYLES ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#000000;color:#e2e8f0}
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#0a0a0a} ::-webkit-scrollbar-thumb{background:#00aaff40;border-radius:4px}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all .15s}
  .btn-primary{background:#ff6a00;color:#000;font-weight:700} .btn-primary:hover{background:#ff8533;box-shadow:0 0 14px #ff6a0055}
  .btn-ghost{background:transparent;color:#7a90a8;border:1px solid #00aaff25} .btn-ghost:hover{background:#00aaff10;color:#00ccff;border-color:#00aaff50}
  .btn-danger{background:#ff2244;color:#fff} .btn-danger:hover{background:#ff4466}
  .btn-success{background:#00aaff;color:#000;font-weight:700} .btn-success:hover{background:#33bbff;box-shadow:0 0 14px #00aaff55}
  .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.5px}
  .badge-paid{background:#00aaff15;color:#00ccff;border:1px solid #00aaff30}
  .badge-unpaid{background:#ff224415;color:#ff4466;border:1px solid #ff224430}
  .badge-pending{background:#ff6a0015;color:#ff8533;border:1px solid #ff6a0030}
  input,select,textarea{background:#090909;border:1px solid #00aaff20;border-radius:8px;color:#e2e8f0;font-family:'DM Sans',sans-serif;font-size:13px;padding:8px 12px;width:100%;outline:none;transition:all .15s}
  input:focus,select:focus,textarea:focus{border-color:#00aaff;box-shadow:0 0 0 2px #00aaff18}
  select option{background:#0d0d0d}
  .modal-overlay{position:fixed;inset:0;background:#000000aa;display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(6px)}
  .modal{background:#070707;border:1px solid #00aaff25;border-radius:16px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 0 50px #00aaff0d}
  .table{width:100%;border-collapse:collapse}
  .table th{color:#00aaff70;font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;padding:10px 14px;text-align:left;border-bottom:1px solid #00aaff15}
  .table td{padding:12px 14px;border-bottom:1px solid #ffffff06;font-size:13px}
  .table tr:hover td{background:#00aaff07}
  .card{background:#070707;border:1px solid #00aaff18;border-radius:14px;padding:20px}
  .tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500}
`;

// ─── MODAL COMPONENT ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "Syne", fontSize: 18, color: "#00aaff" }}>{title}</h3>
          <button className="btn btn-ghost" style={{ padding: "4px 8px" }} onClick={onClose}>
            <Icon d={icons.x} size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = "#ff6a00", icon }) {
  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: accent + "15" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "#4a6070", fontSize: 12, fontWeight: 600, letterSpacing: ".6px", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
          <p style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, color: accent }}>{value}</p>
          {sub && <p style={{ color: "#4a6070", fontSize: 12, marginTop: 6 }}>{sub}</p>}
        </div>
        <div style={{ background: accent + "20", padding: 10, borderRadius: 10 }}>
          <Icon d={icon} size={22} color={accent} />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [residents, setResidents] = useState(generateResidents);
  const [expenses, setExpenses] = useState(generateExpenses);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(null);
  const [editResident, setEditResident] = useState(null);
  const [newExpense, setNewExpense] = useState({ concept: "", category: "Basura", amount: "", date: "", month: CURRENT_MONTH });
  const [form, setForm] = useState({ name: "", unit: "", email: "", phone: "", type: "Inquilino" });

  // ── Derived stats
  const monthPayments = useMemo(() => residents.map(r => ({
    ...r,
    payment: r.payments[selectedMonth],
  })), [residents, selectedMonth]);

  const paidCount = monthPayments.filter(r => r.payment.paid).length;
  const unpaidCount = monthPayments.filter(r => !r.payment.paid).length;
  const totalCollected = paidCount * MAINTENANCE_FEE;
  const totalPending = unpaidCount * MAINTENANCE_FEE;

  const overdueResidents = residents.filter(r =>
    r.payments.some((p, m) => m < CURRENT_MONTH && !p.paid)
  );

  const monthExpenses = expenses.filter(e => e.month === selectedMonth);
  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const barData = MONTHS.map((m, i) => ({
    mes: m,
    cobrado: residents.filter(r => r.payments[i].paid).length * MAINTENANCE_FEE,
    gastos: expenses.filter(e => e.month === i).reduce((s, e) => s + e.amount, 0),
  }));

  const pieData = [
    { name: "Pagado", value: paidCount },
    { name: "Pendiente", value: unpaidCount },
  ];

  // ── Handlers
  const togglePayment = (residentId) => {
    setResidents(prev => prev.map(r =>
      r.id === residentId
        ? { ...r, payments: r.payments.map((p, m) => m === selectedMonth ? { ...p, paid: !p.paid, date: !p.paid ? new Date().toLocaleDateString("es-MX") : null } : p) }
        : r
    ));
  };

  const saveResident = () => {
    if (!form.name || !form.unit) return;
    if (editResident) {
      setResidents(prev => prev.map(r => r.id === editResident.id ? { ...r, ...form } : r));
    } else {
      const newId = Math.max(...residents.map(r => r.id)) + 1;
      setResidents(prev => [...prev, {
        id: newId, ...form,
        payments: Array.from({ length: 12 }, (_, m) => ({ month: m, year: CURRENT_YEAR, paid: false, date: null, amount: MAINTENANCE_FEE }))
      }]);
    }
    setShowModal(null); setEditResident(null); setForm({ name: "", unit: "", email: "", phone: "", type: "Inquilino" });
  };

  const deleteResident = (id) => setResidents(prev => prev.filter(r => r.id !== id));

  const addExpense = () => {
    if (!newExpense.concept || !newExpense.amount) return;
    const newId = Math.max(...expenses.map(e => e.id)) + 1;
    setExpenses(prev => [...prev, { id: newId, ...newExpense, amount: Number(newExpense.amount), month: Number(newExpense.month) }]);
    setNewExpense({ concept: "", category: "Basura", amount: "", date: "", month: CURRENT_MONTH });
    setShowModal(null);
  };

  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const filteredResidents = monthPayments.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.unit.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === "all" || (filterStatus === "paid" && r.payment.paid) || (filterStatus === "unpaid" && !r.payment.paid);
    return matchSearch && matchFilter;
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: icons.dashboard },
    { id: "residents", label: "Residentes", icon: icons.residents },
    { id: "payments", label: "Pagos", icon: icons.payments },
    { id: "alerts", label: "Alertas", icon: icons.alert },
    { id: "expenses", label: "Gastos", icon: icons.expense },
    { id: "reports", label: "Reportes", icon: icons.reports },
  ];

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#000000" }}>
        {/* SIDEBAR */}
        <aside style={{ width: 220, background: "#050505", borderRight: "1px solid #00aaff18", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          {/* EXO-NODUS LOGO */}
          <div style={{ padding: "4px 8px 20px", borderBottom: "1px solid #00aaff12", marginBottom: 8 }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Glow layer */}
              <p style={{
                fontFamily: "Syne", fontWeight: 800, fontSize: 17, letterSpacing: "3px",
                position: "absolute", top: 0, left: 0,
                background: "linear-gradient(90deg, #00aaff, #00eeff, #ff6a00)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                filter: "blur(6px)", opacity: 0.6, userSelect: "none",
              }}>EXO-NODUS</p>
              {/* Main text */}
              <p style={{
                fontFamily: "Syne", fontWeight: 800, fontSize: 17, letterSpacing: "3px",
                position: "relative",
                background: "linear-gradient(90deg, #00aaff 0%, #00eeff 50%, #ff6a00 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>EXO-NODUS</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              {/* Decorative line */}
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #00aaff60, transparent)" }} />
              <p style={{ fontSize: 9, color: "#00aaff60", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>SOFTWARE</p>
            </div>
            {/* Building section */}
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: "#ff6a00", borderRadius: 6, padding: "4px 6px", boxShadow: "0 0 10px #ff6a0050" }}>
                <Icon d={icons.building} size={14} color="#000" />
              </div>
              <div>
                <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 13, color: "#e2e8f0", letterSpacing: "1px" }}>MELIDA</p>
                <p style={{ fontSize: 10, color: "#00aaff70", letterSpacing: ".5px" }}>Admin Panel</p>
              </div>
            </div>
          </div>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none",
              background: tab === item.id ? "#00aaff12" : "transparent",
              color: tab === item.id ? "#00ccff" : "#4a6070",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: tab === item.id ? 600 : 400,
              transition: "all .15s", textAlign: "left",
              borderLeft: tab === item.id ? "2px solid #00aaff" : "2px solid transparent",
            }}>
              <Icon d={item.icon} size={16} color={tab === item.id ? "#00aaff" : "#4a6070"} />
              {item.label}
              {item.id === "alerts" && overdueResidents.length > 0 && (
                <span style={{ marginLeft: "auto", background: "#ff2244", color: "#fff", borderRadius: 999, fontSize: 10, padding: "1px 6px", fontWeight: 700 }}>
                  {overdueResidents.length}
                </span>
              )}
            </button>
          ))}
          <div style={{ marginTop: "auto", padding: "16px 8px 0", borderTop: "1px solid #00aaff15" }}>
            <p style={{ fontSize: 11, color: "#4a6070" }}>Cuota mensual</p>
            <p style={{ fontFamily: "Syne", fontSize: 20, fontWeight: 800, color: "#ff6a00", textShadow: "0 0 12px #ff6a0040" }}>${MAINTENANCE_FEE.toLocaleString()}</p>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #00aaff10" }}>
              <p style={{ fontSize: 10, color: "#4a6070", letterSpacing: ".5px", textTransform: "uppercase" }}>Desarrollado por</p>
              <p style={{
                fontFamily: "Syne", fontWeight: 800, fontSize: 12, letterSpacing: "2px", marginTop: 3,
                background: "linear-gradient(90deg, #00aaff, #00eeff, #ff6a00)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>EXO-NODUS</p>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {/* Month selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontFamily: "Syne", fontSize: 24, fontWeight: 800 }}>
                {tab === "dashboard" && "Dashboard"}
                {tab === "residents" && "Residentes"}
                {tab === "payments" && "Control de Pagos"}
                {tab === "alerts" && "Alertas de Mora"}
                {tab === "expenses" && "Gastos del Edificio"}
                {tab === "reports" && "Reportes Anuales"}
              </h1>
              <p style={{ color: "#4a6070", fontSize: 13, marginTop: 2 }}>{residents.length} unidades · Melida · {CURRENT_YEAR}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ width: 140 }}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m} {CURRENT_YEAR}</option>)}
              </select>
            </div>
          </div>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <StatCard label="Total Cobrado" value={`$${totalCollected.toLocaleString()}`} sub={`${paidCount} de ${residents.length} unidades`} accent="#00aaff" icon={icons.payments} />
                <StatCard label="Por Cobrar" value={`$${totalPending.toLocaleString()}`} sub={`${unpaidCount} unidades pendientes`} accent="#ff2244" icon={icons.alert} />
                <StatCard label="Gastos del Mes" value={`$${totalExpenses.toLocaleString()}`} sub={`${monthExpenses.length} registros`} accent="#ff6a00" icon={icons.expense} />
                <StatCard label="Balance Neto" value={`$${(totalCollected - totalExpenses).toLocaleString()}`} sub="Cobrado − Gastos" accent="#00ccff" icon={icons.building} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <div className="card">
                  <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 16 }}>Flujo Anual 2026</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} barGap={2}>
                      <XAxis dataKey="mes" tick={{ fill: "#4a6070", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#4a6070", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "#050505", border: "1px solid #00aaff25", borderRadius: 8, fontSize: 12 }} formatter={v => [`$${v.toLocaleString()}`, ""]} />
                      <Bar dataKey="cobrado" fill="#00aaff" radius={[4, 4, 0, 0]} name="Cobrado" />
                      <Bar dataKey="gastos" fill="#ff6a00" radius={[4, 4, 0, 0]} name="Gastos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>Estado {MONTHS[selectedMonth]}</p>
                  <PieChart width={160} height={160}>
                    <Pie data={pieData} cx={75} cy={75} innerRadius={50} outerRadius={72} dataKey="value" strokeWidth={0}>
                      <Cell fill="#00aaff" />
                      <Cell fill="#ff2244" />
                    </Pie>
                  </PieChart>
                  <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "#00aaff", fontFamily: "Syne", fontWeight: 800, fontSize: 22 }}>{paidCount}</p>
                      <p style={{ color: "#4a6070", fontSize: 11 }}>Pagaron</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "#ff2244", fontFamily: "Syne", fontWeight: 800, fontSize: 22 }}>{unpaidCount}</p>
                      <p style={{ color: "#4a6070", fontSize: 11 }}>Pendientes</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Recent unpaid */}
              <div className="card">
                <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 14 }}>Pendientes de {MONTHS[selectedMonth]}</p>
                <table className="table">
                  <thead><tr><th>Unidad</th><th>Residente</th><th>Monto</th><th>Estado</th></tr></thead>
                  <tbody>
                    {monthPayments.filter(r => !r.payment.paid).slice(0, 8).map(r => (
                      <tr key={r.id}>
                        <td><span style={{ fontFamily: "Syne", fontWeight: 700, color: "#ff6a00" }}>{r.unit}</span></td>
                        <td>{r.name}</td>
                        <td>${r.payment.amount.toLocaleString()}</td>
                        <td><span className="badge badge-unpaid">PENDIENTE</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── RESIDENTS ── */}
          {tab === "residents" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <input placeholder="Buscar por nombre o unidad..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
                <button className="btn btn-primary" onClick={() => { setEditResident(null); setForm({ name: "", unit: "", email: "", phone: "", type: "Inquilino" }); setShowModal("resident"); }}>
                  <Icon d={icons.plus} size={14} /> Agregar Residente
                </button>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <table className="table">
                  <thead><tr><th>Unidad</th><th>Nombre</th><th>Tipo</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {residents.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.unit.toLowerCase().includes(search.toLowerCase())).map(r => (
                      <tr key={r.id}>
                        <td><span style={{ fontFamily: "Syne", fontWeight: 800, color: "#ff6a00" }}>{r.unit}</span></td>
                        <td style={{ fontWeight: 500 }}>{r.name}</td>
                        <td><span className="tag" style={{ background: r.type === "Propietario" ? "#a78bfa20" : "#38bdf820", color: r.type === "Propietario" ? "#a78bfa" : "#38bdf8" }}>{r.type}</span></td>
                        <td style={{ color: "#7a90a8" }}>{r.phone}</td>
                        <td style={{ color: "#4a6070" }}>{r.email}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-ghost" style={{ padding: "4px 8px" }} onClick={() => { setEditResident(r); setForm({ name: r.name, unit: r.unit, email: r.email, phone: r.phone, type: r.type }); setShowModal("resident"); }}>
                              <Icon d={icons.edit} size={14} />
                            </button>
                            <button className="btn btn-danger" style={{ padding: "4px 8px" }} onClick={() => deleteResident(r.id)}>
                              <Icon d={icons.trash} size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {tab === "payments" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <input placeholder="Buscar residente..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 250 }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
                  <option value="all">Todos</option>
                  <option value="paid">Solo pagados</option>
                  <option value="unpaid">Solo pendientes</option>
                </select>
                <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="badge badge-paid">{paidCount} pagados</span>
                  <span className="badge badge-unpaid">{unpaidCount} pendientes</span>
                </div>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <table className="table">
                  <thead><tr><th>Unidad</th><th>Residente</th><th>Monto</th><th>Fecha Pago</th><th>Estado</th><th>Acción</th></tr></thead>
                  <tbody>
                    {filteredResidents.map(r => (
                      <tr key={r.id}>
                        <td><span style={{ fontFamily: "Syne", fontWeight: 800, color: "#ff6a00" }}>{r.unit}</span></td>
                        <td style={{ fontWeight: 500 }}>{r.name}</td>
                        <td>${r.payment.amount.toLocaleString()}</td>
                        <td style={{ color: "#4a6070" }}>{r.payment.date || "—"}</td>
                        <td>
                          <span className={`badge ${r.payment.paid ? "badge-paid" : "badge-unpaid"}`}>
                            {r.payment.paid ? "PAGADO" : "PENDIENTE"}
                          </span>
                        </td>
                        <td>
                          <button className={`btn ${r.payment.paid ? "btn-ghost" : "btn-success"}`} style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => togglePayment(r.id)}>
                            <Icon d={r.payment.paid ? icons.x : icons.check} size={12} />
                            {r.payment.paid ? "Desmarcar" : "Registrar pago"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {tab === "alerts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "#ff224410", border: "1px solid #ff224430", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Icon d={icons.alert} size={22} color="#ff4757" />
                <div>
                  <p style={{ fontWeight: 600, color: "#ff2244", marginBottom: 4 }}>{overdueResidents.length} residentes con pagos atrasados</p>
                  <p style={{ color: "#7a90a8", fontSize: 13 }}>Estos residentes tienen uno o más meses sin pagar en {CURRENT_YEAR}.</p>
                </div>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Unidad</th><th>Residente</th><th>Meses Atrasados</th><th>Deuda Total</th><th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueResidents.map(r => {
                      const overduePmts = r.payments.filter((p, m) => m < CURRENT_MONTH && !p.paid);
                      const debt = overduePmts.length * MAINTENANCE_FEE;
                      return (
                        <tr key={r.id}>
                          <td><span style={{ fontFamily: "Syne", fontWeight: 800, color: "#ff6a00" }}>{r.unit}</span></td>
                          <td style={{ fontWeight: 500 }}>{r.name}</td>
                          <td>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {overduePmts.map(p => (
                                <span key={p.month} className="tag" style={{ background: "#ff475720", color: "#ff2244" }}>{MONTHS[p.month]}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ color: "#ff2244", fontFamily: "Syne", fontWeight: 700 }}>${debt.toLocaleString()}</td>
                          <td><span className="badge badge-unpaid">{overduePmts.length} mes{overduePmts.length > 1 ? "es" : ""}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {overdueResidents.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#4a6070" }}>
                  <Icon d={icons.check} size={48} color="#1dd1a1" />
                  <p style={{ marginTop: 12, fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: "#00aaff" }}>¡Sin adeudos!</p>
                  <p style={{ marginTop: 4 }}>Todos los residentes están al corriente.</p>
                </div>
              )}
            </div>
          )}

          {/* ── EXPENSES ── */}
          {tab === "expenses" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ background: "#ff6a0015", borderRadius: 10, padding: "8px 16px" }}>
                    <p style={{ fontSize: 11, color: "#4a6070" }}>Total {MONTHS[selectedMonth]}</p>
                    <p style={{ fontFamily: "Syne", fontWeight: 800, color: "#ff6a00", fontSize: 20 }}>${totalExpenses.toLocaleString()}</p>
                  </div>
                  <div style={{ background: "#38bdf820", borderRadius: 10, padding: "8px 16px" }}>
                    <p style={{ fontSize: 11, color: "#4a6070" }}>Registros</p>
                    <p style={{ fontFamily: "Syne", fontWeight: 800, color: "#38bdf8", fontSize: 20 }}>{monthExpenses.length}</p>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal("expense")}>
                  <Icon d={icons.plus} size={14} /> Agregar Gasto
                </button>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <table className="table">
                  <thead><tr><th>Concepto</th><th>Categoría</th><th>Fecha</th><th>Monto</th><th></th></tr></thead>
                  <tbody>
                    {monthExpenses.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: "center", color: "#4a6070", padding: 40 }}>Sin gastos registrados para este mes.</td></tr>
                    )}
                    {monthExpenses.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 500 }}>{e.concept}</td>
                        <td>
                          <span className="tag" style={{
                            background: e.category === "Basura" ? "#e8b84b20" : e.category === "Mantenimiento" ? "#38bdf820" : e.category === "Limpieza" ? "#1dd1a120" : "#a78bfa20",
                            color: e.category === "Basura" ? "#e8b84b" : e.category === "Mantenimiento" ? "#38bdf8" : e.category === "Limpieza" ? "#1dd1a1" : "#a78bfa",
                          }}>{e.category}</span>
                        </td>
                        <td style={{ color: "#4a6070" }}>{e.date}</td>
                        <td style={{ fontFamily: "Syne", fontWeight: 700, color: "#ff6a00" }}>${e.amount.toLocaleString()}</td>
                        <td>
                          <button className="btn btn-danger" style={{ padding: "4px 8px" }} onClick={() => deleteExpense(e.id)}>
                            <Icon d={icons.trash} size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {MONTHS.slice(0, CURRENT_MONTH + 1).map((m, i) => {
                  const paid = residents.filter(r => r.payments[i].paid).length;
                  const gastos = expenses.filter(e => e.month === i).reduce((s, e) => s + e.amount, 0);
                  const cobrado = paid * MAINTENANCE_FEE;
                  return (
                    <div key={i} className="card" style={{ cursor: "pointer" }} onClick={() => setSelectedMonth(i)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16 }}>{m} {CURRENT_YEAR}</p>
                        <span className={`badge ${i === selectedMonth ? "badge-pending" : "badge-paid"}`}>{i === selectedMonth ? "Actual" : "Cerrado"}</span>
                      </div>
                      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#4a6070", fontSize: 12 }}>Cobrado</span>
                          <span style={{ color: "#00aaff", fontWeight: 600 }}>${cobrado.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#4a6070", fontSize: 12 }}>Gastos</span>
                          <span style={{ color: "#ff2244", fontWeight: 600 }}>${gastos.toLocaleString()}</span>
                        </div>
                        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#4a6070", fontSize: 12 }}>Balance</span>
                          <span style={{ color: "#ff6a00", fontFamily: "Syne", fontWeight: 800 }}>${(cobrado - gastos).toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#4a6070", fontSize: 12 }}>Cobertura</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{paid}/{residents.length} unidades</span>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, background: "#0b0f1a", borderRadius: 6, height: 4, overflow: "hidden" }}>
                        <div style={{ background: "#00aaff", height: "100%", width: `${(paid / residents.length) * 100}%`, borderRadius: 6 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="card">
                <p style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 16 }}>Resumen Anual</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData.slice(0, CURRENT_MONTH + 1)}>
                    <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "#050505", border: "1px solid #00aaff25", borderRadius: 8, fontSize: 12 }} formatter={v => [`$${v.toLocaleString()}`, ""]} />
                    <Bar dataKey="cobrado" fill="#00aaff" radius={[4, 4, 0, 0]} name="Cobrado" />
                    <Bar dataKey="gastos" fill="#ff6a00" radius={[4, 4, 0, 0]} name="Gastos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL: RESIDENT ── */}
      {showModal === "resident" && (
        <Modal title={editResident ? "Editar Residente" : "Nuevo Residente"} onClose={() => setShowModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Nombre completo *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej. Ana García" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Unidad *</label>
                <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Ej. 3B" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Tipo</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option>Inquilino</option>
                <option>Propietario</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Teléfono</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="5512345678" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveResident}>
                <Icon d={icons.check} size={14} /> {editResident ? "Guardar cambios" : "Agregar residente"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: EXPENSE ── */}
      {showModal === "expense" && (
        <Modal title="Registrar Gasto" onClose={() => setShowModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Concepto *</label>
              <input value={newExpense.concept} onChange={e => setNewExpense(f => ({ ...f, concept: e.target.value }))} placeholder="Ej. Recolección de Basura - Marzo" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Categoría</label>
                <select value={newExpense.category} onChange={e => setNewExpense(f => ({ ...f, category: e.target.value }))}>
                  <option>Basura</option>
                  <option>Mantenimiento</option>
                  <option>Limpieza</option>
                  <option>Servicios</option>
                  <option>Reparaciones</option>
                  <option>Otros</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Mes</label>
                <select value={newExpense.month} onChange={e => setNewExpense(f => ({ ...f, month: e.target.value }))}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Monto (MXN) *</label>
                <input type="number" value={newExpense.amount} onChange={e => setNewExpense(f => ({ ...f, amount: e.target.value }))} placeholder="2400" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#4a6070", display: "block", marginBottom: 6 }}>Fecha</label>
                <input value={newExpense.date} onChange={e => setNewExpense(f => ({ ...f, date: e.target.value }))} placeholder="DD/MM/AAAA" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={addExpense}>
                <Icon d={icons.check} size={14} /> Registrar gasto
        </button>
      </div>
    </div>
  </Modal>
  );
};

export default EdificioAdmin;
      

