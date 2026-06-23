import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const FBARQuestionnaire = () => {
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

  const handleDownload = () => {
    alert("Downloading FBAR questionnaire...");
  };

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
          <span className="breadcrumb-current">Fbar Questionnaire</span>
        </div>

        {/* Content */}
        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Fbar Questionaire</h3>

            <div className="fbar-content">
              <p className="fbar-text">
                A United States person that has a financial interest in or signature authority over foreign financial accounts must file an FBAR if the aggregate value of the foreign financial accounts exceeds $10,000 at any time during the calendar year. Filing FBAR is a mandatory filing requirement for many 'United States Persons', including expats, who have 'Foreign Financial Accounts'.
              </p>

              <p className="fbar-text">
                Keep in mind that those filing FBAR aren't taxed on the balance of the accounts or anything of the sort–it's truly just a reporting requirement so that the IRS knows what money lies overseas
              </p>

              <p className="fbar-text">
                Please click the button below to download FBAR questionnaire and fill the document and upload it along with other tax documents
              </p>

              <div className="fbar-download-section">
                <button className="btn-download-fbar" onClick={handleDownload}>
                  <Download size={20} />
                  Download
                </button>
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

export default FBARQuestionnaire;
