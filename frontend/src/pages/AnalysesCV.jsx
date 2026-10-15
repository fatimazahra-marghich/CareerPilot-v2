import { useEffect, useState } from "react";
import Sidebar, { C } from "./Sidebar";

function ScoreCircle({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#22C55E" : score >= 60 ? C.secondary : "#F59E0B";

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke={C.border} strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color }}>
          {score}%
        </span>

        <span style={{ fontSize: 10, color: C.muted }}>
          {score >= 75 ? "STRONG MATCH" : score >= 60 ? "GOOD MATCH" : "WEAK MATCH"}
        </span>
      </div>
    </div>
  );
}

function KpiBar({ label, score, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: C.text }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}%</span>
      </div>

      <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, width: `${score}%`, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function SkillTag({ label, variant }) {
  const styles = {
    tech: { bg: "#EDE4FD", color: C.secondary },
    soft: { bg: "#FCE4F3", color: C.primary },
  };

  const s = styles[variant] || styles.tech;

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "6px 13px",
        borderRadius: 50,
        background: s.bg,
        color: s.color,
      }}
    >
      {label}
    </span>
  );
}

function ListBlock({ title, items, color = C.text }) {
  if (!items || items.length === 0) return null;

  return (
    <div
      style={{
        background: "#FAFAFF",
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 18,
      }}
    >
      <h4 style={{ fontSize: 14, fontWeight: 800, color, marginBottom: 12 }}>
        {title}
      </h4>

      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 6 }}>
          • {item}
        </div>
      ))}
    </div>
  );
}

