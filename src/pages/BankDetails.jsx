import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const BankDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

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
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="main-content">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/dashboard">Home</a>
          <span className="breadcrumb-separator">›</span>
          <a href="#">Basic Information</a>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Bank Details</span>
        </div>

        {/* Form Content */}
        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Bank Details</h3>
            <p className="form-description">
              Please provide your Bank Details for direct deposit of your refunds from the departments.
            </p>

            <div className="bank-form-grid">
              <div className="form-group">
                <label>Bank Name <span className="required">*</span></label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group">
                <label>Account No <span className="required">*</span></label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group">
                <label>Account Holder Name <span className="required">*</span></label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group">
                <label>Routing No <span className="required">*</span></label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group full-width">
                <label>Type of Account <span className="required">*</span></label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="accountType" value="checking" />
                    <span>checking Account</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="accountType" value="savings" />
                    <span>savings Account</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="form-actions">
              <button className="btn-save">Save</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default BankDetails;
