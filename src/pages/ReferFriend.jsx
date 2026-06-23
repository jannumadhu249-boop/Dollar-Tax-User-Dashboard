import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const ReferFriend = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard/referrals");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Referral submitted successfully!");
  };

  const handleReset = () => {
    document.getElementById("referralForm").reset();
  };

  // Handle initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        {/* Top Navigation */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/dashboard">Home</a>
          <span className="breadcrumb-separator">›</span>
          <a href="/dashboard/referrals">refer List</a>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Refer a Friend</span>
        </div>

        {/* Content */}
        <div className="form-container" style={{ padding: '2rem' }}>
          <div className="back-button-wrapper" style={{ padding: '0 0 1.5rem 0' }}>
            <button className="btn-back" onClick={handleBack}>
              <ArrowLeft size={18} />
              Back To List
            </button>
          </div>

          <div className="refer-container">
            {/* Left Side - Info */}
            <div className="refer-info-section">
              <div className="refer-info-card">
                <h2>Refer a Friend and Earn!</h2>
                <p className="refer-subtitle">Invite your friends to join us and</p>
                
                <h3 className="earn-text">Earn 10% of the Fee they pay</h3>
                <p className="bonus-text">as a referral bonus.</p>

                <div className="terms-section">
                  <h4>Terms and Conditions:</h4>
                  <ol className="terms-list">
                    <li>The referrer can utilize their referral bonus for bill payments or opt for cash redemption after the 15th of each cycle.</li>
                    <li>Referrals can apply their earned credit towards all payments.</li>
                    <li>Referral credits and bonuses are valid upon the service usage of the referred client.</li>
                    <li>The reference can track their friend's status in real time from client portal.</li>
                    <li>Once must first register and then start referring the friends.</li>
                    <li>Refer more, earn more, No limits</li>
                    <li>The referral program is exclusively applicable to those referred through the "Refer a Friend" page and is not valid for one references.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="refer-form-section">
              <div className="refer-form-card">
                <h3>Your Referring Details</h3>
                
                <div className="referring-code">
                  <p>Referral Code: REF-2026-20019</p>
                </div>

                <form id="referralForm" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Friend's Name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Friend's Email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Friend's Phone Number"
                      required
                    />
                  </div>

                  <div className="refer-form-actions">
                    <button type="submit" className="btn-save">
                      Save
                    </button>
                    <button type="button" className="btn-reset" onClick={handleReset}>
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default ReferFriend;
