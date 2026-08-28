import React, { useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";
import Icon from "../components/common/Icon";
import * as api from "../services/api";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setMessage(
        res?.message ||
          "If an account exists for that email, a password reset link has been sent."
      );
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow glow-one" />
      <div className="auth-glow glow-two" />

      <div className="auth-layout" style={{ gridTemplateColumns: "1fr", maxWidth: 460 }}>
        <div className="auth-card">
          <div style={{ marginBottom: 22 }}>
            <BrandLogo />
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-heading">
              <span>Reset your password</span>
              <h2>Forgot password</h2>
              <p>Enter the email on your BiteWise account and we&rsquo;ll send you a reset link.</p>
            </div>

            {error && <div className="form-error">{error}</div>}
            {message && <div className="form-success">{message}</div>}

            {!message && (
              <>
                <div className="form-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@example.com"
                  />
                </div>

                <button type="submit" className="primary-button full-btn" disabled={loading}>
                  {loading ? "Sending\u2026" : "Send reset link"}
                  {!loading && <Icon type="arrow" size={16} />}
                </button>
              </>
            )}

            <div className="demo-hint">
              <Link to="/login" className="link-button">
                <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
                  <Icon type="arrow" size={13} />
                </span>
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
