import { login } from "@/API/Login";
import PopupContainer from "@/Components/ui/PopupContainer";
import { usePopup } from "@/hooks/usePopup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────── KEYFRAMES / STYLES ─────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

  .lp-fade-up {
    opacity: 0;
    transform: translateY(18px);
    animation: lpFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes lpFadeUp {
    to { opacity: 1; transform: translateY(0); }
  }
  .lp-delay-1 { animation-delay: 0.08s; }
  .lp-delay-2 { animation-delay: 0.18s; }

  .lp-input {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #D8D0C4;
    border-radius: 10px;
    font-size: 14px;
    background: #FAFAF6;
    color: #0B1526;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .lp-input:focus {
    border-color: #C9922F;
    box-shadow: 0 0 0 3px rgba(201,146,47,0.15);
  }
  .lp-input::placeholder { color: #C9C0B0; }
  .lp-input:disabled { opacity: 0.5; cursor: not-allowed; }

  .lp-btn {
    transition: transform 0.14s ease, box-shadow 0.14s ease;
  }
  .lp-btn:hover  { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(11,21,38,0.22); }
  .lp-btn:active { transform: translateY(0); box-shadow: none; }

  .lp-back-btn {
    transition: transform 0.14s ease, box-shadow 0.14s ease;
  }
  .lp-back-btn:hover  { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
  .lp-back-btn:active { transform: translateY(0); box-shadow: none; }

  .lp-header-line {
    width: 0;
    animation: lpLineGrow 0.9s 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes lpLineGrow {
    to { width: 48px; }
  }
`;

/* ─────────────────────────── ICONS ─────────────────────────── */
const IconCal = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="16" height="15" rx="2" stroke="#0B1526" strokeWidth="1.6" />
    <path d="M2 8h16M7 2v2m6-2v2" stroke="#0B1526" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="7" cy="12" r="1" fill="#0B1526" />
    <circle cx="10" cy="12" r="1" fill="#0B1526" />
    <circle cx="13" cy="12" r="1" fill="#0B1526" />
  </svg>
);

const IconUser = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="#0B1526" strokeWidth="1.8" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#0B1526" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconEmail = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="6" width="16" height="12" rx="2" stroke="#C9922F" strokeWidth="1.5" />
    <path d="M2 9l8 5 8-5" stroke="#C9922F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="9" width="14" height="10" rx="2" stroke="#C9922F" strokeWidth="1.5" />
    <path d="M7 9V6a3 3 0 016 0v3" stroke="#C9922F" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="14" r="1.5" fill="#C9922F" />
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M3 10h14M11 4l6 6-6 6" stroke="#F7F4EE" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ═══════════════════════════ LOGIN PAGE ═══════════════════════════ */
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { popups, show, dismiss } = usePopup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = await login({ email, password });

    setLoading(false);

    if (!user) {
      show("Invalid email or password", "error");
      return;
    }

    localStorage.setItem("role", user.role);

    if (user.role === "admin") {
      show("Login successful!", "success");
      navigate("/dashboard");
      return;
    }
    if (user.role === "teacher") {
      show("Login successful!", "success");
      navigate("/teacher");
      return;
    }
    if (user.role === "user") {
      navigate("/");
      return;
    }
  };

  return (
    <div
      dir="ltr"
      style={{ minHeight: "100vh", background: "#F7F4EE", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" }}
    >
      <style>{STYLES}</style>
      <PopupContainer popups={popups} onDismiss={dismiss} />

      {/* ── HEADER ── */}
      <header style={{ background: "linear-gradient(135deg, #0B1526 0%, #122040 100%)", borderBottom: "1px solid rgba(201,146,47,0.25)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg, #C9922F 0%, #F0C060 50%, #C9922F 100%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "linear-gradient(135deg, #C9922F, #F0C060)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(201,146,47,0.4)", flexShrink: 0,
            }}>
              <IconCal />
            </div>
            <div>
               <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 22, fontWeight: 700, color: "#F7F4EE", lineHeight: 1.1, letterSpacing: 0.3 }}>
                University  <span style={{ color: "#C9922F" }}>Laghouat</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(247,244,238,0.45)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>
                Academic Timetable
              </div>
            </div>
          </div>

          {/* Back button */}
          <button
            className="lp-back-btn"
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: "1px solid rgba(201,146,47,0.55)",
              color: "#C9922F",
              padding: "8px 22px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: 0.3,
            }}
          >
            ← Back to Schedule
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px 64px" }}>
        <div
          className="lp-fade-up"
          style={{ width: "100%", maxWidth: 420 }}
        >
          {/* Avatar */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "linear-gradient(135deg, #C9922F, #F0C060)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(201,146,47,0.38)",
              margin: "0 auto 18px",
            }}>
              <IconUser />
            </div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 32, fontWeight: 700, color: "#0B1526", lineHeight: 1.1, marginBottom: 4 }}>
              Welcome Back
            </div>
            <div className="lp-header-line" style={{
              height: 3,
              background: "linear-gradient(90deg, #C9922F, #F0C060)",
              borderRadius: 2,
              margin: "10px auto 12px",
            }} />
            <p style={{ color: "#9A8E7E", fontSize: 14, margin: 0 }}>
              Sign in to your Elameed account
            </p>
          </div>

          {/* Card */}
          <div
            className="lp-fade-up lp-delay-1"
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid #E5DFD3",
              boxShadow: "0 2px 24px rgba(11,21,38,0.06)",
              padding: "32px 32px 28px",
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#7A6E5E", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  <IconEmail /> Email Address
                </label>
                <input
                  className="lp-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@university.edu"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#7A6E5E", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  <IconLock /> Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="lp-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    style={{ paddingRight: 60 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#9A8E7E", fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600, padding: "4px 6px",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  className="lp-btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: loading
                      ? "rgba(11,21,38,0.5)"
                      : "linear-gradient(135deg, #0B1526, #122040)",
                    color: "#F7F4EE",
                    border: "none",
                    borderRadius: "10px 10px 0 0",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: loading ? "not-allowed" : "pointer",
                    letterSpacing: 0.3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {!loading && <IconArrow />}
                  {loading ? "Signing in…" : "Sign In"}
                </button>
                {/* Gold accent stripe */}
                <div style={{
                  height: 3,
                  background: "linear-gradient(90deg, #C9922F, #F0C060)",
                  borderRadius: "0 0 10px 10px",
                  opacity: loading ? 0.4 : 1,
                  transition: "opacity 0.2s",
                }} />
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid #E5DFD3",
        background: "#FAFAF6",
        padding: "18px 24px",
        textAlign: "center",
        fontSize: 12,
        color: "#AFA89A",
      }}>
        © {new Date().getFullYear()} Université Laghouat · Academic Timetable System
      </footer>
    </div>
  );
};

export default Login;