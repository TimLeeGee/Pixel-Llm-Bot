import React, { useEffect, useRef, useState } from "react";

/**
 * Pixel LLM Bot – Spectra Terminal Layout (Dot‑Matrix) v2
 * - Left: terminal chat; Right: portrait panel
 * - Pure black background; green dot‑matrix visuals
 * - AI = green text; USER = blue text
 * - No TTS; Dragon‑Quest‑like SFX only
 * - Extras: double‑line frames, corner labels, scanline overlay, subtle CRT flicker
 *
 * NOTE: This file is plain React (no TS types) so it runs in any React 18 app.
 */

// ---- Theme ----
const GREEN = "#00ff80"; // neon green
const BLUE = "#3aa7ff"; // neon blue
const MONO = `ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace`;

// ---- WebAudio SFX (8‑bit style) ----
function useAudio() {
  const ctxRef = useRef(null);
  const ensureCtx = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  };

  const playBeep = (freq = 880, durationMs = 24) => {
    const ctx = ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square"; // retro
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    osc.stop(now + durationMs / 1000);
  };

  const playJingle = () => {
    const ctx = ensureCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = f;
      gain.gain.value = 0.06;
      osc.connect(gain).connect(ctx.destination);
      const t0 = now + i * 0.08;
      osc.start(t0);
      osc.stop(t0 + 0.12);
    });
  };

  return { playBeep, playJingle };
}

// ---- Typewriter hook ----
function useTypewriter(text, speedMs = 20, onFinish, onTick) {
  const [cursor, setCursor] = useState(0);
  useEffect(() => setCursor(0), [text]);
  useEffect(() => {
    if (!text) return;
    if (cursor >= text.length) { onFinish && onFinish(); return; }
    const id = setTimeout(() => { const next = cursor + 1; onTick && onTick(next); setCursor(next); }, speedMs);
    return () => clearTimeout(id);
  }, [cursor, text, speedMs, onFinish, onTick]);
  return text.slice(0, cursor);
}

