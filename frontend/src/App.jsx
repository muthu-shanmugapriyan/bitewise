import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import * as api from "./services/api";

/* ── Styles ── */
import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/auth.css";
import "./styles/home.css";
import "./styles/daily-update.css";
import "./styles/expenses.css";
import "./styles/products.css";
import "./styles/analytics.css";
import "./styles/settings.css";
import "./styles/wizard.css";

/* ── Layout ── */
import Sidebar from "./components/layout/Sidebar";
import TopHeader from "./components/layout/TopHeader";
import MobileNav from "./components/layout/MobileNav";

/* ── Pages ── */
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import DailyUpdatePage from "./pages/DailyUpdatePage";
import ExpensesPage from "./pages/ExpensesPage";
import ProductsPage from "./pages/ProductsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import BusinessHistoryPage from "./pages/BusinessHistoryPage";
import SetupWizard from "./pages/SetupWizard";

/* ── Common ── */
import ErrorBoundary from "./components/common/ErrorBoundary";

/* ────────────────────────────────────────────────────── */

const PAGE_ROUTES = {
  "/": "home",
  "/update": "update",
  "/expenses": "expenses",
  "/products": "products",
  "/analytics": "analytics",
  "/settings": "settings",
  "/history": "history",
};

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showWizard, setShowWizard] = useState(false);
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ownerName = localStorage.getItem("bitewise_owner") || "";

  /* Determine active page from URL path */
  const page = PAGE_ROUTES[location.pathname] || "home";

  const setPage = (id) => {
    const path = Object.entries(PAGE_ROUTES).find(([, v]) => v === id)?.[0] || "/";
    navigate(path);
  };

  const loadAppData = async () => {
    if (!api.isAuthenticated()) return;
    setLoading(true);
    setError("");
    try {
      const [bizData, prodData, dashData] = await Promise.all([
        api.getBusiness().catch(() => null),
        api.getProducts().catch(() => []),
        api.getDashboardAnalytics().catch(() => null),
      ]);
      if (bizData) setBusiness(bizData);
      setProducts(Array.isArray(prodData) ? prodData : []);
      if (dashData) setDashboard(dashData);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        handleLogout();
      } else {
        setError(err.message || "Failed to load application data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/login");
    setBusiness(null);
    setProducts([]);
    setDashboard(null);
    // Fire-and-forget: best-effort audit-log entry server-side, and always
    // clears the local session even if that call fails (e.g. offline).
    api.logoutUser();
  };

  useEffect(() => {
    loadAppData();
  }, []);

  const currency = business?.currency || "INR";

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
        business={business}
        onOpenWizard={() => setShowWizard(true)}
      />

      <main className="main-content">
        <div className="content-container">
          <TopHeader
            business={business}
            ownerName={ownerName}
            onLogout={handleLogout}
            setPage={setPage}
          />

          {page === "home" && (
            <HomePage
              setPage={setPage}
              dashboard={dashboard}
              business={business}
              loading={loading}
              error={error}
              currency={currency}
            />
          )}

          {page === "update" && (
            <DailyUpdatePage
              products={products}
              currency={currency}
              onSalesSaved={loadAppData}
            />
          )}

          {page === "expenses" && (
            <ExpensesPage
              currency={currency}
              onExpenseAdded={loadAppData}
            />
          )}

          {page === "products" && (
            <ProductsPage
              products={products}
              currency={currency}
              onProductsChanged={loadAppData}
            />
          )}

          {page === "analytics" && <AnalyticsPage currency={currency} />}

          {page === "settings" && (
            <SettingsPage
              business={business}
              onBusinessUpdated={(updated) => setBusiness(updated)}
              onLogout={handleLogout}
              onOpenWizard={() => setShowWizard(true)}
              setPage={setPage}
            />
          )}

          {page === "history" && <BusinessHistoryPage setPage={setPage} />}
        </div>
      </main>

      <MobileNav page={page} setPage={setPage} />

      {showWizard && (
        <SetupWizard
          business={business}
          onComplete={() => {
            setShowWizard(false);
            loadAppData();
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}

function AuthGuard({ children }) {
  if (!api.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [, setAuthTick] = useState(0);

  const handleAuthSuccess = (authData, isNew = false) => {
    setAuthTick((t) => t + 1);
    /* Navigation is handled by the auth page itself via navigate() */
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          api.isAuthenticated()
            ? <Navigate to="/" replace />
            : <AuthPage onAuthSuccess={handleAuthSuccess} />
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      />
    </Routes>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
