const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function getToken() {
  return (
    localStorage.getItem("bitewise_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export function setAuthSession(data) {
  if (data?.token) localStorage.setItem("bitewise_token", data.token);
  if (data?.email) localStorage.setItem("bitewise_email", data.email);
  if (data?.ownerName) localStorage.setItem("bitewise_owner", data.ownerName);
}

export function clearAuthSession() {
  localStorage.removeItem("bitewise_token");
  localStorage.removeItem("bitewise_email");
  localStorage.removeItem("bitewise_owner");
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      // ignore parse error
    }
  } else {
    try {
      const text = await response.text();
      if (text) data = { message: text };
    } catch {
      // ignore parse error
    }
  }

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      data?.message ||
      (typeof data === "string" ? data : `Request failed (${response.status})`);
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return data;
}

// ---------------- AUTH ----------------
export async function loginUser(email, password) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthSession(data);
  return data;
}

export async function registerUser(formData) {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
  setAuthSession(data);
  return data;
}

export async function logoutUser() {
  try {
    // Best-effort — JWTs are stateless, this just records the activity.
    // Logout must always succeed locally even if this call fails
    // (e.g. offline), so errors are swallowed here.
    if (isAuthenticated()) {
      await request("/api/auth/logout", { method: "POST" });
    }
  } catch {
    // ignore — still clear the local session below
  } finally {
    clearAuthSession();
  }
}

export async function forgotPassword(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, newPassword) {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function changePassword(currentPassword, newPassword) {
  return request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ---------------- BUSINESS ----------------
export async function getBusiness() {
  return request("/api/business");
}

export async function updateBusiness(data) {
  return request("/api/business", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ---------------- PRODUCTS & CATEGORIES ----------------
export async function getProducts() {
  return request("/api/products");
}

export async function addProduct(productData) {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(id, productData) {
  return request(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(id) {
  return request(`/api/products/${id}`, {
    method: "DELETE",
  });
}

export async function getProductCategories() {
  return request("/api/products/categories");
}

export async function addProductCategory(categoryData) {
  return request("/api/products/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}

// ---------------- DAILY SALES & CLOSE DAY ----------------
export async function getDailySale(date) {
  return request(`/api/sales/daily?date=${date}`);
}

export async function saveDailySale(payload) {
  return request("/api/sales/daily", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function closeDay(date) {
  return request(`/api/sales/daily/${date}/close`, {
    method: "POST",
  });
}

// ---------------- EXPENSES & CATEGORIES ----------------
export async function getExpenses(from, to) {
  return request(`/api/expenses?from=${from}&to=${to}`);
}

export async function addExpense(payload) {
  return request("/api/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getExpenseCategories() {
  return request("/api/expenses/categories");
}

export async function addExpenseCategory(payload) {
  return request("/api/expenses/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------------- ANALYTICS & REPORTS ----------------
export async function getDashboardAnalytics() {
  return request("/api/analytics/dashboard");
}

export async function getDailyAnalytics(date) {
  return request(`/api/analytics/daily?date=${date}`);
}

export async function getWeeklyAnalytics(end) {
  const query = end ? `?end=${end}` : "";
  return request(`/api/analytics/weekly${query}`);
}

export async function getMonthlyAnalytics(year, month) {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (month) params.append("month", month);
  const q = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/analytics/monthly${q}`);
}

export async function getRangeAnalytics(from, to) {
  return request(`/api/analytics/range?from=${from}&to=${to}`);
}

// ---------------- NOTIFICATIONS ----------------
export async function getNotificationPreferences() {
  return request("/api/notifications/preferences");
}

export async function updateNotificationPreferences(payload) {
  return request("/api/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function sendTestReport(type) {
  return request(`/api/notifications/send-test/${type}`, {
    method: "POST",
  });
}

// ---------------- BUSINESS HISTORY (AUDIT LOG) ----------------
export async function getAuditLog() {
  return request("/api/audit-log");
}
