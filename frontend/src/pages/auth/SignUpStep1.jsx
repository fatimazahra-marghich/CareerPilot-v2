/**
 * @file SignUpStep1.jsx
 * @description Étape 1 d'inscription CareerPilot — Informations de base
 * @author Fatima Zahra MARGHICH
 * @version 1.0.0
 *
 * Fonctionnalités :
 * - Saisie nom complet et email
 * - Inscription sociale (Google, GitHub)
 * - Validation en temps réel
 * - Indicateur de progression (étape 1/2)
 * - Transition vers étape 2
 */

import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Vortex } from "../../components/Vortex";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  primary:       "#C8187A",
  secondary:     "#7B2FF7",
  gradient:      "linear-gradient(135deg, #C8187A 0%, #7B2FF7 100%)",
  gradientLight: "linear-gradient(135deg, #FCE4F3 0%, #EDE4FD 100%)",
  bg:            "#F8F7FF",
  card:          "#FFFFFF",
  border:        "#EDE8FB",
  text:          "#1A1035",
  muted:         "#8B7AA8",
  error:         "#EF4444",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Panneau gauche avec illustration et slogan
 */
function LeftPanel() {
  return (
    <div style={{
      flex: 1, position: "relative",
      overflow: "hidden", minHeight: "100vh",
    }}>
      <Vortex
        backgroundColor="#050308"
        baseHue={280}
        particleCount={700}
        rangeY={300}
        baseSpeed={0.3}
        rangeSpeed={2}
      >
        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(200,24,122,0.25) 0%, rgba(123,47,247,0.25) 100%)",
          zIndex: 1,
        }} />

        {/* Contenu */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 40px", minHeight: "100vh",
        }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:40, height:40, borderRadius:12,
              background:"rgba(255,255,255,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, fontWeight:800, color:"#fff",
              fontFamily:"'Syne', sans-serif",
            }}>C</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"#fff" }}>
              CareerPilot
            </span>
          </div>

          {/* Slogan */}
          <div>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:6,
              background:"rgba(255,255,255,0.15)",
              backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.2)",
              borderRadius:50, padding:"6px 14px", marginBottom:24,
              fontSize:12, color:"#fff",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
            }}>
              <span style={{ width:7, height:7, borderRadius:"50%",
                background:"#fff", display:"inline-block" }} />
              Trusted by 50k+ Professionals
            </div>
            <h1 style={{
              fontFamily:"'Syne',sans-serif",
              fontSize:40, fontWeight:800, color:"#fff",
              lineHeight:1.15, margin:"0 0 20px",
              textShadow:"0 2px 20px rgba(0,0,0,0.3)",
            }}>
              Your future is<br />not a destination,<br />it's a journey.
            </h1>
            <p style={{
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:15, color:"rgba(255,255,255,0.85)",
              lineHeight:1.7, maxWidth:340,
            }}>
              Rejoins 50 000+ professionnels qui naviguent
              vers leurs objectifs avec l'IA.
            </p>
          </div>

          {/* Illustration */}
          <div style={{
            borderRadius:16, overflow:"hidden",
            background:"rgba(255,255,255,0.1)",
            backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,0.2)",
            height:180, display:"flex", alignItems:"center",
            justifyContent:"center",
          }}>
            <span style={{ fontSize:60 }}>🎯</span>
          </div>

          {/* Footer */}
          <div style={{ display:"flex", gap:24 }}>
            {["Politique de confidentialité", "Conditions d'utilisation"].map(l => (
              <span key={l} style={{
                fontSize:11, color:"rgba(255,255,255,0.6)",
                cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif",
              }}>{l}</span>
            ))}
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
 * Indicateur de progression en étapes
 * @param {number} currentStep - Étape actuelle (1 ou 2)
 */
