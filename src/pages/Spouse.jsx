import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { URLS } from "../url";
import "../styles/Dashboard.css";

const formatDate = (isoString) => {
  if (!isoString) return null;
  return new Date(isoString);
};

const toDateString = (dateObj) => {
  if (!dateObj) return null;
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const Spouse = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const today = new Date();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [occupation, setOccupation] = useState("");
  const [visaType, setVisaType] = useState("");

  // Tax ID
  const [taxIdType, setTaxIdType] = useState("ssn");
  const [ssnNumber, setSsnNumber] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState(null);
  const [visaNumber, setVisaNumber] = useState("");
  const [visaExpiry, setVisaExpiry] = useState(null);
  const [firstEntryDate, setFirstEntryDate] = useState(null);

  // UI state
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sidebar resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // GET spouse on mount
  useEffect(() => {
    const fetchSpouse = async () => {
      setFetching(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in.");
          setFetching(false);
          return;
        }
        const res = await fetch(URLS.GetSpouse, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          const d = data.data;
          setFirstName(d.first_name || "");
          setMiddleName(d.middle_name || "");
          setLastName(d.last_name || "");
          setGender(d.gender || "");
          setDateOfBirth(formatDate(d.date_of_birth));
          setOccupation(d.occupation || "");
          setVisaType(d.visa_type || "");

          if (d.tax_id_type === "APPLYING FOR ITIN") {
            setTaxIdType("applying");
            setPassportNumber(d.passport_number || "");
            setPassportExpiry(formatDate(d.passport_expiry_date));
            setVisaNumber(d.visa_number || "");
            setVisaExpiry(formatDate(d.visa_expiry_date));
            setFirstEntryDate(formatDate(d.first_entry_date_into_usa));
          } else {
            setTaxIdType("ssn");
            setSsnNumber(d.ssn_itin || "");
          }
        } else {
          setError(data.message || "Failed to fetch spouse details.");
        }
      } catch (err) {
        setError("Network error fetching spouse details.");
      } finally {
        setFetching(false);
      }
    };
    fetchSpouse();
  }, []);

  // PUT — save spouse
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body =
        taxIdType === "ssn"
          ? {
              first_name: firstName,
              middle_name: middleName,
              last_name: lastName,
              gender,
              date_of_birth: toDateString(dateOfBirth),
              occupation,
              visa_type: visaType,
              tax_id_type: "SSN/ITIN",
              ssn_itin: ssnNumber,
            }
          : {
              first_name: firstName,
              middle_name: middleName,
              last_name: lastName,
              gender,
              date_of_birth: toDateString(dateOfBirth),
              occupation,
              visa_type: visaType,
              tax_id_type: "APPLYING FOR ITIN",
              passport_number: passportNumber,
              passport_expiry_date: toDateString(passportExpiry),
              visa_number: visaNumber,
              visa_expiry_date: toDateString(visaExpiry),
              first_entry_date_into_usa: toDateString(firstEntryDate),
            };

      const res = await fetch(URLS.UpdateSpouse, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Spouse details saved successfully.");
      } else {
        setError(data.message || "Failed to update spouse details.");
      }
    } catch (err) {
      setError("Network error updating spouse details.");
    } finally {
      setLoading(false);
    }
  };

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

            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.87rem", borderRadius: "8px" }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success py-2 px-3 mb-3" style={{ fontSize: "0.87rem", borderRadius: "8px" }}>
                {successMsg}
              </div>
            )}

            {fetching ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                  Fetching Spouse Details...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Main 3-column grid */}
                <div className="form-grid">
                  {/* Row 1 */}
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Middle Name</label>
                    <input type="text" className="form-control" value={middleName} onChange={e => setMiddleName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" className="form-control" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>

                  {/* Row 2 */}
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
                      maxDate={today}
                    />
                  </div>
                  <div className="form-group">
                    <label>Occupation</label>
                    <input type="text" className="form-control" value={occupation} onChange={e => setOccupation(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Visa Type</label>
                    <select className="form-control" value={visaType} onChange={e => setVisaType(e.target.value)}>
                      <option value="">Select Visa Type</option>
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

                  {/* Row 3 */}
                  <div className="form-group">
                    <label>Gender</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="gender" value="Male" checked={gender === "Male"} onChange={e => setGender(e.target.value)} />
                        <span>Male</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="gender" value="Female" checked={gender === "Female"} onChange={e => setGender(e.target.value)} />
                        <span>Female</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tax Id Type</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="taxIdType" value="ssn" checked={taxIdType === "ssn"} onChange={e => setTaxIdType(e.target.value)} />
                        <span>SSN/ITIN</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="taxIdType" value="applying" checked={taxIdType === "applying"} onChange={e => setTaxIdType(e.target.value)} />
                        <span>APPLYING FOR ITIN</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SSN/ITIN Number */}
                {taxIdType === "ssn" && (
                  <div className="form-grid-2col" style={{ marginBottom: "1.5rem" }}>
                    <div className="form-group">
                      <label>SSN/ITIN Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={ssnNumber}
                        onChange={e => setSsnNumber(e.target.value)}
                        maxLength={12}
                        placeholder="e.g. 123-45-6789"
                      />
                    </div>
                  </div>
                )}

                {/* ITIN application fields */}
                {taxIdType === "applying" && (
                  <div className="form-grid-2col" style={{ marginBottom: "1.5rem" }}>
                    <div className="form-group">
                      <label>Passport Number</label>
                      <input type="text" className="form-control" value={passportNumber} onChange={e => setPassportNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Passport Expiry Date</label>
                      <DatePicker selected={passportExpiry} onChange={date => setPassportExpiry(date)} dateFormat="MM/dd/yyyy" className="form-control" placeholderText="Select date" />
                    </div>
                    <div className="form-group">
                      <label>Visa Number</label>
                      <input type="text" className="form-control" value={visaNumber} onChange={e => setVisaNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Visa Expiry Date</label>
                      <DatePicker selected={visaExpiry} onChange={date => setVisaExpiry(date)} dateFormat="MM/dd/yyyy" className="form-control" placeholderText="Select date" />
                    </div>
                    <div className="form-group">
                      <label>First Entry Date into USA</label>
                      <DatePicker selected={firstEntryDate} onChange={date => setFirstEntryDate(date)} dateFormat="MM/dd/yyyy" className="form-control" placeholderText="Select date" />
                    </div>
                  </div>
                )}

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

        <Footer />
      </main>
    </div>
  );
};

export default Spouse;
