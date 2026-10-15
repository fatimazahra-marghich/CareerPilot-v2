import React, { useState, useEffect, useRef } from "react";
import Sidebar, { C, Icons } from "./Sidebar";
import { useAppSettings } from "../context/AppSettingsContext";

export default function Entretien() {
  const { theme } = useAppSettings();
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [started, setStarted] = useState(false);
  const [interim, setInterim] = useState("");
  
  const socket = useRef(null);
  const recognition = useRef(null);
  const chatEndRef = useRef(null);
  const isSpeaking = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interim]);

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
      if (started && !isSpeaking.current) {
        try { recognition.current.start(); } catch(e) {}
      }
    };

    recognition.current.onresult = (e) => {
      if (isSpeaking.current) return;
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          const final = e.results[i][0].transcript;
          if (final.trim()) {
            sendToAlex(final);
            setInterim("");
          }
        } else {
          interimText += e.results[i][0].transcript;
        }
      }
      setInterim(interimText);
    };
  }, [started]);

  const startInterview = () => {
    setStarted(true);
    socket.current = new WebSocket(`ws://localhost:8000/ws/interview/${localStorage.getItem("cv_id") || "18"}/`);
    socket.current.onopen = () => {
      try { recognition.current.start(); } catch(e) {}
    };
    socket.current.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => [...prev, { role: "ai", text: data.text }]);
      if (data.audio) {
        isSpeaking.current = true;
        try { recognition.current.stop(); } catch(e) {}
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        await audio.play();
        audio.onended = () => {
          isSpeaking.current = false;
          try { recognition.current.start(); } catch(e) {}
        };
      }
    };
  };

  const sendToAlex = (text) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
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
                {isListening ? "ALEX ÉCOUTE..." : "ALEX RÉPOND..."}
              </span>
            </div>
          )}
        </div>

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
              <div ref={chatEndRef} />
            </>
          )}
        </div>

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