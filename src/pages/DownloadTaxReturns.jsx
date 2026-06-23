import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const DownloadTaxReturns = () => {
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
          <span className="breadcrumb-current">Download Tax Summary</span>
        </div>

        {/* Content */}
        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Download Tax Returns</h3>
            <p className="form-description">
              Download your E-filed copies and Review copies here
            </p>

            <div className="table-card" style={{ marginTop: '2rem' }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>S.NO</th>
                      <th>FILES</th>
                      <th>DOWNLOAD DOCUMENT</th>
                      <th>TAX YEAR</th>
                      <th>DATE & TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data">
                      <td colSpan="5" style={{ textAlign: 'left', padding: '2rem' }}>
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

export default DownloadTaxReturns;
