import React, { useState, useEffect, useRef } from "react";
import Sidebar, { C, Icons } from "./Sidebar";
import { useAppSettings } from "../context/AppSettingsContext";

export default function Entretien() {
  const { theme } = useAppSettings();
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [started, setStarted] = useState(false);
  const [interim, setInterim] = useState("");
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState(false);
  const [voiceError, setVoiceError] = useState(false);
  
  const socket = useRef(null);
  const recognition = useRef(null);
  const chatEndRef = useRef(null);
  const isSpeaking = useRef(false);
  const finishedRef = useRef(false);
  const pendingReport = useRef(null);
  const answerBuffer = useRef("");     // ce que le candidat a dit pendant sa réponse
  const silenceTimer = useRef(null);   // minuteur : réponse envoyée après un silence
  const SILENCE_MS = 3000;             // 3 secondes de silence = réponse terminée

  // Envoie la réponse complète à Alex (appelée après le silence ou par le bouton)
  const flushAnswer = () => {
    clearTimeout(silenceTimer.current);
    const text = answerBuffer.current.trim();
    answerBuffer.current = "";
    setInterim("");
    if (text) sendToAlex(text);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interim, report]);

  useEffect(() => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return;

    recognition.current = new Speech();
    recognition.current.lang = "fr-FR";
    recognition.current.continuous = true; 
    recognition.current.interimResults = true;

    recognition.current.onstart = () => setIsListening(true);
    recognition.current.onend = () => {
      setIsListening(false);
      if (started && !isSpeaking.current && !finishedRef.current) {
        try { recognition.current.start(); } catch(e) {}
      }
    };

    recognition.current.onresult = (e) => {
      if (isSpeaking.current) return;
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const part = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          if (part.trim()) answerBuffer.current += part.trim() + " ";
        } else {
          interimText += part;
        }
      }

      const shown = (answerBuffer.current + interimText).trim();
      setInterim(shown);

      // Tant que le candidat parle, on repousse l'envoi.
      clearTimeout(silenceTimer.current);
      if (shown) silenceTimer.current = setTimeout(flushAnswer, SILENCE_MS);
    };
  }, [started]);

  // Appelée quand Alex a fini de parler (voix serveur ou voix du navigateur)
  const finishSpeaking = () => {
    isSpeaking.current = false;
    if (pendingReport.current) {
      const r = pendingReport.current;
      pendingReport.current = null;
      if (r.report) setReport(r.report);
      else setReportError(true);
    }
    if (!finishedRef.current) {
      try { recognition.current.start(); } catch(e) {}
    }
  };

  // Voix de secours : synthèse vocale du navigateur (si la voix du serveur échoue)
  const speakWithBrowser = (fullText) => {
    const id = Date.now() + Math.random();
    const words = fullText.split(" ");
    setMessages(prev => [...prev, { id, role: "ai", text: "" }]);

    const showFull = () => setMessages(prev => prev.map(m => m.id === id ? { ...m, text: fullText } : m));

    if (!window.speechSynthesis) {
      showFull();
      return;
    }

    isSpeaking.current = true;
    clearTimeout(silenceTimer.current);
    answerBuffer.current = "";
    setInterim("");
    try { recognition.current.stop(); } catch(e) {}

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = "fr-FR";
    const frVoice = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;

    let timer = null;
    utterance.onstart = () => {
      let n = 0;
      timer = setInterval(() => {
        n += 1;
        const shown = words.slice(0, n).join(" ");
        setMessages(prev => prev.map(m => m.id === id ? { ...m, text: shown } : m));
        if (n >= words.length) clearInterval(timer);
      }, 330);
    };
    const done = () => {
      clearInterval(timer);
      showFull();
      finishSpeaking();
    };
    utterance.onend = done;
    utterance.onerror = done;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    setStarted(true);
    socket.current = new WebSocket(`ws://localhost:8000/ws/interview/${localStorage.getItem("cv_id") || "18"}/`);
    socket.current.onopen = () => {
      try { recognition.current.start(); } catch(e) {}
    };
    socket.current.onmessage = async (e) => {
      const data = JSON.parse(e.data);

      // Rapport final envoyé par le backend
      if (data.type === "report") {
        finishedRef.current = true;
        setFinished(true);
        if (isSpeaking.current) {
          pendingReport.current = data;   // affiché quand Alex a fini de parler
        } else if (data.report) {
          setReport(data.report);
        } else {
          setReportError(true);
        }
        return;
      }

      // Dernier message d'Alex (conclusion) : le rapport arrive juste après
      if (data.end_of_turn === false) {
        finishedRef.current = true;
        setFinished(true);
        try { recognition.current.stop(); } catch(e) {}
      }

      const fullText = data.text || "";

      // Pas d'audio : on affiche le texte directement.
      if (!data.audio) {
        setVoiceError(true);
        speakWithBrowser(fullText);
        return;
      }

      // Audio : le texte apparaît mot par mot, au rythme de la voix.
      const id = Date.now() + Math.random();
      const words = fullText.split(" ");
      setMessages(prev => [...prev, { id, role: "ai", text: "" }]);

      isSpeaking.current = true;
      clearTimeout(silenceTimer.current);
      answerBuffer.current = "";
      setInterim("");
      try { recognition.current.stop(); } catch(e) {}

      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      let timer = null;

      const showFull = () => {
        clearInterval(timer);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, text: fullText } : m));
      };

      const startReveal = () => {
        const seconds = isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : words.length * 0.35;
        const step = Math.max(60, (seconds * 1000 * 0.9) / words.length);
        let n = 0;
        timer = setInterval(() => {
          n += 1;
          const shown = words.slice(0, n).join(" ");
          setMessages(prev => prev.map(m => m.id === id ? { ...m, text: shown } : m));
          if (n >= words.length) clearInterval(timer);
        }, step);
      };

      audio.onplaying = startReveal;
      audio.onended = () => {
        showFull();
        finishSpeaking();
      };

      try {
        await audio.play();
      } catch (err) {
        // Lecture impossible (navigateur) : on affiche le texte quand même.
        console.error("Lecture audio impossible :", err);
        showFull();
        finishSpeaking();
      }
    };
  };

  const sendToAlex = (text) => {
    if (!finishedRef.current && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ text }));
      setMessages(prev => [...prev, { role: "user", text }]);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar activePage="entretien" />
      
      <main style={{ marginLeft: 240, flex: 1, padding: "32px", display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, margin: 0 }}>
              Entretien <span style={{ color: C.primary }}>IA Temps Réel</span>
            </h1>
            <p style={{ fontSize: 13, color: theme.muted, margin: "4px 0 0" }}>Discutez oralement avec Alex pour préparer votre poste.</p>
          </div>
          {started && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: theme.card, padding: "8px 16px", borderRadius: 12, border: `1px solid ${theme.border}` }}>
              <div className={isListening ? "pulse-green" : "pulse-red"} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
                {finished ? "ENTRETIEN TERMINÉ" : isListening ? "ALEX ÉCOUTE..." : "ALEX RÉPOND..."}
              </span>
            </div>
          )}
        </div>

        {voiceError && (
          <div style={{ marginBottom: 12, padding: "10px 16px", borderRadius: 12, fontSize: 13, background: "#fef3c7", color: "#92400e" }}>
            🔇 La voix du serveur est indisponible : Alex utilise la voix de secours de ton navigateur.
          </div>
        )}

        {/* Chat Area */}
        <div style={{ 
          flex: 1, 
          background: theme.card, 
          borderRadius: 24, 
          padding: 32, 
          overflowY: "auto", 
          position: "relative", 
          border: `1px solid ${theme.border}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column"
        }}>
          {!started ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              <div style={{ fontSize: 60, marginBottom: 20 }}>🎙️</div>
              <h2 style={{ fontFamily: "'Syne'", fontWeight: 800 }}>Prêt pour l'entraînement ?</h2>
              <p style={{ color: theme.muted, maxWidth: 400, marginBottom: 32, fontSize: 15 }}>
                Alex va analyser votre CV et simuler un entretien d'embauche réaliste. Branchez votre micro !
              </p>
              <button onClick={startInterview} className="btn-start">Démarrer l'immersion</button>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} style={{ 
                  marginBottom: 24, 
                  display: "flex", 
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "fadeIn 0.3s ease" 
                }}>
                  <div style={{ 
                    maxWidth: "70%", 
                    padding: "16px 20px", 
                    borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px", 
                    background: msg.role === "user" ? theme.gradient : theme.bg, 
                    color: msg.role === "user" ? "#fff" : theme.text,
                    border: msg.role === "user" ? "none" : `1px solid ${theme.border}`,
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, marginBottom: 4, opacity: 0.6, letterSpacing: 1 }}>
                      {msg.role === "user" ? "VOUS" : "ALEX"}
                    </div>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {interim && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                  <div style={{ padding: "12px 18px", borderRadius: 20, background: "rgba(0,0,0,0.05)", fontSize: 14, fontStyle: "italic", opacity: 0.7 }}>
                    {interim}...
                  </div>
                </div>
              )}
              {finished && !report && !reportError && (
                <div style={{ textAlign: "center", color: theme.muted, fontSize: 14, margin: "16px 0" }}>
                  Génération de votre rapport...
                </div>
              )}

              {reportError && (
                <div style={{ textAlign: "center", color: theme.muted, fontSize: 14, margin: "16px 0" }}>
                  Le rapport n'a pas pu être généré. Réessayez l'entretien plus tard.
                </div>
              )}

              {report && (
                <div style={{ border: `1px solid ${theme.border}`, borderRadius: 20, padding: 24, marginTop: 8, background: theme.bg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
                    <div style={{
                      width: 84, height: 84, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#fff",
                      background: report.score >= 70 ? "#10b981" : report.score >= 40 ? "#f59e0b" : "#ef4444"
                    }}>
                      {report.score}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>
                        Rapport d'entretien
                      </div>
                      <div style={{ fontSize: 13, color: theme.muted }}>Score sur 100</div>
                    </div>
                  </div>

                  {report.resume && (
                    <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>{report.resume}</p>
                  )}

                  {[
                    ["Points forts", report.points_forts],
                    ["Points à améliorer", report.points_a_ameliorer],
                    ["Conseils", report.conseils],
                  ].map(([title, items]) =>
                    Array.isArray(items) && items.length > 0 ? (
                      <div key={title} style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>{title}</div>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
                          {items.map((it, k) => <li key={k}>{it}</li>)}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {started && !finished && interim && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <button onClick={flushAnswer} className="btn-start" style={{ padding: "10px 24px", fontSize: 14 }}>
              J'ai terminé ma réponse
            </button>
          </div>
        )}

        {/* Footer Voice Animation */}
        {started && (
          <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
             {[1,2,3,4,5,6,7,8].map(i => (
               <div key={i} className={isListening ? "wave-bar listening" : "wave-bar speaking"} style={{ animationDelay: `${i * 0.1}s` }} />
             ))}
          </div>
        )}

      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .btn-start { 
          padding: 16px 40px; 
          border-radius: 16px; 
          background: ${theme.gradient}; 
          color: white; 
          border: none; 
          font-weight: 800; 
          cursor: pointer; 
          font-size: 1rem; 
          font-family: 'Syne';
          transition: transform 0.2s;
        }
        .btn-start:hover { transform: scale(1.05); }

        .pulse-green { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 4px #10b98133; animation: pulse 1.5s infinite; }
        .pulse-red { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 0 4px #ef444433; }

        @keyframes pulse { 0% { box-shadow: 0 0 0 0px #10b98166; } 100% { box-shadow: 0 0 0 8px #10b98100; } }

        .wave-bar { width: 4px; border-radius: 2px; transition: 0.3s; }
        .wave-bar.listening { background: ${C.primary}; animation: wave 1s infinite ease-in-out; }
        .wave-bar.speaking { background: ${C.secondary}; height: 10px; }

        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 35px; }
        }
      `}</style>
    </div>
  );
}