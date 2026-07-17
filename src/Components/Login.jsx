import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, Mail, Lock } from "lucide-react";
import { URLS } from "../url";

// Keywords that indicate the email itself is the problem (not registered / not found)
const EMAIL_ERROR_KEYWORDS = [
  "not found", "not registered", "no account", "does not exist",
  "invalid email", "user not found", "email not", "account not",
];

// Keywords that indicate the password is the problem
const PASSWORD_ERROR_KEYWORDS = [
  "incorrect password", "wrong password", "invalid password",
  "password is incorrect", "password mismatch",
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "", general: "" });
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const clearFieldError = (name) =>
    setFieldErrors((prev) => ({ ...prev, [name]: "", general: "" }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  // Validate email format on blur
  const handleEmailBlur = () => {
    const email = formData.email.trim();
    if (!email) return;
    if (!emailRegex.test(email)) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
    } else {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  // Parse server error message and assign to correct field
  const applyServerError = (message) => {
    const lower = (message || "").toLowerCase();
    if (EMAIL_ERROR_KEYWORDS.some((k) => lower.includes(k))) {
      setFieldErrors({ email: message, password: "", general: "" });
    } else if (PASSWORD_ERROR_KEYWORDS.some((k) => lower.includes(k))) {
      setFieldErrors({ email: "", password: message, general: "" });
    } else {
      setFieldErrors({ email: "", password: "", general: message || "Login failed. Please try again." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ email: "", password: "", general: "" });

    // Client-side field validation
    const newErrors = { email: "", password: "", general: "" };
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    }
    if (newErrors.email || newErrors.password) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(URLS.Login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user details
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            member_id: data.data.member_id,
            first_name: data.data.first_name,
            last_name: data.data.last_name,
            email: data.data.email,
            contact_number: data.data.contact_number,
            file_no: data.data.file_no,
            image: data.data.image,
            email_verified: data.data.email_verified,
          })
        );
        navigate("/dashboard");
      } else {
        applyServerError(data.message);
      }
    } catch (err) {
      setFieldErrors({ email: "", password: "", general: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 min-vh-100 d-flex align-items-stretch" style={{ overflowX: "hidden", backgroundColor: "#f3f4f6" }}>
      <div className="row g-0 w-100 min-vh-100">
        {/* Left Side */}
        <div className="col-lg-7 p-0 d-none d-lg-flex flex-column text-white position-relative" style={{ minHeight: "100vh" }}>
          <div
            className="h-100 d-flex flex-column justify-content-center align-items-center text-white text-center p-5 position-relative"
            style={{
              backgroundImage: "url('/images/tax-deduction.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              flex: 1,
            }}
          >
            {/* Dark overlay */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 27, 75, 0.88) 100%)",
              }}
            />

            {/* Centered content */}
            <div className="position-relative d-flex flex-column align-items-center" style={{ maxWidth: "480px", width: "100%" }}>
              <img
                src="/images/logo-white.png"
                alt="Tax Filer"
                style={{ maxWidth: "180px", marginBottom: "2.5rem" }}
              />

              <h1 className="fw-bold text-white mb-4" style={{ fontSize: "2.8rem", lineHeight: 1.2 }}>
                Welcome <span style={{ color: "#fbbf24" }}>!</span>
              </h1>
              <p className="mb-5 text-white-50" style={{ fontSize: "1.05rem" }}>
                Trusted Tax Filing — Simple, Fast &amp; Free
              </p>

              <div className="w-100" style={{ maxWidth: "340px" }}>
                {[
                  "FREE Federal Tax Return",
                  "Free Tax Estimates",
                  "Dedicated Account Executive",
                ].map((item, index) => (
                  <div
                    key={index}
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

        <div className="col-lg-5 bg-white d-flex align-items-center">
          <div className="w-100 p-4 p-lg-5">
            <h3 className="text-center mb-1 fw-bold" style={{ color: "#1e1b4b", fontSize: "1.6rem" }}>Welcome Back</h3>
            <p className="text-center text-muted mb-4" style={{ fontSize: "0.88rem" }}>Sign in to your account</p>

            {/* General Error Alert */}
            {fieldErrors.general && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.87rem", borderRadius: "8px" }}>
                {fieldErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="auth-field-wrap">
                  <span className="auth-icon" style={{ color: fieldErrors.email ? "#dc3545" : undefined }}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className={`form-control${fieldErrors.email ? " is-invalid" : ""}`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                  />
                </div>
                {fieldErrors.email && (
                  <div className="d-flex align-items-center mt-1" style={{ gap: "5px" }}>
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="#dc3545">
                      <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span style={{ fontSize: "0.8rem", color: "#dc3545", fontWeight: "500" }}>
                      {fieldErrors.email}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="auth-field-wrap">
                  <span className="auth-icon" style={{ color: fieldErrors.password ? "#dc3545" : undefined }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-control${fieldErrors.password ? " is-invalid" : ""}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="d-flex align-items-center mt-1" style={{ gap: "5px" }}>
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="#dc3545">
                      <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span style={{ fontSize: "0.8rem", color: "#dc3545", fontWeight: "500" }}>
                      {fieldErrors.password}
                    </span>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check mb-0">
                  <input type="checkbox" className="form-check-input" id="remember" />
                  <label htmlFor="remember" className="form-check-label">Remember Me</label>
                </div>
                <Link to="/forgot-password" style={{ color: "#4f46e5", textDecoration: "none", fontSize: "0.85rem", fontWeight: "600" }}>
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-danger btn-auth w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing In...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="d-flex align-items-center my-4">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted" style={{ fontSize: "0.85rem" }}>Or</span>
              <hr className="flex-grow-1" />
            </div>

            <p className="text-center mb-0" style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;