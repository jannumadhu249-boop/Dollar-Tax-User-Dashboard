import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { URLS } from "../url";
import "../styles/Dashboard.css";
import { CheckCircle, XCircle, X } from "lucide-react";

const Taxpayer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [firstEntryDate, setFirstEntryDate] = useState(null);
  const [marriageDate, setMarriageDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const today = new Date();
  
  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Referral states
  const [referred, setReferred] = useState("no");
  const [refer_full_name, setReferFullName] = useState("");
  const [refer_email, setReferEmail] = useState("");

  // Dynamic states list from API
  const [statesList, setStatesList] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);

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
    date_of_marriage: "",
    mailing_address: "",
    city: "",
    state: "",
    zipcode: "",
  });

  // ─── Validations ─────────────────────────────────────────

  const isValidPhone = (phone) => {
    return /^\d{10}$/.test(phone.replace(/\D/g, ''));
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ─── Auto‑dismiss alerts ─────────────────────────────────────────
  const alertTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear any existing timer
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }

    // If there's a message, set a timer to clear it after 5 seconds
    if (error || successMsg) {
      alertTimeoutRef.current = setTimeout(() => {
        setError("");
        setSuccessMsg("");
      }, 5000); // 5 seconds
    }

    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [error, successMsg]);

  // ─── Sidebar responsiveness ─────────────────────────────────────
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

  // ─── Fetch taxpayer data on mount ──────────────────────────────
  useEffect(() => {
    fetchTaxpayerData();
    fetchStates();
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
          date_of_marriage: item.date_of_marriage || "",
          mailing_address: item.mailing_address || "",
          city: item.city || "",
          state: item.state || "",
          zipcode: item.zipcode || "",
        });

        if (item.date_of_birth) setDateOfBirth(new Date(item.date_of_birth));
        if (item.first_entry_date_into_usa)
          setFirstEntryDate(new Date(item.first_entry_date_into_usa));
        if (item.date_of_marriage) setMarriageDate(new Date(item.date_of_marriage));

        if (item.referred !== undefined) setReferred(item.referred ? "yes" : "no");
        if (item.refer_full_name) setReferFullName(item.refer_full_name);
        if (item.refer_email) setReferEmail(item.refer_email);
      } else {
        // Do not show error when no data found – treat as new profile
        if (resData.message && resData.message.toLowerCase().includes("not found")) {
          setError("");
          // Pre-fill from localStorage user data saved during registration
          try {
            const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
            if (savedUser && (savedUser.first_name || savedUser.last_name || savedUser.email)) {
              setFormData((prev) => ({
                ...prev,
                first_name: savedUser.first_name || prev.first_name,
                last_name: savedUser.last_name || prev.last_name,
                email: savedUser.email || prev.email,
                contact_number: savedUser.contact_number || prev.contact_number,
              }));
            }
          } catch (_) {}
        } else {
          setError(resData.message || "Failed to fetch taxpayer details.");
        }
      }
    } catch (err) {
      setError("Network error fetching taxpayer details.");
    } finally {
      setFetching(false);
    }
  };

  // ─── Fetch States from API ───────────────────────────────────────
  const fetchStates = async () => {
    setStatesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(URLS.GetStates, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (resData.success && Array.isArray(resData.data)) {
        setStatesList(resData.data);
      } else if (Array.isArray(resData.data)) {
        setStatesList(resData.data);
      }
    } catch (err) {
      console.error("Error fetching states:", err);
    } finally {
      setStatesLoading(false);
    }
  };

  // ─── Handlers ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (successMsg) setSuccessMsg("");
  };

  // SSN/TIN formatting: only digits, max 9, format as XXX-XX-XXXX
  const handleSsnChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 5) {
      formatted = raw.slice(0, 3) + "-" + raw.slice(3);
    } else if (raw.length > 5) {
      formatted = raw.slice(0, 3) + "-" + raw.slice(3, 5) + "-" + raw.slice(5, 9);
    }
    if (formatted.length > 11) formatted = formatted.slice(0, 11);
    setFormData((prev) => ({ ...prev, ssn_tin: formatted }));
    if (error) setError("");
    if (successMsg) setSuccessMsg("");
  };

  const handlePhoneChange = (e, fieldName) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, 10);
    let formatted = limited;
    if (limited.length > 6) {
      formatted = limited.slice(0, 3) + ' ' + limited.slice(3, 6) + ' ' + limited.slice(6);
    } else if (limited.length > 3) {
      formatted = limited.slice(0, 3) + ' ' + limited.slice(3);
    }
    setFormData(prev => ({ ...prev, [fieldName]: formatted }));
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

  // ─── Step Validation ─────────────────────────────────────────────
  const validateStep = (step) => {
    setError("");
    
    switch(step) {
      case 1: // Personal Information
        if (!formData.first_name.trim()) {
          setError("First Name is required.");
          return false;
        }
        if (!formData.last_name.trim()) {
          setError("Last Name is required.");
          return false;
        }
        if (!dateOfBirth) {
          setError("Date of Birth is required.");
          return false;
        }
        break;
        
      case 2: // Employment & Immigration
        if (!formData.occupation.trim()) {
          setError("Occupation is required.");
          return false;
        }
        if (!formData.visa_type || formData.visa_type === "Select Visa Type") {
          setError("Please select a Visa Type.");
          return false;
        }
        if (!formData.filing_status || formData.filing_status === "Select") {
          setError("Please select a Filing Status.");
          return false;
        }
        if (showMarriageDate && !marriageDate) {
          setError("Date of Marriage is required for the selected filing status.");
          return false;
        }
        break;
        
      case 3: // Contact Details
        const phone = formData.contact_number.replace(/\D/g, '');
        const altPhone = formData.alternate_number.replace(/\D/g, '');
        const email = formData.email.trim();
        
        if (!isValidPhone(phone)) {
          setError("Contact Number must be exactly 10 digits.");
          return false;
        }
        if (altPhone.length > 0 && !isValidPhone(altPhone)) {
          setError("Alternate Number must be exactly 10 digits.");
          return false;
        }
        if (!email) {
          setError("Email is required.");
          return false;
        }
        if (email && !isValidEmail(email)) {
          setError("Please enter a valid email address.");
          return false;
        }
        break;
        
      case 4: // Address Information
        if (!formData.mailing_address.trim()) {
          setError("Mailing Address is required.");
          return false;
        }
        if (!formData.city.trim()) {
          setError("City is required.");
          return false;
        }
        if (!formData.state) {
          setError("State is required.");
          return false;
        }
        if (!formData.zipcode.trim()) {
          setError("Zip Code is required.");
          return false;
        }
        break;
        
      case 5: // Referral Information
        if (referred === "yes") {
          if (!refer_full_name.trim()) {
            setError("Referrer Full Name is required.");
            return false;
          }
          if (!refer_email.trim()) {
            setError("Referrer Email is required.");
            return false;
          }
          if (!isValidEmail(refer_email.trim())) {
            setError("Please enter a valid referrer email address.");
            return false;
          }
        }
        break;
        
      default:
        break;
    }
    
    return true;
  };

  // ─── Step Navigation ─────────────────────────────────────────────
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setError("");
    setSuccessMsg("");
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // ─── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate final step before submitting
    if (!validateStep(currentStep)) {
      setLoading(false);
      return;
    }
    
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const payload = {
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      gender: formData.gender,
      ssn_tin: formData.ssn_tin.replace(/-/g, ""),
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
      marriage_date: formatDate(marriageDate),
      referred: referred === "yes",
      refer_full_name: refer_full_name,
      refer_email: refer_email,
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

  // ─── Conditional rendering – marriage date ─────────────────────
  const showMarriageDate = [
    "Married Filing Separate",
    "Married Filing Joint",
    "Qualifying Widow/ER",
  ].includes(formData.filing_status);

  // ─── Options ────────────────────────────────────────────────────
  const visaOptions = [
    "Select Visa Type",
    "NOT AVAILABLE",
    "US CITIZEN",
    "B1",
    "B2",
    "H1 A",
    "H1 B",
    "H4",
    "L1 A",
    "L1 B",
    "L2",
    "F1",
    "F1 OPT",
    "F1 CPT",
    "J",
    "M",
    "Q",
    "EAD",
    "GREEN CARD",
    "TN",
  ];
  const filingOptions = [
    "Select",
    "Single",
    "Married Filing Joint",
    "Married Filing Separate",
    "Head of Household",
    "Qualifying Widow/ER",
  ];
  const timezoneOptions = [
    "Select Time Zone",
    "MST",
    "EST",
    "PST",
    "CST",
    "IST",
  ];


  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main-content">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="breadcrumb">
          <a href="/dashboard">Home</a>
          <span className="breadcrumb-separator">›</span>
          <a href="#">Basic Information</a>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Taxpayer</span>
        </div>

        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Tax Payer Details</h3>

            {/* ─── Advanced Alerts ─── */}
            {error && (
              <div
                className="alert alert-danger d-flex align-items-center justify-content-between py-2 px-3 mb-3"
                style={{
                  fontSize: "0.87rem",
                  borderRadius: "8px",
                  borderLeft: "4px solid #dc3545",
                  backgroundColor: "#fff5f5",
                  color: "#842029",
                }}
              >
                <div className="d-flex align-items-center">
                  <XCircle size={18} className="me-2" style={{ color: "#dc3545" }} />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem",
                    lineHeight: 1,
                    cursor: "pointer",
                    color: "#842029",
                  }}
                  onClick={() => setError("")}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {successMsg && (
              <div
                className="alert alert-success d-flex align-items-center justify-content-between py-2 px-3 mb-3"
                style={{
                  fontSize: "0.87rem",
                  borderRadius: "8px",
                  borderLeft: "4px solid #198754",
                  backgroundColor: "#f0fff4",
                  color: "#0a5c36",
                }}
              >
                <div className="d-flex align-items-center">
                  <CheckCircle size={18} className="me-2" style={{ color: "#198754" }} />
                  <span>{successMsg}</span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem",
                    lineHeight: 1,
                    cursor: "pointer",
                    color: "#0a5c36",
                  }}
                  onClick={() => setSuccessMsg("")}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {fetching ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                  Fetching Taxpayer Details...
                </p>
              </div>
            ) : (
              <>
                {/* ─── Step Progress Indicator ─── */}
                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    position: "relative",
                    marginBottom: "1rem"
                  }}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center",
                        flex: 1,
                        position: "relative"
                      }}>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: currentStep >= step ? "#2563eb" : "#e5e7eb",
                          color: currentStep >= step ? "#fff" : "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          fontSize: "0.95rem",
                          zIndex: 2,
                          transition: "all 0.3s ease"
                        }}>
                          {step}
                        </div>
                        <div style={{
                          marginTop: "0.5rem",
                          fontSize: "0.75rem",
                          fontWeight: currentStep === step ? "600" : "400",
                          color: currentStep === step ? "#2563eb" : "#6b7280",
                          textAlign: "center",
                          maxWidth: "120px"
                        }}>
                          {step === 1 && "Personal Info"}
                          {step === 2 && "Employment"}
                          {step === 3 && "Contact"}
                          {step === 4 && "Address"}
                          {step === 5 && "Referral"}
                        </div>
                        {step < 5 && (
                          <div style={{
                            position: "absolute",
                            top: "20px",
                            left: "50%",
                            width: "100%",
                            height: "2px",
                            backgroundColor: currentStep > step ? "#2563eb" : "#e5e7eb",
                            zIndex: 1,
                            transition: "all 0.3s ease"
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* ─── Step 1: Personal Information ─── */}
                  {currentStep === 1 && (
                    <>
                      <h3 className="form-title">Step 1: Personal Information</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>First Name <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter First Name"
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
                            placeholder="Enter Middle Name"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Last Name <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                          />
                        </div>

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
                            onChange={handleSsnChange}
                            placeholder="XXX-XX-XXXX"
                            maxLength="11"
                          />
                        </div>

                        <div className="form-group">
                          <label>Date of Birth <span style={{ color: "red" }}>*</span></label>
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
                            placeholderText="Enter Date of Birth"
                            maxDate={today}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─── Step 2: Employment & Immigration ─── */}
                  {currentStep === 2 && (
                    <>
                      <h3 className="form-title">Step 2: Employment & Immigration</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Occupation <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Occupation In USA"
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
                            placeholderText="Enter First Entry Date"
                            maxDate={today}
                          />
                        </div>

                        <div className="form-group">
                          <label>Visa Type <span style={{ color: "red" }}>*</span></label>
                          <select
                            className="form-control"
                            name="visa_type"
                            value={formData.visa_type}
                            onChange={handleChange}
                          >
                            {!visaOptions.includes(formData.visa_type) &&
                              formData.visa_type && (
                                <option value={formData.visa_type}>
                                  {formData.visa_type}
                                </option>
                              )}
                            {visaOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Filing Status <span style={{ color: "red" }}>*</span></label>
                          <select
                            className="form-control"
                            name="filing_status"
                            value={formData.filing_status}
                            onChange={handleChange}
                          >
                            {!filingOptions.includes(formData.filing_status) &&
                              formData.filing_status && (
                                <option value={formData.filing_status}>
                                  {formData.filing_status}
                                </option>
                              )}
                            {filingOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Conditional Marriage Date field */}
                        {showMarriageDate && (
                          <div className="form-group">
                            <label>Date of Marriage <span style={{ color: "red" }}>*</span></label>
                            <DatePicker
                              selected={marriageDate}
                              onChange={(date) => {
                                setMarriageDate(date);
                                if (error) setError("");
                                if (successMsg) setSuccessMsg("");
                              }}
                              dateFormat="MM/dd/yyyy"
                              className="form-control"
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              placeholderText="Enter Date of Marriage"
                              maxDate={today}
                            />
                          </div>
                        )}

                        <div className="form-group">
                          <label>Timezone</label>
                          <select
                            className="form-control"
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleChange}
                          >
                            {!timezoneOptions.includes(formData.timezone) &&
                              formData.timezone && (
                                <option value={formData.timezone}>
                                  {formData.timezone}
                                </option>
                              )}
                            {timezoneOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─── Step 3: Contact Details ─── */}
                  {currentStep === 3 && (
                    <>
                      <h3 className="form-title">Step 3: Contact Details</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Contact Number <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Phone Number"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={(e) => handlePhoneChange(e, "contact_number")}
                          />
                        </div>
                        <div className="form-group">
                          <label>Alternate Number</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Alternate Number"
                            name="alternate_number"
                            value={formData.alternate_number}
                            onChange={(e) => handlePhoneChange(e, "alternate_number")}
                          />
                        </div>
                        <div className="form-group">
                          <label>Email <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Enter Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─── Step 4: Address Information ─── */}
                  {currentStep === 4 && (
                    <>
                      <h3 className="form-title">Step 4: Address Information</h3>
                      <div className="form-grid">
                        <div className="form-group full-width">
                          <label>Mailing Address <span style={{ color: "red" }}>*</span></label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Enter Mailing Address"
                            name="mailing_address"
                            value={formData.mailing_address}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>City <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>State <span style={{ color: "red" }}>*</span></label>
                          <select
                            className="form-control"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            disabled={statesLoading}
                          >
                            <option value="">
                              {statesLoading ? "Loading states..." : "Select State"}
                            </option>
                            {formData.state &&
                              !statesList.some(
                                (s) =>
                                  (s.name || s.state_name || s) === formData.state
                              ) && (
                                <option value={formData.state}>
                                  {formData.state}
                                </option>
                              )}
                            {statesList.map((stateItem, idx) => {
                              const stateName =
                                typeof stateItem === "string"
                                  ? stateItem
                                  : stateItem.name ||
                                    stateItem.state_name ||
                                    stateItem.title ||
                                    stateItem.label ||
                                    "";
                              const stateId =
                                typeof stateItem === "string"
                                  ? stateItem
                                  : stateItem._id || stateName;
                              return (
                                <option key={stateId || idx} value={stateName}>
                                  {stateName}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Zip Code <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            name="zipcode"
                            value={formData.zipcode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─── Step 5: Referral Information ─── */}
                  {currentStep === 5 && (
                    <>
                      <h3 className="form-title">Step 5: Referral Information</h3>
                      <div className="form-grid">
                        <div className="form-group full-width">
                          <label>Have you been referred?</label>
                          <div
                            className="radio-group"
                            style={{ display: "flex", gap: "1.5rem", marginTop: "0.25rem" }}
                          >
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="referred"
                                value="yes"
                                checked={referred === "yes"}
                                onChange={() => {
                                  setReferred("yes");
                                  if (error) setError("");
                                  if (successMsg) setSuccessMsg("");
                                }}
                              />
                              <span>Yes</span>
                            </label>
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="referred"
                                value="no"
                                checked={referred === "no"}
                                onChange={() => {
                                  setReferred("no");
                                  setReferFullName("");
                                  setReferEmail("");
                                  if (error) setError("");
                                  if (successMsg) setSuccessMsg("");
                                }}
                              />
                              <span>No</span>
                            </label>
                          </div>
                        </div>

                        {referred === "yes" && (
                          <>
                            <div className="form-group">
                              <label>Full Name <span style={{ color: "red" }}>*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Referred Name"
                                value={refer_full_name}
                                onChange={(e) => {
                                  setReferFullName(e.target.value);
                                  if (error) setError("");
                                  if (successMsg) setSuccessMsg("");
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label>Referred Email <span style={{ color: "red" }}>*</span></label>
                              <input
                                type="email"
                                className="form-control"
                                placeholder="Enter Referred Email Address"
                                value={refer_email}
                                onChange={(e) => {
                                  setReferEmail(e.target.value);
                                  if (error) setError("");
                                  if (successMsg) setSuccessMsg("");
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {/* ─── Navigation Buttons ─── */}
                  <div className="form-actions" style={{ 
                    display: "flex", 
                    justifyContent: currentStep === 1 ? "flex-end" : "space-between",
                    gap: "1rem",
                    marginTop: "2rem"
                  }}>
                    {currentStep > 1 && (
                      <button 
                        type="button" 
                        className="btn-save" 
                        onClick={handlePrevious}
                        style={{
                          backgroundColor: "#6b7280",
                          flex: "1",
                          maxWidth: "200px"
                        }}
                      >
                        Previous
                      </button>
                    )}
                    
                    {currentStep < totalSteps ? (
                      <button 
                        type="button" 
                        className="btn-save" 
                        onClick={handleNext}
                        style={{
                          flex: "1",
                          maxWidth: "200px"
                        }}
                      >
                        Next
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        className="btn-save" 
                        disabled={loading}
                        style={{ 
                          flex: "1",
                          maxWidth: "200px"
                        }}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Taxpayer;