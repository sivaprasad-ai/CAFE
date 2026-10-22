import { useState } from "react";

// SHA-256 hashes of allowed passwords:
// "Raghuveer@2001" -> 3303ffc942319519283e33f4e34e151e0cbaa9ee809557527ddc900669f04992
// "raghuveer@2001" -> 67c2a4953f28160c97a720b2b479312732f2bb6c1b6efde3b79737797df7c22d
const ALLOWED_HASHES = [
  "3303ffc942319519283e33f4e34e151e0cbaa9ee809557527ddc900669f04992",
  "67c2a4953f28160c97a720b2b479312732f2bb6c1b6efde3b79737797df7c22d",
];

export async function verifyAdminPassword(password) {
  try {
    const enc = new TextEncoder().encode(password.trim());
    const hashBuf = await crypto.subtle.digest("SHA-256", enc);
    const hashHex = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return ALLOWED_HASHES.includes(hashHex);
  } catch {
    return password.trim() === "Raghuveer@2001" || password.trim() === "raghuveer@2001";
  }
}

export function isOwnerAuthenticated() {
  try {
    return sessionStorage.getItem("ownerAuthed") === "1";
  } catch {
    return false;
  }
}

export function setOwnerAuthenticated() {
  try {
    sessionStorage.setItem("ownerAuthed", "1");
  } catch {}
}

export function clearOwnerAuthenticated() {
  try {
    sessionStorage.removeItem("ownerAuthed");
  } catch {}
}

export function LoginGate({ onSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    const valid = await verifyAdminPassword(password);
    setChecking(false);
    if (valid) {
      setOwnerAuthenticated();
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="owner-login">
      <form className="owner-login-card" onSubmit={submit}>
        <div className="owner-login-logo">RC</div>
        <h2>Staff &amp; Admin Portal</h2>
        <p>Enter the master password to continue</p>
        <div className="owner-login-field">
          <input
            type={showPassword ? "text" : "password"}
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Enter password"
          />
          <button
            type="button"
            className="owner-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {error && <div className="owner-login-err">Incorrect password. Please try again.</div>}
        <button type="submit" className="owner-login-btn" disabled={checking}>
          {checking ? "Verifying…" : "Enter Portal →"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="owner-btn owner-btn-cancel"
            style={{ marginTop: "12px", width: "100%" }}
            onClick={onCancel}
          >
            ← Back to Cafe Menu
          </button>
        )}
      </form>
    </div>
  );
}
