import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  FileText,
  Upload,
  Calendar,
  Mail,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getStoredUser, isEmailVerified } from "../utils/user";
import "../styles/Dashboard.css";
import { URLS } from "../url";


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    setDashboardError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(URLS.GetDashboard, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.warn(`GetDashboard API returned status ${response.status}`);
        setDashboardError(`Dashboard API returned status ${response.status}`);
        setLoadingDashboard(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        setDashboardData(data.data);
      } else {
        setDashboardError(data.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard details:", err);
      setDashboardError("Network error loading dashboard data");
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    const loadUser = () => {
      const storedUser = getStoredUser();
      if (!storedUser) {
        navigate("/login");
      } else {
        setUser(storedUser);
      }
    };

    loadUser();
    fetchDashboardData();

    const handleUserUpdated = () => loadUser();
    window.addEventListener("user-updated", handleUserUpdated);

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
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("user-updated", handleUserUpdated);
    };
  }, [navigate]);

  if (!user) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/tax-preparation.svg";
    if (imagePath.startsWith("http")) return imagePath;
    const base = URLS.ImageUrl || "";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${cleanBase}${cleanPath}`;
  };

  const getStepIcon = (index) => {
    const icons = [
      <FileText size={32} key="file" />,
      <Upload size={32} key="upload" />,
      <Calendar size={32} key="calendar" />,
    ];
    return icons[index % icons.length];
  };

  // Process sections: sort by order if sections exist
  const dynamicSections =
    dashboardData?.sections && Array.isArray(dashboardData.sections)
      ? [...dashboardData.sections].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        )
      : [];

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
          {!isEmailVerified(user) && (
            <div className="email-verify-banner">
              <div className="email-verify-banner-content">
                <Mail size={22} className="email-verify-banner-icon" />
                <p>Your email is not verified please verify your email.</p>
              </div>
              <button
                type="button"
                className="email-verify-banner-btn"
                onClick={() => navigate("/verify-email")}
              >
                Verify Email
              </button>
            </div>
          )}

          <div className="welcome-banner">
            <div className="welcome-banner-header">
              <h2 className="user-greeting">
                Dear {user?.name || "Valued Client"},
              </h2>
              {dashboardData?.file_status && (
                <span className="file-status-badge">
                  File Status: <strong>{dashboardData.file_status}</strong>
                </span>
              )}
            </div>
            {dashboardData?.page_title && (
              <p className="welcome-api-text">
                {dashboardData.page_title}
              </p>
            )}
            {dashboardData?.description && (
              <p className="welcome-api-text">
                {dashboardData.description}
              </p>
            )}
          </div>

          <div className="getting-started">
            <h3>To get started, please provide the information below.</h3>

            {loadingDashboard ? (
              <div className="dashboard-loading-state">
                <Loader2 size={32} className="spinner-icon" />
                <p>Loading dashboard sections...</p>
              </div>
            ) : dynamicSections.length > 0 ? (
              <div className="steps-container">
                {dynamicSections.map((sec, index) => (
                  <div className="step-card" key={sec._id || index}>
                    <div className="step-header">
                      <div className={`step-icon step-${(index % 3) + 1}`}>
                        {getStepIcon(index)}
                      </div>
                      <div className="step-number">
                        {sec.order !== undefined ? sec.order : index + 1}
                      </div>
                    </div>
                    <h4>{sec.title}</h4>
                    <p>{sec.description}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="progress-illustration">
              <img
                src={getImageUrl(dashboardData?.banner_image)}
                alt={dashboardData?.page_title || "Tax Preparation"}
                className="illustration"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/tax-preparation.svg";
                }}
              />
            </div>

            <div className="status-message">
              <p>
                {dashboardData?.file_status
                  ? `Your file status is currently "${dashboardData.file_status}". Your tax returns are currently being prepared.`
                  : "Your tax returns are currently being prepared. You can expect to receive tax estimates within the next 6 to 24 hours."}
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

