import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const ChangePassword = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password changed successfully!");
  };

  return (
    <div className="dashboard-container">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="main-content">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Form Content */}
        <div className="form-container">
          <div className="form-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h3 className="form-title">Change Password</h3>

            <form onSubmit={handleSubmit}>
              <div className="password-form-grid">
                <div className="form-group position-relative">
                  <label>Current Password</label>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="form-control"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div className="form-group position-relative">
                  <label>New Password</label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div className="form-group position-relative">
                  <label>Confirm New Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default ChangePassword;
