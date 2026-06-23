import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const ReferDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleReferFriend = () => {
    navigate("/referrals/refer-friend");
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
          <span className="breadcrumb-current">Referrals Details</span>
        </div>

        {/* Content */}
        <div className="form-container">
          <div className="form-card">
            <div className="referral-header-section">
              <h3 className="form-title">Referrals Details</h3>
              <button className="btn-refer-friend-action" onClick={handleReferFriend}>
                <Users size={18} />
                Refer Your Friend
              </button>
            </div>

            {/* Summary Cards */}
            <div className="referral-summary-cards">
              <div className="summary-card-item">
                <div className="summary-label">TOTAL</div>
                <div className="summary-value">$0.00</div>
              </div>
              <div className="summary-card-item">
                <div className="summary-label">PAID</div>
                <div className="summary-value">$0.00</div>
              </div>
              <div className="summary-card-item">
                <div className="summary-label">BAL</div>
                <div className="summary-value">$0.00</div>
              </div>
            </div>

            {/* Table */}
            <div className="table-card" style={{ marginTop: '2rem' }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>S.NO</th>
                      <th>NAME</th>
                      <th>E-MAIL</th>
                      <th>YEAR</th>
                      <th>STATUS</th>
                      <th>AMOUNT</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data">
                      <td colSpan="7" style={{ textAlign: 'left', padding: '2rem' }}>
                        No records found
                      </td>
                    </tr>
                  </tbody>
                </table>
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

export default ReferDetails;
