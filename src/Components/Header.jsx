import React from "react";
import { Menu, X, Users, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const handleReferFriend = () => {
    navigate("/referrals/refer-friend");
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="top-nav">
      <button
        className="menu-toggle"
        onClick={handleToggleSidebar}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="nav-left">
        <button 
          className="nav-menu-btn" 
          onClick={handleToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <span className="page-title">Home</span>
      </div>

      <div className="nav-right">
        <div className="contact-info">
          <div className="contact-item">
            <img
              src="https://flagcdn.com/w20/us.png"
              alt="US Flag"
              className="flag-icon"
            />
            <Phone size={14} />
            <span>+1-623-369-2589</span>
          </div>
          <div className="contact-item">
            <img
              src="https://flagcdn.com/w20/in.png"
              alt="India Flag"
              className="flag-icon"
            />
            <Phone size={14} />
            <span>+91-963258741</span>
          </div>
          <div className="contact-item">
            <Mail size={14} />
            <span>dollar@tax.com</span>
          </div>
        </div>

        <div className="nav-actions">
          <button className="btn-refer" onClick={handleReferFriend}>
            <Users size={18} />
            <span className="btn-refer-text">Refer Your Friend</span>
          </button>

          <NotificationDropdown />

          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
