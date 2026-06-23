import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Upload as UploadIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const UploadDocuments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
          <span className="breadcrumb-current">Upload Tax Documents</span>
        </div>

        {/* Upload Content */}
        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Upload Documents</h3>
            <p className="form-description">
              Please upload your tax related documents.
            </p>

            <div className="upload-form">
              <div className="form-group">
                <label>Document Type</label>
                <select className="form-control">
                  <option>Select Document Type</option>
                  <option>W-2 Form</option>
                  <option>1099-MISC</option>
                  <option>1099-INT</option>
                  <option>1099-DIV</option>
                  <option>1099-B</option>
                  <option>1099-R</option>
                  <option>1098 Mortgage Interest</option>
                  <option>1098-T Tuition</option>
                  <option>1098-E Student Loan Interest</option>
                  <option>Form 8606 - IRA</option>
                  <option>Form 1095-A Health Insurance</option>
                  <option>K-1 Form</option>
                  <option>Schedule C</option>
                  <option>Other Income Documents</option>
                  <option>Rental Property Documents</option>
                  <option>Investment Documents</option>
                  <option>Foreign Income Documents</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Document File</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="fileUpload"
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="fileUpload" className="file-upload-label">
                    <span className="file-upload-button">Choose File</span>
                    <span className="file-upload-text">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                  </label>
                </div>
                <p className="file-note">Note: Please upload files size below 20Mb</p>
              </div>

              {/* Upload Button */}
              <div className="upload-actions">
                <button className="btn-upload">
                  <UploadIcon size={18} />
                  Upload Now
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

export default UploadDocuments;
