/**
 * @file SignUpStep2.jsx
 * @description Étape 2 d'inscription CareerPilot — Sécurité du compte
 * @author Fatima Zahra MARGHICH
 * @version 1.0.0
 *
 * Fonctionnalités :
 * - Création et confirmation du mot de passe
 * - Indicateur de force du mot de passe (Faible / Moyen / Fort)
 * - Affichage/masquage du mot de passe
 * - Validation en temps réel
 * - Indicateur de progression (étape 2/2)
 * - Appel API d'inscription
 */

import { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  warning:       "#F59E0B",
  success:       "#22C55E",
};

/**
 * Niveaux de force du mot de passe
 * Chaque niveau a une couleur et un label
 */
const PASSWORD_STRENGTH = {
  0: { label: "",        color: COLORS.border,   bars: 0 },
  1: { label: "Faible",  color: COLORS.error,    bars: 1 },
  2: { label: "Moyen",   color: COLORS.warning,  bars: 2 },
  3: { label: "Fort",    color: COLORS.success,  bars: 3 },
};

// ─── Utils ────────────────────────────────────────────────────────────────────

/**
 * Calcule la force d'un mot de passe
 * @param {string} password - Le mot de passe à analyser
 * @returns {number} Score de 0 à 3
 */
function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)                        score++; // Longueur suffisante
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++; // Majuscule + chiffre
  if (/[^A-Za-z0-9]/.test(password))              score++; // Caractère spécial
  return score;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Panneau gauche avec illustration et slogan (étape 2)
 */
function LeftPanel() {
  return (
    <div style={{
      flex: 1, position: "relative",
      overflow: "hidden", minHeight: "100vh",
    }}>
      <Vortex
        backgroundColor="#050308"
        baseHue={260}
        particleCount={700}
        rangeY={300}
        baseSpeed={0.3}
        rangeSpeed={2}
      >
        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(123,47,247,0.25) 0%, rgba(200,24,122,0.25) 100%)",
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
              fontFamily:"'Syne',sans-serif",
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
              fontSize:38, fontWeight:800, color:"#fff",
              lineHeight:1.15, margin:"0 0 20px",
              textShadow:"0 2px 20px rgba(0,0,0,0.3)",
            }}>
              Chart your<br />course to<br />the top.
            </h1>
            <p style={{
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:15, color:"rgba(255,255,255,0.85)",
              lineHeight:1.7, maxWidth:340,
            }}>
              Ton parcours professionnel mérite un co-pilote
              qui comprend tes ambitions. Sécurise ton compte.
            </p>
          </div>

          {/* Illustration */}
          <div style={{
            borderRadius:16, overflow:"hidden",
            background:"rgba(255,255,255,0.1)",
            backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,0.2)",
            height:160, display:"flex",
            alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ fontSize:56 }}>🔐</span>
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
 * Indicateur de progression
 */
function StepIndicator({ currentStep }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
      {[1, 2].map((step, i) => (
        <div key={step} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background: currentStep >= step ? COLORS.gradient : "transparent",
            border:`2px solid ${currentStep >= step ? "transparent" : COLORS.border}`,
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
              background: currentStep > 1 ? COLORS.gradient : COLORS.border,
              transition:"all 0.3s",
            }} />
          )}
        </div>
      ))}
      <span style={{
        color:COLORS.muted, fontSize:12, marginLeft:8,
        fontFamily:"'Plus Jakarta Sans',sans-serif",
      }}>
        Étape {currentStep} sur 2
      </span>
    </div>
  );
}

/**
 * Champ mot de passe avec bouton afficher/masquer
 * @param {object} props
 */
