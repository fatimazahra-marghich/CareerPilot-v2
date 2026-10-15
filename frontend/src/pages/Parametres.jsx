import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useAppSettings } from "../context/AppSettingsContext";

function Toggle({ label, desc, checked, onChange, theme }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${theme.border}` }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, fontFamily: "'Syne',sans-serif" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{desc}</div>}
      </div>

      <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer", background: checked ? theme.gradient : theme.border, position: "relative" }}>
        <div style={{ position: "absolute", top: 4, left: checked ? 24 : 4, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }} />
      </div>
    </div>
  );
}

function SelectField({ label, desc, value, options, onChange, theme }) {
  return (
    <div style={{ padding: "14px 0", borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, fontFamily: "'Syne',sans-serif" }}>{label}</div>
          {desc && <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{desc}</div>}
        </div>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            background: theme.bg,
            border: `1.5px solid ${theme.border}`,
            borderRadius: 8,
            padding: "7px 12px",
            fontSize: 13,
            color: theme.text,
            outline: "none",
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Section({ title, icon, children, theme }) {
  return (
    <div style={{ background: theme.card, borderRadius: 20, padding: 24, border: `1px solid ${theme.border}`, marginBottom: 20 }}>
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: theme.text, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: theme.primary }}>{icon}</span>
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

export default function Parametres() {
  const { theme, t, updateGlobalSettings } = useAppSettings();

  const [settings, setSettings] = useState({
    email_notifications: true,
    language: localStorage.getItem("language") || "fr",
    dark_mode: localStorage.getItem("dark_mode") === "true",
    analytics_anonymous: true,
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://127.0.0.1:8000/api/dashboard/settings", {
          headers: { Authorization: `Token ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Erreur chargement paramètres");
        }

        setSettings({
          email_notifications: data.email_notifications,
          language: data.language || "fr",
          dark_mode: !!data.dark_mode,
          analytics_anonymous: data.analytics_anonymous,
        });

        updateGlobalSettings({
          language: data.language || "fr",
          dark_mode: !!data.dark_mode,
        });
      } catch (e) {
        setApiError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);

    if (key === "language") {
      updateGlobalSettings({ language: value });
    }

    if (key === "dark_mode") {
      updateGlobalSettings({ dark_mode: value });
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/dashboard/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erreur sauvegarde");
      }

      updateGlobalSettings({
        language: settings.language,
        dark_mode: settings.dark_mode,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setApiError(e.message);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/api/dashboard/export-data", {
      headers: { Authorization: `Token ${token}` },
    });

    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "careerpilot_donnees.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t.confirmDelete)) return;

    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/api/dashboard/delete-account", {
      method: "DELETE",
      headers: { Authorization: `Token ${token}` },
    });

    if (res.ok) {
      localStorage.clear();
      window.location.href = "/signup";
    }
  };

  if (loading) {
    return <div style={{ padding: 40, background: theme.bg, color: theme.text }}>{t.loading}</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <Sidebar activePage="parametres" />

      <main
        style={{
          marginLeft: settings.language === "ar" ? 0 : 220,
          marginRight: settings.language === "ar" ? 220 : 0,
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>{t.breadcrumb}</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: theme.text }}>
              {t.title}
            </h1>
          </div>

          <button
            onClick={handleSave}
            style={{
              background: saved ? "#22C55E" : theme.gradient,
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              padding: "11px 24px",
              borderRadius: 12,
              cursor: "pointer",
              fontFamily: "'Syne',sans-serif",
            }}
          >
            {saved ? t.saved : t.save}
          </button>
        </div>

        {apiError && <div style={{ color: "#EF4444", marginBottom: 20 }}>❌ {apiError}</div>}

        <div style={{ maxWidth: 740 }}>
          <Section title={t.notifications} icon="🔔" theme={theme}>
            <Toggle
              label={t.emailNotif}
              desc={t.emailNotifDesc}
              checked={settings.email_notifications}
              onChange={() => update("email_notifications", !settings.email_notifications)}
              theme={theme}
            />
          </Section>

          <Section title={t.preferences} icon="☀️" theme={theme}>
            <SelectField
              label={t.language}
              desc={t.languageDesc}
              value={settings.language}
              onChange={(v) => update("language", v)}
              theme={theme}
              options={[
                { value: "fr", label: "Français" },
                { value: "en", label: "English" },
                { value: "ar", label: "العربية" },
              ]}
            />

            <Toggle
              label={t.darkMode}
              desc={t.darkModeDesc}
              checked={settings.dark_mode}
              onChange={() => update("dark_mode", !settings.dark_mode)}
              theme={theme}
            />
          </Section>

          <Section title={t.privacy} icon="🛡️" theme={theme}>
            <Toggle
              label={t.analytics}
              desc={t.analyticsDesc}
              checked={settings.analytics_anonymous}
              onChange={() => update("analytics_anonymous", !settings.analytics_anonymous)}
              theme={theme}
            />

            <div style={{ padding: "14px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, fontFamily: "'Syne',sans-serif" }}>{t.data}</div>
                  <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{t.dataDesc}</div>
                </div>

                <button
                  onClick={handleExport}
                  style={{
                    background: "transparent",
                    border: `1px solid ${theme.border}`,
                    color: theme.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  {t.export}
                </button>
              </div>
            </div>

            <div style={{ padding: "14px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#EF4444", fontFamily: "'Syne',sans-serif" }}>{t.deleteAccount}</div>
                  <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{t.deleteDesc}</div>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  style={{
                    background: "transparent",
                    border: "1px solid #FCA5A5",
                    color: "#EF4444",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </Section>

          <Section title={t.about} icon="ℹ️" theme={theme}>
            {[
              { label: t.version, val: "2.0.0" },
              { label: t.aiEngine, val: "Groq API (Mixtral-8x7B)" },
              { label: t.speech, val: "Whisper Tiny" },
              { label: t.developedBy, val: "ENIAD Berkane — PFA 2024/2025" },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: 13, color: theme.muted }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: "'Syne',sans-serif" }}>{val}</span>
              </div>
            ))}
          </Section>
        </div>
      </main>
    </div>
  );
}