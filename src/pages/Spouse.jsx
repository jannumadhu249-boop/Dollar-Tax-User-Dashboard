import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Spouse = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState(null);
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

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main-content">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/dashboard">Home</a>
          <span className="breadcrumb-separator">›</span>
          <a href="#">Basic Information</a>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Spouse</span>
        </div>

        {/* Form Content */}
        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Spouse Information</h3>

            <div className="form-grid">
              {/* First Row */}
              <div className="form-group">
                <label>First Name</label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group">
                <label>Middle Name</label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input type="text" className="form-control" />
              </div>

              {/* Second Row */}
              <div className="form-group">
                <label>Date of Birth</label>
                <DatePicker
                  selected={dateOfBirth}
                  onChange={(date) => setDateOfBirth(date)}
                  dateFormat="MM/dd/yyyy"
                  className="form-control"
                  placeholderText="Select date"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div className="form-group">
                <label>Occupation</label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group">
                <label>Visa Type</label>
                <select className="form-control">
                  <option>Select Visa Type</option>
                  <option>H1B</option>
                  <option>H4</option>
                  <option>L1</option>
                  <option>L2</option>
                  <option>F1</option>
                  <option>F2</option>
                  <option>J1</option>
                  <option>J2</option>
                </select>
              </div>

              {/* Third Row */}
              <div className="form-group">
                <label>Tax Id Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="taxIdType" value="ssn" defaultChecked />
                    <span>SSN/ITIN</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="taxIdType" value="applying" />
                    <span>APPLYING FOR ITIN</span>
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

        <Footer />
      </main>
    </div>
  );
};

export default Spouse;
