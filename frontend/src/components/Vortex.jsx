/**
 * @file Vortex.jsx
 * @description Animation particules Vortex — version corrigée
 * @author Fatima Zahra MARGHICH
 */

import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export function Vortex({
  children,
  backgroundColor = "#1A1035",
  baseHue         = 300,
  particleCount   = 500,
  rangeY          = 200,
  baseSpeed       = 0.2,
  rangeSpeed      = 1.5,
  style           = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // ── Dimensions ──────────────────────────────────────
    const setSize = () => {
      canvas.width  = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || window.innerWidth / 2;
      canvas.height = canvas.offsetHeight || canvas.parentElement?.offsetHeight || window.innerHeight;
    };

    // Attendre que le DOM soit prêt
    setTimeout(setSize, 50);

    // ── Config ───────────────────────────────────────────
    const PROPS   = 9;
    const total   = particleCount * PROPS;
    const noise3D = createNoise3D();
    const TAU     = 2 * Math.PI;
    let   tick    = 0;
    let   rafId   = null;
    let   props   = new Float32Array(total);

    const rand      = n => n * Math.random();
    const randRange = n => n - rand(2 * n);
    const fadeInOut = (t, m) => {
      const hm = 0.5 * m;
      return Math.abs(((t + hm) % m) - hm) / hm;
    };
    const lerp = (a, b, t) => (1 - t) * a + t * b;

    // ── Init une particule ───────────────────────────────
    const initP = (i) => {
      const cx = 0.5 * canvas.width;
      const cy = 0.5 * canvas.height;
      props.set([
        rand(canvas.width),          // x
        cy + randRange(rangeY),      // y
        0, 0,                        // vx, vy
        0,                           // life
        50 + rand(150),              // ttl
        baseSpeed + rand(rangeSpeed),// speed
        1 + rand(2),                 // radius
        baseHue + rand(100),         // hue
      ], i);
    };

    // ── Init toutes les particules ───────────────────────
    const initAll = () => {
      props = new Float32Array(total);
      for (let i = 0; i < total; i += PROPS) initP(i);
    };

    // ── Boucle de rendu ──────────────────────────────────
    const draw = () => {
      tick++;

      // Fond
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particules
      for (let i = 0; i < total; i += PROPS) {
        const x   = props[i];
        const y   = props[i+1];
        const n   = noise3D(x * 0.00125, y * 0.00125, tick * 0.0005) * 3 * TAU;
        const vx  = lerp(props[i+2], Math.cos(n), 0.5);
        const vy  = lerp(props[i+3], Math.sin(n), 0.5);
        const lt  = props[i+4];
        const ttl = props[i+5];
        const spd = props[i+6];
        const r   = props[i+7];
        const hue = props[i+8];
        const x2  = x + vx * spd;
        const y2  = y + vy * spd;
        const a   = fadeInOut(lt, ttl);

        // Dessiner la particule
        ctx.save();
        ctx.lineCap     = "round";
        ctx.lineWidth   = r;
        ctx.strokeStyle = `hsla(${hue},100%,60%,${a})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();

        // Update
        props[i]   = x2;
        props[i+1] = y2;
        props[i+2] = vx;
        props[i+3] = vy;
        props[i+4] = lt + 1;

        // Réinitialiser si hors limites ou mort
        const oob = x2 < 0 || x2 > canvas.width || y2 < 0 || y2 > canvas.height;
        if (oob || lt > ttl) initP(i);
      }

      // Glow effect
      ctx.save();
      ctx.filter = "blur(8px) brightness(200%)";
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.filter = "blur(4px) brightness(200%)";
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    };

    // ── Démarrage ────────────────────────────────────────
    initAll();
    rafId = requestAnimationFrame(draw);

    // ── Resize ───────────────────────────────────────────
    const onResize = () => {
      setSize();
      initAll();
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ──────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      minHeight: "100vh",
      overflow: "hidden",
      ...style,
    }}>
      {/* Canvas plein écran */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* Contenu par-dessus */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        height: "100%",
        minHeight: "100vh",
      }}>
        {children}
      </div>
    </div>
  );
}

export default Vortex;