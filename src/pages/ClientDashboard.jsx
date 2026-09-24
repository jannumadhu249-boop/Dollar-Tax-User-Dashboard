import React, { useState, useEffect, useMemo } from "react";
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
import {
  FILING_PHASES,
  FILE_STATUS_PIPELINE,
  getPipelineIndex,
  getPipelineProgressPercentage,
  resolveFilingStatusInfo,
} from "../utils/filingStatus";
import { getMediaUrlCandidates, resolveMediaUrl } from "../utils/media";
import { URLS } from "../url";
import WelcomeModal from "../Components/WelcomeModal";
import "../styles/Dashboard.css";
import "../styles/ClientDashboard.css";

const OverviewBanner = ({ imagePath, alt }) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const candidates = useMemo(() => getMediaUrlCandidates(imagePath), [imagePath]);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [imagePath]);

  if (!imagePath || !candidates.length) return null;

  if (failed) {
    return (
      <div className="dt-overview-banner dt-overview-banner-fallback">
        <span>Status banner unavailable</span>
      </div>
    );
  }

  const currentCandidate = candidates[candidateIndex];

  return (
    <div className="dt-overview-banner">
      <div
        className="dt-overview-banner-bg"
        style={{ backgroundImage: `url(${currentCandidate})` }}
      />
      <img
        src={currentCandidate}
        alt={alt}
        onError={() => {
          if (candidateIndex < candidates.length - 1) {
            setCandidateIndex((prev) => prev + 1);
          } else {
            setFailed(true);
          }
        }}
      />
    </div>
  );
};

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeUserData, setWelcomeUserData] = useState(null);

  // Point of Contact card state
  const [isPocExpanded, setIsPocExpanded] = useState(false);
  const [showPocTextarea, setShowPocTextarea] = useState(false);
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
        } else if (data.data) {
          setDashboardData(data.data);
        } else if (data.success) {
          setDashboardData(data);
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

  const fileStatusCode = (
    header?.file_status_code ||
    dashboardData?.file_status_code ||
    dashboardData?.file_status?.code ||
    user?.file_status?.code ||
    ""
  )
    .toUpperCase()
    .trim();

  const fileStatusName =
    header?.file_status_name ||
    header?.file_status ||
    dashboardData?.file_status_name ||
    (typeof dashboardData?.file_status === "string"
      ? dashboardData.file_status
      : dashboardData?.file_status?.name) ||
    dashboardData?.filing?.status ||
    dashboardData?.member?.file_status ||
    user?.file_status?.name ||
    (typeof user?.file_status === "string" ? user.file_status : "") ||
    "Registered Users";

  const currentStatusInfo = resolveFilingStatusInfo({ fileStatusCode, fileStatusName });
  const currentStage = Math.max(0, currentStatusInfo.stage);
  const displayStatus = currentStatusInfo.label || fileStatusName || "Registered";
  const currentPipelineIndex = getPipelineIndex(currentStatusInfo.code);
  const stageProgressPercentage =
    cards?.filing_progress?.percentage ??
    getPipelineProgressPercentage(currentStatusInfo.code);

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

  // Documents Pending check - button should only appear when documents are pending
  const isDocumentsPending = (() => {
    if (fileStatusCode === "DP") return true;
    const norm = (fileStatusName || "").toLowerCase().trim();
    if (
      norm === "documents pending" ||
      norm === "document pending" ||
      norm.includes("documents pending") ||
      norm.includes("document pending")
    ) {
      return true;
    }
    const docSt = (documentsStatus || docStatus || "").toLowerCase();
    if (
      (fileStatusCode === "RGO" ||
        fileStatusCode === "SP" ||
        fileStatusCode === "BIP" ||
        fileStatusCode === "IP" ||
        !fileStatusCode) &&
      (docSt.includes("pending") || docSt.includes("awaiting"))
    ) {
      return true;
    }
    return false;
  })();

  // Milestone points on Return Progress Chart (Intake -> Documents -> Preparation -> Review -> Filed)
  // Removed - chart visualization replaced with simple stepper

  const pickImagePath = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.url || value.path || value.src || value.image || "";
    }
    return "";
  };

  const extractImageFromObject = (obj) => {
    if (!obj || typeof obj !== "object") return "";
    const directKeys = [
      "banner_image",
      "bannerImage",
      "file_status_image",
      "status_image",
      "image",
      "img",
      "url",
      "path",
      "src",
    ];
    for (const key of directKeys) {
      const picked = pickImagePath(obj[key]);
      if (picked) return picked;
    }
    return "";
  };

  const getOverviewImagePath = () => {
    const content = dashboardData?.dashboard_content || dashboardData?.dashboardContent;
    const statusCode = currentStatusInfo.code;

    const fromStatusList = (() => {
      const lists = [
        dashboardData?.file_statuses,
        dashboardData?.file_status_list,
        dashboardData?.status_list,
        content?.file_statuses,
        content?.status_images,
      ];
      for (const list of lists) {
        if (!Array.isArray(list)) continue;
        const match = list.find(
          (item) =>
            (item?.code || item?.status_code || item?.file_status_code || "")
              .toUpperCase()
              .trim() === statusCode
        );
        const image = extractImageFromObject(match);
        if (image) return image;
      }
      return "";
    })();

    const fromStatusMap = (() => {
      const maps = [
        dashboardData?.file_status_images,
        dashboardData?.status_images,
        content?.file_status_images,
        content?.status_images,
      ];
      for (const map of maps) {
        if (!map || typeof map !== "object" || Array.isArray(map)) continue;
        const value = map[statusCode] || map[statusCode?.toLowerCase()];
        const picked = pickImagePath(value) || extractImageFromObject(value);
        if (picked) return picked;
      }
      return "";
    })();

    return (
      pickImagePath(content?.banner_image) ||
      pickImagePath(content?.bannerImage) ||
      pickImagePath(content?.image) ||
      pickImagePath(content?.file_status_image) ||
      fromStatusList ||
      fromStatusMap ||
      extractImageFromObject(dashboardData?.file_status) ||
      pickImagePath(dashboardData?.file_status?.banner_image) ||
      pickImagePath(dashboardData?.file_status?.image) ||
      pickImagePath(dashboardData?.file_status?.file_status_image) ||
      pickImagePath(dashboardData?.file_status_image) ||
      pickImagePath(dashboardData?.banner_image) ||
      pickImagePath(dashboardData?.header?.banner_image) ||
      pickImagePath(dashboardData?.header?.file_status_image) ||
      extractImageFromObject(welcomeUserData?.file_status) ||
      extractImageFromObject(user?.file_status) ||
      pickImagePath(welcomeUserData?.file_status?.image) ||
      pickImagePath(user?.file_status?.image) ||
      ""
    );
  };

  // Helper to render Dashboard Content (or Fallback Intake Panel)
  const renderMainContentPanel = () => {
    const content = dashboardData?.dashboard_content || dashboardData?.dashboardContent;
    const overviewImagePath = getOverviewImagePath();

    const pageTitleText = content?.page_title || content?.title || "";
    const blocks = pageTitleText
      ? pageTitleText
        .split(/\r?\n\r?\n/)
        .map((b) => b.trim())
        .filter(Boolean)
      : [];

    const introParagraphs = [];
    const stepItems = [];
    const dashboardBody =
      content?.description ||
      content?.welcome_text ||
      content?.body ||
      content?.guidelines ||
      content?.content ||
      "";

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

    const sections = Array.isArray(content?.sections) ? content.sections : [];
    const intakeStepsList = Array.isArray(dashboardData?.complete_your_intake?.steps)
      ? dashboardData.complete_your_intake.steps
      : [];

    const defaultStepsConfig = [
      {
        key: "basic_information",
        defaultTitle: "Basic information",
        defaultDesc:
          "Personal details, spouse information if married, and dependents information for any children or others.",
        defaultNavTarget: "/dashboard/basic-info/taxpayer",
        defaultNavText: "Review details →",
        iconClass: "emerald",
        IconComp: User,
        defaultStatus: basicInfoStatus,
      },
      {
        key: "documents",
        defaultTitle: "Upload tax related documents",
        defaultDesc:
          "W-2 forms, 1099s, or any other documents you'd like your preparer to consider.",
        defaultNavTarget: "/dashboard/upload",
        defaultNavText: "Upload now →",
        iconClass: "gold",
        IconComp: Upload,
        defaultStatus: documentsStatus,
      },
      {
        key: "consultation",
        defaultTitle: "Schedule for tax notes",
        defaultDesc:
          "Pick a time to talk with our expert about an accurate return and maximum eligible benefits.",
        defaultNavTarget: "/dashboard/schedule",
        defaultNavText: "Schedule now →",
        iconClass: "blue",
        IconComp: Calendar,
        defaultStatus: consultationStatus,
      },
    ];

    const tasksToRender = defaultStepsConfig.map((cfg, idx) => {
      const stepFromApi =
        intakeStepsList.find((s) => s.key === cfg.key) ||
        intakeStepsList[idx];

      const secFromApi =
        sections.find((s) => s.order === idx + 1) ||
        sections[idx];

      const parsedStep = stepItems.find((s) => s.stepNum === String(idx + 1));

      const title =
        (stepFromApi?.title && stepFromApi.title.trim()) ||
        (secFromApi?.title && secFromApi.title.trim()) ||
        parsedStep?.title ||
        cfg.defaultTitle;

      const description =
        (stepFromApi?.description && stepFromApi.description.trim()) ||
        (secFromApi?.description && secFromApi.description.trim()) ||
        (secFromApi?.content && secFromApi.content.trim()) ||
        parsedStep?.description ||
        cfg.defaultDesc;

      const status =
        stepFromApi?.status ||
        cfg.defaultStatus;

      let navTarget = cfg.defaultNavTarget;
      const apiButtonUrl = stepFromApi?.button_url || secFromApi?.button_url;
      if (apiButtonUrl && apiButtonUrl.startsWith("/dashboard")) {
        navTarget = apiButtonUrl;
      }

      let navText = cfg.defaultNavText;
      const apiButtonText = stepFromApi?.button_text || secFromApi?.button_text;
      if (apiButtonText && apiButtonText.trim() && apiButtonText.toLowerCase() !== "continue") {
        navText = apiButtonText.includes("→") ? apiButtonText : `${apiButtonText} →`;
      }

      return {
        key: cfg.key,
        title,
        description,
        status,
        navTarget,
        navText,
        iconClass: cfg.iconClass,
        IconComp: cfg.IconComp,
      };
    });

    if (intakeStepsList.length > defaultStepsConfig.length) {
      intakeStepsList.slice(defaultStepsConfig.length).forEach((extraStep, extraIdx) => {
        const stepNum = defaultStepsConfig.length + extraIdx + 1;
        tasksToRender.push({
          key: extraStep.key || `step_${stepNum}`,
          title: extraStep.title || `Step ${stepNum}`,
          description: extraStep.description || "",
          status: extraStep.status || "Pending",
          navTarget: (extraStep.button_url && extraStep.button_url.startsWith("/")) ? extraStep.button_url : "/dashboard",
          navText: extraStep.button_text ? `${extraStep.button_text} →` : "View details →",
          iconClass: "blue",
          IconComp: Calendar,
        });
      });
    }

    return (
      <div className="dt-panel">
        <div className="dt-panel-head">
          <h2>Overview & Guidelines</h2>
          {/* {completedIntakeCount != null && (
            <span className="dt-tag">{completedIntakeCount} of 3 done</span>
          )} */}
        </div>

        <OverviewBanner imagePath={overviewImagePath} alt="Overview & Guidelines" />

        {dashboardBody && (
          <div className="dt-overview-copy">
            <p>{dashboardBody}</p>
          </div>
        )}

        {introParagraphs.length > 0 && (
          <div className="dt-overview-copy">
            {introParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        )}

        {/* Intake Tasks - dynamically populated from API (complete_your_intake.steps & dashboard_content.sections) with graceful fallbacks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {tasksToRender.map((task, idx) => (
            <div className="dt-task" key={task.key || idx}>
              <div className={`dt-ticon ${task.iconClass}`}>
                <task.IconComp size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="dt-task-row">
                  <h3>{task.title}</h3>
                  <span className={getStatusPillClass(task.status)}>
                    {task.status}
                  </span>
                </div>
                {task.description && <p>{task.description}</p>}
                <span
                  className="dt-link"
                  onClick={() => navigate(task.navTarget)}
                >
                  {task.navText}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic sections if present beyond standard intake */}
        {sections.length > defaultStepsConfig.length && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
            {sections.slice(defaultStepsConfig.length).map((sec, sIdx) => (
              <div
                key={sIdx}
                style={{
                  padding: "14px 16px",
                  background: "#F9FAFB",
                  borderRadius: "10px",
                  border: "1px solid var(--dt-border, #E5E7EB)",
                }}
              >
                {sec.title && <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: 600 }}>{sec.title}</h4>}
                {(sec.description || sec.content) && (
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--dt-ink-muted, #4B5563)" }}>
                    {sec.description || sec.content}
                  </p>
                )}
                {sec.image && (
                  <div style={{ marginTop: "10px", borderRadius: "6px", overflow: "hidden", maxHeight: "220px", display: "flex", justifyContent: "center", background: "#f8fafc" }}>
                    <img
                      src={resolveMediaUrl(sec.image)}
                      alt={sec.title || "Section"}
                      style={{ maxWidth: "100%", maxHeight: "220px", objectFit: "contain", borderRadius: "4px" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
              </div>
              {isDocumentsPending && (
                <button
                  type="button"
                  className="dt-cta-primary"
                  onClick={() => navigate("/dashboard/upload")}
                >
                  <Upload size={14} strokeWidth={2.4} />
                  <span>Upload document</span>
                </button>
              )}
            </div>

            {/* Metrics Row (4 Cards) */}
            <section className="dt-metrics">
              {/* Metric 1 - Account Information */}
              <div className="dt-metric">
                <p className="dt-k">Account Information</p>
                <div className="dt-row2">
                  <p className="dt-v" style={{ fontSize: "14px", lineHeight: "1.4" }}>
                    Account - {displayFileNo}
                  </p>
                  <span className="dt-trend muted" style={{ fontSize: "12px" }}>
                    TY{displayTaxYear} · {displayFilingType || "Standard"} ·
                    <br/> {displayStatus}
                  </span>
                </div>
              </div>

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

              {/* Metric 3 - Referrals Bonus */}
              <div className="dt-metric">
                <p className="dt-k">Referrals Bonus</p>
                <div className="dt-row2">
                  <p className="dt-v">$0</p>
                  <span className="dt-trend muted">
                    Refer friends and earn
                  </span>
                </div>
              </div>

              {/* Metric 4 - Point of Contact - Clickable */}
              <div 
                className="dt-metric" 
                onClick={() => {
                  if (!showPocTextarea) {
                    setIsPocExpanded(!isPocExpanded);
                  }
                }}
                style={{ cursor: showPocTextarea ? "default" : "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => {
                  if (!showPocTextarea) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showPocTextarea) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <p className="dt-k">Point of Contact</p>
                <div className="dt-row2">
                  <p className="dt-v" style={{ fontSize: "16px" }}>
                    {pocName || "Support Specialist"}
                  </p>
                  <span className="dt-trend up">
                    {pocPhone || pocEmail || "Available"}
                  </span>
                </div>

                {/* Step 2: Show "Send message" button when card is clicked */}
                {isPocExpanded && !showPocTextarea && (
                  <button
                    type="button"
                    className="dt-cta-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPocTextarea(true);
                    }}
                    style={{
                      marginTop: "12px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "center",
                      width: "100%",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <MessageSquare size={16} strokeWidth={2.4} />
                    <span>Send message</span>
                  </button>
                )}

                {/* Step 3: Show textarea and action buttons when "Send message" is clicked */}
                {showPocTextarea && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: "12px" }}
                  >
                    <textarea
                      value={pocMessage}
                      onChange={(e) => setPocMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid var(--dt-border, #E5E7EB)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        resize: "vertical",
                        marginBottom: "12px",
                        boxSizing: "border-box",
                      }}
                      disabled={pocSending}
                      autoFocus
                    />

                    {/* Success Alert */}
                    {pocSuccess && (
                      <div
                        style={{
                          padding: "8px 10px",
                          background: "#D1FAE5",
                          border: "1px solid #10B981",
                          borderRadius: "6px",
                          marginBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: "#065F46",
                        }}
                      >
                        <Check size={14} />
                        <span>{pocSuccess}</span>
                      </div>
                    )}

                    {/* Error Alert */}
                    {pocError && (
                      <div
                        style={{
                          padding: "8px 10px",
                          background: "#FEE2E2",
                          border: "1px solid #EF4444",
                          borderRadius: "6px",
                          marginBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: "#991B1B",
                        }}
                      >
                        <AlertCircle size={14} />
                        <span>{pocError}</span>
                      </div>
                    )}

                    {/* Cancel and Send buttons - equal width, side by side */}
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPocTextarea(false);
                          setIsPocExpanded(false);
                          setPocMessage("");
                          setPocError("");
                          setPocSuccess("");
                        }}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          background: "#F3F4F6",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: "#374151",
                          height: "40px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#E5E7EB";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#F3F4F6";
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendPocMessage(e);
                        }}
                        disabled={pocSending || !pocMessage.trim()}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#fff",
                          cursor: pocSending || !pocMessage.trim() ? "not-allowed" : "pointer",
                          opacity: pocSending || !pocMessage.trim() ? 0.6 : 1,
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          height: "40px",
                        }}
                        onMouseEnter={(e) => {
                          if (!pocSending && pocMessage.trim()) {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {pocSending ? (
                          <>
                            <Loader2 size={14} className="spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} strokeWidth={2.4} />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Inline Point of Contact Expanded Section */}
            {isPocExpanded && showPocTextarea && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid var(--dt-border, #E5E7EB)",
                  padding: "24px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  marginBottom: "24px",
                }}
              >
                {/* Additional context or info can go here if needed */}
                <p style={{ margin: 0, fontSize: "13px", color: "var(--dt-ink-muted)" }}>
                  Your message will be sent to {pocName || "your support specialist"}.
                </p>
              </div>
            )}

            {/* Return Progress Panel - Full Width */}
            <div className="dt-panel">
              <div className="dt-panel-head">
                <h2>Return progress</h2>
              </div>

              {/* SVG Area Chart - Orange/Red Gradient */}
              <div className="dt-chart-container" style={{ position: "relative", width: "100%", height: "200px", marginTop: "24px", marginBottom: "24px" }}>
                <svg width="100%" height="200" viewBox="0 0 100 200" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#EF4C23", stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: "#EF4C23", stopOpacity: 0.05 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="120" x2="100" y2="120" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="160" x2="100" y2="160" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                  
                  {/* Area path - smooth bezier curve with orange gradient fill */}
                  <path
                    d={(() => {
                      // X positions for 5 stages (0-4) across the width
                      const xPositions = [5, 27.5, 50, 72.5, 95];
                      const yBase = 180; // Bottom baseline
                      // Y positions when active (decreasing = going up)
                      const yPoints = [150, 110, 80, 60, 40];
                      
                      // Build smooth bezier curve
                      let path = `M ${xPositions[0]} ${yBase}`; // Start at bottom left
                      
                      // Add first point
                      path += ` L ${xPositions[0]} ${currentStage >= 0 ? yPoints[0] : yBase}`;
                      
                      // Add bezier curves between active points
                      for (let i = 1; i < xPositions.length; i++) {
                        const prevX = xPositions[i - 1];
                        const prevY = currentStage >= i - 1 ? yPoints[i - 1] : yBase;
                        const currX = xPositions[i];
                        const currY = currentStage >= i ? yPoints[i] : yBase;
                        
                        // Control points for smooth curve
                        const cpX1 = prevX + (currX - prevX) * 0.5;
                        const cpY1 = prevY;
                        const cpX2 = currX - (currX - prevX) * 0.5;
                        const cpY2 = currY;
                        
                        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${currX} ${currY}`;
                      }
                      
                      // Close path back to baseline
                      path += ` L ${xPositions[xPositions.length - 1]} ${yBase}`;
                      path += ` L ${xPositions[0]} ${yBase} Z`;
                      
                      return path;
                    })()}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line path - smooth bezier curve stroke */}
                  <path
                    d={(() => {
                      const xPositions = [5, 27.5, 50, 72.5, 95];
                      const yBase = 180;
                      const yPoints = [150, 110, 80, 60, 40];
                      
                      // Start at first point
                      let path = `M ${xPositions[0]} ${currentStage >= 0 ? yPoints[0] : yBase}`;
                      
                      // Add bezier curves
                      for (let i = 1; i < xPositions.length; i++) {
                        const prevX = xPositions[i - 1];
                        const prevY = currentStage >= i - 1 ? yPoints[i - 1] : yBase;
                        const currX = xPositions[i];
                        const currY = currentStage >= i ? yPoints[i] : yBase;
                        
                        const cpX1 = prevX + (currX - prevX) * 0.5;
                        const cpY1 = prevY;
                        const cpX2 = currX - (currX - prevX) * 0.5;
                        const cpY2 = currY;
                        
                        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${currX} ${currY}`;
                      }
                      
                      return path;
                    })()}
                    fill="none"
                    stroke="#EF4C23"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Data points - dots at each stage */}
                  {[0, 1, 2, 3, 4].map((stage) => {
                    const xPositions = [5, 27.5, 50, 72.5, 95];
                    const yPoints = [150, 110, 80, 60, 40];
                    const yBase = 180;
                    const isActive = currentStage >= stage;
                    const isCurrent = currentStage === stage;
                    
                    return (
                      <circle
                        key={stage}
                        cx={xPositions[stage]}
                        cy={isActive ? yPoints[stage] : yBase}
                        r={isCurrent ? "2" : "1.5"}
                        fill={isActive ? "#EF4C23" : "#D1D5DB"}
                        stroke={isCurrent ? "#fff" : "none"}
                        strokeWidth={isCurrent ? "0.5" : "0"}
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Dynamic 5-Step Stepper Component */}
              <div className="dt-stepper">
                {/* Step 1: Registered */}
                <div
                  className="dt-snode"
                  onClick={() => navigate("/dashboard/basic-info/taxpayer")}
                  title="Registered"
                >
                  <div className={`dt-scircle ${currentStage > 0 ? "done" : currentStage === 0 ? "active" : ""}`}>
                    {currentStage > 0 ? "✓" : "01"}
                  </div>
                  <div
                    className="dt-slabel"
                    style={{
                      fontWeight: currentStage === 0 ? 600 : 500,
                      color: currentStage === 0 ? "var(--dt-gold)" : undefined,
                    }}
                  >
                    Registered
                  </div>
                </div>

                <div className={`dt-sline ${currentStage >= 1 ? "done" : ""}`}></div>

                {/* Step 2: Scheduled Preparation */}
                <div
                  className="dt-snode"
                  onClick={() => navigate("/dashboard/schedule")}
                  title="Scheduled Preparation"
                >
                  <div className={`dt-scircle ${currentStage > 1 ? "done" : currentStage === 1 ? "active" : ""}`}>
                    {currentStage > 1 ? "✓" : "02"}
                  </div>
                  <div
                    className="dt-slabel"
                    style={{
                      fontWeight: currentStage === 1 ? 600 : 500,
                      color: currentStage === 1 ? "var(--dt-gold)" : undefined,
                    }}
                  >
                    Scheduled Preparation
                  </div>
                </div>

                <div className={`dt-sline ${currentStage >= 2 ? "done" : ""}`}></div>

                {/* Step 3: Payment Pending */}
                <div
                  className="dt-snode"
                  onClick={() => navigate("/dashboard/make-payment")}
                  title="Payment Pending"
                >
                  <div className={`dt-scircle ${currentStage > 2 ? "done" : currentStage === 2 ? "active" : ""}`}>
                    {currentStage > 2 ? "✓" : "03"}
                  </div>
                  <div
                    className="dt-slabel"
                    style={{
                      fontWeight: currentStage === 2 ? 600 : 500,
                      color: currentStage === 2 ? "var(--dt-gold)" : undefined,
                    }}
                  >
                    Payment Pending
                  </div>
                </div>

                <div className={`dt-sline ${currentStage >= 3 ? "done" : ""}`}></div>

                {/* Step 4: Tax Return Review */}
                <div
                  className="dt-snode"
                  onClick={() => navigate("/dashboard/tax-summary")}
                  title="Tax Return Review"
                >
                  <div className={`dt-scircle ${currentStage > 3 ? "done" : currentStage === 3 ? "active" : ""}`}>
                    {currentStage > 3 ? "✓" : "04"}
                  </div>
                  <div
                    className="dt-slabel"
                    style={{
                      fontWeight: currentStage === 3 ? 600 : 500,
                      color: currentStage === 3 ? "var(--dt-gold)" : undefined,
                    }}
                  >
                    Tax Return Review
                  </div>
                </div>

                <div className={`dt-sline ${currentStage >= 4 ? "done" : ""}`}></div>

                {/* Step 5: E-filing Done */}
                <div
                  className="dt-snode"
                  onClick={() => navigate(currentStage >= 4 ? "/dashboard/download" : "#")}
                  title="E-filing Done"
                >
                  <div className={`dt-scircle ${currentStage >= 5 ? "done" : currentStage === 4 ? "active" : ""}`}>
                    {currentStage >= 5 ? "✓" : "05"}
                  </div>
                  <div
                    className="dt-slabel"
                    style={{
                      fontWeight: currentStage >= 4 ? 600 : 500,
                      color: currentStage >= 5 ? "var(--dt-teal)" : currentStage === 4 ? "var(--dt-gold)" : undefined,
                    }}
                  >
                    E-filing Done
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Guidelines Panel - Full Width */}
            {renderMainContentPanel()}
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
