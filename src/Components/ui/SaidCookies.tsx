import { useState } from "react";

const SaidCookies = () => {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem("cookie_consent")
  );

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "1.5rem",
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(480px, calc(100vw - 2rem))",
      background: "#1a1a1a",
      color: "#f0f0f0",
      borderRadius: "12px",
      padding: "1.25rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      zIndex: 9999,
    }}>
      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "#ccc" }}>
        🍪 We use cookies to improve your experience. By continuing, you agree to our{" "}
        <a href="/privacy" style={{ color: "#a78bfa", textDecoration: "none" }}>
          Privacy Policy
        </a>.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button onClick={decline} style={{
          padding: "0.5rem 1rem", borderRadius: "8px",
          border: "1px solid #444", background: "transparent",
          color: "#aaa", fontSize: "13px", cursor: "pointer",
        }}>
          Decline
        </button>
        <button onClick={accept} style={{
          padding: "0.5rem 1rem", borderRadius: "8px",
          border: "none", background: "#a78bfa",
          color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
        }}>
          Accept All
        </button>
      </div>
    </div>
  );
};



export default SaidCookies;