// ---- Dot‑Matrix Portrait (green on black) ----
function DotPortrait({ talking }) {
  const dotStyle = {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(${GREEN} 1px, transparent 1.6px)`,
    backgroundSize: "6px 6px",
    opacity: 0.9,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
  return (
    <div
      className="relative"
      style={{
        width: 208,
        height: 208,
        background: "#000",
        imageRendering: "pixelated",
        border: `2px solid ${GREEN}`,
        boxShadow: `0 0 0 2px ${GREEN} inset, 0 0 18px ${GREEN}55`,
      }}
    >
      {/* grid overlay */}
      <div style={dotStyle} />
      {/* Simple pixel face */}
      <div className="absolute left-1/2 -translate-x-1/2 top-8 w-28 h-28" style={{ border: `2px solid ${GREEN}`, boxShadow: `0 0 8px ${GREEN}` }} />
      {/* eyes */}
      <div className="absolute top-[96px] left-[66px] w-3 h-3" style={{ background: GREEN }} />
      <div className="absolute top-[96px] right-[66px] w-3 h-3" style={{ background: GREEN }} />
      {/* mouth */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[122px] w-16" style={{ height: talking ? 10 : 2, background: GREEN, transition: "height 60ms" }} />
      {/* caption */}
      <div style={{ position: "absolute", bottom: -36, left: 0, right: 0, textAlign: "center", color: GREEN, fontFamily: MONO }}>SPECTRA</div>
    </div>
  );
}

// ---- Terminal frame helper (double border + corner label) ----
function Frame({ children, title }) {
  return (
    <div className="relative">
      <div style={{ border: `2px solid ${GREEN}`, boxShadow: `0 0 0 2px ${GREEN} inset, 0 0 12px ${GREEN}66` }}>
        <div style={{ border: `2px solid ${GREEN}`, margin: 6 }}>
          {title && (
            <div
              style={{ position: "absolute", top: -12, left: 12, padding: "0 6px", background: "#000", color: GREEN, fontFamily: MONO, fontSize: 12 }}
            >{title}</div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// ---- Fake LLM (replace with your API call) ----
function generateReply(user) {
  if (!user.trim()) return "……";
  return `了解。「${user.trim()}」。こちらはデモの応答です。`;
}

export default function SpectraTerminalDemo() {
  const { playBeep, playJingle } = useAudio();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", text: "SYSTEM: Spectra Communicator Online" },
    { role: "system", text: "AI Chat Ready" },
  ]);
  const [botTyping, setBotTyping] = useState(false);
  const [pendingBotFull, setPendingBotFull] = useState("");

  // Mouth open/close synced to SFX
  const [mouthOpen, setMouthOpen] = useState(false);
  const mouthTimerRef = useRef(null);
  const pulseMouth = (duration = 100) => {
    setMouthOpen(true);
    if (mouthTimerRef.current) clearTimeout(mouthTimerRef.current);
    mouthTimerRef.current = setTimeout(() => setMouthOpen(false), duration);
  };

  const typed = useTypewriter(
    botTyping ? pendingBotFull : "",
    18,
    () => { 
      setBotTyping(false); 
      playJingle();
      // Pulse mouth roughly in sync with the 4 jingle notes
      [0, 80, 160, 240].forEach((t) => setTimeout(() => pulseMouth(110), t));
    },
    (idx) => { 
      if (idx % 2 === 0) { 
        playBeep(820 + (idx % 5) * 40, 18); 
        pulseMouth(90);
      }
    }
  );

  // Update last assistant line while typing
  useEffect(() => {
    if (!botTyping) return;
    setMessages((m) => {
      const copy = [...m];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "assistant") { copy[i] = { ...copy[i], text: typed }; break; }
      }
      return copy;
    });
  }, [typed, botTyping]);

  const send = () => {
    const content = input;
    if (!content.trim()) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: content }]);
    const reply = generateReply(content);
    setPendingBotFull(reply);
    setBotTyping(true);
    setMessages((m) => [...m, { role: "assistant", text: "" }]);
  };

  // Line renderer
  const Line = ({ role, text }) => {
    const color = role === "assistant" ? GREEN : role === "user" ? BLUE : GREEN;
    const prefix = role === "assistant" ? "AI> " : role === "user" ? "USER> " : "";
    return (
      <div style={{ color, fontFamily: MONO, fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{prefix}{text}</div>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full relative" style={{ background: "#000" }}>
      {/* Scanline & flicker overlay */}
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent 0 2px, ${GREEN}08 2px 4px)`,
          animation: "scan 6s linear infinite, flicker 3s steps(1) infinite",
          mixBlendMode: "screen",
        }}
      />
      <style>{`
        @keyframes scan { from { transform: translateY(0); } to { transform: translateY(-8px); } }
        @keyframes flicker {
          0%, 19%, 21%, 23%, 80%, 100% { opacity: .95; }
          20%, 22% { opacity: .8; }
          81% { opacity: .9; }
        }
      `}</style>

      <div className="grid grid-cols-[1fr_260px] gap-4 p-4">
        {/* Left: Terminal Chat */}
        <Frame title="COMMUNICATION LOG">
          <div className="flex flex-col" style={{ height: "70vh" }}>
            <div className="flex-1 overflow-auto p-4" style={{ scrollbarColor: `${GREEN} #000` }}>
              {messages.map((m, i) => <Line key={i} role={m.role} text={m.text} />)}
            </div>
            {/* Input bar */}
            <div className="p-3 border-t" style={{ borderColor: GREEN }}>
              <div className="flex items-center gap-2">
                <div style={{ color: GREEN, fontFamily: MONO }}>{'>'}</div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="やあ / 你好 / Hello"
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: BLUE, fontFamily: MONO, caretColor: BLUE }}
                />
                <button
                  onClick={send}
                  className="px-3 py-1"
                  style={{ color: "#000", background: GREEN, fontFamily: MONO, border: `1px solid ${GREEN}` }}
                >SEND</button>
              </div>
            </div>
          </div>
        </Frame>

        {/* Right: Portrait Panel */}
        <Frame title="S-P-E-C-T-R-A">
          <div className="flex flex-col items-center justify-center gap-6 p-4">
            <DotPortrait talking={mouthOpen} />
          </div>
        </Frame>
      </div>
    </div>
  );
}
