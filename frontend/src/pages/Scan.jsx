import { useState } from "react";
import CameraCapture from "../components/CameraCapture";
import VisitorForm from "../components/VisitorForm";
import { api } from "../services/api";
import "./Scan.css";

export default function Scan() {
  const [image, setImage] = useState(null);
  const [needForm, setNeedForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async (capturedImage, visitorData = null) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await api.post("/scan", {
        image_base64: capturedImage,
        visitor: visitorData,
      });

      if (res.data.action === "need_details") {
        setNeedForm(true);
        setImage(capturedImage);
      } else {
        setMessage(res.data.message);
        setImage(null);
        setNeedForm(false);
        
        // Auto-reset after success
        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setNeedForm(false);
    setMessage("");
    setError("");
    setLoading(false);
  };

  return (
    <div className="scan-container">
      <div className="scan-wrapper">
        {/* Header Section */}
        <div className="scan-header">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h1 className="scan-title">Visitor Scan System</h1>
          <p className="scan-subtitle">Secure facial recognition entry management</p>
        </div>

        {/* Main Content Area */}
        <div className="scan-content">
          {/* Loading State */}
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p className="loading-text">Processing scan...</p>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {message && !needForm && (
            <div className="message-card success-card">
              <div className="message-icon success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="message-title">Success!</h3>
              <p className="message-text">{message}</p>
              <button className="btn btn-primary" onClick={handleReset}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                Scan Another Visitor
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="message-card error-card">
              <div className="message-icon error-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="message-title">Error</h3>
              <p className="message-text">{error}</p>
              <button className="btn btn-secondary" onClick={handleReset}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Try Again
              </button>
            </div>
          )}

          {/* Camera Capture */}
          {!needForm && !message && !error && (
            <div className="camera-section">
              <div className="camera-instructions">
                <div className="instruction-item">
                  <div className="instruction-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </div>
                  <span>Position face within the frame</span>
                </div>
                <div className="instruction-item">
                  <div className="instruction-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  <span>Ensure good lighting</span>
                </div>
                <div className="instruction-item">
                  <div className="instruction-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span>Look directly at camera</span>
                </div>
              </div>
              
              <CameraCapture
                onCapture={(img) => {
                  setImage(img);
                  handleScan(img);
                }}
              />
            </div>
          )}

          {/* Visitor Form */}
          {needForm && (
            <div className="form-section">
              <div className="form-header">
                <div className="form-header-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div>
                  <h3 className="form-title">New Visitor Registration</h3>
                  <p className="form-description">Please provide your details to complete the entry process</p>
                </div>
              </div>
              
              <VisitorForm onSubmit={(data) => handleScan(image, data)} />
              
              <button className="btn btn-text btn-cancel" onClick={handleReset}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="scan-footer">
          <div className="footer-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Secured with end-to-end encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}