/**
 * @file JobMatching.jsx
 * @description Page de Matching Intelligent CareerPilot connectée au Backend
 * @author Fatima Zahra MARGHICH
 */

import { useState } from "react";
import Sidebar, { C, Icons } from "./Sidebar";
import { useAppSettings } from "../context/AppSettingsContext";

export default function JobMatching() {
  const { theme } = useAppSettings();

  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleMatch = async () => {
    if (!jobDescription) return;
    setLoading(true);

    try {
      // Appel vers ton API Django
      const response = await fetch("http://localhost:8000/api/matching/analyze/", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          // Récupère l'ID du CV stocké ou utilise "18" par défaut
          cv_id: localStorage.getItem("cv_id") || "18", 
          job_description: jobDescription
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        console.error("Erreur Backend:", data.error);
        alert("Une erreur est survenue lors de l'analyse.");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <Sidebar activePage="matching" />

      <div style={{ marginLeft: 240, flex: 1, padding: "32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: theme.text, margin: "0 0 8px" }}>
            Job Matching <span style={{ color: C.secondary }}>Intelligent</span>
          </h1>
          <p style={{ color: theme.muted, fontSize: 14, margin: 0 }}>
            Analysez la compatibilité entre votre CV et une offre d'emploi grâce à la similarité sémantique de l'IA.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
          
          {/* Section Input */}
          <div style={{
            background: theme.card,
            borderRadius: 20,
            padding: 24,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 16, color: theme.text }}>
              Description du poste
            </h3>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Collez ici l'offre d'emploi (Job Description)..."
              style={{
                width: "100%",
                height: 350,
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.text,
                outline: "none",
                fontSize: 14,
                fontFamily: "inherit",
                resize: "none",
                transition: "border-color 0.2s"
              }}
            />

            <button 
              onClick={handleMatch}
              disabled={loading || !jobDescription}
              style={{
                width: "100%",
                marginTop: 20,
                background: loading || !jobDescription ? theme.border : theme.gradient,
                border: "none",
                color: loading || !jobDescription ? theme.muted : "#fff",
                fontSize: 15,
                fontWeight: 700,
                padding: "14px",
                borderRadius: 14,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Syne',sans-serif",
                transition: "all 0.2s"
              }}
            >
              {loading ? "⌛ Analyse sémantique en cours..." : "Lancer le Matching IA"}
            </button>
          </div>

          {/* Section Résultats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {!results ? (
              <div style={{ 
                flex: 1,
                border: `2px dashed ${theme.border}`,
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
                color: theme.muted,
                textAlign: "center"
              }}>
                <div style={{ opacity: 0.2, marginBottom: 16, fontSize: 40 }}>{Icons.matching}</div>
                <p style={{ fontSize: 14 }}>Les résultats de compatibilité s'afficheront ici après l'analyse.</p>
              </div>
            ) : (
              <div style={{
                background: theme.card,
                borderRadius: 20,
                padding: 24,
                border: `1px solid ${theme.border}`,
                animation: "fadeIn 0.4s ease-out"
              }}>
                {/* Score Circle */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ 
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: theme.gradientLight || "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    border: `4px solid ${results.score > 70 ? "#DCFCE7" : "#FEE2E2"}`
                  }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: C.primary, fontFamily: "'Syne'" }}>
                      {results.score}%
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>
                    Score de Compatibilité
                  </div>
                </div>

                {/* Matching Skills */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>✓</span> POINTS FORTS
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {results.matching.map((s, index) => (
                      <span key={index} style={{ background: "#DCFCE7", color: "#166534", padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#991B1B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>✗</span> LACUNES DÉTECTÉES
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {results.missing.map((s, index) => (
                      <span key={index} style={{ background: "#FEE2E2", color: "#991B1B", padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Advice */}
                <div style={{
                  background: theme.bg,
                  padding: 16,
                  borderRadius: 12,
                  borderLeft: `4px solid ${C.secondary}`,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: theme.text,
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                }}>
                  <strong style={{ color: C.secondary }}>Conseil d'Alex :</strong> {results.advice}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(15px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        textarea::placeholder {
          color: ${theme.muted};
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}