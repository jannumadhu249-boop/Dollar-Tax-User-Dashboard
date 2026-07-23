import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import { URLS } from "../url";

const BankDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    routing_number: "",
    account_type: "Checking Account",
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

  // Fetch bank details on mount
  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    setFetching(true);
    // Fetch bank details on mount
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in.");
        return;
      }
      const response = await fetch(URLS.GetBankDetails, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("BankDetails fetch status:", response.status);
      const data = await response.json();
      if (response.ok && data.success && data.data) {
        const item = data.data;
        console.log("[BankDetails] GET response data:", item);
        setFormData({
          bank_name: item.bank_name || "",
          account_number: item.account_number || "",
          account_holder_name: item.account_holder_name || "",
          routing_number: item.routing_number || "",
          account_type: item.account_type || "Checking Account",
        });
      } else {
        const msg = data.message || `Failed to fetch bank details (status ${response.status})`;
        setError(msg);
      }
    } catch (err) {
      setError("Network error fetching bank details.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_holder_name: formData.account_holder_name,
        routing_number: formData.routing_number,
        account_type: formData.account_type,
      };
      console.log("[BankDetails] PUT payload:", payload);
      console.log("[BankDetails] PUT URL:", URLS.UpdateBankDetails);
      const response = await fetch(URLS.UpdateBankDetails, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      console.log("[BankDetails] PUT status:", response.status);
      let data;
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }
      console.log("[BankDetails] PUT response body:", data);
      if (data.success) {
        setSuccessMsg(data.message || "Bank details saved successfully.");
      } else {
        setError(data.message || `Server error ${response.status}: check console for details.`);
      }
    } catch (err) {
      console.error("[BankDetails] PUT network error:", err);
      setError("Network error updating bank details.");
    } finally {
      setLoading(false);
    }
  };

  const accountTypeOptions = ["Checking Account", "Savings Account"];

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
          <span className="breadcrumb-current">Bank Details</span>
        </div>
        <div className="form-container">
          <div className="form-card">
            <h3 className="form-title">Bank Details</h3>
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
                <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>Fetching Bank Details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="bank-form-grid">
                  <div className="form-group">
                    <label>Bank Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Account No <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Holder Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="account_holder_name"
                      value={formData.account_holder_name || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Routing No <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="routing_number"
                      value={formData.routing_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Type of Account <span className="required">*</span></label>
                    <div className="radio-group">
                      {accountTypeOptions.map((opt) => (
                        <label className="radio-label" key={opt}>
                          <input
                            type="radio"
                            name="account_type"
                            value={opt}
                            checked={formData.account_type?.toLowerCase() === opt.toLowerCase()}
                            onChange={handleChange}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
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

export default BankDetails;
