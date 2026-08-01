import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { URLS } from "../url";
import SendQueryModal from "../Components/SendQueryModal";

const SendQuery = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // ── Responsive sidebar ──
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Fetch all notifications (queries) ──
  const fetchQueries = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const response = await fetch(URLS.GetNotificationsList, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setQueries(data.data || []);
      } else {
        setError(data.message || "Failed to fetch queries.");
      }
    } catch (err) {
      console.error("Fetch queries error:", err); 
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  // ── Refresh list after sending a query ──
  const handleQuerySent = () => {
    fetchQueries();
    setIsModalOpen(false);
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
          <span className="breadcrumb-current">Send Query</span>
        </div>

        {/* Content */}
        <div className="form-container">
          <div className="table-card" style={{padding: "1.5rem"}}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h4 style={{ margin: 0 }}>My Queries</h4>
              <button
                className="btn btn-primary btn-md px-4"
                onClick={() => setIsModalOpen(true)}
              >
                + Send Query
              </button>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ fontSize: "0.9rem" }}>
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : queries.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No queries found. Click "Send Query" to ask a question.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Your Query</th>
                      <th>Admin Reply</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.map((q, index) => (
                      <tr key={q._id}>
                        <td>{index + 1}</td>
                        <td>{q.message || "—"}</td>
                        <td>{q.reply || "No reply yet"}</td>
                        <td>
                          <span
                            className={`badge ${
                              q.status === "Resolved"
                                ? "bg-success"
                                : q.status === "Pending"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {q.status || "Pending"}
                          </span>
                        </td>
                        <td>
                          {q.createdAt
                            ? new Date(q.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        <SendQueryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleQuerySent}
        />

        <Footer />
      </main>
    </div>
  );
};

export default SendQuery;