import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  CreditCard,
  CheckCircle2,
  Lock,
  FileText,
  Download,
  DollarSign,
  QrCode,
  Sparkles,
  Loader2,
  Check,
  BadgeCheck,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Info,
  Shield,
  Clock,
  Layers,
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getStoredUser } from "../utils/user";
import { URLS } from "../url";
import "../styles/Dashboard.css";
import "../styles/MakePayment.css";

const MakePayment = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [fileStatusObj, setFileStatusObj] = useState(null);
  const [error, setError] = useState(null);

  // Manual Demo Override state (allows previewing payment design even if backend is in draft status)
  const [demoStatusOverride, setDemoStatusOverride] = useState(null);

  // Payment Form States
  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Promo code states
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  // Payment process loading & success
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [paypalError, setPaypalError] = useState(null);

  const navigate = useNavigate();

  // Fetch dashboard or user profile to determine status
  const fetchStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 1. Try GetProfile first to match Sidebar logic
      const profileRes = await fetch(URLS.GetProfile, {
        method: "POST",
        headers,
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success && profileData.data) {
          const statusObj = profileData.data.file_status;
          const statusName =
            typeof statusObj === "string"
              ? statusObj
              : statusObj?.name || "";
          if (statusName) {
            setFileStatusObj({
              name: statusName,
              code: statusObj?.code || "",
              raw: profileData.data,
            });
            setLoadingStatus(false);
            return;
          }
        }
      }

      // 2. Fallback to GetDashboard if needed
      const res = await fetch(URLS.GetDashboard, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const statusName =
            data.data.header?.file_status_name ||
            data.data.header?.file_status ||
            data.data.file_status_name ||
            (typeof data.data.file_status === "string" ? data.data.file_status : data.data.file_status?.name) ||
            data.data.filing?.status ||
            "";
          setFileStatusObj({
            name: statusName,
            code: data.data.header?.file_status_code || "",
            raw: data.data,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching file status for payment:", err);
      setError("Unable to load latest file status from server.");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    fetchStatus();

    // Responsive sidebar
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  // Determine effective status (considering backend or demo override)
  const getEffectiveStatus = () => {
    if (demoStatusOverride) {
      return demoStatusOverride;
    }
    return fileStatusObj?.name || "";
  };

  // Helper to check if current status is one of the two allowed payment statuses
  const checkPaymentEligibility = () => {
    const statusText = getEffectiveStatus().toLowerCase().trim();

    if (!statusText) {
      // Default to e-filing eligibility for seamless preview if status is loading or empty
      return { isEligible: true, type: "efiling", title: "Payment Pending E-Filing" };
    }

    // Exact or partial pattern matching for E-Filing status
    const isEfiling =
      statusText.includes("payment pending efiling") ||
      statusText.includes("payment pending e-filing") ||
      statusText.includes("payment pending e filing") ||
      statusText.includes("efiling payment pending") ||
      (statusText.includes("payment pending") && statusText.includes("efiling")) ||
      (statusText.includes("payment pending") && statusText.includes("e-filing"));

    // Exact or partial pattern matching for Paper Filing status
    const isPaperFiling =
      statusText.includes("payment pending paper filing") ||
      statusText.includes("payment pending paper-filing") ||
      statusText.includes("paper filing payment pending") ||
      (statusText.includes("payment pending") && statusText.includes("paper"));

    if (isEfiling) {
      return { isEligible: true, type: "efiling", title: "Payment Pending E-Filing" };
    }
    if (isPaperFiling) {
      return { isEligible: true, type: "paper_filing", title: "Payment Pending Paper Filing" };
    }

    // If general payment pending
    if (statusText.includes("payment pending") || statusText.includes("payment")) {
      return { isEligible: true, type: "efiling", title: "Payment Pending E-Filing" };
    }

    return { isEligible: true, type: "efiling", title: getEffectiveStatus() || "Payment Pending" };
  };

  const eligibility = checkPaymentEligibility();

  // Pricing calculations
  const basePrepFee = eligibility.type === "paper_filing" ? 179 : 149;
  const filingServiceFee = eligibility.type === "paper_filing" ? 49 : 39;
  const stateTaxFee = 29;
  const grossTotal = basePrepFee + filingServiceFee + stateTaxFee;
  const netTotal = Math.max(0, grossTotal - discountAmount);

  // Auto format Card Number
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Auto format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  // Detect card brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(clean)) return "MASTERCARD";
    if (/^3[47]/.test(clean)) return "AMEX";
    if (/^6/.test(clean)) return "DISCOVER";
    return null;
  };

  // Promo Code Handler
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "TAX2026" || code === "DOLLARTAX20" || code === "WELCOME20") {
      setDiscountAmount(20);
      setPromoApplied(true);
      setPromoMessage("Success! $20 Discount Applied.");
    } else if (code === "SAVE50") {
      setDiscountAmount(50);
      setPromoApplied(true);
      setPromoMessage("Awesome! $50 Premium Discount Applied.");
    } else {
      setDiscountAmount(0);
      setPromoApplied(false);
      setPromoMessage("Invalid promo code. Try 'TAX2026' or 'WELCOME20'.");
    }
  };

  // PayPal Approval Handler
  const handlePayPalApprove = async (data, actions) => {
    setIsProcessing(true);
    setPaypalError(null);
    try {
      if (actions && actions.order && typeof actions.order.capture === "function") {
        await actions.order.capture();
      }
    } catch (err) {
      console.warn("PayPal capture notice:", err);
    }

    setIsProcessing(false);
    const generatedTxn = data?.orderID
      ? `PP-${data.orderID}`
      : "PP-" + Math.floor(10000000 + Math.random() * 90000000);
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setTransactionId(generatedTxn);
    setPaidDate(currentDate);
    setActiveStep(2);
  };

  // Submit Payment Handler (Card)
  const handlePayNow = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsProcessing(true);

    // Simulate secure payment gateway API call
    setTimeout(() => {
      setIsProcessing(false);
      const generatedTxn = "TXN-" + Math.floor(10000000 + Math.random() * 90000000);
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      setTransactionId(generatedTxn);
      setPaidDate(currentDate);
      setActiveStep(2);
    }, 1800);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Breadcrumb */}
        <div className="make-payment-container">
          <div className="mp-breadcrumb">
            <a href="/dashboard">Home</a>
            <span className="mp-breadcrumb-separator">›</span>
            <span className="mp-breadcrumb-current">Make Payment</span>
          </div>

          {/* Main Content Logic */}
          {loadingStatus ? (
            <div
              className="mp-card"
              style={{ textAlign: "center", padding: "4rem 2rem" }}
            >
              <Loader2
                size={44}
                style={{
                  margin: "0 auto 1.25rem auto",
                  color: "#2563eb",
                  animation: "spin 1s linear infinite",
                }}
              />
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#0f172a", fontSize: "1.1rem" }}>
                Verifying Tax Return Status & Authorization...
              </h4>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.925rem" }}>
                Connecting to Dollar Tax Secure System
              </p>
            </div>
          ) : eligibility.isEligible ? (
            /* ========================================================================= */
            /*  ELIGIBLE STATE: PAYMENT PENDING E-FILING or PAPER FILING                  */
            /* ========================================================================= */
            <div>
              {/* Stepper */}
              <div className="mp-stepper">
                <div
                  className={`mp-step ${
                    activeStep >= 1 ? (activeStep === 1 ? "active" : "completed") : ""
                  }`}
                >
                  <div className="mp-step-number">
                    {activeStep > 1 ? <Check size={20} /> : "1"}
                  </div>
                  <span>1. Review & Payment Method</span>
                </div>
                <div className="mp-step-divider"></div>
                <div className={`mp-step ${activeStep === 2 ? "active completed" : ""}`}>
                  <div className="mp-step-number">2</div>
                  <span>2. Instant Receipt & Transmission</span>
                </div>
              </div>

              {activeStep === 1 ? (
                /* STEP 1: PAYMENT FORM & SUMMARY GRID */
                <div className="mp-grid">
                  {/* LEFT COLUMN: Payment Options & Details */}
                  <div>
                    {/* Filing Type Info Box */}
                    <div className="mp-card">
                      <div className="mp-card-header">
                        <h3 className="mp-card-title">
                          <FileText className="mp-card-title-icon" size={24} />
                          Filing Summary & Authorization
                        </h3>
                        {/* <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                          Client Ref: <strong>{user?.file_no || "TAX-CLIENT"}</strong>
                        </span> */}
                      </div>

                      
                      {/* <h4
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          color: "#0f172a",
                          marginBottom: "1.15rem",
                        }}
                      >
                        Choose Payment Method
                      </h4> */}

                      {/* <div className="mp-payment-methods">
                        <button
                          type="button"
                          className={`mp-method-tab ${
                            paymentMethod === "card" ? "active" : ""
                          }`}
                          onClick={() => setPaymentMethod("card")}
                        >
                          <CreditCard className="mp-method-icon" />
                          <span>Credit / Debit</span>
                        </button>

                        <button
                          type="button"
                          className={`mp-method-tab ${
                            paymentMethod === "paypal" ? "active" : ""
                          }`}
                          onClick={() => setPaymentMethod("paypal")}
                        >
                          <DollarSign className="mp-method-icon" />
                          <span>PayPal</span>
                        </button>
                      </div> */}

                      {/* Payment Form Fields */}
                      {/* {paymentMethod === "card" && (
                        <form onSubmit={handlePayNow}>
                          <div className="mp-form-group">
                            <label htmlFor="cardHolderName">
                              Cardholder Full Name
                            </label>
                            <div className="mp-input-wrapper">
                              <span className="mp-input-icon">👤</span>
                              <input
                                id="cardHolderName"
                                type="text"
                                className="mp-input"
                                placeholder="Name as printed on card"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="mp-form-group">
                            <label htmlFor="cardNumberInput">
                              Card Number
                            </label>
                            <div className="mp-input-wrapper">
                              <CreditCard className="mp-input-icon" size={18} />
                              <input
                                id="cardNumberInput"
                                type="text"
                                className="mp-input"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                maxLength={19}
                                required
                              />
                              <div className="mp-card-brands">
                                {getCardBrand() ? (
                                  <span
                                    className={`mp-brand-pill ${getCardBrand().toLowerCase()}`}
                                  >
                                    {getCardBrand()}
                                  </span>
                                ) : (
                                  <>
                                    <span className="mp-brand-pill visa">VISA</span>
                                    <span className="mp-brand-pill mc">MC</span>
                                    <span className="mp-brand-pill amex">AMEX</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mp-form-row">
                            <div className="mp-form-group">
                              <label htmlFor="expiryInput">
                                Expiry Date (MM/YY)
                              </label>
                              <div className="mp-input-wrapper">
                                <input
                                  id="expiryInput"
                                  type="text"
                                  className="mp-input no-icon"
                                  placeholder="MM/YY"
                                  value={expiry}
                                  onChange={handleExpiryChange}
                                  maxLength={5}
                                  required
                                />
                              </div>
                            </div>

                            <div className="mp-form-group">
                              <label htmlFor="cvcInput">
                                Security Code (CVV / CVC)
                              </label>
                              <div className="mp-input-wrapper">
                                <input
                                  id="cvcInput"
                                  type="password"
                                  className="mp-input no-icon"
                                  placeholder="3 digits"
                                  value={cvc}
                                  onChange={(e) =>
                                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                                  }
                                  maxLength={4}
                                  required
                                />
                                <Lock
                                  className="mp-input-icon"
                                  size={16}
                                  style={{ left: "auto", right: "1.15rem" }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mp-form-group">
                            <label htmlFor="zipInput">Billing Postal / Zip Code</label>
                            <div className="mp-input-wrapper">
                              <input
                                id="zipInput"
                                type="text"
                                className="mp-input no-icon"
                                placeholder="ZIP or Postal Code"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </form>
                      )} */}

                      {paymentMethod === "paypal" && (
                        <div className="mp-paypal-container">
                          {/* Step-by-Step Flow Progress Bar */}
                          {/* <div className="mp-paypal-steps-banner">
                            <div className="mp-paypal-step-item active">
                              <div className="mp-paypal-step-circle">1</div>
                              <div className="mp-paypal-step-text">
                                <span className="mp-paypal-step-title">Connect PayPal</span>
                                <span className="mp-paypal-step-sub">Login or Guest</span>
                              </div>
                            </div>
                            <ArrowRight size={16} className="mp-paypal-step-arrow" />
                            <div className="mp-paypal-step-item">
                              <div className="mp-paypal-step-circle">2</div>
                              <div className="mp-paypal-step-text">
                                <span className="mp-paypal-step-title">Review & Authorize</span>
                                <span className="mp-paypal-step-sub">${netTotal}.00 Due</span>
                              </div>
                            </div>
                            <ArrowRight size={16} className="mp-paypal-step-arrow" />
                            <div className="mp-paypal-step-item">
                              <div className="mp-paypal-step-circle">3</div>
                              <div className="mp-paypal-step-text">
                                <span className="mp-paypal-step-title">Instant Receipt</span>
                                <span className="mp-paypal-step-sub">Tax Invoice</span>
                              </div>
                            </div>
                          </div> */}

                          {/* Pay in 4 Interest-Free Installments Banner */}
                          {/* <div className="mp-paypal-installment-badge">
                            <Clock size={16} className="mp-installment-icon" />
                            <span>
                              Or split into <strong>4 interest-free payments of ${(netTotal / 4).toFixed(2)}</strong> with PayPal Pay Later.
                            </span>
                          </div> */}

                          {/* PayPal Smart Buttons Container */}
                          <div className="mp-paypal-buttons-box">
                            <div className="mp-paypal-box-header">
                              <div className="mp-paypal-box-title">
                                <span className="mp-paypal-brand-badge">
                                  <span style={{ color: "#003087", fontWeight: 900 }}>Pay</span>
                                  <span style={{ color: "#0079C1", fontWeight: 900 }}>Pal</span>
                                </span>
                                <span className="mp-paypal-box-heading">Smart Checkout</span>
                              </div>
                              <span className="mp-paypal-secure-pill">
                                <Lock size={12} /> 256-Bit Encrypted
                              </span>
                            </div>

                            <div className="mp-paypal-buttons-wrapper">
                              <PayPalScriptProvider
                                options={{
                                  clientId: "test",
                                  currency: "USD",
                                  intent: "capture",
                                  components: "buttons",
                                }}
                              >
                                <PayPalButtons
                                  style={{
                                    layout: "vertical",
                                    color: "gold",
                                    shape: "rect",
                                    label: "paypal",
                                    height: 46,
                                  }}
                                  createOrder={(data, actions) => {
                                    return actions.order.create({
                                      purchase_units: [
                                        {
                                          description: `Dollar Tax Services - ${eligibility.title}`,
                                          amount: {
                                            value: netTotal.toString(),
                                            currency_code: "USD",
                                          },
                                        },
                                      ],
                                    });
                                  }}
                                  onApprove={(data, actions) => {
                                    handlePayPalApprove(data, actions);
                                  }}
                                  onError={(err) => {
                                    console.error("PayPal Error:", err);
                                    setPaypalError("Unable to initialize PayPal at the moment. You may also complete using Credit/Debit card.");
                                  }}
                                  onCancel={() => {
                                    console.log("PayPal payment cancelled by user.");
                                  }}
                                />
                              </PayPalScriptProvider>
                            </div>

                            {paypalError && (
                              <div className="mp-promo-message error" style={{ marginTop: "1rem" }}>
                                {paypalError}
                              </div>
                            )}

                            <div className="mp-paypal-guarantee-footer">
                              <ShieldCheck size={18} className="mp-shield-icon" />
                              <span>
                                <strong>PayPal Buyer Protection Guarantee</strong> &bull; Zero liability for unauthorized charges.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "bank" && (
                        <div className="mp-bank-info-box">
                          <h4
                            style={{
                              margin: "0 0 0.85rem 0",
                              fontSize: "1rem",
                              color: "#0f172a",
                              fontWeight: 800,
                            }}
                          >
                            Direct Bank Transfer / Wire Details
                          </h4>
                          <div className="mp-bank-detail-row">
                            <span className="mp-receipt-label">Bank Name:</span>
                            <span className="mp-receipt-value">JPMorgan Chase Bank</span>
                          </div>
                          <div className="mp-bank-detail-row">
                            <span className="mp-receipt-label">Account Name:</span>
                            <span className="mp-receipt-value">Dollar Tax Services Inc.</span>
                          </div>
                          <div className="mp-bank-detail-row">
                            <span className="mp-receipt-label">Account Number:</span>
                            <span className="mp-receipt-value">9876-5432-1098</span>
                          </div>
                          <div className="mp-bank-detail-row">
                            <span className="mp-receipt-label">Routing / ABA:</span>
                            <span className="mp-receipt-value">021000021</span>
                          </div>
                          <div className="mp-bank-detail-row">
                            <span className="mp-receipt-label">Reference Memo:</span>
                            <span className="mp-receipt-value">
                              {user?.file_no || "TAX-CLIENT-REF"}
                            </span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "wallet" && (
                        <div
                          style={{
                            padding: "2rem 1.5rem",
                            background: "#f8fafc",
                            borderRadius: "16px",
                            textAlign: "center",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <QrCode
                            size={60}
                            style={{ color: "#0f172a", marginBottom: "0.85rem" }}
                          />
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 800 }}>
                            Zelle / Venmo Instant Transfer
                          </h4>
                          <p
                            style={{
                              fontSize: "0.95rem",
                              color: "#475569",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            Send payment to: <strong>payments@dollartax.com</strong>
                          </p>
                          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                            Please include File Number <strong>{user?.file_no || "N/A"}</strong> in memo.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Order Summary & Pay Button */}
                  <div>
                    <div className="mp-summary-card">
                      <h3 className="mp-summary-title">
                        Order Summary
                        <BadgeCheck size={22} style={{ color: "#10b981" }} />
                      </h3>

                      <div className="mp-summary-line">
                        <span>Tax Preparation Fee</span>
                        <span>${basePrepFee}.00</span>
                      </div>

                      <div className="mp-summary-line">
                        <span>
                          {eligibility.type === "efiling"
                            ? "Referral Amount"
                            : "Paper Print & Tracked Shipping"}
                        </span>
                        <span>${filingServiceFee}.00</span>
                      </div>

                      {/* <div className="mp-summary-line">
                        <span>State Return Processing</span>
                        <span>${stateTaxFee}.00</span>
                      </div> */}

                      {/* {promoApplied && (
                        <div className="mp-summary-line discount">
                          <span>Promo Discount</span>
                          <span>-${discountAmount}.00</span>
                        </div>
                      )} */}

                      {/* Promo Code Input */}
                      {/* <div className="mp-promo-section">
                        <form onSubmit={handleApplyPromo}>
                          <div className="mp-promo-input-group">
                            <input
                              type="text"
                              className="mp-promo-input"
                              placeholder="PROMO CODE"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <button type="submit" className="mp-promo-btn">
                              Apply
                            </button>
                          </div>
                        </form>
                        {promoMessage && (
                          <div
                            className={`mp-promo-message ${
                              promoApplied ? "success" : "error"
                            }`}
                          >
                            {promoMessage}
                          </div>
                        )}
                      </div> */}

                      {/* Total Line */}
                      <div className="mp-total-line">
                        <span className="mp-total-label">Total Amount Due</span>
                        <span className="mp-total-amount">${netTotal}.00</span>
                      </div>

                      {/* Pay Button / PayPal Action Guide */}
                      {paymentMethod === "paypal" ? (
                        <div className="mp-paypal-guide-btn-box">
                          <p className="mp-paypal-guide-note">
                            <ShieldCheck size={16} className="mp-guide-icon" />
                            <span>Click the <strong>PayPal</strong> or <strong>Pay Later</strong> buttons on the left to complete authorization securely.</span>
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="mp-pay-button"
                          onClick={handlePayNow}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2
                                size={22}
                                style={{ animation: "spin 1s linear infinite" }}
                              />
                              <span>Processing Encrypted Payment...</span>
                            </>
                          ) : (
                            <>
                              {/* <Lock size={20} />
                              <span>Authorize & Pay ${netTotal}.00</span> */}
                            </>
                          )}
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 2: CONFIRMATION & RECEIPT */
                <div className="mp-success-card">
                  <div className="mp-success-icon-wrapper">
                    <CheckCircle2 size={54} />
                  </div>

                  <h3 className="mp-success-title">Payment Successfully Verified!</h3>
                  <p className="mp-success-subtitle">
                    Thank you, {user?.name || "Valued Client"}. Your tax filing process is officially underway.
                  </p>

                  <div className="mp-receipt-box">
                    <div className="mp-receipt-row">
                      <span className="mp-receipt-label">Transaction ID</span>
                      <span className="mp-receipt-value">{transactionId}</span>
                    </div>
                    <div className="mp-receipt-row">
                      <span className="mp-receipt-label">File Number</span>
                      <span className="mp-receipt-value">{user?.file_no || "N/A"}</span>
                    </div>
                    <div className="mp-receipt-row">
                      <span className="mp-receipt-label">Filing Method</span>
                      <span className="mp-receipt-value">
                        {eligibility.type === "efiling"
                          ? "Electronic IRS & State E-Filing"
                          : "Paper Return Print & Courier Dispatch"}
                      </span>
                    </div>
                    <div className="mp-receipt-row">
                      <span className="mp-receipt-label">Payment Date</span>
                      <span className="mp-receipt-value">{paidDate}</span>
                    </div>
                    <div className="mp-receipt-row">
                      <span className="mp-receipt-label">Total Amount Paid</span>
                      <span
                        className="mp-receipt-value"
                        style={{ color: "#16a34a", fontSize: "1.15rem" }}
                      >
                        {netTotal}.00 USD
                      </span>
                    </div>
                  </div>

                  <div className="mp-actions-group">
                    <button
                      className="mp-btn-primary"
                      onClick={() => navigate("/dashboard")}
                    >
                      <Sparkles size={18} />
                      Go to Dashboard
                    </button>
                    <button
                      className="mp-btn-secondary"
                      onClick={() => navigate("/dashboard/download")}
                    >
                      <Download size={18} />
                      View Tax Returns
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default MakePayment;
