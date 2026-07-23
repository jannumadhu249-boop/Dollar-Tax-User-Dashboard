import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { URLS } from "../url";
import "../styles/Dashboard.css";

/* ─── helpers ─────────────────────────────────────────────────── */
const toDate = (iso) => (iso ? new Date(iso) : null);
const toDateStr = (d) => {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const EMPTY_FORM = {
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "",
  date_of_birth: null,
  relationship: "",
  visa_type: "",
  tax_id_type: "ssn",        // 'ssn' | 'applying'
  ssn_itin: "",
  passport_number: "",
  passport_expiry_date: null,
  visa_number: "",
  visa_expiry_date: null,
  first_entry_date_into_usa: null,
};

/* ─── component ────────────────────────────────────────────────── */
const Dependent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const today = new Date();

  // list
  const [dependents, setDependents] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // form panel
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);       // null = create
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // delete
  const [deletingId, setDeletingId] = useState(null);

  /* sidebar resize */
  useEffect(() => {
    const onResize = () => setSidebarOpen(window.innerWidth > 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── GET list ─────────────────────────────────────────────────── */
  const fetchDependents = async () => {
    setListLoading(true);
    setListError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(URLS.GetDependent, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDependents(data.data || []);
      } else {
        setListError(data.message || "Failed to fetch dependents.");
      }
    } catch {
      setListError("Network error fetching dependents.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => { fetchDependents(); }, []);

  /* ── open ADD form ────────────────────────────────────────────── */
  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormSuccess("");
    setShowForm(true);
  };

  /* ── open EDIT form (GET by ID) ───────────────────────────────── */
  const openEdit = async (id) => {
    setFormError("");
    setFormSuccess("");
    setShowForm(true);
    setEditId(id);
    setForm(EMPTY_FORM);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(URLS.GetByIdDenpendent + id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        const isApplying = d.tax_id_type === "APPLYING FOR ITIN";
        setForm({
          first_name: d.first_name || "",
          middle_name: d.middle_name || "",
          last_name: d.last_name || "",
          gender: d.gender || "",
          date_of_birth: toDate(d.date_of_birth),
          relationship: d.relationship || "",
          visa_type: d.visa_type || "",
          tax_id_type: isApplying ? "applying" : "ssn",
          ssn_itin: d.ssn_itin || "",
          passport_number: d.passport_number || "",
          passport_expiry_date: toDate(d.passport_expiry_date),
          visa_number: d.visa_number || "",
          visa_expiry_date: toDate(d.visa_expiry_date),
          first_entry_date_into_usa: toDate(d.first_entry_date_into_usa),
        });
      } else {
        setFormError(data.message || "Failed to load dependent.");
      }
    } catch {
      setFormError("Network error loading dependent.");
    }
  };

  /* ── SAVE (create or update) ──────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const isApplying = form.tax_id_type === "applying";
      const body = {
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        gender: form.gender,
        date_of_birth: toDateStr(form.date_of_birth),
        relationship: form.relationship,
        visa_type: form.visa_type,
        tax_id_type: isApplying ? "APPLYING FOR ITIN" : "SSN/ITIN",
        ...(isApplying
          ? {
              passport_number: form.passport_number,
              passport_expiry_date: toDateStr(form.passport_expiry_date),
              visa_number: form.visa_number,
              visa_expiry_date: toDateStr(form.visa_expiry_date),
              first_entry_date_into_usa: toDateStr(form.first_entry_date_into_usa),
            }
          : { ssn_itin: form.ssn_itin }),
      };

      const url = editId ? URLS.UpdateDependent + editId : URLS.CreateDependent;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess(data.message || (editId ? "Dependent updated." : "Dependent created."));
        await fetchDependents();
        if (!editId) {
          setTimeout(() => { setShowForm(false); }, 1200);
        }
      } else {
        setFormError(data.message || "Failed to save dependent.");
      }
    } catch {
      setFormError("Network error saving dependent.");
    } finally {
      setSaving(false);
    }
  };

  /* ── DELETE ───────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dependent?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(URLS.DeleteDependent + id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        await fetchDependents();
        if (editId === id) setShowForm(false);
      } else {
        alert(data.message || "Failed to delete dependent.");
      }
    } catch {
      alert("Network error deleting dependent.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── field change helper ──────────────────────────────────────── */
  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (formError) setFormError("");
    if (formSuccess) setFormSuccess("");
  };

  /* ─────────────────────────────────────────────────────────────── */
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
          <span className="breadcrumb-current">Dependent</span>
        </div>

        <div className="form-container">

          {/* ── List Card ─────────────────────────────────────────── */}
          <div className="form-card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 className="form-title" style={{ margin: 0 }}>Dependents</h3>
              <button
                className="btn-save"
                style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
                onClick={openAdd}
              >
                + Add Dependent
              </button>
            </div>

            {listError && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.87rem", borderRadius: "8px" }}>
                {listError}
              </div>
            )}

            {listLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>Fetching Dependents...</p>
              </div>
            ) : dependents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 0", color: "#94a3b8" }}>
                <p style={{ fontSize: "0.95rem" }}>No dependents added yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(99,102,241,0.08)", textAlign: "left" }}>
                      {["Name", "Gender", "DOB", "Relationship", "Visa Type", "Tax ID Type", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dependents.map((dep, i) => (
                      <tr
                        key={dep._id}
                        style={{
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                          background: i % 2 === 0 ? "transparent" : "rgba(99,102,241,0.02)",
                        }}
                      >
                        <td style={{ padding: "0.75rem 1rem", color: "#1e293b", fontWeight: 500 }}>
                          {[dep.first_name, dep.middle_name, dep.last_name].filter(Boolean).join(" ")}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{dep.gender || "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#64748b", whiteSpace: "nowrap" }}>{fmtDate(dep.date_of_birth)}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{dep.relationship || "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{dep.visa_type || "—"}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{
                            padding: "0.2rem 0.65rem",
                            borderRadius: "999px",
                            fontSize: "0.775rem",
                            fontWeight: 600,
                            background: dep.tax_id_type === "APPLYING FOR ITIN" ? "rgba(234,179,8,0.12)" : "rgba(34,197,94,0.12)",
                            color: dep.tax_id_type === "APPLYING FOR ITIN" ? "#b45309" : "#15803d",
                          }}>
                            {dep.tax_id_type || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                          <button
                            onClick={() => openEdit(dep._id)}
                            style={{
                              marginRight: "0.5rem",
                              padding: "0.3rem 0.85rem",
                              border: "none",
                              borderRadius: "6px",
                              background: "rgba(99,102,241,0.12)",
                              color: "#6366f1",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(dep._id)}
                            disabled={deletingId === dep._id}
                            style={{
                              padding: "0.3rem 0.85rem",
                              border: "none",
                              borderRadius: "6px",
                              background: "rgba(239,68,68,0.1)",
                              color: "#dc2626",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              cursor: "pointer",
                            }}
                          >
                            {deletingId === dep._id ? "..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Form Card ─────────────────────────────────────────── */}
          {showForm && (
            <div className="form-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 className="form-title" style={{ margin: 0 }}>
                  {editId ? "Edit Dependent" : "Add Dependent"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    background: "none", border: "none", fontSize: "1.25rem",
                    cursor: "pointer", color: "#94a3b8", lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.87rem", borderRadius: "8px" }}>
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="alert alert-success py-2 px-3 mb-3" style={{ fontSize: "0.87rem", borderRadius: "8px" }}>
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleSave}>
                {/* Row 1 */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="form-control" value={form.first_name}
                      onChange={e => setField("first_name", e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Middle Name</label>
                    <input type="text" className="form-control" value={form.middle_name}
                      onChange={e => setField("middle_name", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" className="form-control" value={form.last_name}
                      onChange={e => setField("last_name", e.target.value)} required />
                  </div>

                  {/* Row 2 */}
                  <div className="form-group">
                    <label>Gender</label>
                    <div className="radio-group">
                      {["Male", "Female"].map((g) => (
                        <label className="radio-label" key={g}>
                          <input type="radio" name="dep-gender" value={g}
                            checked={form.gender === g}
                            onChange={() => setField("gender", g)} />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <DatePicker
                      selected={form.date_of_birth}
                      onChange={(d) => setField("date_of_birth", d)}
                      dateFormat="MM/dd/yyyy"
                      className="form-control"
                      placeholderText="Select date"
                      showMonthDropdown showYearDropdown dropdownMode="select"
                      maxDate={today}
                    />
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <select className="form-control" value={form.relationship}
                      onChange={e => setField("relationship", e.target.value)} required>
                      <option value="">-Select One-</option>
                      {["Son", "Daughter", "Stepson", "Stepdaughter", "Foster Child", "Other"].map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div className="form-group">
                    <label>Visa Type</label>
                    <select className="form-control" value={form.visa_type}
                      onChange={e => setField("visa_type", e.target.value)}>
                      <option value="">Select Visa Type</option>
                      {["H4", "L2", "F2", "J2", "B1/B2", "US Citizen"].map(v => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tax Id Type</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="dep-taxid" value="ssn"
                          checked={form.tax_id_type === "ssn"}
                          onChange={() => setField("tax_id_type", "ssn")} />
                        <span>SSN/ITIN</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="dep-taxid" value="applying"
                          checked={form.tax_id_type === "applying"}
                          onChange={() => setField("tax_id_type", "applying")} />
                        <span>APPLYING FOR ITIN</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SSN/ITIN field */}
                {form.tax_id_type === "ssn" && (
                  <div className="form-grid-2col" style={{ marginBottom: "1.5rem" }}>
                    <div className="form-group">
                      <label>SSN/ITIN Number</label>
                      <input type="text" className="form-control"
                        value={form.ssn_itin}
                        onChange={e => setField("ssn_itin", e.target.value)}
                        placeholder="e.g. 123-45-6789"
                        maxLength={12}
                      />
                    </div>
                  </div>
                )}

                {/* Applying for ITIN fields */}
                {form.tax_id_type === "applying" && (
                  <div className="form-grid-2col" style={{ marginBottom: "1.5rem" }}>
                    <div className="form-group">
                      <label>Passport Number</label>
                      <input type="text" className="form-control" value={form.passport_number}
                        onChange={e => setField("passport_number", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Passport Expiry Date</label>
                      <DatePicker selected={form.passport_expiry_date}
                        onChange={d => setField("passport_expiry_date", d)}
                        dateFormat="MM/dd/yyyy" className="form-control" placeholderText="Select date" />
                    </div>
                    <div className="form-group">
                      <label>Visa Number</label>
                      <input type="text" className="form-control" value={form.visa_number}
                        onChange={e => setField("visa_number", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Visa Expiry Date</label>
                      <DatePicker selected={form.visa_expiry_date}
                        onChange={d => setField("visa_expiry_date", d)}
                        dateFormat="MM/dd/yyyy" className="form-control" placeholderText="Select date" />
                    </div>
                    <div className="form-group">
                      <label>First Entry Date into USA</label>
                      <DatePicker selected={form.first_entry_date_into_usa}
                        onChange={d => setField("first_entry_date_into_usa", d)}
                        dateFormat="MM/dd/yyyy" className="form-control" placeholderText="Select date" />
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn-cancel"
                    onClick={() => setShowForm(false)}
                    style={{ marginRight: "0.75rem" }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (editId ? "Update" : "Save")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Dependent;
