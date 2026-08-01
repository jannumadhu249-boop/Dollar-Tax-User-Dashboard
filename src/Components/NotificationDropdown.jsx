import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/NotificationDropdown.css";
import { URLS } from "../url";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ── Fetch unread notification count ──
  const fetchCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(URLS.GetNotificationCount, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCount(data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  };

  // Initial fetch and periodic polling every
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── When dropdown opens, refresh count ──
  const handleToggle = async () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      await fetchCount(); // refresh count on open
    }
  };

  const handleViewQueries = () => {
    setIsOpen(false);
    navigate("/send-query");
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button
        className="icon-btn notification-trigger"
        onClick={handleToggle}
      >
        <Bell size={20} />
        {count > 0 && <span className="badge">{count}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            <span className="badge-count">{count} unread</span>
          </div>

          <div className="notification-content">
            {count === 0 ? (
              <p className="no-notifications">No new notifications</p>
            ) : (
              <p className="no-notifications" style={{ color: "#0d6efd" }}>
                You have {count} unread notification{count > 1 ? "s" : ""}.
              </p>
            )}
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