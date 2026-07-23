import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { URLS } from "../url";
import "../styles/Dashboard.css";

const Taxpayer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [firstEntryDate, setFirstEntryDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const today = new Date();

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "Male",
    ssn_tin: "",
    occupation: "",
    visa_type: "NOT AVAILABLE",
    filing_status: "Single",
    timezone: "MST",
    contact_number: "",
    alternate_number: "",
    email: "",
    mailing_address: "",
    city: "",
    state: "",
    zipcode: "",
  });

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch taxpayer details on mount
  useEffect(() => {
    fetchTaxpayerData();
  }, []);

  const fetchTaxpayerData = async () => {
    setFetching(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(URLS.GetTaxPayer, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const item = resData.data;
        setFormData({
          first_name: item.first_name || "",
          middle_name: item.middle_name || "",
          last_name: item.last_name || "",
          gender: item.gender || "Male",
          ssn_tin: item.ssn_tin || "",
          occupation: item.occupation || "",
          visa_type: item.visa_type || "NOT AVAILABLE",
          filing_status: item.filing_status || "Single",
          timezone: item.timezone || "MST",
          contact_number: item.contact_number || "",
          alternate_number: item.alternate_number || "",
          email: item.email || "",
          mailing_address: item.mailing_address || "",
          city: item.city || "",
          state: item.state || "",
          zipcode: item.zipcode || "",
        });

        if (item.date_of_birth) {
          setDateOfBirth(new Date(item.date_of_birth));
        }
        if (item.first_entry_date_into_usa) {
          setFirstEntryDate(new Date(item.first_entry_date_into_usa));
        }
      } else {
        setError(resData.message || "Failed to fetch taxpayer details.");
      }
    } catch (err) {
      setError("Network error fetching taxpayer details.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (successMsg) setSuccessMsg("");
  };

  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date.split("T")[0];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const payload = {
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      gender: formData.gender,
      ssn_tin: formData.ssn_tin,
      date_of_birth: formatDate(dateOfBirth),
      occupation: formData.occupation,
      first_entry_date_into_usa: formatDate(firstEntryDate),
      visa_type: formData.visa_type,
      filing_status: formData.filing_status,
      timezone: formData.timezone,
      contact_number: formData.contact_number,
      alternate_number: formData.alternate_number,
      email: formData.email,
      mailing_address: formData.mailing_address,
      city: formData.city,
      state: formData.state,
      zipcode: formData.zipcode,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(URLS.UpdateTaxPayer, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.success) {
        setSuccessMsg(resData.message || "Taxpayer details saved successfully.");
      } else {
        setError(resData.message || "Failed to update taxpayer details.");
      }
    } catch (err) {
      setError("Network error updating taxpayer details.");
    } finally {
      setLoading(false);
    }
  };

  const visaOptions = ["NOT AVAILABLE", "H1B", "L1", "F1", "F1 OPT", "OPT", "J1"];
  const filingOptions = ["Single", "Married Filing Joint", "Married Filing Jointly", "Married Filing Separately", "Head of Household"];
  const timezoneOptions = ["MST", "EST", "PST", "CST", "IST"];
  const stateOptions = ["California", "New York", "Texas", "Florida", "Telangana", "Washington", "Illinois"];

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

            {/* Alert Messages */}
            {error && (
              <div
                className="alert alert-danger py-2 px-3 mb-3"
                style={{ fontSize: "0.87rem", borderRadius: "8px" }}
              >
                {error}
              </div>
            )}
            {successMsg && (
              <div
                className="alert alert-success py-2 px-3 mb-3"
                style={{ fontSize: "0.87rem", borderRadius: "8px" }}
              >
                {successMsg}
              </div>
            )}

            {fetching ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>Fetching Taxpayer Details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* First Row */}
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Middle Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Second Row */}
                  <div className="form-group">
                    <label>Gender</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender?.toLowerCase() === "male"}
                          onChange={handleChange}
                        />
                        <span>Male</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender?.toLowerCase() === "female"}
                          onChange={handleChange}
                        />
                        <span>Female</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>SSN / TIN</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ssn_tin"
                      value={formData.ssn_tin}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Date of Birth</label>
                    <DatePicker
                      selected={dateOfBirth}
                      onChange={(date) => {
                        setDateOfBirth(date);
                        if (error) setError("");
                        if (successMsg) setSuccessMsg("");
                      }}
                      dateFormat="MM/dd/yyyy"
                      className="form-control"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={today}
                    />
                  </div>

                  {/* Third Row */}
                  <div className="form-group">
                    <label>Occupation</label>
                    <input
                      type="text"
                      className="form-control"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>First entry date into USA</label>
                    <DatePicker
                      selected={firstEntryDate}
                      onChange={(date) => {
                        setFirstEntryDate(date);
                        if (error) setError("");
                        if (successMsg) setSuccessMsg("");
                      }}
                      dateFormat="MM/dd/yyyy"
                      className="form-control"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={today}
                    />
                  </div>

                  <div className="form-group">
                    <label>Visa Type</label>
                    <select
                      className="form-control"
                      name="visa_type"
                      value={formData.visa_type}
                      onChange={handleChange}
                    >
                      {!visaOptions.includes(formData.visa_type) && formData.visa_type && (
                        <option value={formData.visa_type}>{formData.visa_type}</option>
                      )}
                      {visaOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fourth Row */}
                  <div className="form-group">
                    <label>Filing Status</label>
                    <select
                      className="form-control"
                      name="filing_status"
                      value={formData.filing_status}
                      onChange={handleChange}
                    >
                      {!filingOptions.includes(formData.filing_status) && formData.filing_status && (
                        <option value={formData.filing_status}>{formData.filing_status}</option>
                      )}
                      {filingOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      className="form-control"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                    >
                      {!timezoneOptions.includes(formData.timezone) && formData.timezone && (
                        <option value={formData.timezone}>{formData.timezone}</option>
                      )}
                      {timezoneOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
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
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Alternate Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="alternate_number"
                      value={formData.alternate_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Second Row - Mailing Address */}
                  <div className="form-group full-width">
                    <label>Mailing Address</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="mailing_address"
                      value={formData.mailing_address}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Third Row */}
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <select
                      className="form-control"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      {!stateOptions.includes(formData.state) && formData.state && (
                        <option value={formData.state}>{formData.state}</option>
                      )}
                      {stateOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default Taxpayer;

