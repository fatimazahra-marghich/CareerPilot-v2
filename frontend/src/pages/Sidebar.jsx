/**
 * @file Sidebar.jsx
 * @description Sidebar de navigation CareerPilot — partagée entre toutes les pages
 * @author Fatima Zahra MARGHICH
 * @version 1.0.0
 */

import { useState } from "react";
import { useAppSettings } from "../context/AppSettingsContext";

// ─── Couleurs partagées (export pour toutes les pages) ───
export const C = {
  primary:       "#C8187A",
  secondary:     "#7B2FF7",
  gradient:      "linear-gradient(135deg, #C8187A 0%, #7B2FF7 100%)",
  gradientLight: "linear-gradient(135deg, #FCE4F3 0%, #EDE4FD 100%)",
  bg:            "#F8F7FF",
  card:          "#FFFFFF",
  border:        "#EDE8FB",
  text:          "#1A1035",
  muted:         "#8B7AA8",
  success:       "#22C55E",
  warning:       "#F59E0B",
  error:         "#EF4444",
};

// ─── Icônes SVG (export) ──────────────────────────────────
export const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  upload:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  analyse:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  matching:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  entretien: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
  cvopt:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  profil:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  settings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",    icon: Icons.dashboard, path: "/dashboard"   },
  { id: "analyses",   label: "Analyses CV",  icon: Icons.analyse,   path: "/analyses"    },
  { id: "upload",     label: "Upload CV",    icon: Icons.upload,    path: "/upload"      },
  { id: "entretien",  label: "Entretien",    icon: Icons.entretien, path: "/entretien"   },
  { id: "matching",   label: "Job Matching", icon: Icons.matching,  path: "/matching"    },
  { id: "optimise",   label: "CV Optimisé",  icon: Icons.cvopt,     path: "/optimise"    },
  { id: "profil",     label: "Profil",       icon: Icons.profil,    path: "/profil"      },
];

export default function Sidebar({ activePage }) {
  const [hovered, setHovered] = useState(null);
  const { theme } = useAppSettings();

  const go = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("latest_analysis_id");
    window.location.href = "/login";
  };

  return (
    <div style={{
      width: 240, minHeight: "100vh",
      background: theme.card, borderRight: `1px solid ${theme.border}`,
      display: "flex", flexDirection: "column",
      padding: "24px 0", position: "fixed",
      top: 0, left: 0, zIndex: 50,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 20px 24px", borderBottom: `1px solid ${theme.border}`, marginBottom: 8,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: theme.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif",
          boxShadow: "0 4px 12px rgba(200,24,122,0.3)",
        }}>C</div>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: theme.text }}>
            Career<span style={{ color: C.primary }}>Pilot</span>
          </div>
          <div style={{ fontSize: 10, color: theme.muted }}>AI Digital Concierge</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: "8px 12px" }}>
        {NAV_ITEMS.map(item => {
          const isActive  = activePage === item.id;
          const isHov     = hovered === item.id;
          return (
            <button key={item.id} onClick={() => go(item.path)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 10, border: "none",
                cursor: "pointer", marginBottom: 2, textAlign: "left",
                background: isActive ? theme.gradientLight : isHov ? theme.bg : "transparent",
                color: isActive ? C.primary : isHov ? theme.text : theme.muted,
                fontWeight: isActive ? 700 : 500, fontSize: 14,
                fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.2s",
                borderLeft: isActive ? `3px solid ${C.primary}` : "3px solid transparent",
              }}>
              <span style={{ color: isActive ? C.primary : isHov ? C.secondary : theme.muted, flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px", borderTop: `1px solid ${theme.border}` }}>
        <button onClick={() => go("/parametres")} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 10, border: "none",
          cursor: "pointer", marginBottom: 4, background: "transparent",
          color: theme.muted, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.color = theme.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.muted; }}>
          {Icons.settings} Paramètres
        </button>

        <button onClick={handleLogout} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 10, border: "none",
          cursor: "pointer", marginBottom: 12, background: "transparent",
          color: theme.muted, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = C.error; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.muted; }}>
          {Icons.logout} Déconnexion
        </button>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
}