import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, User, Mail, Phone, Globe, Lock } from "lucide-react";
import { URLS } from "../url";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    contact_number: "",
    alter_number: "",
    email: "",
    password: "",
    time_zone: "America/New_York",
    countryCode: "+1",
    terms: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ─── Validations ──────────────────────────────────────────────────
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!formData.contact_number.trim()) {
      setError("Phone number is required.");
      return;
    }
    // Phone number must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contact_number.trim())) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    if (!formData.password) {
      setError("Password is required.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!formData.terms) {
      setError("You must agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append("first_name", formData.first_name.trim());
      body.append("last_name", formData.last_name.trim());
      body.append("contact_number", formData.contact_number.trim());
      body.append("alter_number", formData.alter_number.trim() || formData.contact_number.trim());
      body.append("time_zone", formData.time_zone);
      body.append("email", formData.email.trim());
      body.append("password", formData.password);
      body.append("current_stage", "New");
      body.append("stage", "Pending");
      body.append("filestatus", "Open");
      body.append("stat", "1");
      body.append("user_ip", "");
      body.append("new_dnos", "0");
      body.append("new_upload", "false");
      body.append("docs_updated", "false");
      body.append("old_client", "false");
      body.append("tin_type", "SSN");

      const response = await fetch(URLS.Registration, {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            member_id: data.data.member_id,
            year_id: data.data.year_id,
            file_no: data.data.file_no,
            first_name: data.data.first_name,
            last_name: data.data.last_name,
            email: data.data.email,
            contact_number: data.data.contact_number,
            image: data.data.image,
            financial_year: data.data.financial_year,
          })
        );
        navigate("/login");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 d-flex align-items-stretch" style={{ height: "100vh", overflowX: "hidden", backgroundColor: "#f3f4f6" }}>
      <div className="row g-0 w-100 h-100">
        {/* Left Side */}
        <div className="col-lg-7 p-0 d-none d-lg-flex flex-column text-white position-relative h-100">
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
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 27, 75, 0.88) 100%)",
              }}
            />
            <div className="position-relative d-flex flex-column align-items-center" style={{ maxWidth: "420px", width: "100%" }}>
              <img
                src="/images/logo-white.png"
                alt="Tax Filer"
                style={{ maxWidth: "180px", marginBottom: "1.5rem" }}
              />
              <h1 className="fw-bold text-white mb-4" style={{ fontSize: "2.2rem", lineHeight: 1.2 }}>
                Join Us <span style={{ color: "#fbbf24" }}>!</span>
              </h1>
              <p className="mb-5 text-white-50" style={{ fontSize: "0.95rem" }}>
                Start your tax journey — Secure &amp; Free
              </p>
              <div className="w-100" style={{ maxWidth: "300px" }}>
                {[
                  "FREE Federal Tax Return",
                  "Free Tax Estimates",
                  "Dedicated Account Executive",
                  "Secure & Confidential",
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

        {/* Right Side */}
        <div className="col-lg-5 bg-white d-flex align-items-center h-100 overflow-hidden">
          <div className="w-100 p-4 p-lg-5 overflow-auto">
            <h3 className="text-center mb-1 fw-bold" style={{ color: "#1e1b4b", fontSize: "1.4rem" }}>Create Account</h3>
            <p className="text-center text-muted mb-4" style={{ fontSize: "0.88rem" }}>Fill in your details to get started</p>

            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.8rem", borderRadius: "8px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* First Name & Last Name */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label">
                    First Name <span style={{ color: "#e63946" }}>*</span>
                  </label>
                  <div className="auth-field-wrap">
                    <span className="auth-icon"><User size={16} /></span>
                    <input
                      type="text"
                      name="first_name"
                      className="form-control"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label">
                    Last Name <span style={{ color: "#e63946" }}>*</span>
                  </label>
                  <div className="auth-field-wrap">
                    <span className="auth-icon"><User size={16} /></span>
                    <input
                      type="text"
                      name="last_name"
                      className="form-control"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">
                  Email <span style={{ color: "#e63946" }}>*</span>
                </label>
                <div className="auth-field-wrap">
                  <span className="auth-icon"><Mail size={16} /></span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* ─── Combined Row: Time Zone | Country Code | Phone Number ─── */}
              <div className="mb-3">
                <label className="form-label">
                  Contact Details <span style={{ color: "#e63946" }}>*</span>
                </label>
                <div className="row g-2">
                  {/* Time Zone */}
                  <div className="col-md-4 col-12">
                    <select
                      name="time_zone"
                      className="form-select"
                      value={formData.time_zone}
                      onChange={handleChange}
                      required
                    >
                      <option value="America/New_York">Eastern (US)</option>
                      <option value="America/Chicago">Central (US)</option>
                      <option value="America/Denver">Mountain (US)</option>
                      <option value="America/Los_Angeles">Pacific (US)</option>
                      <option value="Asia/Kolkata">IST (India)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  {/* Country Code */}
                  <div className="col-md-3 col-6">
                    <select
                      className="form-select"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      required
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                  </div>
                  {/* Phone Number */}
                  <div className="col-md-5 col-6">
                    <input
                      type="tel"
                      name="contact_number"
                      className="form-control"
                      placeholder="10-digit phone"
                      value={formData.contact_number}
                      onChange={handleChange}
                      required
                      maxLength="10"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">
                  Password <span style={{ color: "#e63946" }}>*</span>
                </label>
                <div className="auth-field-wrap">
                  <span className="auth-icon"><Lock size={16} /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: "44px" }}
                    required
                    minLength="8"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                </div>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Password must be at least 8 characters.
                </small>
              </div>

              {/* Terms */}
              <div className="mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="terms"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="terms" className="form-check-label">
                    I agree to the{" "}
                    <a href="/terms" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>Terms and Conditions</a>
                    <span style={{ color: "#e63946" }}>*</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-danger btn-auth w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="d-flex align-items-center my-4">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted" style={{ fontSize: "0.85rem" }}>Or</span>
              <hr className="flex-grow-1" />
            </div>

            <p className="text-center mb-0" style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;