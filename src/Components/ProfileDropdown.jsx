import React, { useState, useEffect, useRef } from "react";
import { User, Key, LogOut, Mail, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, isEmailVerified } from "../utils/user";
import "../styles/ProfileDropdown.css";
import { URLS } from "../url";

// Helper to get auth token (same as in other components)
const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return null;
};

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch profile from API
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(URLS.GetProfile, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();
      if (result.success && result.data) {
        const profileData = result.data;
        const userData = {
          name: profileData.name || '',
          email: profileData.email || '',
          file_no: profileData.file_no || '',
          file_status: profileData.file_status || { code: '', name: '' },
          ...getStoredUser(),
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('user-updated'));
      } else {
        console.warn('Profile fetch returned success:false', result.message);
        setUser(getStoredUser());
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setUser(getStoredUser());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load – try stored user first, then fetch fresh
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setLoading(false);
    }
    // Always fetch fresh profile
    fetchProfile();

    // Listen for user updates from other components
    const handleUserUpdated = () => {
      setUser(getStoredUser());
    };
    window.addEventListener('user-updated', handleUserUpdated);
    return () => window.removeEventListener('user-updated', handleUserUpdated);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    navigate('/change-password');
  };

  const handleVerifyEmail = () => {
    setIsOpen(false);
    navigate('/verify-email');
  };

  const showVerifyEmail = user && !isEmailVerified(user);

  // Display name – use user.name, fallback to 'Guest'
  const displayName = user?.name || 'Guest';
  const displayEmail = user?.email || 'No email';
  const displayFileNo = user?.file_no || '—';
  const displayFileStatus = user?.file_status?.name || '—';

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
              {loading ? (
                <Loader2 size={40} className="animate-spin" />
              ) : (
                <User size={40} />
              )}
            </div>
            <div className="profile-user-details">
              <h4>{loading ? 'Loading...' : displayName}</h4>
              <p className="profile-email">{loading ? '...' : displayEmail}</p>
            </div>
          </div>

          {/* Account Info */}
          <div className="profile-account-info">
            <div className="account-info-item">
              <h5>File Number</h5>
              <p className="account-number">{displayFileNo}</p>
            </div>
            <div className="account-info-item">
              <h5>File Status</h5>
              <p className="account-status">{displayFileStatus}</p>
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

            {showVerifyEmail && (
              <button
                className="profile-menu-item"
                onClick={handleVerifyEmail}
              >
                <Mail size={20} />
                <span>Verify email</span>
              </button>
            )}

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