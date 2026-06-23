import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const ScheduleTaxConsultation = () => {
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
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="main-content">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
           
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/dashboard">Home</a>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Schedule Tax Consultation</span>
        </div>

        {/* Form Content */}
        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Schedule Tax Consultation</h3>

            <div className="form-grid">
              {/* First Row */}
              <div className="form-group">
                <label>Choose Date</label>
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
                <label>Time Slot</label>
                <select className="form-control">
                  <option>Select Time Slot</option>
                  <option>7:30 AM CST</option>
                  <option>8:00 AM CST</option>
                  <option>8:30 AM CST</option>
                  <option>9:00 AM CST</option>
                  <option>9:30 AM CST</option>
                  <option>10:00 AM CST</option>
                  <option>10:30 AM CST</option>
                  <option>11:00 AM CST</option>
                </select>
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

export default ScheduleTaxConsultation;
