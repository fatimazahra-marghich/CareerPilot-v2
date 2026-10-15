import { useState, useRef } from "react";
import Sidebar, { C } from "./Sidebar";
import { useAppSettings } from "../context/AppSettingsContext";

export default function UploadCV() {
  const { theme } = useAppSettings();

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState("");
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExts = f.name.endsWith(".pdf") || f.name.endsWith(".docx");

    if (!validTypes.includes(f.type) && !validExts) {
      alert("Format non supporté. Utilisez PDF ou DOCX.");
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      alert("Fichier trop grand (max 5MB).");
      return;
    }

    setFile(f);
    setProgress(0);
    setDone(false);
    setApiError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleLaunch = async () => {
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setApiError("Vous devez être connecté pour analyser un CV.");
      return;
    }

    setLoading(true);
    setApiError("");
    setProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/cv/upload-analyze", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de l'analyse du CV.");
      }

      setProgress(100);
      setDone(true);

      localStorage.setItem("latest_analysis_id", String(data.analysis_id));

      setTimeout(() => {
        window.location.href = "/analyses";
      }, 1000);
    } catch (err) {
      setApiError(err.message || "Erreur réseau.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const fmtSize = (b) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <Sidebar activePage="upload" />

      <div style={{ marginLeft: 240, flex: 1, padding: "32px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: theme.text, margin: "0 0 8px" }}>
            Analyser votre CV
          </h1>
          <p style={{ color: theme.muted, fontSize: 14, margin: 0 }}>
            Optimisez votre CV pour les systèmes ATS avec notre IA de pointe. Obtenez un retour instantané.
          </p>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? C.primary : file ? C.success : theme.border}`,
              borderRadius: 20,
              padding: "48px 32px",
              textAlign: "center",
              cursor: file ? "default" : "pointer",
              background: dragging ? "#FCE4F3" : file ? "#F0FDF4" : theme.card,
              transition: "all 0.3s",
              boxShadow: dragging ? `0 0 0 4px ${C.primary}18` : "0 2px 8px rgba(0,0,0,0.04)",
              marginBottom: 24,
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {!file ? (
              <>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: dragging ? theme.gradient : theme.gradientLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    transition: "all 0.3s",
                    boxShadow: dragging ? "0 8px 24px rgba(200,24,122,0.3)" : "none",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragging ? "#fff" : C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: theme.text, margin: "0 0 8px" }}>
                  Glissez votre CV ici ou cliquez pour parcourir
                </p>
                <p style={{ color: theme.muted, fontSize: 13, margin: "0 0 20px" }}>PDF, DOCX — Max 5MB</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  style={{
                    background: "transparent",
                    border: `1.5px solid ${C.primary}`,
                    color: C.primary,
                    borderRadius: 10,
                    padding: "10px 24px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Parcourir les fichiers
                </button>
              </>
            ) : (
              <>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: theme.text, margin: "0 0 4px" }}>
                  {file.name}
                </p>
                <p style={{ color: theme.muted, fontSize: 13, margin: "0 0 16px" }}>{fmtSize(file.size)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setProgress(0);
                    setDone(false);
                    setApiError("");
                  }}
                  style={{
                    background: "transparent",
                    border: `1px solid ${theme.border}`,
                    color: theme.muted,
                    borderRadius: 8,
                    padding: "6px 16px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  ✕ Supprimer
                </button>
              </>
            )}
          </div>

          {apiError && (
            <div
              style={{
                marginBottom: 18,
                background: "#FEF2F2",
                border: "1.5px solid #FCA5A5",
                borderRadius: 12,
                padding: "12px 16px",
                color: "#EF4444",
                fontSize: 13,
              }}
            >
              ❌ {apiError}
            </div>
          )}

          {(loading || done) && (
            <div style={{ marginBottom: 24, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{file?.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: done ? C.success : C.primary, fontFamily: "'Syne',sans-serif" }}>
                  {progress}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: theme.border, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, background: done ? C.success : theme.gradient, width: `${progress}%`, transition: "width 0.2s ease" }} />
              </div>
              {done && (
                <p style={{ color: C.success, fontSize: 12, fontWeight: 600, margin: "8px 0 0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  ✅ Analyse terminée ! Redirection vers les résultats...
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleLaunch}
            disabled={!file || loading || done}
            style={{
              width: "100%",
              background: !file || loading || done ? theme.border : theme.gradient,
              border: "none",
              color: !file || loading || done ? theme.muted : "#fff",
              fontSize: 15,
              fontWeight: 700,
              padding: "16px",
              borderRadius: 14,
              cursor: !file || loading || done ? "not-allowed" : "pointer",
              fontFamily: "'Syne',sans-serif",
              boxShadow: !file || loading || done ? "none" : "0 4px 20px rgba(200,24,122,0.3)",
              transition: "all 0.2s",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {loading ? "⏳ Analyse en cours..." : done ? "✅ Analyse terminée !" : "Lancer l'Analyse IA"}
          </button>
        </div>
      </div>
    </div>
  );
}