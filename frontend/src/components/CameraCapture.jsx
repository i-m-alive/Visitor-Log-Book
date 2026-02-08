import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import "./CameraCapture.css";

export default function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Get available camera devices
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos) => {
        const videoDevices = deviceInfos.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      })
      .catch((err) => {
        console.error("Error enumerating devices:", err);
      });
  }, [selectedDevice]);

  const handleUserMedia = () => {
    setIsReady(true);
    setError(null);
  };

  const handleUserMediaError = (err) => {
    console.error("Camera error:", err);
    setError("Unable to access camera. Please check permissions.");
    setIsReady(false);
  };

  const captureImage = () => {
    if (!isReady) {
      alert("Camera not ready. Please wait a moment.");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Failed to capture image. Please try again.");
      return;
    }

    setIsCaptured(true);
    
    // Small delay for animation before calling onCapture
    setTimeout(() => {
      onCapture(imageSrc);
      setIsCaptured(false);
    }, 300);
  };

  const captureWithCountdown = () => {
    if (!isReady) {
      alert("Camera not ready. Please wait a moment.");
      return;
    }

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            captureImage();
            setCountdown(null);
          }, 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(
        (device) => device.deviceId === selectedDevice
      );
      const nextIndex = (currentIndex + 1) % devices.length;
      setSelectedDevice(devices[nextIndex].deviceId);
    }
  };

  const videoConstraints = {
    deviceId: selectedDevice,
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  return (
    <div className="camera-capture">
      <div className="camera-container">
        {/* Camera Status Indicator */}
        <div className={`camera-status ${isReady ? "ready" : "loading"}`}>
          <div className="status-indicator"></div>
          <span className="status-text">
            {isReady ? "Camera Ready" : "Initializing Camera..."}
          </span>
        </div>

        {/* Camera View */}
        <div className={`camera-view ${isCaptured ? "captured" : ""}`}>
          {error ? (
            <div className="camera-error">
              <div className="error-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="error-title">Camera Access Denied</h3>
              <p className="error-message">{error}</p>
              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Retry
              </button>
            </div>
          ) : (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className="webcam"
                mirrored={true}
              />

              {/* Face Frame Guide */}
              <div className="face-frame">
                <div className="frame-corner top-left"></div>
                <div className="frame-corner top-right"></div>
                <div className="frame-corner bottom-left"></div>
                <div className="frame-corner bottom-right"></div>
              </div>

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="countdown-overlay">
                  <div className="countdown-number">{countdown}</div>
                  <div className="countdown-circle">
                    <svg width="150" height="150" viewBox="0 0 150 150">
                      <circle
                        cx="75"
                        cy="75"
                        r="65"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="75"
                        cy="75"
                        r="65"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeDasharray="408.4"
                        strokeDashoffset="0"
                        className="countdown-progress"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Capture Flash Effect */}
              {isCaptured && <div className="capture-flash"></div>}
            </>
          )}
        </div>

        {/* Camera Tips */}
        {!error && (
          <div className="camera-tips">
            <div className="tip-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>Position your face in the frame</span>
            </div>
            <div className="tip-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span>Ensure adequate lighting</span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {!error && isReady && (
          <div className="camera-controls">
            <div className="primary-controls">
              <button
                className="control-btn capture-btn"
                onClick={captureImage}
                disabled={!isReady}
              >
                <div className="capture-btn-inner">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <span className="btn-label">Capture & Scan</span>
              </button>

              <button
                className="control-btn timer-btn"
                onClick={captureWithCountdown}
                disabled={!isReady || countdown !== null}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="btn-label">3s Timer</span>
              </button>
            </div>

            <div className="secondary-controls">
              {devices.length > 1 && (
                <button
                  className="icon-btn"
                  onClick={switchCamera}
                  title="Switch Camera"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                </button>
              )}

              <button
                className="icon-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && !error && (
          <div className="settings-panel">
            <div className="settings-header">
              <h4 className="settings-title">Camera Settings</h4>
              <button
                className="close-btn"
                onClick={() => setShowSettings(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="settings-content">
              <div className="setting-item">
                <label className="setting-label">Camera Device</label>
                <select
                  className="setting-select"
                  value={selectedDevice || ""}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-item">
                <label className="setting-label">Camera Info</label>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className={`info-value ${isReady ? "success" : ""}`}>
                      {isReady ? "Active" : "Initializing"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Devices:</span>
                    <span className="info-value">{devices.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!error && (
        <div className="camera-help">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            Click "Capture & Scan" for instant capture, or use the timer for a 3-second countdown
          </span>
        </div>
      )}
    </div>
  );
}