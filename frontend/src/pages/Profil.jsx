import { useEffect, useMemo, useState } from "react";
import Sidebar, { C } from "./Sidebar";
import { useAppSettings } from "../context/AppSettingsContext";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";
}

function Field({ label, value, onChange, readOnly = true, type = "text", theme }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontSize: 12,
        fontWeight: 700,
        color: theme.muted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        display: "block",
        marginBottom: 6,
      }}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 14,
          color: theme.text,
          background: readOnly ? theme.bg : "#fff",
          border: `1.5px solid ${readOnly ? theme.border : C.primary}`,
          borderRadius: 10,
          outline: "none",
        }}
      />
    </div>
  );
}

export default function Profil() {
  const { theme } = useAppSettings();

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
  });

  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setApiError("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Token ${token}` };

        const profileRes = await fetch("http://localhost:8000/api/dashboard/profile", {
          method: "GET",
          headers,
        });

        const profileData = await profileRes.json();

        if (!profileRes.ok) {
          throw new Error(profileData.detail || "Impossible de charger le profil.");
        }

        setProfile({
          full_name: profileData.full_name || profileData.username || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
        });

        localStorage.setItem("user", JSON.stringify(profileData));

        const historyRes = await fetch("http://localhost:8000/api/cv/history", { headers });
        const historyData = await historyRes.json();

        if (Array.isArray(historyData)) {
          setHistory(historyData);
        }

        const latestRes = await fetch("http://localhost:8000/api/cv/latest-analysis", { headers });

        if (latestRes.ok) {
          const latestData = await latestRes.json();
          setLatest(latestData);
        }
      } catch (e) {
        setApiError(e.message || "Erreur profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (field) => (e) => {
    setProfile((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setSuccess("");
    setApiError("");
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setApiError("Utilisateur non connecté.");
      return;
    }

    setSaving(true);
    setApiError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8000/api/dashboard/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de la sauvegarde.");
      }

      const updatedUser = data.user || {};
      setProfile({
        full_name: updatedUser.full_name || updatedUser.username || profile.full_name,
        email: updatedUser.email || profile.email,
        phone: updatedUser.phone || "",
        location: updatedUser.location || "",
      });

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditing(false);
      setSuccess("Profil mis à jour avec succès.");
    } catch (e) {
      setApiError(e.message || "Erreur sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const avgScore = useMemo(() => {
    if (!history.length) return 0;
    const total = history.reduce((sum, item) => sum + Number(item.atsScore || 0), 0);
    return Math.round(total / history.length);
  }, [history]);

  const topSkills = useMemo(() => {
    const skills = latest?.technicalSkills || [];
    return skills.slice(0, 6);
  }, [latest]);

  const recentActivities = useMemo(() => {
    return history.slice(0, 3).map((item) => ({
      label: `Analyse CV terminée — ${item.filename}`,
      time: "Récemment",
      color: item.atsScore >= 75 ? "#22C55E" : item.atsScore >= 60 ? "#F59E0B" : C.primary,
    }));
  }, [history]);

  if (loading) {
    return <div style={{ padding: 40, background: theme.bg, color: theme.text }}>Chargement du profil...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <Sidebar activeId="profil" />

      <main style={{ marginLeft: 220, flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>CareerPilot / Profil</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: theme.text }}>
            Mon Profil
          </h1>
        </div>

        {apiError && (
          <div style={{
            background: "#FEF2F2",
            border: "1.5px solid #FCA5A5",
            color: "#DC2626",
            borderRadius: 14,
            padding: 14,
            marginBottom: 18,
            fontSize: 13,
          }}>
            ❌ {apiError}
          </div>
        )}

        {success && (
          <div style={{
            background: "#DCFCE7",
            border: "1.5px solid #86EFAC",
            color: "#16A34A",
            borderRadius: 14,
            padding: 14,
            marginBottom: 18,
            fontSize: 13,
            fontWeight: 700,
          }}>
            ✅ {success}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              background: theme.card,
              borderRadius: 20,
              padding: 28,
              border: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}>
              <div style={{
                width: 86,
                height: 86,
                borderRadius: "50%",
                background: theme.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 800,
                color: "#fff",
                fontFamily: "'Syne',sans-serif",
                boxShadow: "0 8px 24px rgba(200,24,122,0.3)",
              }}>
                {getInitials(profile.full_name)}
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: theme.text,
                  marginBottom: 6,
                }}>
                  {profile.full_name || "Utilisateur"}
                </h2>

                <div style={{ fontSize: 14, color: theme.muted, marginBottom: 8 }}>
                  Profil CareerPilot
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: theme.muted }}>
                    📍 {profile.location || "Non renseigné"}
                  </span>
                  <span style={{ fontSize: 12, color: theme.muted }}>
                    📄 {history.length} CV analysé{history.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                style={{
                  background: editing ? theme.gradient : "transparent",
                  border: `1.5px solid ${editing ? "transparent" : theme.border}`,
                  color: editing ? "#fff" : theme.text,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "10px 22px",
                  borderRadius: 10,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Sauvegarde..." : editing ? "✓ Sauvegarder" : "✏ Modifier le profil"}
              </button>
            </div>

            <div style={{ background: theme.card, borderRadius: 20, padding: 28, border: `1px solid ${theme.border}` }}>
              <h3 style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: theme.text,
                marginBottom: 20,
              }}>
                👤 Informations personnelles
              </h3>

              <Field label="Nom complet" value={profile.full_name} readOnly={!editing} onChange={handleChange("full_name")} theme={theme} />
              <Field label="Email" value={profile.email} type="email" readOnly={true} theme={theme} />
              <Field label="Téléphone" value={profile.phone} readOnly={!editing} onChange={handleChange("phone")} theme={theme} />
              <Field label="Localisation" value={profile.location} readOnly={!editing} onChange={handleChange("location")} theme={theme} />

              {editing && (
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: theme.gradient,
                      color: "#fff",
                      border: "none",
                      padding: "11px 22px",
                      borderRadius: 10,
                      fontWeight: 800,
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>

                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      background: "transparent",
                      color: theme.muted,
                      border: `1px solid ${theme.border}`,
                      padding: "11px 22px",
                      borderRadius: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>

            <div style={{ background: theme.card, borderRadius: 20, padding: 28, border: `1px solid ${theme.border}` }}>
              <h3 style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: theme.text,
                marginBottom: 20,
              }}>
                🔐 Sécurité
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Mot de passe</div>
                  <div style={{ fontSize: 12, color: theme.muted, letterSpacing: "0.15em" }}>••••••••••••</div>
                </div>

                <button style={{
                  background: "transparent",
                  border: `1px solid ${theme.border}`,
                  color: C.primary,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}>
                  Changer
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>
            <div style={{ background: theme.card, borderRadius: 20, padding: 24, border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: theme.text }}>
                  Career Insights
                </h3>

                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: 50,
                  background: theme.gradientLight,
                  color: C.primary,
                }}>
                  Profil actif 🔥
                </span>
              </div>

              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: theme.muted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}>
                  Top compétences
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {topSkills.length === 0 ? (
                    <span style={{ fontSize: 13, color: theme.muted }}>Aucune compétence détectée</span>
                  ) : (
                    topSkills.map((skill) => (
                      <span key={skill} style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "6px 13px",
                        borderRadius: 50,
                        background: theme.gradientLight,
                        color: C.primary,
                      }}>
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{
                background: theme.bg,
                borderRadius: 14,
                padding: 18,
                textAlign: "center",
                border: `1px solid ${theme.border}`,
                marginBottom: 22,
              }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 34, fontWeight: 800, color: C.primary }}>
                  {avgScore}%
                </div>
                <div style={{ fontSize: 12, color: theme.muted }}>Score ATS moyen</div>
              </div>

              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: theme.muted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}>
                  Activité récente
                </div>

                {recentActivities.length === 0 ? (
                  <div style={{ fontSize: 13, color: theme.muted }}>
                    Aucune activité récente.
                  </div>
                ) : (
                  recentActivities.map((activity, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: activity.color,
                        flexShrink: 0,
                        marginTop: 6,
                      }} />

                      <div>
                        <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.4 }}>
                          {activity.label}
                        </div>
                        <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ background: theme.gradientLight, borderRadius: 14, padding: 18, textAlign: "center", marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: theme.text, marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>
                  Prêt pour une nouvelle analyse ?
                </div>

                <div style={{ fontSize: 12, color: theme.muted, marginBottom: 14 }}>
                  Analysez un nouveau CV et améliorez votre score ATS.
                </div>

                <button
                  onClick={() => (window.location.href = "/upload")}
                  style={{
                    background: theme.gradient,
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    padding: "10px 22px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "'Syne',sans-serif",
                    boxShadow: "0 4px 12px rgba(200,24,122,0.3)",
                  }}
                >
                  Nouvelle analyse →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}