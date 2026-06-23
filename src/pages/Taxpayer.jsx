import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Taxpayer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState(new Date("2025-01-22"));
  const [firstEntryDate, setFirstEntryDate] = useState(new Date("2025-01-21"));
  const navigate = useNavigate();

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
          <a href="#">Basic Information</a>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Taxpayer</span>
        </div>

        {/* Form Content */}
        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Tax Payer Details</h3>

            <div className="form-grid">
              {/* First Row */}
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="sandeep"
                />
              </div>

              <div className="form-group">
                <label>Middle Name</label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="sandeep"
                />
              </div>

              {/* Second Row */}
              <div className="form-group">
                <label>Gender</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="gender" value="male" defaultChecked />
                    <span>Male</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="gender" value="female" />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>SSN</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="224-45-6566"
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <DatePicker
                  selected={dateOfBirth}
                  onChange={(date) => setDateOfBirth(date)}
                  dateFormat="MM/dd/yyyy"
                  className="form-control"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              {/* Third Row */}
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="software"
                />
              </div>

              <div className="form-group">
                <label>First entry date into USA</label>
                <DatePicker
                  selected={firstEntryDate}
                  onChange={(date) => setFirstEntryDate(date)}
                  dateFormat="MM/dd/yyyy"
                  className="form-control"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div className="form-group">
                <label>Visa Type</label>
                <select className="form-control">
                  <option>NOT AVAILABLE</option>
                  <option>H1B</option>
                  <option>L1</option>
                  <option>F1</option>
                  <option>J1</option>
                </select>
              </div>

              {/* Fourth Row */}
              <div className="form-group">
                <label>Filing Status</label>
                <select className="form-control">
                  <option>Single</option>
                  <option>Married Filing Jointly</option>
                  <option>Married Filing Separately</option>
                  <option>Head of Household</option>
                </select>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select className="form-control">
                  <option>MST</option>
                  <option>EST</option>
                  <option>PST</option>
                  <option>CST</option>
                </select>
              </div>
            </div>

            {/* Contact Details Section */}
            <h3 className="form-title mt-4">Contact Details</h3>

            <div className="form-grid">
              {/* First Row */}
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="+919676170986"
                />
              </div>

              <div className="form-group">
                <label>Alternate Number</label>
                <input type="text" className="form-control" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  defaultValue="sandeep@digitalraiz.com"
                />
              </div>

              {/* Second Row - Mailing Address */}
              <div className="form-group full-width">
                <label>Mailing Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  defaultValue="testing from digitalraiz"
                />
              </div>

              {/* Third Row */}
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="hyderabad"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <select className="form-control">
                  <option>New York</option>
                  <option>California</option>
                  <option>Texas</option>
                  <option>Florida</option>
                </select>
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="4567888"
                />
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

export default Taxpayer;
