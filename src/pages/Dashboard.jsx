import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  FileText,
  Upload,
  Calendar,
} from "lucide-react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }

    // Handle initial sidebar state based on screen size
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navigation */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="welcome-banner">
            <h2>Dear {user?.name || "Balakrishna Burra"},</h2>
            <p>
              Welcome to MinimumTax! We truly appreciate the opportunity to
              assist you with filing your Tax Return for TY2025. As a valued
              client, we are dedicated to delivering the highest level of
              service and ensuring a seamless experience.
            </p>
            <p>
              You can easily track the progress of your tax return in real-time
              via your personalized dashboard.
            </p>
          </div>

          <div className="getting-started">
            <h3>To get started, please provide the information below.</h3>

            <div className="steps-container">
              {/* Step 1 */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-icon step-1">
                    <FileText size={32} />
                  </div>
                  <div className="step-number">1</div>
                </div>
                <h4>Basic Information</h4>
                <p>
                  Please provide your personal details, as well as information
                  about your spouse (if married) and any dependents (such as
                  children or others, if applicable)
                </p>
              </div>

              {/* Step 2 */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-icon step-2">
                    <Upload size={32} />
                  </div>
                  <div className="step-number">2</div>
                </div>
                <h4>Upload Tax documents</h4>
                <p>
                  Please upload any tax-related documents, such as W-2 forms,
                  1099s, or any other documents you would like us to review.
                </p>
              </div>

              {/* Step 3 */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-icon step-3">
                    <Calendar size={32} />
                  </div>
                  <div className="step-number">3</div>
                </div>
                <h4>Schedule a Tax Consultation</h4>
                <p>
                  Choose a time to speak with a tax expert to ensure an
                  accurate tax return and maximize your potential refund.
                </p>
              </div>
            </div>

            <div className="progress-illustration">
              <img
                src="/images/tax-preparation.svg"
                alt="Tax Preparation"
                className="illustration"
              />
            </div>

            <div className="status-message">
              <p>
                Your tax returns are currently being prepared. You can expect to
                receive tax estimates within the next 6 to 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;
