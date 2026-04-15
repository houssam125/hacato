import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div className="relative min-h-screen bg-[#080a0f] text-[#f0f0ea] font-sans overflow-hidden flex flex-col items-center justify-center px-4">

      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 h-12 border-b border-[#1e2330] flex items-center justify-between px-4 md:px-6 bg-[#080a0f]/80 backdrop-blur z-10">
        <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-[#5a5e6a] tracking-widest font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
          <span>ERROR_STATE</span>
        </div>
        <div className="text-[10px] md:text-[11px] text-[#5a5e6a] font-mono">
          HTTP 404
        </div>
      </div>

      {/* 404 */}
      <div className="relative overflow-hidden mt-10 md:mt-0">

        {/* scanline */}
        <div
          className="absolute left-0 right-0 h-[2px] bg-[#e8ff47]/20 z-10 pointer-events-none"
          style={{ animation: "scan 3s linear infinite" }}
        />

        <h1
          className="text-[clamp(90px,25vw,300px)] md:text-[clamp(140px,28vw,300px)]
                     font-extrabold leading-none tracking-tight relative select-none"
          style={{
            color: "transparent",
            WebkitTextStroke: "2px #e8ff47",
          }}
        >
          404

          {/* glitch cyan */}
          <span
            className="absolute inset-0"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px #00ffff",
              animation: "glitch1 2.5s infinite",
            }}
            aria-hidden
          >
            404
          </span>

          {/* glitch red */}
          <span
            className="absolute inset-0"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px #ef4444",
              animation: "glitch2 2.5s infinite",
            }}
            aria-hidden
          >
            404
          </span>
        </h1>
      </div>

      {/* Divider */}
      <div className="w-[min(460px,80vw)] h-[1px] bg-gradient-to-r from-transparent via-[#e8ff47] to-transparent my-8 md:my-10" />

      {/* Content */}
      <div className="text-center max-w-md px-2">
        <div className="inline-flex items-center gap-2 bg-[#e8ff47]/10 border border-[#e8ff47]/30 px-3 py-1 text-[9px] md:text-[10px] tracking-widest uppercase text-[#e8ff47] font-mono mb-5 md:mb-6">
          ■ PAGE NOT FOUND
        </div>

        <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">
          You've drifted into the void.
        </h2>

        <p className="text-xs md:text-sm text-[#5a5e6a] font-mono mb-6 md:mb-8 leading-relaxed">
          The page you're looking for doesn't exist,
          <br />
          was moved, or never existed at all.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-3 bg-[#e8ff47] text-black text-xs font-bold tracking-wide rounded hover:bg-[#f5ff80] transition w-full sm:w-auto"
          >
            ← Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-5 py-3 border border-[#1e2330] text-xs font-bold tracking-wide rounded hover:border-[#5a5e6a] hover:bg-white/5 transition w-full sm:w-auto"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] text-[#5a5e6a] font-mono tracking-widest flex gap-4 md:gap-6">
        <span>LAT 36.4553° N</span>
        <span>VOID/NULL</span>
        <span>LNG 6.2642° E</span>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes scan {
          0%   { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes glitch1 {
          0%, 90%, 100% { transform: translate(0, 0); opacity: 0; }
          91% { transform: translate(-3px, 1px); opacity: 0.8; }
          93% { transform: translate(3px, -1px); opacity: 0.8; }
        }

        @keyframes glitch2 {
          0%, 85%, 100% { transform: translate(0, 0); opacity: 0; }
          86% { transform: translate(4px, -1px); opacity: 0.7; }
          88% { transform: translate(-4px, 1px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default Error404;