import React, { useState, useEffect } from "react";
import * as api from "../services/api";
import Icon from "../components/common/Icon";

function SettingsPage({ business, onBusinessUpdated, onLogout, onOpenWizard, setPage }) {
  const [form, setForm] = useState({
    name: "",
    businessType: "",
    currency: "INR",
    location: "",
    phone: "",
    operatingDays: "Mon - Sat",
  });

  const [prefs, setPrefs] = useState({
    dailySummary: true,
    weeklyReport: true,
    monthlyReport: true,
    quarterlyReport: false,
    annualReport: false,
    emailEnabled: false,
    preferredReportTime: "21:30",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [testSending, setTestSending] = useState("");
  const [testResult, setTestResult] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || "",
        businessType: business.businessType || "Food Truck",
        currency: business.currency || "INR",
        location: business.location || "",
        phone: business.phone || "",
        operatingDays: business.operatingDays || "Mon - Sat",
      });
    }

    api
      .getNotificationPreferences()
      .then((p) => {
        if (p) setPrefs(p);
      })
      .catch(() => null);
  }, [business]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await api.updateBusiness(form);
      await api.updateNotificationPreferences(prefs).catch(() => null);
      setSuccess("Business profile and notification preferences saved!");
      if (onBusinessUpdated) onBusinessUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const ownerName = localStorage.getItem("bitewise_owner") || "Business Owner";
  const email = localStorage.getItem("bitewise_email") || "owner@bitewise.local";

  const handleSendTest = async (type) => {
    setTestSending(type);
    setTestResult("");
    try {
      const res = await api.sendTestReport(type);
      setTestResult(res?.message || `Test ${type} report sent.`);
    } catch (err) {
      setTestResult(err.message || `Failed to send test ${type} report.`);
    } finally {
      setTestSending("");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords don't match.");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await api.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess(res?.message || "Password updated.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Settings &amp; preferences</h1>
          <p className="page-sub">Manage your business details, currency, notifications and the setup wizard.</p>
        </div>

        <button type="button" className="secondary-button" onClick={onOpenWizard}>
          <Icon type="sparkle" size={14} /> Launch setup wizard
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <div className="settings-grid">
        <section className="settings-card">
          <div className="products-header">
            <h2>Business profile</h2>
            <span>Your shop details, used across reports and daily sales</span>
          </div>

          <form onSubmit={handleSave} className="settings-form">
            <div className="form-group">
              <label>Business name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Business type</label>
                <select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}>
                  <option value="Food Truck">Food Truck</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Street Food">Street Food Cart</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Cloud Kitchen">Cloud Kitchen</option>
                  <option value="Juice Shop">Juice Shop</option>
                </select>
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location / city</label>
                <input
                  type="text"
                  placeholder="e.g. Vijayawada, AP"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone number</label>
                <input type="tel" placeholder="+91..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="settings-subheading">
              <h3>Notification preferences</h3>
            </div>

            <div className="notif-toggles-grid">
              <div className="notif-toggle-row">
                <span>Daily business summary at day close</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={prefs.dailySummary}
                    onChange={(e) => setPrefs({ ...prefs, dailySummary: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="notif-toggle-row">
                <span>Weekly business intelligence report</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={prefs.weeklyReport}
                    onChange={(e) => setPrefs({ ...prefs, weeklyReport: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="notif-toggle-row">
                <span>Monthly P&amp;L report</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={prefs.monthlyReport}
                    onChange={(e) => setPrefs({ ...prefs, monthlyReport: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="notif-toggle-row">
                <span>Quarterly business report</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={prefs.quarterlyReport}
                    onChange={(e) => setPrefs({ ...prefs, quarterlyReport: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="notif-toggle-row">
                <span>Annual business report</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={prefs.annualReport}
                    onChange={(e) => setPrefs({ ...prefs, annualReport: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="notif-toggle-row">
                <span>Send reports by email</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={prefs.emailEnabled}
                    onChange={(e) => setPrefs({ ...prefs, emailEnabled: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving changes\u2026" : "Save settings & preferences"}
            </button>
          </form>

          <div className="settings-subheading" style={{ marginTop: 24 }}>
            <h3>Test your reports</h3>
            <p style={{ margin: "4px 0 12px", fontSize: 13, color: "var(--paper-dim)" }}>
              Send yourself a report right now using your real BiteWise data — no need to wait for
              the schedule.
            </p>
          </div>

          <div className="test-report-row">
            {["daily", "weekly", "monthly", "quarterly", "annual"].map((type) => (
              <button
                key={type}
                type="button"
                className="secondary-button-sm"
                disabled={testSending === type}
                onClick={() => handleSendTest(type)}
              >
                {testSending === type ? "Sending\u2026" : `Send ${type}`}
              </button>
            ))}
          </div>
          {testResult && <div className="form-success" style={{ marginTop: 10 }}>{testResult}</div>}
        </section>

        <section className="settings-card account-card">
          <div className="products-header">
            <h2>Account &amp; security</h2>
          </div>

          <div className="account-info-box">
            <div className="acc-item">
              <span>Owner name</span>
              <strong>{ownerName}</strong>
            </div>
            <div className="acc-item">
              <span>Account email</span>
              <strong>{email}</strong>
            </div>
            <div className="acc-item">
              <span>Security</span>
              <strong>JWT bearer authentication active</strong>
            </div>
          </div>

          <button
            type="button"
            className="secondary-button"
            style={{ width: "100%", marginBottom: 10 }}
            onClick={() => setPage && setPage("history")}
          >
            <Icon type="history" size={15} /> View business history
          </button>

          <button type="button" className="logout-action-btn" onClick={onLogout}>
            <Icon type="logout" size={15} /> Log out of account
          </button>

          <div className="settings-subheading" style={{ marginTop: 20 }}>
            <h3>Change password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="settings-form">
            {pwError && <div className="form-error">{pwError}</div>}
            {pwSuccess && <div className="form-success">{pwSuccess}</div>}

            <div className="form-group">
              <label>Current password</label>
              <input
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="Enter your current password"
              />
            </div>
            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                required
                minLength={8}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm new password</label>
              <input
                type="password"
                required
                minLength={8}
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
              />
            </div>

            <button type="submit" className="secondary-button" disabled={pwSaving}>
              <Icon type="lock" size={14} />
              {pwSaving ? "Updating\u2026" : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
