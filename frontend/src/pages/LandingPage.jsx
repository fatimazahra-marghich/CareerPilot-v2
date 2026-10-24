/**
 * @file LandingPage.jsx
 * @description Page d'accueil CareerPilot
 * @author Fatima Zahra MARGHICH
 * @version 3.0.0
 */

import { useState, useEffect, useRef } from "react";

// ─── Couleurs ─────────────────────────────────────────────
const C = {
  primary:       "#C8187A",
  secondary:     "#7B2FF7",
  gradient:      "linear-gradient(135deg, #C8187A 0%, #7B2FF7 100%)",
  gradientLight: "linear-gradient(135deg, #FCE4F3 0%, #EDE4FD 100%)",
  bg:            "#F8F7FF",
  card:          "#FFFFFF",
  border:        "#EDE8FB",
  text:          "#1A1035",
  muted:         "#8B7AA8",
};

// ─── Données ──────────────────────────────────────────────
const STATS = [
  { value: "500+", label: "CVs Analysés",     color: C.primary   },
  { value: "98%",  label: "Satisfaction",     color: C.secondary },
  { value: "5",    label: "Sec d'Analyse",    color: C.primary   },
  { value: "3x",   label: "Plus de Réponses", color: C.secondary },
];

const FEATURES = [
  { icon: "📄", title: "Analyse ATS",     desc: "Passez les filtres automatiques grâce à notre analyse sémantique ultra-précise.",          color: C.primary   },
  { icon: "🎯", title: "Job Matching",    desc: "L'IA identifie les offres qui correspondent parfaitement à vos compétences.",              color: C.secondary },
  { icon: "✨", title: "CV Optimisé",     desc: "Recevez des suggestions de rédaction en temps réel pour rendre votre CV irrésistible.",    color: C.primary   },
  { icon: "🎤", title: "Entretien Vocal", desc: "Entraînez-vous avec Whisper. Notre IA analyse votre ton et la pertinence des réponses.",   color: C.secondary },
  { icon: "🧠", title: "Soft Skills",     desc: "Mettez en avant vos qualités humaines grâce à des tests pilotés par l'IA.",                color: C.primary   },
  { icon: "📊", title: "Dashboard",       desc: "Suivez vos candidatures et vos progrès sur une interface fluide et intuitive.",             color: C.secondary },
];

