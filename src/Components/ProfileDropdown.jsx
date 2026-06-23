import React, { useState, useEffect, useRef } from "react";
import { User, Key, Moon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileDropdown.css";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add("dark-mode");
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    navigate("/change-password");
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button
        className="icon-btn profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <h3>Profile</h3>
          </div>

          {/* User Info Section */}
          <div className="profile-user-section">
            <div className="profile-avatar">
              <User size={40} />
            </div>
            <div className="profile-user-details">
              <h4>{user?.name || "Balakrishna Burra"}</h4>
              <p className="profile-email">
                {user?.email || "krishnabalu365@gmail.com"}
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="profile-account-info">
            <div className="account-info-item">
              <h5>Account Number</h5>
              <p className="account-number">20019</p>
            </div>
            <div className="account-info-item">
              <h5>Account Status</h5>
              <p className="account-status">Registered only</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="profile-menu">
            <button
              className="profile-menu-item"
              onClick={handleChangePassword}
            >
              <Key size={20} />
              <span>Change password</span>
            </button>

            <div className="profile-menu-item dark-mode-toggle">
              <Moon size={20} />
              <span>Dark mode</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <button className="profile-menu-item logout-item" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
