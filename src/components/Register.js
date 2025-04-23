import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ username: false, password: false });
  const [error, setError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("apiKey")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Validators
  const USER_REGEX = /^[A-Za-z0-9_]+$/;
  const validate = {
    username: (u) => {
      const trimmed = u.trim();
      return (
        trimmed.length >= 3 && trimmed.length <= 10 && USER_REGEX.test(trimmed)
      );
    },
    password: (p) => p.length >= 3 && p.length <= 8,
  };

  const errors = {
    username: (() => {
      if (!touched.username) return "";
      const u = username.trim();
      if (u.length < 3 || u.length > 10) {
        return "Username must be 3-10 characters.";
      }
      if (!USER_REGEX.test(u)) {
        return "Username can only contain letters, numbers, or underscores.";
      }
      return "";
    })(),
    password:
      touched.password && !validate.password(password)
        ? "Password must be 3-8 characters."
        : "",
  };

  const handleBlur = (field) => () =>
    setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!validate.username(username) || !validate.password(password)) {
      return;
    }
    try {
      await api.post("/auth/register", {
        username: username.trim(),
        password,
      });
      // show toast
      setShowSuccessToast(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  // auto-hide toast and navigate to login
  useEffect(() => {
    let timer;
    if (showSuccessToast) {
      timer = setTimeout(() => {
        setShowSuccessToast(false);
        navigate("/login");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessToast, navigate]);

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <div className="card shadow-sm">
          <div className="card-body position-relative">
            {/* Bootstrap Toast */}
            {showSuccessToast && (
              <div
                className="toast show position-absolute top-0 end-0 m-3"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                style={{ zIndex: 1050 }}
              >
                <div className="toast-header">
                  <strong className="me-auto text-success">Success</strong>
                  <small>Just now</small>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowSuccessToast(false)}
                  ></button>
                </div>
                <div className="toast-body">
                  You have registered successfully!
                </div>
              </div>
            )}

            <h2 className="card-title text-center mb-4">Register</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form noValidate onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className={`form-control ${
                    errors.username ? "is-invalid" : ""
                  }`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={handleBlur("username")}
                  required
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handleBlur("password")}
                  required
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>

              <button type="submit" className="btn btn-success w-100">
                Register
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