const STEPS = [
  {
    number: "1", title: "Upload",     desc: "Déposez votre CV au format PDF ou Word.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  },
  {
    number: "2", title: "Analyse IA", desc: "L'algorithme examine chaque section en moins de 5 sec.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  },
  {
    number: "3", title: "Questions",  desc: "Simulez un entretien vocal personnalisé.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  },
  {
    number: "4", title: "Feedback",   desc: "Recevez un rapport complet d'optimisation.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
];

const TESTIMONIALS = [
  { name: "Thomas D.", role: "Développeur Fullstack", initiale: "T", color: C.primary,   text: "Grâce à l'analyse ATS, j'ai enfin eu des retours de grandes entreprises. L'optimisation a fait toute la différence." },
  { name: "Sarah L.",  role: "Product Manager",       initiale: "S", color: C.secondary, text: "Le simulateur d'entretien vocal est bluffant. J'ai pu m'entraîner à répondre aux questions difficiles sereinement." },
  { name: "Marc A.",   role: "Data Analyst",          initiale: "M", color: C.primary,   text: "Une plateforme fluide qui m'a aidé à restructurer complètement mon CV pour valoriser mes soft skills." },
];

// ─── Hook useInView ───────────────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.2, ...options });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ─── Hook useCounter ──────────────────────────────────────
function useCounter(target, trigger, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [trigger, target, duration]);
  return count;
}

// ─── Navbar ───────────────────────────────────────────────
function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [active,   setActive]   = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      for (const id of ["features", "how-it-works", "testimonials"]) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 100 && r.bottom >= 100) { setActive(id); return; }
        }
      }
      setActive("");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const LINKS = [
    { label: "Fonctionnalités",   id: "features"     },
    { label: "Comment ça marche", id: "how-it-works" },
    { label: "Témoignages",       id: "testimonials" },
  ];

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100, height:68,
      background: scrolled ? "rgba(248,247,255,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 48px", transition:"all 0.3s",
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
        onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}>
        <div style={{
          width:36, height:36, borderRadius:10, background:C.gradient,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif",
          boxShadow:"0 4px 12px rgba(200,24,122,0.3)",
        }}>C</div>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:C.text }}>
          Career<span style={{ color:C.primary }}>Pilot</span>
        </span>
      </div>

      {/* Liens actifs */}
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {LINKS.map(({ label, id }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background: isActive ? C.gradientLight : "transparent",
              border:"none", color: isActive ? C.primary : C.muted,
              fontSize:14, fontWeight: isActive ? 700 : 500,
              padding:"8px 14px", borderRadius:8, cursor:"pointer",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              transition:"all 0.2s", position:"relative",
            }}>
              {label}
              {isActive && (
                <span style={{
                  position:"absolute", bottom:2, left:"50%",
                  transform:"translateX(-50%)",
                  width:4, height:4, borderRadius:"50%",
                  background:C.primary, display:"block",
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Boutons */}
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <button onClick={onLogin} style={{
          background:"transparent", border:"none", color:C.text,
          fontSize:14, fontWeight:600, padding:"9px 18px", borderRadius:10,
          cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = C.primary}
        onMouseLeave={e => e.currentTarget.style.color = C.text}>
          Se connecter
        </button>
        <button onClick={onSignup} style={{
          background:C.gradient, border:"none", color:"#fff",
          fontSize:14, fontWeight:700, padding:"10px 22px", borderRadius:10,
          cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif",
          boxShadow:"0 4px 16px rgba(200,24,122,0.3)", transition:"all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          Essayer gratuit →
        </button>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────
function HeroSection({ onSignup }) {
  return (
    <section style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"120px 48px 80px", textAlign:"center",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:"10%", left:"5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(200,24,122,0.1),transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"10%", right:"5%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(123,47,247,0.1),transparent 70%)", pointerEvents:"none" }} />

      <div style={{
        display:"inline-flex", alignItems:"center", gap:8,
        background:C.gradientLight, border:`1px solid ${C.border}`,
        borderRadius:50, padding:"8px 20px", fontSize:13,
        color:C.primary, fontWeight:600, marginBottom:32,
        fontFamily:"'Plus Jakarta Sans',sans-serif", animation:"fadeInDown 0.6s both",
      }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:C.primary, display:"inline-block", animation:"pulse 2s infinite" }} />
        🚀 Propulsé par Groq AI + Whisper
      </div>

      <h1 style={{
        fontFamily:"'Syne',sans-serif", fontSize:"clamp(38px,6vw,72px)",
        fontWeight:800, lineHeight:1.08, letterSpacing:"-0.03em",
        margin:"0 0 24px", animation:"fadeInDown 0.6s 0.1s both",
      }}>
        <span style={{ color:C.text }}>Optimise ton CV.</span><br />
        <span style={{ background:C.gradient, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          Décroche ton emploi.
        </span>
      </h1>

      <p style={{
        fontSize:18, color:C.muted, maxWidth:560, lineHeight:1.8,
        margin:"0 auto 48px", fontFamily:"'Plus Jakarta Sans',sans-serif",
        animation:"fadeInDown 0.6s 0.2s both",
      }}>
        Utilisez l'intelligence artificielle pour transformer votre parcours professionnel.
        Analyse en temps réel, coaching vocal et matching intelligent.
      </p>

      <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", animation:"fadeInDown 0.6s 0.3s both" }}>
        <button onClick={onSignup} style={{
          background:C.gradient, border:"none", color:"#fff",
          fontSize:16, fontWeight:700, padding:"16px 36px", borderRadius:14,
          cursor:"pointer", fontFamily:"'Syne',sans-serif",
          boxShadow:"0 8px 32px rgba(200,24,122,0.35)", transition:"all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(200,24,122,0.45)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(200,24,122,0.35)"; }}>
          Commencer gratuitement →
        </button>
        <button style={{
          background:C.card, border:`1.5px solid ${C.border}`, color:C.text,
          fontSize:15, fontWeight:600, padding:"16px 32px", borderRadius:14,
          cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
          ▶ Voir la démo
        </button>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:48, animation:"fadeInDown 0.6s 0.4s both" }}>
        <div style={{ display:"flex" }}>
          {["T","S","M","A"].map((l,i) => (
            <div key={i} style={{
              width:38, height:38, borderRadius:"50%",
              background: i%2===0 ? C.gradient : "linear-gradient(135deg,#7B2FF7,#C8187A)",
              border:"2.5px solid #fff", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff",
              marginLeft: i===0 ? 0 : -12, fontFamily:"'Syne',sans-serif",
              boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
            }}>{l}</div>
          ))}
        </div>
        <p style={{ fontSize:14, color:C.muted, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          <strong style={{ color:C.text }}>10 000+</strong> professionnels nous font confiance
        </p>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────
function StatCard({ value, label, color }) {
  const [ref, inView] = useInView({ threshold: 0.5 });
  const num   = parseInt(value.replace(/\D/g, "")) || 0;
  const count = useCounter(num, inView);
  const display = value.includes("+") ? `${count}+`
    : value.includes("%") ? `${count}%`
    : value.includes("x") ? `${count}x`
    : `${count}`;

  return (
    <div ref={ref} style={{ textAlign:"center" }}>
      <div style={{
        fontFamily:"'Syne',sans-serif", fontSize:48, fontWeight:800,
        color, lineHeight:1, marginBottom:8,
        opacity: inView ? 1 : 0, transform: inView ? "scale(1)" : "scale(0.8)",
        transition:"all 0.5s ease",
      }}>{display}</div>
      <div style={{
        fontSize:14, color:C.muted, fontFamily:"'Plus Jakarta Sans',sans-serif",
        opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(10px)",
        transition:"all 0.5s ease 0.2s",
      }}>{label}</div>
    </div>
  );
}

function StatsSection() {
  return (
    <section style={{
      background:C.card, borderTop:`1px solid ${C.border}`,
      borderBottom:`1px solid ${C.border}`, padding:"56px 48px",
    }}>
      <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:32 }}>
        {STATS.map((s,i) => <StatCard key={i} {...s} />)}
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, index }) {
  const [hovered, setHovered] = useState(false);
  const [ref, inView]         = useInView({ threshold: 0.15 });
  const delay                 = (index % 3) * 150;

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:C.card, border:`1.5px solid ${hovered ? color+"60" : C.border}`,
        borderRadius:20, padding:"28px 24px",
        display:"flex", flexDirection:"column", gap:14, cursor:"default",
        opacity: inView ? 1 : 0,
        transform: inView ? (hovered ? "translateY(-4px)" : "translateY(0)") : "translateY(40px)",
        transition:`opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, border-color 0.25s, box-shadow 0.25s`,
        boxShadow: hovered ? `0 16px 40px ${color}20` : "0 2px 8px rgba(0,0,0,0.04)",
      }}>
      <div style={{
        width:52, height:52, borderRadius:14,
        background: hovered ? `${color}20` : C.gradientLight,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:26, transition:"background 0.25s",
      }}>{icon}</div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:C.text, margin:0 }}>{title}</h3>
      <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{desc}</p>
    </div>
  );
}

function FeaturesSection() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <section id="features" style={{ padding:"100px 48px", background:C.bg }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div ref={ref} style={{
          textAlign:"center", marginBottom:60,
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
          transition:"all 0.7s ease",
        }}>
          <div style={{
            display:"inline-block", background:C.gradientLight, border:`1px solid ${C.border}`,
            borderRadius:50, padding:"6px 18px", fontSize:12, color:C.primary,
            fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
            marginBottom:16, fontFamily:"'Plus Jakarta Sans',sans-serif",
          }}>Fonctionnalités avancées</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:800, color:C.text, margin:0, letterSpacing:"-0.02em" }}>
            Tout ce dont vous avez besoin
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {FEATURES.map((f,i) => <FeatureCard key={i} {...f} index={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────
function AnimatedStep({ step, index }) {
  const [ref, inView]         = useInView();
  const [hovered, setHovered] = useState(false);
  const delay                 = index * 180;

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        textAlign:"center", gap:16, position:"relative", zIndex:1, cursor:"default",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(40px) scale(0.9)",
        transition:`opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}>
      <div style={{
        width: hovered ? 64 : 56, height: hovered ? 64 : 56,
        borderRadius:"50%", background:C.gradient,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: hovered ? 24 : 20, fontWeight:800, color:"#fff",
        fontFamily:"'Syne',sans-serif",
        boxShadow: hovered ? "0 12px 32px rgba(200,24,122,0.5)" : "0 8px 24px rgba(200,24,122,0.3)",
        border:`3px solid ${C.card}`,
        transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>{step.number}</div>

      <div style={{
        color:C.primary, opacity: hovered ? 1 : 0,
        transform: hovered ? "scale(1) translateY(0)" : "scale(0.5) translateY(10px)",
        transition:"all 0.3s ease", height: hovered ? 36 : 0, overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>{step.icon}</div>

      <h3 style={{
        fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700,
        color: hovered ? C.primary : C.text, margin:0, transition:"color 0.3s",
      }}>{step.title}</h3>

      <p style={{ fontSize:13, color:C.muted, lineHeight:1.7, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        {step.desc}
      </p>

      {hovered && (
        <div style={{
          background:C.gradientLight, borderRadius:10, padding:"8px 12px",
          fontSize:12, color:C.primary, fontWeight:600,
          fontFamily:"'Plus Jakarta Sans',sans-serif", animation:"fadeInUp 0.3s ease",
        }}>
          {index===0 && "✅ PDF, DOCX — Max 5MB"}
          {index===1 && "✅ Analyse en ~5 secondes"}
          {index===2 && "✅ Propulsé par Groq AI"}
          {index===3 && "✅ Rapport PDF téléchargeable"}
        </div>
      )}
    </div>
  );
}

function HowItWorksSection() {
  const [titleRef, titleInView] = useInView({ threshold: 0.4 });
  const [lineRef,  lineInView]  = useInView({ threshold: 0.3 });

  return (
    <section id="how-it-works" style={{ padding:"100px 48px", background:C.card, overflow:"hidden" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div ref={titleRef} style={{
          textAlign:"center", marginBottom:64,
          opacity: titleInView ? 1 : 0, transform: titleInView ? "translateY(0)" : "translateY(30px)",
          transition:"all 0.7s ease",
        }}>
          <div style={{
            display:"inline-block", background:C.gradientLight, border:`1px solid ${C.border}`,
            borderRadius:50, padding:"6px 18px", fontSize:12, color:C.secondary,
            fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
            marginBottom:16, fontFamily:"'Plus Jakarta Sans',sans-serif",
          }}>Comment ça marche ?</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:800, color:C.text, margin:0, letterSpacing:"-0.02em" }}>
            Une méthode simple et efficace en 4 étapes
          </h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, position:"relative" }}>
          <div ref={lineRef} style={{
            position:"absolute", top:28, left:"12.5%", right:"12.5%", height:2,
            background:`linear-gradient(90deg,${C.primary},${C.secondary})`,
            transformOrigin:"left",
            transform: lineInView ? "scaleX(1)" : "scaleX(0)",
            transition:"transform 1s ease 0.3s", zIndex:0,
          }} />
          {STEPS.map((step,i) => <AnimatedStep key={i} step={step} index={i} />)}
        </div>
      </div>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────
function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const [titleRef, titleInView] = useInView({ threshold: 0.3 });

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(c => (c+1) % TESTIMONIALS.length), 3500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section id="testimonials" style={{ padding:"100px 48px", background:C.bg }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div ref={titleRef} style={{
          textAlign:"center", marginBottom:60,
          opacity: titleInView ? 1 : 0, transform: titleInView ? "translateY(0)" : "translateY(30px)",
          transition:"all 0.7s ease",
        }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:800, color:C.text, margin:"0 0 12px", letterSpacing:"-0.02em" }}>
            Ils ont trouvé leur job de rêve
          </h2>
          <p style={{ color:C.muted, fontSize:16, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            Des milliers de professionnels nous font confiance
          </p>
        </div>

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {TESTIMONIALS.map((t,i) => {
              const isActive = i === current;
              return (
                <div key={i} onClick={() => setCurrent(i)} style={{
                  cursor:"pointer",
                  transition:"transform 0.4s ease, opacity 0.4s ease",
                  transform: isActive ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                  opacity: isActive ? 1 : 0.65,
                }}>
                  <div style={{
                    background:C.card,
                    border:`1.5px solid ${isActive ? t.color+"50" : C.border}`,
                    borderLeft: isActive ? `4px solid ${t.color}` : `1.5px solid ${C.border}`,
                    borderRadius:20, padding:"28px 24px",
                    display:"flex", flexDirection:"column", gap:20,
                    boxShadow: isActive ? `0 20px 50px ${t.color}20` : "0 2px 12px rgba(0,0,0,0.04)",
                    transition:"all 0.4s ease",
                  }}>
                    <div style={{ display:"flex", gap:4 }}>
                      {[...Array(5)].map((_,j) => (
                        <span key={j} style={{ color: isActive ? "#FCD34D" : "#D1C4E9", fontSize:16, transition:"color 0.4s" }}>★</span>
                      ))}
                    </div>
                    <p style={{
                      fontSize:14, color:C.text, lineHeight:1.8, margin:0, flex:1,
                      fontFamily:"'Plus Jakarta Sans',sans-serif", fontStyle:"italic",
                      opacity: isActive ? 1 : 0.7, transition:"opacity 0.4s",
                    }}>"{t.text}"</p>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{
                        width:44, height:44, borderRadius:"50%",
                        background:`linear-gradient(135deg,${t.color},${t.color}90)`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:16, fontWeight:800, color:"#fff",
                        fontFamily:"'Syne',sans-serif", flexShrink:0,
                      }}>{t.initiale}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:C.text, fontFamily:"'Syne',sans-serif" }}>{t.name}</div>
                        <div style={{ fontSize:12, color:C.muted, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:8, marginTop:36 }}>
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i===current ? 28 : 8, height:8, borderRadius:4,
                background: i===current ? C.primary : C.border,
                border:"none", cursor:"pointer", padding:0,
                transition:"all 0.35s ease",
                boxShadow: i===current ? "0 2px 8px rgba(200,24,122,0.4)" : "none",
              }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────
function CTASection({ onSignup }) {
  return (
    <section style={{ padding:"80px 48px 60px", background:C.card }}>
      <div style={{
        maxWidth:720, margin:"0 auto", background:C.gradient,
        borderRadius:28, padding:"64px 48px", textAlign:"center",
        position:"relative", overflow:"hidden",
        boxShadow:"0 24px 64px rgba(200,24,122,0.25)",
      }}>
        <div style={{ position:"absolute", top:"-60px", right:"-60px", width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-40px", left:"-40px", width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }} />
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800, color:"#fff", margin:"0 0 16px", letterSpacing:"-0.02em", position:"relative", zIndex:1 }}>
          Prêt à booster votre carrière ?
        </h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.85)", margin:"0 0 36px", lineHeight:1.7, fontFamily:"'Plus Jakarta Sans',sans-serif", position:"relative", zIndex:1 }}>
          Rejoignez des milliers de professionnels qui utilisent l'IA pour se démarquer.
        </p>
        <button onClick={onSignup} style={{
          background:"#fff", border:"none", color:C.primary,
          fontSize:16, fontWeight:800, padding:"16px 40px", borderRadius:14,
          cursor:"pointer", fontFamily:"'Syne',sans-serif",
          boxShadow:"0 8px 24px rgba(0,0,0,0.15)", transition:"all 0.2s", position:"relative", zIndex:1,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.15)"; }}>
          Commencer mon analyse gratuite →
        </button>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", margin:"16px 0 0", fontFamily:"'Plus Jakarta Sans',sans-serif", position:"relative", zIndex:1 }}>
          Aucune carte bancaire requise · 100% gratuit pour les étudiants
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background:C.text, padding:"40px 48px", margin:0,
      display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:C.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>C</div>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#fff" }}>
          Career<span style={{ color:C.primary }}>Pilot</span> AI
        </span>
      </div>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        © 2025 CareerPilot · PFA ENIAD Berkane · Génie Informatique
      </p>
      <div style={{ display:"flex", gap:24 }}>
        {["Privacy Policy","Terms of Service","Contact Support"].map(l => (
          <span key={l} style={{ fontSize:13, color:"rgba(255,255,255,0.4)", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
            {l}
          </span>
        ))}
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function LandingPage() {
  const handleLogin  = () => window.location.href = "/login";
  const handleSignup = () => window.location.href = "/signup";

  return (
    <div style={{ background:C.bg, fontFamily:"'Plus Jakarta Sans',sans-serif", overflowX:"hidden", width:"100%", margin:0, padding:0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { margin:0 !important; padding:0 !important; width:100%; overflow-x:hidden; scroll-behavior:smooth; }
        #root { margin:0; padding:0; width:100%; }
        @keyframes fadeInDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#F8F7FF}
        ::-webkit-scrollbar-thumb{background:#EDE8FB;border-radius:3px}
      `}</style>

      <Navbar       onLogin={handleLogin}   onSignup={handleSignup} />
      <HeroSection  onSignup={handleSignup} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection   onSignup={handleSignup} />
      <Footer />
    </div>
  );
}