export default function AnalysesCV() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchAnalysis = async () => {
      const token = localStorage.getItem("token");
      const analysisId = localStorage.getItem("latest_analysis_id");

      if (!token) {
        setApiError("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Token ${token}` };

      try {
        let response;

        if (analysisId) {
          response = await fetch(`http://localhost:8000/api/cv/analysis/${analysisId}`, {
            method: "GET",
            headers,
          });

          if (response.ok) {
            const result = await response.json();
            setData(result);
            setLoading(false);
            return;
          }
        }

        response = await fetch("http://localhost:8000/api/cv/latest-analysis", {
          method: "GET",
          headers,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || "Impossible de charger l'analyse.");
        }

        if (result.analysis_id) {
          localStorage.setItem("latest_analysis_id", String(result.analysis_id));
        }

        setData(result);
      } catch (err) {
        setApiError(err.message || "Erreur réseau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}>Chargement de l’analyse...</div>;
  }

  if (apiError) {
    return <div style={{ padding: 40, color: "red" }}>❌ {apiError}</div>;
  }

  const ai = data.aiAnalysis || {};

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      <Sidebar activePage="analyses" />

      <main
        style={{
          marginLeft: 220,
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>
            CareerPilot / Analyses CV
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: C.gradientLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              📄
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: C.text,
                  margin: 0,
                }}
              >
                {data.filename}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: 50,
                    background: "#DCFCE7",
                    color: "#16A34A",
                  }}
                >
                  ✓ ANALYSÉ
                </span>

                <span style={{ fontSize: 12, color: C.muted }}>{data.date}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* SCORE + KPI */}
          <div
            style={{
              background: C.card,
              borderRadius: 22,
              padding: 30,
              border: `1px solid ${C.border}`,
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                ATS Match Score
              </div>

              <ScoreCircle score={data.atsScore} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Key Performance Indicators
              </div>

              {(data.kpis || []).map((kpi, i) => (
                <KpiBar key={i} {...kpi} />
              ))}
            </div>
          </div>

          {/* SKILLS */}
          <div
            style={{
              background: C.card,
              borderRadius: 22,
              padding: 28,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: C.muted,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  {"<>"} Technical Skills
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                  {(data.technicalSkills || []).map((s) => (
                    <SkillTag key={s} label={s} variant="tech" />
                  ))}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: C.muted,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  ◎ Soft Skills
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                  {(data.softSkills || []).map((s) => (
                    <SkillTag key={s} label={s} variant="soft" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* IA ANALYSIS */}
          <div
            style={{
              background: C.card,
              borderRadius: 22,
              padding: 30,
              border: `1px solid ${C.border}`,
            }}
          >
            <h3
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: C.text,
                marginBottom: 18,
              }}
            >
              🤖 Analyse IA détaillée
            </h3>

            {ai.global_feedback && (
              <div
                style={{
                  background: "#F8F5FF",
                  borderRadius: 16,
                  padding: 18,
                  border: `1px solid ${C.border}`,
                  marginBottom: 18,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: C.primary, marginBottom: 8 }}>
                  Avis global
                </div>

                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
                  {ai.global_feedback}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
              {ai.professional_title_quality && (
                <div style={{ background: "#FAFAFF", border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                  <strong style={{ color: C.text }}>Titre professionnel</strong>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginTop: 8 }}>
                    {ai.professional_title_quality}
                  </p>
                </div>
              )}

              {ai.summary_quality && (
                <div style={{ background: "#FAFAFF", border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                  <strong style={{ color: C.text }}>Résumé</strong>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginTop: 8 }}>
                    {ai.summary_quality}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <ListBlock title="✅ Points forts" items={ai.strengths} color="#16A34A" />
              <ListBlock title="⚠️ Points faibles" items={ai.weaknesses} color="#F59E0B" />
              <ListBlock title="🏗️ Problèmes de structure" items={ai.structure_problems} color="#DC2626" />
              <ListBlock title="🔁 Redondances détectées" items={ai.redundancies} color="#DC2626" />
              <ListBlock title="✍️ Erreurs / corrections" items={ai.grammar_errors} color="#DC2626" />
              <ListBlock title="📅 Problèmes chronologiques" items={ai.date_order_issues} color="#7B2FF7" />
            </div>

            {ai.photo_advice && (
              <div
                style={{
                  marginTop: 20,
                  background: "#F0FDF4",
                  border: "1.5px solid #BBF7D0",
                  borderRadius: 16,
                  padding: 18,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: "#16A34A", marginBottom: 8 }}>
                  📸 Conseil photo professionnelle
                </div>

                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>
                  {ai.photo_advice}
                </div>
              </div>
            )}
          </div>

          {/* KEYWORDS */}
          <div
            style={{
              background: C.card,
              borderRadius: 22,
              padding: 30,
              border: `1px solid ${C.border}`,
            }}
          >
            <h3
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: C.text,
                marginBottom: 18,
              }}
            >
              🔍 Analyse des mots-clés ATS
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div
                style={{
                  background: "#ECFDF5",
                  borderRadius: 18,
                  padding: 22,
                  border: "1.5px solid #BBF7D0",
                }}
              >
                <h4 style={{ fontSize: 15, fontWeight: 800, color: "#16A34A", marginBottom: 14 }}>
                  ✅ Mots-clés détectés
                </h4>

                {(data.present || []).length === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>Aucun mot-clé détecté.</div>
                ) : (
                  (data.present || []).map((k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                      <span style={{ color: "#22C55E", fontWeight: 800 }}>✓</span>
                      <span style={{ fontSize: 14, color: C.text }}>{k}</span>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  background: "#FEF2F2",
                  borderRadius: 18,
                  padding: 22,
                  border: "1.5px solid #FCA5A5",
                }}
              >
                <h4 style={{ fontSize: 15, fontWeight: 800, color: "#DC2626", marginBottom: 14 }}>
                  ❌ Mots-clés manquants
                </h4>

                {(data.missing || []).length === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>Aucun mot-clé manquant.</div>
                ) : (
                  (data.missing || []).map((k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                      <span style={{ color: "#EF4444", fontWeight: 800 }}>✗</span>
                      <span style={{ fontSize: 14, color: C.text }}>{k}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}