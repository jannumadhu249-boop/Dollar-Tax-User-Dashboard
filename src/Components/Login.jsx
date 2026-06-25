import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Static login - no validation required
    localStorage.setItem('user', JSON.stringify({ 
      email: 'demo@minimumtax.com',
      name: 'Balakrishna Burra'
    }));
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="container-fluid bg-dark min-vh-100 py-4">
      <div className="container">
        <div className="row min-vh-100">
          {/* Left Side */}
          <div className="col-lg-7 p-0">
            <div
              className="h-100 d-flex flex-column text-white p-5 position-relative"
              style={{
                backgroundImage: "url('/images/abt-img.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: "rgba(27, 43, 94, 0.85)",
                }}
              />

              <div className="position-relative">
                <img
                  src="/images/logo-lg.png"
                  alt="Dollar Tax Filer"
                  style={{ maxWidth: "200px", marginBottom: "2rem" }}
                />
              </div>

              <div className="position-relative my-auto">
                <h1 className="fw-bold mb-5">
                  Welcome <span style={{ color: "#053231" }}>!</span>
                </h1>

                {[
                  "FREE Federal Tax Return",
                  "Free Tax Estimates",
                  "Dedicated Account Executive",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-4"
                  >
                    <CheckCircle size={28} />
                    <h5 className="ms-3 mb-0">{item}</h5>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="col-lg-5 bg-white d-flex align-items-center">
            <div className="w-100 p-4 p-lg-5">
              <h3 className="text-center mb-4">Login</h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter Email"
                  />
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label">Password</label>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                    placeholder="Enter Password"
                  />

                  <button
                    type="button"
                    className="btn border-0 position-absolute"
                    style={{
                      right: "10px",
                      top: "38px",
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>

                <div className="d-flex justify-content-between mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                    />

                    <label
                      htmlFor="remember"
                      className="form-check-label"
                    >
                      Remember Me
                    </label>
                  </div>

                  <Link to="/forgot-password">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn btn-danger w-100"
                >
                  Login
                </button>
              </form>

              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" />
                <span className="mx-2">Or</span>
                <hr className="flex-grow-1" />
              </div>

              <p className="text-center mb-0">
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;