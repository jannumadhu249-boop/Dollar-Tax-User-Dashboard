import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SendQueryModal from "./SendQueryModal";
import {
  Home,
  FileText,
  Upload,
  Calendar,
  TrendingUp,
  Users,
  Download,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  FolderOpen,
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [basicInfoOpen, setBasicInfoOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    {
      icon: FileText,
      label: "Basic Information",
      hasSubmenu: true,
      submenu: [
        { label: "Taxpayer", path: "/dashboard/basic-info/taxpayer" },
        { label: "Spouse", path: "/dashboard/basic-info/spouse" },
        { label: "Dependent", path: "/dashboard/basic-info/dependent" },
        { label: "Address in tax year", path: "/dashboard/basic-info/address" },
        { label: "Bank details", path: "/dashboard/basic-info/bank" },
      ],
    },
    { icon: Upload, label: "Upload Tax Documents", path: "/dashboard/upload" },
    {
      icon: Calendar,
      label: "Schedule a Tax Consultation",
      path: "/dashboard/schedule",
    },
    { icon: TrendingUp, label: "My Tax Summary", path: "/dashboard/tax-summary" },
    { icon: Users, label: "Referrals Details", path: "/dashboard/referrals" },
    { icon: Download, label: "Download Tax Returns", path: "/dashboard/download" },
    { icon: ClipboardList, label: "FBAR Questionnaire", path: "/dashboard/fbar" },
    { icon: FolderOpen, label: "2024 Tax Organizer", path: "/dashboard/organizer" },
  ];

  // Check if any submenu item is active
  const isBasicInfoActive = menuItems[1].submenu.some(
    (item) => location.pathname === item.path
  );

  // Auto-expand Basic Information if on a submenu page
  useEffect(() => {
    if (isBasicInfoActive) {
      setBasicInfoOpen(true);
    }
  }, [isBasicInfoActive]);

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      setBasicInfoOpen(!basicInfoOpen);
    } else {
      navigate(item.path);
      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768 && setSidebarOpen) {
        setSidebarOpen(false);
      }
    }
  };

  const handleSubmenuClick = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768 && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo">
            <span className="logo-icon">▲▲</span>
            <span className="logo-text">DollarTax</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index}>
            <a
              href="#"
              className={`nav-item ${
                location.pathname === item.path || (item.hasSubmenu && isBasicInfoActive)
                  ? "active"
                  : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick(item);
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.hasSubmenu &&
                (basicInfoOpen ? (
                  <ChevronDown size={16} className="nav-arrow" />
                ) : (
                  <ChevronRight size={16} className="nav-arrow" />
                ))}
            </a>

            {/* Submenu for Basic Information */}
            {item.hasSubmenu && basicInfoOpen && (
              <div className="submenu">
                {item.submenu.map((subItem, subIndex) => (
                  <a
                    key={subIndex}
                    href="#"
                    className={`submenu-item ${
                      location.pathname === subItem.path ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuClick(subItem.path);
                    }}
                  >
                    <span className="submenu-dot">•</span>
                    <span>{subItem.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="help-section">
        <div className="help-card">
          <h4>Help Center</h4>
          <p>Please contact us for more questions.</p>
          <button 
            className="btn-help"
            onClick={() => setIsQueryModalOpen(true)}
          >
            Send Query
          </button>
        </div>
      </div>

      <SendQueryModal 
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;