function StepIndicator({ currentStep }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
      {[1, 2].map((step, i) => (
        <div key={step} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background: currentStep >= step ? COLORS.gradient : "transparent",
            border: `2px solid ${currentStep >= step ? "transparent" : COLORS.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            color: currentStep >= step ? "#fff" : COLORS.muted,
            fontSize:13, fontWeight:800,
            fontFamily:"'Syne',sans-serif",
            transition:"all 0.3s",
            boxShadow: currentStep >= step ? "0 4px 12px rgba(200,24,122,0.3)" : "none",
          }}>
            {currentStep > step ? "✓" : step}
          </div>
          {i === 0 && (
            <div style={{
              width:60, height:3, borderRadius:2,
              background: currentStep > 1
                ? COLORS.gradient
                : COLORS.border,
              transition:"all 0.3s",
            }} />
          )}
        </div>
      ))}
      <span style={{
        color: COLORS.muted, fontSize:12, marginLeft:8,
        fontFamily:"'Plus Jakarta Sans',sans-serif",
      }}>
        Étape {currentStep} sur 2
      </span>
    </div>
  );
}

/**
 * Champ de saisie avec validation
 */
function InputField({ icon, type="text", placeholder, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{
        display:"flex", alignItems:"center", gap:12,
        background: focused ? "#fff" : COLORS.bg,
        border:`1.5px solid ${error ? COLORS.error : focused ? COLORS.primary : COLORS.border}`,
        borderRadius:12, padding:"13px 16px",
        transition:"all 0.2s",
        boxShadow: focused ? `0 0 0 3px ${COLORS.primary}18` : "none",
      }}>
        <span style={{ fontSize:18, opacity:0.6, flexShrink:0 }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex:1, background:"transparent",
            border:"none", outline:"none",
            color:COLORS.text, fontSize:14,
            fontFamily:"'Plus Jakarta Sans',sans-serif",
          }}
        />
      </div>
      {error && (
        <span style={{ color:COLORS.error, fontSize:12, paddingLeft:4,
          fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

/**
 * Bouton social
 */
function SocialButton({ icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex:1, display:"flex", alignItems:"center",
        justifyContent:"center", gap:8,
        background: hovered ? COLORS.bg : "#fff",
        border:`1.5px solid ${hovered ? COLORS.border : "#E5E7EB"}`,
        borderRadius:12, padding:"11px 16px",
        cursor:"pointer", fontSize:13, fontWeight:600,
        color:COLORS.text, transition:"all 0.2s",
        fontFamily:"'Plus Jakarta Sans',sans-serif",
      }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Page Inscription Étape 1 — Informations de base
 * Route : /signup
 * @param {function} onNext - Callback appelé avec les données de l'étape 1
 */
export default function SignUpStep1({ onNext }) {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────
  const [form, setForm]     = useState({ fullName: "", email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── Handlers ───────────────────────────────────────────

  const handleChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  }, [errors]);

  /** Validation de l'étape 1 */
  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.fullName.trim())          newErrors.fullName = "Le nom complet est requis";
    else if (form.fullName.trim().length < 2) newErrors.fullName = "Nom trop court";
    if (!form.email)                    newErrors.email = "L'email est requis";
    else if (!EMAIL_REGEX.test(form.email)) newErrors.email = "Email invalide";
    return newErrors;
  }, [form]);

  /** Passage à l'étape 2 */
const handleNext = useCallback(async () => {
  const newErrors = validate();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/auth/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Cet email est déjà utilisé");
    }

    if (onNext) onNext(form);
    else navigate("/signup/step2", { state: form });
  } catch (err) {
    setErrors({ email: err.message });
  } finally {
    setLoading(false);
  }
}, [form, validate, onNext, navigate]);

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{
      display:"flex", minHeight:"100vh",
      width:"100vw", overflow:"hidden",
      position:"fixed", top:0, left:0,
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      <LeftPanel />

      {/* Formulaire */}
      <div style={{
        width:480, minWidth:480, background:"#fff",
        display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"48px",
        overflowY:"auto", height:"100vh",
      }}>
        {/* Indicateur d'étapes */}
        <StepIndicator currentStep={1} />

        {/* En-tête */}
        <div style={{ marginBottom:28 }}>
          <p style={{ color:COLORS.primary, fontSize:12, fontWeight:700,
            letterSpacing:"0.1em", textTransform:"uppercase",
            margin:"0 0 8px" }}>
            ÉTAPE 1 DE 2
          </p>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800,
            color:COLORS.text, margin:"0 0 8px" }}>
            Créer votre compte
          </h2>
          <p style={{ color:COLORS.muted, fontSize:14, margin:0 }}>
            Commencez votre parcours professionnel avec CareerPilot.
          </p>
        </div>

        {/* Boutons sociaux */}
        <div style={{ display:"flex", gap:12, marginBottom:24 }}>
          <SocialButton icon="🔵" label="Google" onClick={() => console.log("Google")} />
          <SocialButton icon="⚫" label="GitHub" onClick={() => console.log("GitHub")} />
        </div>

        {/* Séparateur */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
          <div style={{ flex:1, height:1, background:COLORS.border }} />
          <span style={{ color:COLORS.muted, fontSize:13 }}>ou s'inscrire avec email</span>
          <div style={{ flex:1, height:1, background:COLORS.border }} />
        </div>

        {/* Champs */}
        <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
          <InputField
            icon="👤"
            placeholder="Nom complet"
            value={form.fullName}
            onChange={handleChange("fullName")}
            error={errors.fullName}
          />
          <InputField
            icon="📧"
            type="email"
            placeholder="Adresse email"
            value={form.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
        </div>

        {/* Bouton suivant */}
        <button
          onClick={handleNext}
          disabled={loading}
          style={{
            background: loading ? COLORS.border : COLORS.gradient,
            border:"none", color: loading ? COLORS.muted : "#fff",
            borderRadius:12, padding:"14px",
            fontSize:15, fontWeight:700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily:"'Syne',sans-serif",
            boxShadow: loading ? "none" : "0 4px 20px rgba(200,24,122,0.3)",
            transition:"all 0.2s", marginBottom:20,
          }}
        >
          {loading ? "⏳ Vérification..." : "Continuer →"}
        </button>

        {/* Lien connexion */}
        <p style={{ textAlign:"center", color:COLORS.muted, fontSize:14, margin:0 }}>
          Déjà un compte ?{" "}
          <Link to="/login" style={{ color:COLORS.primary, fontWeight:700, textDecoration:"none" }}>
            Se connecter →
          </Link>
        </p>

        {/* Liens légaux */}
        <p style={{ textAlign:"center", color:COLORS.muted, fontSize:11,
          marginTop:24, lineHeight:1.6 }}>
          En créant un compte, vous acceptez nos{" "}
          <span style={{ color:COLORS.primary, cursor:"pointer" }}>Conditions d'utilisation</span>
          {" "}et notre{" "}
          <span style={{ color:COLORS.primary, cursor:"pointer" }}>Politique de confidentialité</span>
        </p>
      </div>
    </div>
  );
}