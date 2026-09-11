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
  const milestonePoints = [
    { x: 30, y: 118, label: "Intake" },
    { x: 155, y: 98, label: "Documents" },
    { x: 280, y: 78, label: "Preparation" },
    { x: 405, y: 56, label: "Review" },
    { x: 530, y: 35, label: "Filed" },
  ];

  const getActiveCurveData = (stage) => {
    switch (stage) {
      case 0:
        return {
          strokePath: "M 0 122 L 30 118",
          fillPath: "M 0 140 L 0 122 L 30 118 L 30 140 Z",
        };
      case 1:
        return {
          strokePath: "M 0 122 L 30 118 C 80 112, 110 105, 155 98",
          fillPath: "M 0 140 L 0 122 L 30 118 C 80 112, 110 105, 155 98 L 155 140 Z",
        };
      case 2:
        return {
          strokePath: "M 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78",
          fillPath: "M 0 140 L 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 L 280 140 Z",
        };
      case 3:
        return {
          strokePath: "M 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 C 325 72, 365 62, 405 56",
          fillPath: "M 0 140 L 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 C 325 72, 365 62, 405 56 L 405 140 Z",
        };
      case 4:
        return {
          strokePath: "M 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 C 325 72, 365 62, 405 56 C 445 50, 480 42, 510 38",
          fillPath: "M 0 140 L 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 C 325 72, 365 62, 405 56 C 445 50, 480 42, 510 38 L 510 140 Z",
        };
      case 5:
      default:
        return {
          strokePath: "M 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 C 325 72, 365 62, 405 56 C 450 48, 490 40, 530 35",
          fillPath: "M 0 140 L 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 C 325 72, 365 62, 405 56 C 450 48, 490 40, 530 35 L 530 140 Z",
        };
    }
  };
  const pipelineRatio = currentPipelineIndex / Math.max(1, FILE_STATUS_PIPELINE.length - 1);
  const visualStage = Math.min(
    5,
    Math.max(0, Math.ceil(pipelineRatio * 5))
  );
  const activeCurve = getActiveCurveData(visualStage);
  const fullCurveFillPath =
    "M 0 140 L 0 122 L 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 C 325 72, 365 62, 405 56 C 450 48, 490 40, 530 35 L 530 140 Z";

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
          {completedIntakeCount != null && (
            <span className="dt-tag">{completedIntakeCount} of 3 done</span>
          )}
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
                <p>
                  Account {displayFileNo} · TY{displayTaxYear} return {displayFilingType ? `(${displayFilingType}) ` : ""}· {displayStatus}
                </p>
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
                {/* Panel 1: Return Progress with Dynamic SVG Curve & 5-Step Stepper */}
                <div className="dt-panel">
                  <div className="dt-panel-head">
                    <h2>Return progress</h2>
                    <span className="dt-tag">
                      TY{displayTaxYear} · {stageProgressPercentage}% complete
                    </span>
                  </div>

                  {/* <div className="dt-phase-track">
                    {FILING_PHASES.map((phase) => {
                      const isDone = currentStage > phase.stage;
                      const isActive = currentStage === phase.stage;
                      return (
                        <div
                          key={phase.stage}
                          className={`dt-phase-segment ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                          style={{ "--phase-color": phase.color }}
                        >
                          <div className="dt-phase-segment-bar" />
                          <span>{phase.label}</span>
                        </div>
                      );
                    })}
                  </div> */}

                  <div className="dt-pipeline-progress">
                    <div
                      className="dt-pipeline-progress-fill"
                      style={{ width: `${stageProgressPercentage}%` }}
                    />
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
                        <linearGradient id="dtFillGradBg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4C23" stopOpacity="0.12"></stop>
                          <stop offset="100%" stopColor="#EF4C23" stopOpacity="0.02"></stop>
                        </linearGradient>
                        <linearGradient id="dtFillGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4C23" stopOpacity="0.45"></stop>
                          <stop offset="55%" stopColor="#EF4C23" stopOpacity="0.18"></stop>
                          <stop offset="100%" stopColor="#EF4C23" stopOpacity="0.03"></stop>
                        </linearGradient>
                      </defs>

                      {/* Full trajectory background shade */}
                      <path d={fullCurveFillPath} fill="url(#dtFillGradBg)"></path>

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

                      {/* Faint Projected Full Trajectory Line */}
                      <path
                        d="M 30 118 C 80 112, 110 105, 155 98 C 200 92, 235 84, 280 78 C 325 72, 365 62, 405 56 C 450 48, 490 40, 530 35"
                        fill="none"
                        stroke="#CBD5E1"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      ></path>

                      {/* Active Dynamic Area Fill */}
                      <path
                        d={activeCurve.fillPath}
                        fill="url(#dtFillGrad)"
                      ></path>

                      {/* Active Dynamic Progress Stroke Line */}
                      <path
                        d={activeCurve.strokePath}
                        fill="none"
                        stroke="#EF4C23"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>

                      {/* Dynamic Milestone Points */}
                      {milestonePoints.map((pt, idx) => {
                        const isDone = idx < visualStage;
                        const isCurrent = idx === visualStage;
                        return (
                          <g key={idx}>
                            {isCurrent && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="10"
                                fill="#EF4C23"
                                fillOpacity="0.22"
                              />
                            )}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isCurrent ? 5.5 : isDone ? 4.5 : 3.5}
                              fill={isCurrent || isDone ? "#EF4C23" : "#CBD5E1"}
                              stroke="#FFFFFF"
                              strokeWidth={isCurrent ? 2 : 1.5}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Chart Axis Milestones */}
                  <div className="dt-chart-axis">
                    {milestonePoints.map((pt, idx) => {
                      const isDone = idx < visualStage;
                      const isCurrent = idx === visualStage;
                      return (
                        <span
                          key={idx}
                          style={{
                            fontWeight: isCurrent ? 700 : isDone ? 600 : 400,
                            color: isCurrent ? "#EF4C23" : isDone ? "var(--dt-ink)" : "var(--dt-ink-faint)",
                          }}
                        >
                          {isDone ? "✓ " : ""}
                          {pt.label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="dt-status-grid">
                    {FILE_STATUS_PIPELINE.map((status, index) => {
                      const isDone = index < currentPipelineIndex;
                      const isCurrent = index === currentPipelineIndex;
                      const state = isCurrent ? "current" : isDone ? "done" : "upcoming";
                      return (
                        <span
                          key={status.code}
                          className={`dt-status-chip ${state}`}
                          title={`${status.code} · ${status.label}`}
                        >
                          {status.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Dynamic 5-Step Stepper Component */}
                  <div className="dt-stepper">
                    {/* Step 1: Intake */}
                    <div
                      className="dt-snode"
                      onClick={() => navigate("/dashboard/basic-info/taxpayer")}
                      title="Intake & Basic Information"
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
                        Intake
                      </div>
                    </div>

                    <div className={`dt-sline ${currentStage >= 1 ? "done" : ""}`}></div>

                    {/* Step 2: Documents */}
                    <div
                      className="dt-snode"
                      onClick={() => navigate("/dashboard/upload")}
                      title="Upload Documents"
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
                        Documents
                      </div>
                    </div>

                    <div className={`dt-sline ${currentStage >= 2 ? "done" : ""}`}></div>

                    {/* Step 3: Preparation */}
                    <div
                      className="dt-snode"
                      onClick={() => navigate("/dashboard/schedule")}
                      title="Tax Preparation & Notes"
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
                        Preparation
                      </div>
                    </div>

                    <div className={`dt-sline ${currentStage >= 3 ? "done" : ""}`}></div>

                    {/* Step 4: Review & Payment */}
                    <div
                      className="dt-snode"
                      onClick={() =>
                        navigate(currentStage >= 3 ? "/dashboard/tax-summary" : "/dashboard/make-payment")
                      }
                      title="Review & Summary / Payment"
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
                        Review
                      </div>
                    </div>

                    <div className={`dt-sline ${currentStage >= 4 ? "done" : ""}`}></div>

                    {/* Step 5: Filed / Completed */}
                    <div
                      className="dt-snode"
                      onClick={() => navigate(currentStage >= 4 ? "/dashboard/download" : "#")}
                      title="Filing & Acceptance"
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
                        Filed
                      </div>
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
                          <p>Current status: {displayStatus}</p>
                          <p className="dt-t">{currentStatusInfo.shortLabel || "Intake"} phase</p>
                        </div>
                      </div>
                      <div className="dt-activity">
                        <div className="dt-adot"></div>
                        <div>
                          <p>Account registered</p>
                          <p className="dt-t">File #{displayFileNo || "—"}</p>
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
