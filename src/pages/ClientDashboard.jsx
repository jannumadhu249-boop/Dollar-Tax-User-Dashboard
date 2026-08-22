import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  Upload,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";
import { getStoredUser, isEmailVerified } from "../utils/user";
import { URLS } from "../url";
import SendQueryModal from "../Components/SendQueryModal";
import WelcomeModal from "../Components/WelcomeModal";
import "../styles/Dashboard.css";
import "../styles/ClientDashboard.css";

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeUserData, setWelcomeUserData] = useState(null);

  const navigate = useNavigate();

  // Helper to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const res = await fetch(URLS.GetProfile, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const profileData = data.data;
        const updated = {
          ...getStoredUser(),
          ...profileData,
        };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setWelcomeUserData(profileData);
        if (
          profileData.showWelcome === true &&
          sessionStorage.getItem("welcome_dismissed") !== "true"
        ) {
          setShowWelcomeModal(true);
        }
      }
    } catch (err) {
      console.error("Error fetching profile in ClientDashboard:", err);
    }
  };

  // Helper to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(URLS.GetDashboard, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setDashboardData(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = () => {
      const stored = getStoredUser();
      if (!stored) {
        navigate("/login");
        return;
      }
      setUser(stored);
    };

    loadUser();
    fetchDashboardData();
    fetchUserProfile();

    const handleUserUpdated = () => loadUser();
    window.addEventListener("user-updated", handleUserUpdated);

    // Initial sidebar state based on screen width
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdated);
      window.removeEventListener("resize", handleResize);
    };
  }, [navigate]);

  if (!user) return null;

  // Calculate days to tax deadline (e.g., April 15)
  const calculateDaysToDeadline = () => {
    const today = new Date();
    const deadline = new Date(today.getFullYear(), 3, 15);
    if (today > deadline) {
      deadline.setFullYear(deadline.getFullYear() + 1);
    }
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 62;
  };

  const displayName = user?.name || user?.first_name || "Kids Tub";
  const displayFileNo = user?.file_no || "101595";
  const displayStatus =
    user?.file_status?.name ||
    dashboardData?.file_status_name ||
    "registered only";
  const preparerName = dashboardData?.preparer || "Katta H.";
  const daysDeadline = calculateDaysToDeadline();
  const emailVerified = isEmailVerified(user);

  return (
    <div className="dashboard-container">
      {/* Existing Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area with Previous Header */}
      <main className="main-content">
        {/* Previous Top Header with Phone / Email / Refer / Profile */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Dashboard Content with new design inside */}
        <div className="dashboard-content">
          {/* Email Verification Banner */}
          {!emailVerified && (
            <div className="dt-verify-banner">
              <div className="dt-verify-banner-left">
                <AlertCircle size={18} />
                <span>Your email is not verified yet. Please verify to secure your account.</span>
              </div>
              <button
                type="button"
                className="dt-verify-banner-btn"
                onClick={() => navigate("/verify-email")}
              >
                Verify Email
              </button>
            </div>
          )}

          <div className="dt-dashboard-inner">
            {/* Page Heading */}
            <div className="dt-page-head">
              <div>
                <p className="dt-crumb">Dashboard / Overview</p>
                <h1 className="dt-display">Dear {displayName}</h1>
                <p>
                  Account {displayFileNo} · TY2025 return · {displayStatus}
                </p>
              </div>
              <button
                type="button"
                className="dt-cta-primary"
                onClick={() => navigate("/dashboard/upload")}
              >
                <Upload size={14} strokeWidth={2.4} />
                <span>Upload document</span>
              </button>
            </div>

            {/* Metrics Row (4 Cards) */}
            <section className="dt-metrics">
              {/* Metric 1 */}
              <div className="dt-metric">
                <p className="dt-k">Filing progress</p>
                <div className="dt-row2">
                  <p className="dt-v">33%</p>
                  <span className="dt-trend up">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M6 15l6-6 6 6"></path>
                    </svg>
                    Step 1 of 3
                  </span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="dt-metric">
                <p className="dt-k">Days to deadline</p>
                <div className="dt-row2">
                  <p className="dt-v">{daysDeadline}</p>
                  <span className="dt-trend down">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                    Counting down
                  </span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="dt-metric">
                <p className="dt-k">Documents</p>
                <div className="dt-row2">
                  <p className="dt-v">0</p>
                  <span className="dt-trend muted">Awaiting upload</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="dt-metric">
                <p className="dt-k">Preparer</p>
                <div className="dt-row2">
                  <p className="dt-v" style={{ fontSize: "16px" }}>
                    {preparerName}
                  </p>
                  <span className="dt-trend up">Assigned</span>
                </div>
              </div>
            </section>

            {/* Two-Column Grid */}
            <div className="dt-grid">
              {/* Left Column (1fr) */}
              <div>
                {/* Panel 1: Return Progress with SVG Curve & Stepper */}
                <div className="dt-panel">
                  <div className="dt-panel-head">
                    <h2>Return progress</h2>
                    <span className="dt-tag">TY2025 · updated today</span>
                  </div>

                  {/* Area Line Chart with Gradient */}
                  <div className="dt-chart-wrap">
                    <svg
                      viewBox="0 0 560 140"
                      width="100%"
                      height="140"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="dtFillGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#EF4C23"
                            stopOpacity="0.25"
                          ></stop>
                          <stop
                            offset="100%"
                            stopColor="#EF4C23"
                            stopOpacity="0.0"
                          ></stop>
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line
                        x1="0"
                        y1="35"
                        x2="560"
                        y2="35"
                        stroke="#EEEFF3"
                        strokeWidth="1"
                      ></line>
                      <line
                        x1="0"
                        y1="75"
                        x2="560"
                        y2="75"
                        stroke="#EEEFF3"
                        strokeWidth="1"
                      ></line>
                      <line
                        x1="0"
                        y1="115"
                        x2="560"
                        y2="115"
                        stroke="#EEEFF3"
                        strokeWidth="1"
                      ></line>

                      {/* Area fill */}
                      <path
                        d="M0,120 L80,118 L160,112 L240,95 L320,98 L400,70 L480,55 L560,50 L560,140 L0,140 Z"
                        fill="url(#dtFillGrad)"
                      ></path>

                      {/* Smooth curved progress stroke line */}
                      <path
                        d="M0,120 L80,118 L160,112 L240,95 L320,98 L400,70 L480,55 L560,50"
                        fill="none"
                        stroke="#EF4C23"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>

                      {/* End node highlight marker */}
                      <circle cx="560" cy="50" r="4.5" fill="#EF4C23"></circle>
                    </svg>
                  </div>

                  {/* Chart Axis Milestones */}
                  <div className="dt-chart-axis">
                    <span>Registered</span>
                    <span>Basic info</span>
                    <span>Documents</span>
                    <span>Consult</span>
                    <span>Filed</span>
                  </div>

                  {/* Stepper Component */}
                  <div className="dt-stepper">
                    {/* Step 1 */}
                    <div
                      className="dt-snode"
                      onClick={() => navigate("/dashboard/basic-info/taxpayer")}
                      title="Review Basic Information"
                    >
                      <div className="dt-scircle done">✓</div>
                      <div className="dt-slabel">Basic info</div>
                    </div>

                    {/* Connecting Line 1 */}
                    <div className="dt-sline done"></div>

                    {/* Step 2 */}
                    <div
                      className="dt-snode"
                      onClick={() => navigate("/dashboard/upload")}
                      title="Upload Documents"
                    >
                      <div className="dt-scircle active">02</div>
                      <div className="dt-slabel">Documents</div>
                    </div>

                    {/* Connecting Line 2 */}
                    <div className="dt-sline"></div>

                    {/* Step 3 */}
                    <div
                      className="dt-snode"
                      onClick={() => navigate("/dashboard/schedule")}
                      title="Schedule Consultation"
                    >
                      <div className="dt-scircle">03</div>
                      <div className="dt-slabel">Consult</div>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Complete Your Intake */}
                <div className="dt-panel">
                  <div className="dt-panel-head">
                    <h2>Complete your intake</h2>
                    <span className="dt-tag">1 of 3 done</span>
                  </div>

                  {/* Task 1: Basic Information */}
                  <div className="dt-task">
                    <div className="dt-ticon emerald">
                      <User size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="dt-task-row">
                        <h3>Basic information</h3>
                        <span className="dt-pill done">Complete</span>
                      </div>
                      <p>
                        Personal details, spouse information if married, and
                        dependents information for any children or others.
                      </p>
                      <span
                        className="dt-link"
                        onClick={() => navigate("/dashboard/basic-info/taxpayer")}
                      >
                        Review details →
                      </span>
                    </div>
                  </div>

                  {/* Task 2: Upload Tax Related Documents */}
                  <div className="dt-task">
                    <div className="dt-ticon gold">
                      <Upload size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="dt-task-row">
                        <h3>Upload tax related documents</h3>
                        <span className="dt-pill todo">In progress</span>
                      </div>
                      <p>
                        W-2 forms, 1099s, or any other documents you'd like your
                        preparer to consider.
                      </p>
                      <span
                        className="dt-link"
                        onClick={() => navigate("/dashboard/upload")}
                      >
                        Upload now →
                      </span>
                    </div>
                  </div>

                  {/* Task 3: Schedule for Tax Notes */}
                  <div className="dt-task">
                    <div className="dt-ticon blue">
                      <Calendar size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="dt-task-row">
                        <h3>Schedule for tax notes</h3>
                        <span className="dt-pill not-started">Not started</span>
                      </div>
                      <p>
                        Pick a time to talk with our expert about an accurate return
                        and maximum eligible benefits.
                      </p>
                      <span
                        className="dt-link"
                        onClick={() => navigate("/dashboard/schedule")}
                      >
                        Schedule now →
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (310px) */}
              <div>
                {/* Panel 1: Completion Donut */}
                <div className="dt-panel">
                  <div className="dt-panel-head" style={{ marginBottom: "14px" }}>
                    <h2>Completion</h2>
                  </div>
                  <div className="dt-donut-wrap">
                    <svg width="88" height="88" viewBox="0 0 88 88">
                      {/* Background track circle */}
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        fill="none"
                        stroke="#EEEFF3"
                        strokeWidth="10"
                      ></circle>
                      {/* Teal segment (Done: 33% = 75 dash on ~226 perimeter) */}
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        fill="none"
                        stroke="#02A19C"
                        strokeWidth="10"
                        strokeDasharray="75 151"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 44 44)"
                      ></circle>
                      {/* Gold segment (In Progress: ~17% = 38 dash) */}
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="10"
                        strokeDasharray="38 151"
                        strokeDashoffset="-75"
                        strokeLinecap="round"
                        transform="rotate(-90 44 44)"
                      ></circle>
                      {/* Center Text */}
                      <text
                        x="44"
                        y="40"
                        textAnchor="middle"
                        fontFamily="Space Grotesk, sans-serif"
                        fontSize="16"
                        fontWeight="700"
                        fill="#14161C"
                      >
                        33%
                      </text>
                      <text
                        x="44"
                        y="55"
                        textAnchor="middle"
                        fontFamily="Inter, sans-serif"
                        fontSize="9"
                        fill="#6B7280"
                      >
                        complete
                      </text>
                    </svg>

                    <div className="dt-donut-legend">
                      <div className="dt-li">
                        <span
                          className="dt-sw"
                          style={{ background: "var(--dt-teal)" }}
                        ></span>
                        <span>Done · 1 step</span>
                      </div>
                      <div className="dt-li">
                        <span
                          className="dt-sw"
                          style={{ background: "var(--dt-gold)" }}
                        ></span>
                        <span>In progress · 1</span>
                      </div>
                      <div className="dt-li">
                        <span
                          className="dt-sw"
                          style={{ background: "#E7E8EC" }}
                        ></span>
                        <span>Remaining · 1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Point of Contact */}
                <div className="dt-panel">
                  <div className="dt-panel-head" style={{ marginBottom: "10px" }}>
                    <h2>Point of contact</h2>
                  </div>
                  <div className="dt-contact">
                    <div className="dt-av">KH</div>
                    <div>
                      <h4>Katta Harshitha</h4>
                      <p>Tax preparer · +1 (828) 229-2979</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="dt-contact-btn"
                    onClick={() => setShowQueryModal(true)}
                  >
                    Message Katta
                  </button>
                </div>

                {/* Panel 3: Recent Activity */}
                <div className="dt-panel" style={{ marginBottom: "0" }}>
                  <div className="dt-panel-head" style={{ marginBottom: "4px" }}>
                    <h2>Recent activity</h2>
                  </div>
                  <div className="dt-activity">
                    <div className="dt-adot on"></div>
                    <div>
                      <p>Basic information submitted</p>
                      <p className="dt-t">Wednesday, 2:14 PM</p>
                    </div>
                  </div>
                  <div className="dt-activity">
                    <div className="dt-adot"></div>
                    <div>
                      <p>Account registered</p>
                      <p className="dt-t">Monday, 9:02 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Send Query Modal */}
      <SendQueryModal
        isOpen={showQueryModal}
        onClose={() => setShowQueryModal(false)}
        onSuccess={() => setShowQueryModal(false)}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => {
          setShowWelcomeModal(false);
          sessionStorage.setItem("welcome_dismissed", "true");
        }}
        userData={welcomeUserData}
      />
    </div>
  );
};

export default ClientDashboard;
