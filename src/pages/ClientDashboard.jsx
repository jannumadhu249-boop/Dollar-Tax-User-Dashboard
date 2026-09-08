import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  Upload,
  User,
  Calendar,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  Loader2,
  Check
} from "lucide-react";
import { getStoredUser, isEmailVerified } from "../utils/user";
import { URLS } from "../url";
import WelcomeModal from "../Components/WelcomeModal";
import "../styles/Dashboard.css";
import "../styles/ClientDashboard.css";

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeUserData, setWelcomeUserData] = useState(null);

  // Point of Contact inline message state
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [pocMessage, setPocMessage] = useState("");
  const [pocSending, setPocSending] = useState(false);
  const [pocSuccess, setPocSuccess] = useState("");
  const [pocError, setPocError] = useState("");

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

  // Extract initials for Point of Contact avatar
  const getInitials = (name) => {
    if (!name) return "TP";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper for dynamic pill badge styles
  const getStatusPillClass = (status) => {
    if (!status) return "dt-pill not-started";
    const s = status.toLowerCase();
    if (s === "complete" || s === "completed" || s === "done") return "dt-pill done";
    if (s === "in progress" || s === "" || s === "") return "dt-pill todo";
    return "dt-pill not-started";
  };

  // Extract response sub-objects
  const header = dashboardData?.header;
  const cards = dashboardData?.cards;

  // Dynamic values mapped from dashboard API data
  const displayName = header?.name || dashboardData?.member?.name || user?.name || user?.first_name || "";
  const displayFileNo = header?.file_no || dashboardData?.member?.file_no || user?.file_no || "";
  const displayTaxYear = header?.year || dashboardData?.tax_year?.name || "";
  const displayFilingType = header?.filing_type;
  const displayStatus =
    header?.file_status_name ||
    header?.file_status ||
    dashboardData?.filing?.status ||
    dashboardData?.member?.file_status ||
    user?.file_status?.name ||
    "Registered";

  // Filing Progress Card
  const filingProgressPercentage = cards?.filing_progress?.percentage ?? 33;
  const filingProgressStep = cards?.filing_progress?.step || "Step 1 of 3";
  const filingProgressLabel = cards?.filing_progress?.label || "Filing progress";

  // Days to Deadline Card
  const daysDeadline =
    cards?.days_to_deadline?.days != null
      ? cards.days_to_deadline.days
      : dashboardData?.deadline?.days_remaining != null
      ? dashboardData.deadline.days_remaining
      : calculateDaysToDeadline();
  const daysDeadlineLabel = cards?.days_to_deadline?.label || "Days to deadline";
  const daysDeadlineStatus = cards?.days_to_deadline?.status || "Counting down";

  // Documents Card
  const docCount = cards?.documents?.count ?? dashboardData?.documents?.count ?? 0;
  const docStatus = cards?.documents?.status || dashboardData?.documents?.status || "Awaiting upload";
  const docLabel = cards?.documents?.label || "Documents";

  // Preparer Card
  const preparer = cards?.preparer || dashboardData?.preparer;
  const preparerName = preparer?.name || "Not Assigned";
  const preparerStatus = preparer?.status || (preparer?.name ? "Assigned" : "Pending");
  const preparerLabel = cards?.preparer?.label || "Preparer";
  const isPreparerAssigned = Boolean(preparer?.name && preparer?.name !== "Not Assigned");

  // Point of Contact
  const poc = dashboardData?.point_of_contact || cards?.preparer || dashboardData?.preparer;
  const pocName = poc?.name || "";
  const pocFirstName = poc?.name ? poc.name.trim().split(/\s+/)[0] : "";
  const pocPhone = poc?.contact_number || "";
  const pocEmail = poc?.email || "";
  const pocInitials = getInitials(pocName);

  // Send message to Point of Contact directly inline
  const handleSendPocMessage = async (e) => {
    if (e) e.preventDefault();
    if (!pocMessage.trim()) return;

    setPocSending(true);
    setPocError("");
    setPocSuccess("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setPocError("You are not logged in.");
        setPocSending(false);
        return;
      }

      const payload = {
        first_name: user?.first_name || user?.name || "Client",
        mobile: user?.contact_number || user?.mobile || "",
        message: pocMessage.trim(),
      };

      const response = await fetch(URLS.SendMessage, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setPocSuccess("Message sent successfully!");
        setPocMessage("");
        setTimeout(() => {
          setPocSuccess("");
        }, 3500);
      } else {
        setPocError(data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setPocError("Network error. Please try again.");
    } finally {
      setPocSending(false);
    }
  };

  // Intake step statuses
  const intakeSteps = dashboardData?.complete_your_intake?.steps;
  const getIntakeStepStatus = (key, defaultVal) => {
    if (intakeSteps && Array.isArray(intakeSteps)) {
      const stepObj = intakeSteps.find((s) => s.key === key);
      if (stepObj?.status) return stepObj.status;
    }
    return defaultVal;
  };

  const basicInfoStatus =
    getIntakeStepStatus("basic_information", dashboardData?.intake?.basic_information?.status || "Complete");
  const documentsStatus =
    getIntakeStepStatus("documents", dashboardData?.intake?.documents?.status || "");
  const consultationStatus =
    getIntakeStepStatus("consultation", dashboardData?.intake?.consultation?.status || "Not started");

  const completedIntakeCount =
    dashboardData?.complete_your_intake?.completed ??
    [basicInfoStatus, documentsStatus, consultationStatus].filter(
      (s) => s?.toLowerCase() === "complete" || s?.toLowerCase() === "completed"
    ).length;

  const emailVerified = isEmailVerified(user);

  // Helper to render Dashboard Content (or Fallback Intake Panel)
  const renderMainContentPanel = () => {
    const content = dashboardData?.dashboard_content;

    if (content && content.page_title) {
      const blocks = content.page_title
        .split(/\r?\n\r?\n/)
        .map((b) => b.trim())
        .filter(Boolean);

      const introParagraphs = [];
      const stepItems = [];

      blocks.forEach((block) => {
        const match = block.match(/^(\d+)[\.\s]+([\s\S]*)/);
        if (match) {
          const stepNum = match[1];
          const rest = match[2];
          const lines = rest.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          const stepTitle = lines[0] || `Step ${stepNum}`;
          const stepDesc = lines.slice(1).join(" ");
          stepItems.push({ stepNum, title: stepTitle, description: stepDesc });
        } else {
          introParagraphs.push(block);
        }
      });

      return (
        <div className="dt-panel">
          <div className="dt-panel-head">
            <h2>Overview & Guidelines</h2>
          </div>

          {content.banner_image && (
            <div style={{ marginBottom: "16px", borderRadius: "8px", overflow: "hidden" }}>
              <img
                src={
                  content.banner_image.startsWith("http")
                    ? content.banner_image
                    : `${URLS.ImageUrl}${content.banner_image}`
                }
                alt="Dashboard Banner"
                style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
              />
            </div>
          )}

          {introParagraphs.length > 0 && (
            <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {introParagraphs.map((para, idx) => (
                <p key={idx} style={{ fontSize: "14px", lineHeight: "1.6", color: "#374151", margin: 0 }}>
                  {para}
                </p>
              ))}
            </div>
          )}

          {stepItems.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {stepItems.map((item, idx) => {
                let navTarget = "/dashboard/basic-info/taxpayer";
                let navText = "Review details →";
                let iconClass = "emerald";
                let IconComp = User;

                const lowerTitle = item.title.toLowerCase();
                if (lowerTitle.includes("upload") || item.stepNum === "2") {
                  navTarget = "/dashboard/upload";
                  navText = "Upload now →";
                  iconClass = "gold";
                  IconComp = Upload;
                } else if (
                  lowerTitle.includes("schedule") ||
                  lowerTitle.includes("consultation") ||
                  item.stepNum === "3"
                ) {
                  navTarget = "/dashboard/schedule";
                  navText = "Schedule now →";
                  iconClass = "blue";
                  IconComp = Calendar;
                }

                const currentStatus =
                  item.stepNum === "1"
                    ? basicInfoStatus
                    : item.stepNum === "2"
                    ? documentsStatus
                    : consultationStatus;

                return (
                  <div className="dt-task" key={idx}>
                    <div className={`dt-ticon ${iconClass}`}>
                      <IconComp size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="dt-task-row">
                        <h3>
                          {item.stepNum}. {item.title}
                        </h3>
                        <span className={getStatusPillClass(currentStatus)}>
                          {currentStatus}
                        </span>
                      </div>
                      {item.description && <p>{item.description}</p>}
                      <span
                        className="dt-link"
                        onClick={() => navigate(navTarget)}
                      >
                        {navText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Dynamic sections if present */}
          {Array.isArray(content.sections) && content.sections.length > 0 && (
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {content.sections.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    padding: "12px",
                    background: "#F9FAFB",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  {sec.title && <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: 600 }}>{sec.title}</h4>}
                  {sec.content && <p style={{ margin: 0, fontSize: "13px", color: "#4B5563" }}>{sec.content}</p>}
                  {sec.image && (
                    <img
                      src={sec.image.startsWith("http") ? sec.image : `${URLS.ImageUrl}${sec.image}`}
                      alt={sec.title || "Section"}
                      style={{ marginTop: "8px", maxWidth: "100%", borderRadius: "4px" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default Fallback: Complete your intake panel
    return (
      <div className="dt-panel">
        <div className="dt-panel-head">
          <h2>Complete your intake</h2>
          <span className="dt-tag">{completedIntakeCount} of 3 done</span>
        </div>

        {/* Task 1: Basic Information */}
        <div className="dt-task">
          <div className="dt-ticon emerald">
            <User size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="dt-task-row">
              <h3>Basic information</h3>
              <span className={getStatusPillClass(basicInfoStatus)}>
                {basicInfoStatus}
              </span>
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
              <span className={getStatusPillClass(documentsStatus)}>
                {documentsStatus}
              </span>
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
              <span className={getStatusPillClass(consultationStatus)}>
                {consultationStatus}
              </span>
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
    );
  };

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

      <main className="main-content">
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
                  Account {displayFileNo} · TY{displayTaxYear} return {displayFilingType ? `(${displayFilingType}) ` : ""}· {displayStatus}
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
              {/* Metric 1 - Filing Progress */}
              {/* <div className="dt-metric">
                <p className="dt-k">{filingProgressLabel}</p>
                <div className="dt-row2">
                  <p className="dt-v">{filingProgressPercentage}%</p>
                  <span className="dt-trend up">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M6 15l6-6 6 6"></path>
                    </svg>
                    {filingProgressStep}
                  </span>
                </div>
              </div> */}

              {/* Metric 2 - Days to Deadline */}
              <div className="dt-metric">
                <p className="dt-k">{daysDeadlineLabel}</p>
                <div className="dt-row2">
                  <p className="dt-v">{daysDeadline ?? "--"}</p>
                  <span className="dt-trend down">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                    {daysDeadlineStatus}
                  </span>
                </div>
              </div>

              {/* Metric 3 - Documents */}
              <div className="dt-metric">
                <p className="dt-k">{docLabel}</p>
                <div className="dt-row2">
                  <p className="dt-v">{docCount}</p>
                  <span className={`dt-trend ${docCount > 0 ? "up" : "muted"}`}>
                    {docStatus}
                  </span>
                </div>
              </div>

              {/* Metric 4 - Preparer */}
              <div className="dt-metric">
                <p className="dt-k">{preparerLabel}</p>
                <div className="dt-row2">
                  <p className="dt-v" style={{ fontSize: "16px" }}>
                    {preparerName}
                  </p>
                  <span className={`dt-trend ${isPreparerAssigned ? "up" : "muted"}`}>
                    {preparerStatus}
                  </span>
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
                    <span className="dt-tag">TY{displayTaxYear} · updated today</span>
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

                {/* Panel 2: Dashboard Content in place of Intake */}
                {renderMainContentPanel()}
              </div>

              {/* Right Column (310px) */}
              <div>
                {/* Panel 1: Completion Donut */}
                {/* <div className="dt-panel">
                  <div className="dt-panel-head" style={{ marginBottom: "14px" }}>
                    <h2>Completion</h2>
                  </div>
                  <div className="dt-donut-wrap">
                    <svg width="88" height="88" viewBox="0 0 88 88">
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        fill="none"
                        stroke="#EEEFF3"
                        strokeWidth="10"
                      ></circle>
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        fill="none"
                        stroke="#02A19C"
                        strokeWidth="10"
                        strokeDasharray={`${(filingProgressPercentage / 100) * 226.19} 226.19`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 44 44)"
                      ></circle>
                      <text
                        x="44"
                        y="40"
                        textAnchor="middle"
                        fontFamily="Space Grotesk, sans-serif"
                        fontSize="16"
                        fontWeight="700"
                        fill="#14161C"
                      >
                        {filingProgressPercentage}%
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
                        <span>Done · {dashboardData?.complete_your_intake?.completed ?? completedIntakeCount} step(s)</span>
                      </div>
                      <div className="dt-li">
                        <span
                          className="dt-sw"
                          style={{ background: "var(--dt-gold)" }}
                        ></span>
                        <span>In progress · {dashboardData?.complete_your_intake?.in_progress ?? 0}</span>
                      </div>
                      <div className="dt-li">
                        <span
                          className="dt-sw"
                          style={{ background: "#E7E8EC" }}
                        ></span>
                        <span>Remaining · {dashboardData?.complete_your_intake?.not_started ?? (3 - completedIntakeCount)}</span>
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Panel 2: Point of Contact */}
                <div className="dt-panel">
                  <div className="dt-panel-head" style={{ marginBottom: "10px" }}>
                    <h2>Point of contact</h2>
                  </div>
                  <div className="dt-contact">
                    <div className="dt-av">{pocInitials}</div>
                    <div>
                      <h4>{pocName || "Support Specialist"}</h4>
                      {pocPhone && <p>{pocPhone}</p>}
                      {pocEmail && <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{pocEmail}</p>}
                    </div>
                  </div>

                  {!isMessageOpen ? (
                    <button
                      type="button"
                      className="dt-contact-btn"
                      onClick={() => {
                        setIsMessageOpen(true);
                        setPocSuccess("");
                        setPocError("");
                      }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                      <MessageSquare size={15} />
                      <span>Send message</span>
                    </button>
                  ) : (
                    <div className="poc-chat-box">
                      <div className="poc-chat-header">
                        <span>Message {pocFirstName || "Point of Contact"}</span>
                        <button
                          type="button"
                          className="poc-chat-close"
                          onClick={() => setIsMessageOpen(false)}
                          title="Close message field"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {pocSuccess && (
                        <div className="poc-chat-alert success">
                          <Check size={14} />
                          <span>{pocSuccess}</span>
                        </div>
                      )}

                      {pocError && (
                        <div className="poc-chat-alert error">
                          <AlertCircle size={14} />
                          <span>{pocError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSendPocMessage} className="poc-chat-input-bar">
                        <textarea
                          className="poc-chat-input"
                          rows="1"
                          placeholder="Type a message..."
                          value={pocMessage}
                          onChange={(e) => setPocMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendPocMessage(e);
                            }
                          }}
                          disabled={pocSending}
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="poc-chat-send-btn"
                          disabled={pocSending || !pocMessage.trim()}
                          title="Send message"
                        >
                          {pocSending ? (
                            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                          ) : (
                            <Send size={15} />
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Panel 3: Recent Activity */}
                <div className="dt-panel" style={{ marginBottom: "0" }}>
                  <div className="dt-panel-head" style={{ marginBottom: "4px" }}>
                    <h2>Recent activity</h2>
                  </div>
                  {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
                    dashboardData.recent_activity.map((activity, index) => (
                      <div className="dt-activity" key={index}>
                        <div className={`dt-adot ${index === 0 ? "on" : ""}`}></div>
                        <div>
                          <p>{activity.title || activity.message || activity.description || "Activity updated"}</p>
                          <p className="dt-t">
                            {activity.date
                              ? new Date(activity.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : activity.time || "Recent"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="dt-activity">
                        <div className="dt-adot on"></div>
                        <div>
                          <p>Basic information {basicInfoStatus.toLowerCase()}</p>
                          <p className="dt-t">Updated</p>
                        </div>
                      </div>
                      <div className="dt-activity">
                        <div className="dt-adot"></div>
                        <div>
                          <p>Account registered</p>
                          <p className="dt-t">Status: {displayStatus}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>

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
