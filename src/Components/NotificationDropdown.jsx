import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/NotificationDropdown.css";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewQueries = () => {
    setIsOpen(false);
    navigate("/send-query");
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button
        className="icon-btn notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        <span className="badge">1</span>
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
          </div>

          <div className="notification-content">
            <p className="no-notifications">No new notifications</p>
            <button className="btn-view-queries" onClick={handleViewQueries}>
              View All Queries
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
