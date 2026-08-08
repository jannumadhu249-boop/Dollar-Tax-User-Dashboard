import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import { URLS } from "../url";

/* ── Shared input styles ── */
const inputBase = {
  width: "100%",
  padding: "12px 16px 12px 44px",
  border: "1.5px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "0.92rem",
  outline: "none",
  background: "#f8fafc",
  color: "#1e293b",
  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  fontFamily: "'Inter', sans-serif",
};

const onFocus = (e) => {
  e.target.style.borderColor = "#4f46e5";
  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)";
  e.target.style.background = "#fff";
};
const onBlur = (e) => {
  e.target.style.borderColor = "#e2e8f0";
  e.target.style.boxShadow = "none";
  e.target.style.background = "#f8fafc";
};

const IconWrap = ({ icon }) => (
  <span style={{
    position: "absolute", left: "13px", top: "50%",
    transform: "translateY(-50%)", color: "#94a3b8",
    display: "flex", alignItems: "center", pointerEvents: "none",
  }}>
    {icon}
  </span>
);

const FieldLabel = ({ children }) => (
  <label style={{
    display: "block", marginBottom: "6px", fontSize: "0.78rem",
    fontWeight: "700", color: "#64748b", letterSpacing: "0.5px",
    textTransform: "uppercase",
  }}>
    {children}
  </label>
);

const STEPS = ["email", "otp", "password"];

// ── Validation constants ──
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`\\-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;"'<>,.?/~`\\-]{8,}$/;

