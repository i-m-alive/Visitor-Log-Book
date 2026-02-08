import React, { useEffect, useState } from "react";
import "./VisitorForm.css";

export default function VisitorForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    purpose: "",
    person_to_meet: "",
    person_email: "",
    person_phone: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            location: `${pos.coords.latitude}, ${pos.coords.longitude}`,
          }));
          setLocationLoading(false);
        },
        () => {
          setForm((prev) => ({ ...prev, location: "Location unavailable" }));
          setLocationLoading(false);
        }
      );
    } else {
      setForm((prev) => ({ ...prev, location: "Geolocation not supported" }));
      setLocationLoading(false);
    }
  }, []);

  const fieldConfig = {
    name: {
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      icon: "user",
      required: true,
    },
    age: {
      label: "Age",
      type: "number",
      placeholder: "Enter your age",
      icon: "calendar",
      required: false,
    },
    gender: {
      label: "Gender",
      type: "select",
      options: ["", "Male", "Female", "Other", "Prefer not to say"],
      icon: "users",
      required: true,
    },
    email: {
      label: "Email Address",
      type: "email",
      placeholder: "your.email@example.com",
      icon: "mail",
      required: true,
    },
    phone: {
      label: "Phone Number",
      type: "tel",
      placeholder: "+1 (555) 000-0000",
      icon: "phone",
      required: true,
    },
    address: {
      label: "Address",
      type: "textarea",
      placeholder: "Enter your address",
      icon: "home",
      required: true,
    },
    purpose: {
      label: "Purpose of Visit",
      type: "select",
      options: ["", "Business Meeting", "Interview", "Delivery", "Personal Visit", "Official Work", "Other"],
      icon: "briefcase",
      required: true,
    },
    person_to_meet: {
      label: "Person to Meet",
      type: "text",
      placeholder: "Name of the person you're visiting",
      icon: "user-check",
      required: true,
    },
    person_email: {
      label: "Contact Email",
      type: "email",
      placeholder: "contact.email@example.com",
      icon: "at-sign",
      required: true,
    },
    person_phone: {
      label: "Contact Phone",
      type: "tel",
      placeholder: "+1 (555) 000-0000",
      icon: "phone-call",
      required: true,
    },
  };

  const validateField = (name, value) => {
    if (fieldConfig[name].required && !value.trim()) {
      return `${fieldConfig[name].label} is required`;
    }

    if (name === "email" || name === "person_email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }

    if (name === "phone" || name === "person_phone") {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (value && !phoneRegex.test(value.replace(/\s/g, ""))) {
        return "Please enter a valid phone number";
      }
    }

    if (name === "age" && value) {
      const age = parseInt(value);
      if (age < 1 || age > 150) {
        return "Please enter a valid age";
      }
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    const newTouched = {};
    Object.keys(fieldConfig).forEach((key) => {
      newTouched[key] = true;
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      onSubmit(form);
    } else {
      // Scroll to first error
      const firstError = document.querySelector(".form-field.error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      user: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      calendar: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      users: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      mail: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      phone: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      home: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      briefcase: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      "user-check": (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
      ),
      "at-sign": (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
        </svg>
      ),
      "phone-call": (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.user;
  };

  const renderField = (key) => {
    const config = fieldConfig[key];
    const hasError = touched[key] && errors[key];

    return (
      <div key={key} className={`form-field ${hasError ? "error" : ""} ${touched[key] && !errors[key] ? "valid" : ""}`}>
        <label htmlFor={key} className="form-label">
          {config.label}
          {config.required && <span className="required">*</span>}
        </label>

        <div className="input-wrapper">
          <div className="input-icon">{getIcon(config.icon)}</div>

          {config.type === "select" ? (
            <select
              id={key}
              name={key}
              value={form[key]}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
              disabled={isSubmitting}
            >
              {config.options.map((option) => (
                <option key={option} value={option}>
                  {option || "Select an option"}
                </option>
              ))}
            </select>
          ) : config.type === "textarea" ? (
            <textarea
              id={key}
              name={key}
              value={form[key]}
              placeholder={config.placeholder}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input form-textarea"
              rows="3"
              disabled={isSubmitting}
            />
          ) : (
            <input
              id={key}
              name={key}
              type={config.type}
              value={form[key]}
              placeholder={config.placeholder}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
              disabled={isSubmitting}
            />
          )}

          {touched[key] && !errors[key] && form[key] && (
            <div className="validation-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}

          {hasError && (
            <div className="validation-icon error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
          )}
        </div>

        {hasError && <p className="error-message">{errors[key]}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="visitor-form" noValidate>
      {/* Personal Information Section */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="section-title">Personal Information</h3>
        </div>

        <div className="form-grid">
          {renderField("name")}
          {renderField("age")}
          {renderField("gender")}
          {renderField("email")}
          {renderField("phone")}
          {renderField("address")}
        </div>
      </div>

      {/* Visit Details Section */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h3 className="section-title">Visit Details</h3>
        </div>

        <div className="form-grid">
          {renderField("purpose")}
          {renderField("person_to_meet")}
          {renderField("person_email")}
          {renderField("person_phone")}
        </div>
      </div>

      {/* Location Section */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3 className="section-title">Location</h3>
        </div>

        <div className="location-field">
          <div className="location-status">
            {locationLoading ? (
              <>
                <div className="location-spinner"></div>
                <span>Detecting location...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="location-text">{form.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="btn-spinner"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Submit Details</span>
            </>
          )}
        </button>

        <p className="form-footer-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Your information is encrypted and secure
        </p>
      </div>
    </form>
  );
}