/**
 * @file LoginPage.jsx
 * @description Page de connexion CareerPilot
 * @author Fatima Zahra MARGHICH
 * @version 1.0.0
 *
 * Fonctionnalités :
 * - Connexion via email + mot de passe
 * - Connexion sociale (Google, GitHub)
 * - Validation des champs en temps réel
 * - Affichage/masquage du mot de passe
 * - Redirection vers Sign Up
 * - Gestion des erreurs API
 */

import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Vortex } from "../../components/Vortex";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Couleurs de la charte graphique CareerPilot */
const COLORS = {
  primary:      "#C8187A",
  secondary:    "#7B2FF7",
  gradient:     "linear-gradient(135deg, #C8187A 0%, #7B2FF7 100%)",
  gradientLight:"linear-gradient(135deg, #FCE4F3 0%, #EDE4FD 100%)",
  bg:           "#F8F7FF",
  card:         "#FFFFFF",
  border:       "#EDE8FB",
  text:         "#1A1035",
  muted:        "#8B7AA8",
  error:        "#EF4444",
  success:      "#22C55E",
};

/** Regex de validation email */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Panneau gauche avec slogan et illustration
 */
function LeftPanel() {
  return (
    <div style={{
      flex: 1,
      position: "relative",
      overflow: "hidden",
      minHeight: "100vh",
    }}>
      <Vortex
        backgroundColor="#050308"
        baseHue={300}
        particleCount={700}
        rangeY={200}
        baseSpeed={0.2}
        rangeSpeed={2}
      >
        {/* Overlay dégradé */}
        <div style={{
          position: "absolute",
          inset: 0, zIndex: 1,
          background: "linear-gradient(135deg, rgba(200,24,122,0.25) 0%, rgba(123,47,247,0.25) 100%)",
          pointerEvents: "none",
        }} />

        {/* Contenu texte */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 40px",
          minHeight: "100vh",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: "#fff",
              fontFamily: "'Syne', sans-serif",
            }}>C</div>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: 22, color: "#fff",
            }}>CareerPilot</span>
          </div>

          {/* Slogan */}
          <div>
            <div style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 50, padding: "6px 16px",
              fontSize: 12, color: "#fff", marginBottom: 24,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              🚀 Propulsé par Groq AI + Whisper
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 42, fontWeight: 800,
              color: "#fff", lineHeight: 1.15,
              margin: "0 0 20px",
              textShadow: "0 2px 20px rgba(0,0,0,0.4)",
            }}>
              Pilot your career<br />
              with AI-driven<br />
              intelligence.
            </h1>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 15, color: "rgba(255,255,255,0.85)",
              lineHeight: 1.7, maxWidth: 340,
            }}>
              Accédez à des analyses CV personnalisées,
              un matching emploi en temps réel et une
              simulation d'entretien vocale par IA.
            </p>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["F", "A", "Y", "+"].map((l, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                  marginLeft: i === 0 ? 0 : -10,
                  fontFamily: "'Syne', sans-serif",
                }}>{l}</div>
              ))}
            </div>
            <span style={{
              fontSize: 13, color: "rgba(255,255,255,0.9)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Rejoins 10k+ professionnels
            </span>
          </div>
        </div>
      </Vortex>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}

/**
 * Composant champ de saisie réutilisable
 * @param {object} props
 */
function InputField({ icon, type, placeholder, value, onChange, error, rightElement }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: focused ? "#fff" : COLORS.bg,
        border: `1.5px solid ${error ? COLORS.error : focused ? COLORS.primary : COLORS.border}`,
        borderRadius: 12, padding: "13px 16px",
        transition: "all 0.2s",
        boxShadow: focused ? `0 0 0 3px ${COLORS.primary}18` : "none",
      }}>
        <span style={{ fontSize: 18, opacity: 0.6, flexShrink: 0 }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: "transparent",
            border: "none", outline: "none",
            color: COLORS.text, fontSize: 14,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />
        {rightElement}
      </div>
      {error && (
        <span style={{
          color: COLORS.error, fontSize: 12,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          paddingLeft: 4,
        }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

/**
 * Bouton de connexion sociale (Google / GitHub)
 * @param {object} props
 */
function SocialButton({ icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
        background: hovered ? COLORS.bg : "#fff",
        border: `1.5px solid ${hovered ? COLORS.border : "#E5E7EB"}`,
        borderRadius: 12, padding: "11px 16px",
        cursor: "pointer", fontSize: 13, fontWeight: 600,
        color: COLORS.text, transition: "all 0.2s",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Page de connexion CareerPilot
 * Route : /login
 */
export default function LoginPage() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────
  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Handlers ───────────────────────────────────────────

  /** Mise à jour d'un champ du formulaire */
  const handleChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    // Effacer l'erreur du champ dès que l'utilisateur tape
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError("");
  }, [errors]);

  /** Validation du formulaire */
  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.email)                    newErrors.email    = "L'email est requis";
    else if (!EMAIL_REGEX.test(form.email)) newErrors.email = "Email invalide";
    if (!form.password)                 newErrors.password = "Le mot de passe est requis";
    else if (form.password.length < 6)  newErrors.password = "Minimum 6 caractères";
    return newErrors;
  }, [form]);

  /** Soumission du formulaire */
const handleSubmit = useCallback(async () => {
  const newErrors = validate();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setLoading(true);
  setApiError("");

  try {
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Identifiants incorrects");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1000);
  } catch (err) {
    setApiError(err.message || "Erreur de connexion. Réessayez.");
  } finally {
    setLoading(false);
  }
}, [form, validate, navigate]);

  /** Connexion avec Google */
  const handleGoogle = useCallback(() => {
    // TODO: Implémenter OAuth Google
    console.log("Google OAuth");
  }, []);

  /** Connexion avec GitHub */
  const handleGitHub = useCallback(() => {
    // TODO: Implémenter OAuth GitHub
    console.log("GitHub OAuth");
  }, []);

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      width: "100vw",
      overflow: "hidden",
      position: "fixed",
      top: 0, left: 0,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Panneau gauche */}
      <LeftPanel />

      {/* Panneau droit — Formulaire */}
      <div style={{
        width: 480,
        minWidth: 480,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px",
        overflowY: "auto",
        height: "100vh",
      }}>

        {/* En-tête */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28, fontWeight: 800,
            color: COLORS.text, margin: "0 0 8px",
          }}>
            Bon retour ! 👋
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 14, margin: 0 }}>
            Connecte-toi pour accéder à ton espace CareerPilot
          </p>
        </div>

        {/* Succès */}
        {success && (
          <div style={{
            background: "#DCFCE7", border: "1.5px solid #86EFAC",
            borderRadius: 12, padding: "14px 18px",
            color: COLORS.success, fontSize: 14, fontWeight: 600,
            marginBottom: 20, textAlign: "center",
          }}>
            ✅ Connexion réussie ! Redirection...
          </div>
        )}

        {/* Erreur API */}
        {apiError && (
          <div style={{
            background: "#FEF2F2", border: "1.5px solid #FCA5A5",
            borderRadius: 12, padding: "12px 16px",
            color: COLORS.error, fontSize: 13,
            marginBottom: 20,
          }}>
            ❌ {apiError}
          </div>
        )}

        {/* Boutons sociaux */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <SocialButton icon="🔵" label="Google"  onClick={handleGoogle} />
          <SocialButton icon="⚫" label="GitHub"  onClick={handleGitHub} />
        </div>

        {/* Séparateur */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, marginBottom: 24,
        }}>
          <div style={{ flex: 1, height: 1, background: COLORS.border }} />
          <span style={{ color: COLORS.muted, fontSize: 13 }}>ou avec email</span>
          <div style={{ flex: 1, height: 1, background: COLORS.border }} />
        </div>

        {/* Formulaire */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
          <InputField
            icon="📧"
            type="email"
            placeholder="Adresse email"
            value={form.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
          <InputField
            icon="🔒"
            type={showPass ? "text" : "password"}
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
            rightElement={
              <button
                onClick={() => setShowPass(v => !v)}
                style={{
                  background: "none", border: "none",
                  cursor: "pointer", fontSize: 16,
                  color: COLORS.muted, padding: 0, flexShrink: 0,
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            }
          />
        </div>

        {/* Mot de passe oublié */}
        <div style={{ textAlign: "right", marginBottom: 24 }}>
          <Link
            to="/forgot-password"
            style={{
              color: COLORS.primary, fontSize: 13,
              textDecoration: "none", fontWeight: 600,
            }}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Bouton de connexion */}
        <button
          onClick={handleSubmit}
          disabled={loading || success}
          style={{
            background: loading || success ? COLORS.border : COLORS.gradient,
            border: "none", color: loading || success ? COLORS.muted : "#fff",
            borderRadius: 12, padding: "14px",
            fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Syne', sans-serif",
            boxShadow: loading ? "none" : "0 4px 20px rgba(200,24,122,0.3)",
            transition: "all 0.2s", marginBottom: 24,
          }}
        >
          {loading ? "⏳ Connexion en cours..." : "🚀 Se connecter"}
        </button>

        {/* Lien inscription */}
        <p style={{ textAlign: "center", color: COLORS.muted, fontSize: 14, margin: 0 }}>
          Pas encore de compte ?{" "}
          <Link
            to="/signup"
            style={{ color: COLORS.primary, fontWeight: 700, textDecoration: "none" }}
          >
            S'inscrire gratuitement →
          </Link>
        </p>

        {/* Conseil IA */}
        <div style={{
          marginTop: 32, background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12, padding: "12px 16px",
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <p style={{ fontSize: 12, color: COLORS.primary, fontWeight: 700, margin: "0 0 2px" }}>
              AI CAREER TIP
            </p>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>
              Les profils complets ont 3.5x plus de chances d'être repérés par les recruteurs premium.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}