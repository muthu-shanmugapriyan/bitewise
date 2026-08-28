import React, { Component } from 'react';
import BrandLogo from './BrandLogo';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("BiteWise UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-page">
          <div className="auth-glow glow-one" />
          <div className="auth-glow glow-two" />
          <div className="auth-card" style={{ textAlign: "center" }}>
            <BrandLogo />
            <div className="auth-heading">
              <h1>Something went sideways</h1>
              <p>
                This screen hit an unexpected error. Your data is safe — try
                reloading, and if it keeps happening, let us know what you
                were doing.
              </p>
            </div>
            <button
              type="button"
              className="primary-button full-btn"
              onClick={() => window.location.reload()}
            >
              Reload BiteWise
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
