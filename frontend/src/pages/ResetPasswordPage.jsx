import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";
import Icon from "../components/common/Icon";
import * as api from "../services/api";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(token, newPassword);
      setMessage(res?.message || "Your password has been reset.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message || "This reset link is invalid or has expired.");
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
              <span>Almost there</span>
              <h2>Set a new password</h2>
              <p>Choose a new password for your BiteWise account.</p>
            </div>

            {error && <div className="form-error">{error}</div>}
            {message && <div className="form-success">{message} Redirecting to sign in\u2026</div>}

            {!message && (
              <>
                {!token && (
                  <div className="form-error">
                    No reset token found in this link. Please request a new password reset.
                  </div>
                )}

                <div className="form-group">
                  <label>New password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm new password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="primary-button full-btn" disabled={loading}>
                  {loading ? "Resetting\u2026" : "Reset password"}
                  {!loading && <Icon type="check" size={16} />}
                </button>
              </>
            )}

            <div className="demo-hint">
              <Link to="/login" className="link-button">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
