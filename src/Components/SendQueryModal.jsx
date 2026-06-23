import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "../styles/Modal.css";

const SendQueryModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    mobile: "",
    message: "",
  });

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setFormData((prev) => ({
        ...prev,
        firstName: user.name || "balakrishna burra",
      }));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Query sent successfully!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Send Query</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+18328473790"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                className="form-control"
                rows="5"
                placeholder="Message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-send-question">
              Send Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendQueryModal;
