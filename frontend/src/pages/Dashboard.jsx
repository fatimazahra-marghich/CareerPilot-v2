import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import { useAppSettings } from "../context/AppSettingsContext";

function getUserName() {
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return (
        user.first_name ||
        user.username ||
        user.name ||
        user.full_name ||
        user.email?.split("@")[0] ||
        ""
      );
    }
  } catch {
    return "";
  }

  return (
    localStorage.getItem("username") ||
    localStorage.getItem("name") ||
    localStorage.getItem("first_name") ||
    ""
  );
}

function getInitials(text) {
  if (!text) return "CV";
  return (
    text
      .replace(".pdf", "")
      .replace(".docx", "")
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "CV"
  );
}

function KpiCard({ label, value, icon, bg, color, sub, theme }) {
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 22,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color }}>
        {value}
      </div>

      <div style={{ fontSize: 13, color: theme.muted }}>{label}</div>

      {sub && <div style={{ fontSize: 11, color: theme.muted, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

function WeekChart({ history, theme }) {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const counts = useMemo(() => {
    const result = [0, 0, 0, 0, 0, 0, 0];

    history.forEach((item) => {
      const date = new Date(item.created_at);
      let day = date.getDay();
      day = day === 0 ? 6 : day - 1;
      result[day] += 1;
    });

    return result;
  }, [history]);

  const max = Math.max(...counts, 1);

  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 26,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 24 }}>
        Activité des analyses
      </h3>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 160 }}>
        {counts.map((count, i) => (
          <div key={days[i]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div
              title={`${count} analyse(s)`}
              style={{
                width: "60%",
                height: `${Math.max((count / max) * 130, count > 0 ? 18 : 6)}px`,
                background: theme.gradient,
                borderRadius: "8px 8px 0 0",
              }}
            />
            <span style={{ fontSize: 12, color: theme.muted }}>{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreLevels({ history, theme }) {
  const total = history.length || 0;

  const levels = {
    faible: history.filter((h) => h.atsScore < 60).length,
    moyen: history.filter((h) => h.atsScore >= 60 && h.atsScore < 75).length,
    fort: history.filter((h) => h.atsScore >= 75).length,
  };

  const percent = (n) => (total ? Math.round((n / total) * 100) : 0);

  const data = [
    ["Faible", "#F59E0B", percent(levels.faible)],
    ["Moyen", theme.secondary, percent(levels.moyen)],
    ["Fort", theme.primary, percent(levels.fort)],
  ];

  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 26,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 18 }}>
        Niveau des CV
      </h3>

      <div style={{ textAlign: "center", margin: "18px 0 24px" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, color: theme.text }}>
          {total}
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>CV analysés</div>
      </div>

      {data.map(([label, color, value]) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: theme.muted }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>{value}%</span>
          </div>
          <div style={{ height: 7, background: theme.border, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 20 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentTable({ history, theme }) {
  const recent = history.slice(0, 5);

  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 26,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 20 }}>
        Analyses récentes
      </h3>

      {recent.length === 0 ? (
        <div style={{ color: theme.muted, fontSize: 14 }}>
          Aucune analyse pour le moment. Lancez votre première analyse.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 10,
              background: theme.bg,
              marginBottom: 8,
            }}
          >
            {["CV", "Score", "Expérience", "Statut"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 800, color: theme.muted, textTransform: "uppercase" }}>
                {h}
              </span>
            ))}
          </div>

          {recent.map((r) => {
            const scoreColor = r.atsScore >= 75 ? theme.success : r.atsScore >= 60 ? theme.warning : "#F59E0B";

            return (
              <div
                key={r.analysis_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: 12,
                  padding: "14px",
                  borderBottom: `1px solid ${theme.border}`,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: theme.gradient,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {getInitials(r.filename)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                    {r.filename}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 7, background: theme.border, borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ width: `${r.atsScore}%`, height: "100%", background: scoreColor }} />
                  </div>
                  <strong style={{ fontSize: 13, color: theme.text }}>{r.atsScore}%</strong>
                </div>

                <span style={{ fontSize: 13, color: theme.muted }}>{r.experienceScore || 0}%</span>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "5px 12px",
                    borderRadius: 20,
                    background: "#DCFCE7",
                    color: theme.success,
                    width: "fit-content",
                  }}
                >
                  Analysé
                </span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { theme } = useAppSettings();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const username = getUserName();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setApiError("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/cv/history", {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || "Impossible de charger le dashboard.");
        }

        setHistory(Array.isArray(result) ? result : []);
      } catch (err) {
        setApiError(err.message || "Erreur réseau.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalCV = history.length;
  const avgScore = totalCV
    ? Math.round(history.reduce((sum, h) => sum + Number(h.atsScore || 0), 0) / totalCV)
    : 0;

  const bestScore = totalCV ? Math.max(...history.map((h) => Number(h.atsScore || 0))) : 0;
  const lastScore = totalCV ? Number(history[0]?.atsScore || 0) : 0;

  if (loading) {
    return <div style={{ padding: 40, background: theme.bg, color: theme.text }}>Chargement du dashboard...</div>;
  }

  if (apiError) {
    return <div style={{ padding: 40, background: theme.bg, color: "red" }}>❌ {apiError}</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <Sidebar activePage="dashboard" />

      <main style={{ marginLeft: 240, flex: 1, padding: "34px 38px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: theme.text, marginBottom: 6 }}>
              Bonjour{username ? `, ${username}` : ""} 👋
            </h1>
            <p style={{ color: theme.muted, fontSize: 15 }}>
              Suivez vos analyses CV et optimisez vos candidatures.
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/upload")}
            style={{
              background: theme.gradient,
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              padding: "13px 26px",
              borderRadius: 14,
              cursor: "pointer",
              fontFamily: "'Syne',sans-serif",
              boxShadow: "0 4px 16px rgba(200,24,122,0.3)",
            }}
          >
            ↑ Nouvelle analyse
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 26 }}>
          <KpiCard theme={theme} label="CVs analysés" value={totalCV} icon="📄" bg="#FCE4F3" color={theme.text} />
          <KpiCard theme={theme} label="Score moyen" value={`${avgScore}%`} icon="📊" bg="#EDE4FD" color={theme.text} />
          <KpiCard theme={theme} label="Meilleur score" value={`${bestScore}%`} icon="🏆" bg="#DCFCE7" color={theme.success} />
          <KpiCard theme={theme} label="Dernier score" value={`${lastScore}%`} icon="🧠" bg="#FEF3C7" color="#F59E0B" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, marginBottom: 26 }}>
          <WeekChart history={history} theme={theme} />
          <ScoreLevels history={history} theme={theme} />
        </div>

        <RecentTable history={history} theme={theme} />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </div>
  );
}