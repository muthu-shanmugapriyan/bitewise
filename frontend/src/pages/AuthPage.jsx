import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";
import FoodIcon from "../components/common/FoodIcon";
import Icon from "../components/common/Icon";
import { getIconTileClass } from "../constants/icons";
import * as api from "../services/api";

const SHOWCASE_ICONS = [
  "biryani", "dosa", "burger", "pizza", "tea", "momos",
  "friedrice", "icecream", "chaat", "coffee", "samosa", "cake",
];

function AuthPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    ownerName: "",
    phone: "",
    businessName: "",
    businessType: "Food Truck",
    location: "",
    currency: "INR",
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.loginUser(loginForm.email, loginForm.password);
      onAuthSuccess(data);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.registerUser(registerForm);
      onAuthSuccess(data, true);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow glow-one" />
      <div className="auth-glow glow-two" />

      <div className="auth-layout">
        <aside className="auth-showcase">
          <BrandLogo />
          <h1 className="auth-showcase-heading">
            Run your food business
            <br />
            on your terms.
          </h1>
          <p className="auth-showcase-copy">
            Set up your menu once. Every day after that, BiteWise turns a few taps into revenue,
            profit, margins and business insight — automatically.
          </p>

          <div className="showcase-icon-field">
            {SHOWCASE_ICONS.map((key, i) => (
              <div className={`showcase-chip ${getIconTileClass(key)}`} key={key}>
                <FoodIcon name={key} size={22} />
              </div>
            ))}
          </div>

          <div className="showcase-stats">
            <div>
              <strong>&lt;5 min</strong>
              <span>daily data entry</span>
            </div>
            <div>
              <strong>30+</strong>
              <span>street-food &amp; menu icons</span>
            </div>
            <div>
              <strong>0</strong>
              <span>spreadsheets required</span>
            </div>
          </div>
        </aside>

        <div className={`auth-card ${isRegister ? "register-mode" : ""}`}>
          <div className="mobile-brand auth-mobile-brand">
            <BrandLogo />
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${!isRegister ? "active" : ""}`}
              onClick={() => {
                setIsRegister(false);
                setError("");
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-tab ${isRegister ? "active" : ""}`}
              onClick={() => {
                setIsRegister(true);
                setError("");
              }}
            >
              Create business
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="auth-heading">
                <span>Welcome back</span>
                <h2>Sign in to BiteWise</h2>
                <p>Enter your credentials to open today&rsquo;s ticket.</p>
              </div>

              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="owner@example.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                />
                <div className="forgot-password-link">
                  <Link to="/forgot-password" className="link-button">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button type="submit" className="primary-button full-btn" disabled={loading}>
                {loading ? "Signing in\u2026" : "Sign in to dashboard"}
                {!loading && <Icon type="arrow" size={16} />}
              </button>

              <div className="demo-hint">
                <span>New to BiteWise?</span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setIsRegister(true);
                    setError("");
                  }}
                >
                  Create your business account <Icon type="arrow" size={13} />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="auth-heading">
                <span>Get started</span>
                <h2>Register your food business</h2>
                <p>Set up once, record sales daily, understand your profits.</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Your name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyan"
                    value={registerForm.ownerName}
                    onChange={(e) => setRegisterForm({ ...registerForm, ownerName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Business name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyan's Street Bites"
                  value={registerForm.businessName}
                  onChange={(e) => setRegisterForm({ ...registerForm, businessName: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Business type</label>
                  <select
                    value={registerForm.businessType}
                    onChange={(e) => setRegisterForm({ ...registerForm, businessType: e.target.value })}
                  >
                    <option value="Food Truck">Food Truck</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Street Food">Street Food</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Cloud Kitchen">Cloud Kitchen</option>
                    <option value="Juice Shop">Juice Shop</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="City / area"
                    value={registerForm.location}
                    onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="primary-button full-btn" disabled={loading}>
                {loading ? "Creating account\u2026" : "Create business account"}
                {!loading && <Icon type="arrow" size={16} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