function PasswordField({ label, placeholder, value, onChange, error, showPassword, onToggleShow }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {label && (
        <label style={{
          fontSize:13, fontWeight:600, color:COLORS.text,
          fontFamily:"'Plus Jakarta Sans',sans-serif",
        }}>
          {label}
        </label>
      )}
      <div style={{
        display:"flex", alignItems:"center", gap:12,
        background: focused ? "#fff" : COLORS.bg,
        border:`1.5px solid ${error ? COLORS.error : focused ? COLORS.primary : COLORS.border}`,
        borderRadius:12, padding:"13px 16px",
        transition:"all 0.2s",
        boxShadow: focused ? `0 0 0 3px ${COLORS.primary}18` : "none",
      }}>
        <span style={{ fontSize:18, opacity:0.6 }}>🔒</span>
        <input
          type={showPassword ? "text" : "password"}
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
        <button
          type="button"
          onClick={onToggleShow}
          style={{
            background:"none", border:"none",
            cursor:"pointer", fontSize:16,
            color:COLORS.muted, padding:0, flexShrink:0,
          }}
        >
          {showPassword ? "🙈" : "👁"}
        </button>
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
 * Indicateur visuel de force du mot de passe
 * @param {string} password - Le mot de passe à évaluer
 */
function PasswordStrengthMeter({ password }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const { label, color, bars } = PASSWORD_STRENGTH[strength];

  if (!password) return null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {/* Barres de force */}
      <div style={{ display:"flex", gap:6 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex:1, height:4, borderRadius:2,
            background: bars >= i ? color : COLORS.border,
            transition:"all 0.3s",
          }} />
        ))}
      </div>
      {/* Label */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{
          color, fontSize:12, fontWeight:600,
          fontFamily:"'Plus Jakarta Sans',sans-serif",
        }}>
          {label}
        </span>
        {strength < 3 && (
          <span style={{ color:COLORS.muted, fontSize:11,
            fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            {strength === 1 && "Ajoutez des majuscules et chiffres"}
            {strength === 2 && "Ajoutez un caractère spécial (!@#$)"}
          </span>
        )}
      </div>
      {/* Message contient symboles et casse mixte */}
      {strength >= 2 && (
        <p style={{ color:COLORS.success, fontSize:11, margin:0,
          fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          ✅ {strength === 2
            ? "Mot de passe correct. Ajoutez un caractère spécial pour plus de sécurité."
            : "Mot de passe fort. Contient symboles et casse mixte."}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Page Inscription Étape 2 — Sécurité du compte
 * Route : /signup/step2
 * @param {object} step1Data - Données de l'étape 1 (nom, email)
 * @param {function} onBack - Retour à l'étape 1
 */
export default function SignUpStep2({ step1Data, onBack }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Récupérer les données étape 1 (via props ou navigation state)
  const userData = step1Data || location.state || {};

  // ── State ──────────────────────────────────────────────
  const [form, setForm]       = useState({ password: "", confirm: "" });
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Computed ───────────────────────────────────────────
  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  // ── Handlers ───────────────────────────────────────────

  const handleChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError("");
  }, [errors]);

  /** Validation de l'étape 2 */
  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.password)                newErrors.password = "Le mot de passe est requis";
    else if (form.password.length < 8) newErrors.password = "Minimum 8 caractères";
    else if (passwordStrength < 1)     newErrors.password = "Mot de passe trop faible";

    if (!form.confirm)                 newErrors.confirm = "Veuillez confirmer votre mot de passe";
    else if (form.password !== form.confirm) newErrors.confirm = "Les mots de passe ne correspondent pas";

    return newErrors;
  }, [form, passwordStrength]);

  /** Soumission finale et création du compte */
const handleSubmit = useCallback(async () => {
  const newErrors = validate();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setLoading(true);
  setApiError("");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: userData.fullName,
        email: userData.email,
        password: form.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Erreur lors de l'inscription");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1200);
  } catch (err) {
    setApiError(err.message || "Erreur serveur. Réessayez.");
  } finally {
    setLoading(false);
  }
}, [form, validate, userData, navigate]);

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
        {/* Indicateur étapes */}
        <StepIndicator currentStep={2} />

        {/* En-tête */}
        <div style={{ marginBottom:28 }}>
          <p style={{ color:COLORS.primary, fontSize:12, fontWeight:700,
            letterSpacing:"0.1em", textTransform:"uppercase",
            margin:"0 0 8px" }}>
            ÉTAPE 2 DE 2
          </p>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800,
            color:COLORS.text, margin:"0 0 8px" }}>
            Définir votre mot de passe
          </h2>
          <p style={{ color:COLORS.muted, fontSize:14, margin:0 }}>
            Créez un mot de passe fort pour protéger votre compte.
          </p>
        </div>

        {/* Résumé étape 1 */}
        {userData.email && (
          <div style={{
            background:COLORS.bg, border:`1px solid ${COLORS.border}`,
            borderRadius:10, padding:"10px 16px",
            display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:24,
          }}>
            <div>
              <p style={{ fontSize:12, color:COLORS.muted, margin:"0 0 2px" }}>Compte pour :</p>
              <p style={{ fontSize:13, fontWeight:600, color:COLORS.text, margin:0 }}>
                {userData.fullName} — {userData.email}
              </p>
            </div>
            <button
              onClick={onBack || (() => navigate("/signup"))}
              style={{ background:"none", border:"none",
                color:COLORS.primary, fontSize:12, fontWeight:600,
                cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
            >
              Modifier
            </button>
          </div>
        )}

        {/* Succès */}
        {success && (
          <div style={{
            background:"#DCFCE7", border:"1.5px solid #86EFAC",
            borderRadius:12, padding:"14px 18px",
            color:COLORS.success, fontSize:14, fontWeight:600,
            marginBottom:20, textAlign:"center",
          }}>
            🎉 Compte créé avec succès ! Redirection...
          </div>
        )}

        {/* Erreur API */}
        {apiError && (
          <div style={{
            background:"#FEF2F2", border:"1.5px solid #FCA5A5",
            borderRadius:12, padding:"12px 16px",
            color:COLORS.error, fontSize:13, marginBottom:20,
          }}>
            ❌ {apiError}
          </div>
        )}

        {/* Champs */}
        <div style={{ display:"flex", flexDirection:"column", gap:20, marginBottom:24 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <PasswordField
              label="Mot de passe"
              placeholder="Créez un mot de passe fort"
              value={form.password}
              onChange={handleChange("password")}
              error={errors.password}
              showPassword={showPass}
              onToggleShow={() => setShowPass(v => !v)}
            />
            {/* Indicateur de force */}
            <PasswordStrengthMeter password={form.password} />
          </div>

          <PasswordField
            label="Confirmer le mot de passe"
            placeholder="Répétez votre mot de passe"
            value={form.confirm}
            onChange={handleChange("confirm")}
            error={errors.confirm}
            showPassword={showConfirm}
            onToggleShow={() => setShowConfirm(v => !v)}
          />

          {/* Correspondance en temps réel */}
          {form.confirm && form.password && (
            <p style={{
              fontSize:12, margin:0, paddingLeft:4,
              color: form.password === form.confirm ? COLORS.success : COLORS.error,
              fontFamily:"'Plus Jakarta Sans',sans-serif",
            }}>
              {form.password === form.confirm
                ? "✅ Les mots de passe correspondent"
                : "❌ Les mots de passe ne correspondent pas"}
            </p>
          )}
        </div>

        {/* Boutons */}
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          <button
            onClick={onBack || (() => navigate("/signup"))}
            style={{
              background:"transparent",
              border:`1.5px solid ${COLORS.border}`,
              color:COLORS.muted, borderRadius:12,
              padding:"14px 20px", fontSize:14,
              cursor:"pointer", fontWeight:600,
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              transition:"all 0.2s",
            }}
          >
            ← Retour
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || success}
            style={{
              flex:1,
              background: loading || success ? COLORS.border : COLORS.gradient,
              border:"none", color: loading || success ? COLORS.muted : "#fff",
              borderRadius:12, padding:"14px",
              fontSize:15, fontWeight:700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"'Syne',sans-serif",
              boxShadow: loading ? "none" : "0 4px 20px rgba(200,24,122,0.3)",
              transition:"all 0.2s",
            }}
          >
            {loading ? "⏳ Création du compte..." : "🎉 Créer mon compte →"}
          </button>
        </div>

        {/* Liens légaux */}
        <p style={{ textAlign:"center", color:COLORS.muted, fontSize:11,
          margin:0, lineHeight:1.6 }}>
          En créant un compte, vous acceptez nos{" "}
          <span style={{ color:COLORS.primary, cursor:"pointer" }}>Conditions d'utilisation</span>
          {" "}et notre{" "}
          <span style={{ color:COLORS.primary, cursor:"pointer" }}>Politique de confidentialité</span>
        </p>
      </div>
    </div>
  );
}