const ForgotPassword = () => {
  // ── State ──
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Field‑specific errors ──
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    otp: "",
    password: "",
    confirm: "",
  });

  const otpRefs = useRef([]);
  const navigate = useNavigate();

  // ── Helper to clear a field error ──
  const clearFieldError = (field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Validation functions ──
  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required.";
    if (!emailRegex.test(trimmed)) return "Please enter a valid email address.";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required.";
    if (value.length < PASSWORD_MIN_LENGTH)
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    if (!PASSWORD_REGEX.test(value))
      return "Password must contain at least one uppercase, one lowercase, one digit, and one special character (!@#$%^&*()_+ etc.)";
    return "";
  };

  const validateConfirm = (password, confirm) => {
    if (!confirm) return "Please confirm your password.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  // ── Handlers ──
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    clearFieldError("email");
    setError("");
  };

  const handleEmailBlur = () => {
    const err = validateEmail(email);
    setFieldErrors((prev) => ({ ...prev, email: err }));
  };

  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    clearFieldError("otp");
    setError("");
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otpDigits];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setOtpDigits(next);
    clearFieldError("otp");
    setError("");
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    clearFieldError("password");
    setError("");
    // Also clear confirm error if it exists and may become valid
    if (fieldErrors.confirm) {
      const confirmErr = validateConfirm(e.target.value, confirmPassword);
      if (!confirmErr) clearFieldError("confirm");
    }
  };

  const handlePasswordBlur = () => {
    const err = validatePassword(newPassword);
    setFieldErrors((prev) => ({ ...prev, password: err }));
  };

  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
    clearFieldError("confirm");
    setError("");
  };

  const handleConfirmBlur = () => {
    const err = validateConfirm(newPassword, confirmPassword);
    setFieldErrors((prev) => ({ ...prev, confirm: err }));
  };

  // ── Step 1: Send OTP ──
  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Validate email
    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(URLS.GenerateOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        // Resolve userId from response or localStorage fallback
        const fromApi =
          data?.data?.userId ||
          data?.data?.member_id ||
          data?.data?._id ||
          data?.data?.id ||
          data?.data?.user_id ||
          data?.userId ||
          data?.member_id ||
          data?._id ||
          data?.id ||
          data?.user_id ||
          "";
        const fromStorage = (() => {
          try {
            const stored = localStorage.getItem("user");
            if (!stored) return "";
            const parsed = JSON.parse(stored);
            return parsed?.member_id || parsed?.userId || parsed?._id || "";
          } catch {
            return "";
          }
        })();
        const resolvedId = fromApi || fromStorage;
        setUserId(resolvedId);
        setSuccessMsg("OTP sent to your email!");
        setStep("otp");
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──
  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const otp = otpDigits.join("");
    if (otp.length < 6) {
      setFieldErrors((prev) => ({ ...prev, otp: "Please enter the complete 6-digit OTP." }));
      return;
    }

    // Resolve userId again if needed
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          resolvedUserId = parsed?.member_id || parsed?.userId || parsed?._id || "";
        }
      } catch { /* ignore */ }
    }

    if (!resolvedUserId) {
      setError("Unable to verify OTP: user ID not found. Please go back and re-enter your email, or log in first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(URLS.VerifyOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resolvedUserId,
          otp: otp,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setUserId(data?.data?.userId || data?.data?.member_id || data?.userId || resolvedUserId);
        setSuccessMsg("OTP verified successfully!");
        setStep("password");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const resendOtp = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const response = await fetch(URLS.GenerateOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg("New OTP sent to your email!");
        setOtpDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        clearFieldError("otp");
      } else {
        setError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──
  const updatePwd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Validate both password fields
    const pwdErr = validatePassword(newPassword);
    const confirmErr = validateConfirm(newPassword, confirmPassword);
    if (pwdErr || confirmErr) {
      setFieldErrors({
        ...fieldErrors,
        password: pwdErr,
        confirm: confirmErr,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(URLS.ResetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setSuccessMsg("Password updated successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = STEPS.indexOf(step);

  return (
    <div
      className="container-fluid p-0 min-vh-100 d-flex align-items-stretch"
      style={{ overflowX: "hidden", backgroundColor: "#f3f4f6" }}
    >
      <div className="row g-0 w-100 min-vh-100">

        {/* ── Left Panel (unchanged) ── */}
        <div
          className="col-lg-7 p-0 d-none d-lg-flex flex-column text-white position-relative"
          style={{ minHeight: "100vh" }}
        >
          <div
            className="h-100 d-flex flex-column justify-content-center align-items-center text-white text-center p-5 position-relative"
            style={{
              backgroundImage: "url('/images/tax-deduction.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              flex: 1,
            }}
          >
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ background: "linear-gradient(135deg,rgba(15,23,42,0.88) 0%,rgba(30,27,75,0.88) 100%)" }}
            />
            <div
              className="position-relative d-flex flex-column align-items-center"
              style={{ maxWidth: "480px", width: "100%" }}
            >
              <img src="/images/logo-white.png" alt="Tax Filer" style={{ maxWidth: "180px", marginBottom: "2.5rem" }} />
              <h1 className="fw-bold text-white mb-4" style={{ fontSize: "2.8rem", lineHeight: 1.2 }}>
                Forgot Password <span style={{ color: "#fbbf24" }}>?</span>
              </h1>
              <p className="mb-5 text-white-50" style={{ fontSize: "1.05rem" }}>
                Recover your account safely and securely
              </p>
              <div className="w-100" style={{ maxWidth: "340px" }}>
                {[
                  "Secure password retrieval",
                  "Dedicated customer assistance",
                  "Safe and confidential data handling",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center mb-3"
                    style={{ background: "rgba(255,255,255,0.06)", borderRadius: "10px", padding: "10px 16px" }}
                  >
                    <CheckCircle size={22} style={{ color: "#fbbf24", flexShrink: 0 }} />
                    <span className="ms-3 fw-normal" style={{ letterSpacing: "0.4px", fontSize: "0.97rem" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="col-lg-5 bg-white d-flex align-items-center">
          <div className="w-100 p-4 p-lg-5">

            {/* Step progress dots */}
            <div className="d-flex justify-content-center align-items-center mb-5" style={{ gap: "8px" }}>
              {STEPS.map((s, i) => {
                const done = i < currentIdx;
                const active = s === step;
                return (
                  <React.Fragment key={s}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%",
                      background: done ? "#22c55e" : active ? "#4f46e5" : "#e2e8f0",
                      color: done || active ? "#fff" : "#94a3b8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.78rem", fontWeight: "800", flexShrink: 0,
                      boxShadow: active ? "0 0 0 4px rgba(79,70,229,0.18)" : "none",
                      transition: "all 0.3s",
                    }}>
                      {done ? "✓" : i + 1}
                    </div>
                    {i < 2 && (
                      <div style={{
                        height: "2px", flex: 1, maxWidth: "50px",
                        background: done ? "#22c55e" : "#e2e8f0",
                        transition: "background 0.3s",
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* General Alerts */}
            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.87rem", borderRadius: "8px" }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success py-2 px-3 mb-3" style={{ fontSize: "0.87rem", borderRadius: "8px" }}>
                {successMsg}
              </div>
            )}

            {/* ─── Step 1 · Email ─── */}
            {step === "email" && (
              <>
                <h3 className="text-center fw-bold mb-1" style={{ color: "#1e1b4b", fontSize: "1.5rem" }}>
                  Reset Password
                </h3>
                <p className="text-center text-muted mb-4" style={{ fontSize: "0.88rem" }}>
                  Enter your email — we'll send a 6-digit OTP
                </p>
                <form onSubmit={sendOtp}>
                  <div className="mb-4">
                    <FieldLabel>Email Address</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <IconWrap icon={<Mail size={17} />} />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                        onFocus={onFocus}
                        style={{
                          ...inputBase,
                          borderColor: fieldErrors.email ? "#dc3545" : "#e2e8f0",
                        }}
                        required
                      />
                    </div>
                    {fieldErrors.email && (
                      <div className="mt-1" style={{ fontSize: "0.8rem", color: "#dc3545", fontWeight: "500" }}>
                        {fieldErrors.email}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-semibold"
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg,#4f46e5,#3730a3)",
                      color: "#fff", border: "none", borderRadius: "10px",
                      fontSize: "0.95rem", letterSpacing: "0.3px",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP →"
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ─── Step 2 · OTP ─── */}
            {step === "otp" && (
              <>
                <h3 className="text-center fw-bold mb-1" style={{ color: "#1e1b4b", fontSize: "1.5rem" }}>
                  Enter OTP
                </h3>
                <p className="text-center text-muted mb-4" style={{ fontSize: "0.88rem" }}>
                  Code sent to <strong style={{ color: "#4f46e5" }}>{email || "your email"}</strong>
                </p>
                <form onSubmit={verifyOtp}>
                  <div className="mb-4">
                    <FieldLabel>6-Digit Verification Code</FieldLabel>
                    <div
                      style={{ display: "flex", gap: "10px", justifyContent: "center" }}
                      onPaste={handlePaste}
                    >
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#4f46e5";
                            e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,0.18)";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = digit ? "#4f46e5" : "#e2e8f0";
                            e.target.style.boxShadow = "none";
                            e.target.style.background = digit ? "#eef2ff" : "#f8fafc";
                          }}
                          style={{
                            width: "52px",
                            height: "58px",
                            textAlign: "center",
                            fontSize: "1.5rem",
                            fontWeight: "800",
                            border: digit ? "2px solid #4f46e5" : "2px solid #e2e8f0",
                            borderRadius: "12px",
                            background: digit ? "#eef2ff" : "#f8fafc",
                            color: "#1e1b4b",
                            outline: "none",
                            transition: "all 0.2s",
                            caretColor: "#4f46e5",
                            fontFamily: "'Inter', monospace",
                          }}
                        />
                      ))}
                    </div>
                    {fieldErrors.otp && (
                      <div className="mt-2 text-center" style={{ fontSize: "0.8rem", color: "#dc3545", fontWeight: "500" }}>
                        {fieldErrors.otp}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-semibold"
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg,#4f46e5,#3730a3)",
                      color: "#fff", border: "none", borderRadius: "10px",
                      fontSize: "0.95rem", letterSpacing: "0.3px",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                        Verify OTP
                      </>
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ color: "#4f46e5", fontSize: "0.85rem", fontWeight: "500" }}
                      onClick={resendOtp}
                      disabled={loading}
                    >
                      Didn't receive? Resend OTP
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ─── Step 3 · New Password ─── */}
            {step === "password" && (
              <>
                <h3 className="text-center fw-bold mb-1" style={{ color: "#1e1b4b", fontSize: "1.5rem" }}>
                  Set New Password
                </h3>
                <p className="text-center text-muted mb-4" style={{ fontSize: "0.88rem" }}>
                  Choose a strong password for your account
                </p>
                <form onSubmit={updatePwd}>
                  <div className="mb-3">
                    <FieldLabel>New Password</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <IconWrap icon={<Lock size={17} />} />
                      <input
                        type={showNewPwd ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                        onFocus={onFocus}
                        maxLength={64}
                        style={{
                          ...inputBase,
                          paddingRight: "44px",
                          borderColor: fieldErrors.password ? "#dc3545" : "#e2e8f0",
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        style={{
                          position: "absolute", right: "12px", top: "50%",
                          transform: "translateY(-50%)", background: "none",
                          border: "none", color: "#94a3b8", cursor: "pointer", padding: 0,
                        }}
                      >
                        {showNewPwd ? <Eye size={17} /> : <EyeOff size={17} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <div className="mt-1" style={{ fontSize: "0.8rem", color: "#dc3545", fontWeight: "500" }}>
                        {fieldErrors.password}
                      </div>
                    )}
                    {/* Optional hint */}
                    {newPassword && !fieldErrors.password && (
                      <div className="mt-1" style={{ fontSize: "0.78rem", color: "#6c757d" }}>
                        Must have at least 8 characters, including uppercase, lowercase, digit, and one special character (!@#$%^&*()_+ etc.).
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <FieldLabel>Confirm New Password</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <IconWrap icon={<Lock size={17} />} />
                      <input
                        type={showConfirmPwd ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={handleConfirmChange}
                        onBlur={handleConfirmBlur}
                        onFocus={onFocus}
                        style={{
                          ...inputBase,
                          paddingRight: "44px",
                          borderColor: fieldErrors.confirm ? "#dc3545" : "#e2e8f0",
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        style={{
                          position: "absolute", right: "12px", top: "50%",
                          transform: "translateY(-50%)", background: "none",
                          border: "none", color: "#94a3b8", cursor: "pointer", padding: 0,
                        }}
                      >
                        {showConfirmPwd ? <Eye size={17} /> : <EyeOff size={17} />}
                      </button>
                    </div>
                    {fieldErrors.confirm && (
                      <div className="mt-1" style={{ fontSize: "0.8rem", color: "#dc3545", fontWeight: "500" }}>
                        {fieldErrors.confirm}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-semibold"
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg,#4f46e5,#3730a3)",
                      color: "#fff", border: "none", borderRadius: "10px",
                      fontSize: "0.95rem", letterSpacing: "0.3px",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating Password...
                      </>
                    ) : (
                      "Update Password ✓"
                    )}
                  </button>
                </form>
              </>
            )}

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-decoration-none"
                style={{ color: "#4f46e5", fontWeight: "500", fontSize: "0.88rem" }}
              >
                ← Back to Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;