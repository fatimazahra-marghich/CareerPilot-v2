import { useEffect, useState } from "react";
import Sidebar, { C } from "./Sidebar";

function MiniList({ title, items, color = C.text }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <h4 style={{ fontSize: 13, fontWeight: 800, color, marginBottom: 10 }}>
        {title}
      </h4>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 6 }}>
          • {item}
        </div>
      ))}
    </div>
  );
}

export default function CVOptimise() {
  const [activeTab, setActiveTab] = useState("compare");
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptimizedCV = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setApiError("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/cv/latest-optimized-cv", {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || "Impossible de charger le CV optimisé.");
        }

        setData(result);
      } catch (err) {
        setApiError(err.message || "Erreur réseau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptimizedCV();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Chargement du CV optimisé...</div>;
  if (apiError) return <div style={{ padding: 40, color: "red" }}>❌ {apiError}</div>;

  const optimizedData = data.optimizedData || {};
const aiAnalysis = data.aiAnalysis || {};

const scoreOriginal = data.scoreOriginal || optimizedData.score_original || 0;
const scoreOptimized = data.scoreOptimized || optimizedData.score_optimized || 0;
const improvement = data.improvement || optimizedData.improvement || 0;

const optimizedSections = optimizedData.optimized_sections || [];
const optimizedExperiences = optimizedData.optimized_experiences || [];

const getSectionItems = (keyword) => {
  const section = optimizedSections.find((sec) =>
    String(sec.section_title || sec.title || "")
      .toLowerCase()
      .includes(keyword.toLowerCase())
  );

  if (!section?.content) return [];

  return String(section.content)
    .split(/,|\n|•|-/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const correctedErrors = [
  ...(aiAnalysis.grammar_errors || []),
  ...(aiAnalysis.structure_problems || []),
  ...(aiAnalysis.date_order_issues || []),
];

const removedRedundancies = aiAnalysis.redundancies || [];

const atsRecommendations = aiAnalysis.ats_recommendations || [];

const mainImprovements = atsRecommendations.length
  ? atsRecommendations
  : aiAnalysis.weaknesses || [];

const technicalSkills = getSectionItems("compétence").length
  ? getSectionItems("compétence")
  : aiAnalysis.missing_keywords || [];

const softSkills = aiAnalysis.strengths || [];

const finalCvText = optimizedData.final_cv_text || data.generatedContent || "";
const photoAdvice =
  aiAnalysis.photo_advice ||
  "Ajoutez une photo professionnelle (fond neutre, tenue correcte).";
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      <Sidebar activeId="optimise" />

      <main style={{ marginLeft: 220, flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>
              CareerPilot / CV Optimisé
            </div>

            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>
              CV Optimisé par IA
            </h1>

            <p style={{ fontSize: 14, color: C.muted }}>
              {data.filename}
            </p>
          </div>

          <div style={{ background: C.card, borderRadius: 16, padding: "16px 24px", border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              SCORE GLOBAL
            </div>

            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, color: "#22C55E", lineHeight: 1 }}>
              {scoreOptimized}%
            </div>

            <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 600, marginTop: 4 }}>
              +{improvement}% Amélioration
            </div>

            <div style={{ height: 4, borderRadius: 2, background: C.border, marginTop: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#22C55E,#16A34A)", width: `${scoreOptimized}%` }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["compare", "ameliorations", "final"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? C.gradient : C.card,
                border: `1px solid ${activeTab === tab ? "transparent" : C.border}`,
                color: activeTab === tab ? "#fff" : C.muted,
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 20px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              {tab === "compare" ? "📊 Comparaison" : tab === "ameliorations" ? "✨ Améliorations" : "📄 CV Final"}
            </button>
          ))}
        </div>

        {activeTab === "compare" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, fontFamily: "'Syne',sans-serif" }}>
                  CV ORIGINAL
                </div>

                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 50, background: "#FEF3C7", color: "#D97706" }}>
                  {scoreOriginal}% ATS
                </span>
              </div>

              <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                CV original analysé depuis le fichier : {data.filename}
              </div>

              <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 12 }}>
                Score original : {scoreOriginal}%<br />
                Score optimisé : {scoreOptimized}%<br />
                Amélioration : +{improvement}%
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: "'Syne',sans-serif" }}>
                  CV OPTIMISÉ — IA
                </div>

                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 50, background: "#DCFCE7", color: "#16A34A" }}>
                  {scoreOptimized}% ATS
                </span>
              </div>

              <div style={{ background: C.card, borderRadius: 14, padding: 20, border: "1.5px solid #BBF7D0", marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>
                  {optimizedData.optimized_title || "Titre optimisé non disponible"}
                </div>

                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                  {optimizedData.optimized_summary || "Résumé optimisé non disponible."}
                </div>
              </div>

              {optimizedSections.length > 0 ? (
                optimizedSections.map((s, i) => (
                  <div key={i} style={{ background: C.card, borderRadius: 14, padding: 18, border: "1.5px solid #BBF7D0", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                      {s.section_title || s.title}
                    </div>

                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {s.content}
                    </div>

                    {s.score && (
                      <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: "#16A34A" }}>
                        Score section : {s.score}%
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ background: "#FEF2F2", borderRadius: 14, padding: 18, border: "1.5px solid #FCA5A5", color: "#DC2626", fontSize: 13 }}>
                  Aucune section optimisée reçue. Vérifiez la réponse Hugging Face dans le backend.
                </div>
              )}

              {optimizedExperiences.map((exp, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 14, padding: 18, border: "1.5px solid #BBF7D0", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 6 }}>
                    {exp.job_title}
                  </div>

                  <div style={{ fontSize: 12, color: C.primary, marginBottom: 8 }}>
                    {exp.company} — {exp.period}
                  </div>

                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.6 }}>
                    {exp.description}
                  </div>

                  {(exp.achievements || []).map((a, j) => (
                    <div key={j} style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                      • {a}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ameliorations" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: C.card, borderRadius: 20, padding: 24, border: "1.5px solid #FCA5A5" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#DC2626", marginBottom: 16 }}>
                ❌ Problèmes corrigés
              </h3>

              <MiniList title="Erreurs corrigées" items={correctedErrors} color="#DC2626" />
              <MiniList title="Redondances supprimées" items={removedRedundancies} color="#DC2626" />

              {correctedErrors.length === 0 && removedRedundancies.length === 0 && (
                <div style={{ fontSize: 13, color: C.muted }}>
                  Aucun problème détaillé reçu.
                </div>
              )}
            </div>

            <div style={{ background: C.card, borderRadius: 20, padding: 24, border: "1.5px solid #BBF7D0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#16A34A", marginBottom: 16 }}>
                ✅ Améliorations IA
              </h3>

              <MiniList title="🚀 Recommandations ATS" items={atsRecommendations} color="#7B2FF7" />              <MiniList title="Compétences techniques" items={technicalSkills} color="#7B2FF7" />
              <MiniList title="Soft skills" items={softSkills} color="#C8187A" />

             
            </div>
          </div>
        )}

        {activeTab === "final" && (
          <div style={{ background: C.card, borderRadius: 20, padding: 28, border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 16, fontFamily: "'Syne',sans-serif" }}>
  CV final optimisé
</h3>

<button
  onClick={async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/api/cv/optimized-cv/${data.optimized_id}/pdf`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "CV_Optimise.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }}
  style={{
    background: C.gradient,
    border: "none",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 20,
  }}
>
  📄 Télécharger le CV optimisé (PDF)
</button>

            {finalCvText ? (
              <div style={{ whiteSpace: "pre-wrap", fontSize: 13, color: C.text, lineHeight: 1.8 }}>
                {finalCvText}
              </div>
            ) : (
              <div>
                <h4 style={{ fontSize: 16, color: C.text, marginBottom: 10 }}>
                  {optimizedData.optimized_title}
                </h4>

                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
                  {optimizedData.optimized_summary}
                </p>

                {optimizedSections.map((s, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <h4 style={{ fontSize: 14, color: C.primary, marginBottom: 8 }}>
                      {s.section_title}
                    </h4>
                    <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
                      {s.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}