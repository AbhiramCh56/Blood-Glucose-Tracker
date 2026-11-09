const API_BASE_URL = "http://localhost:5000";

// Reusable function for making API requests
const apiRequest = async (endpoint, options = {}, requiresAuth = false) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });

  const data = await response.json();

  // Handle expired or invalid authentication
  if (response.status === 401 && requiresAuth) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.assign("/login");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

// Register a new user
export const registerUser = async (userData) => {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// Log in an existing user
export const loginUser = async (credentials) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// Retrieve glucose readings for the logged-in user
export const getReadings = async () => {
  return apiRequest(
    "/api/readings",
    {
      method: "GET",
    },
    true,
  );
};

export const addReadings = async (readingData) => {
  return apiRequest(
    "/api/readings",
    {
      method: "POST",
      body: JSON.stringify(readingData),
    },
    true,
  );
};

export const updateReading = async (id, readingData) => {
  return apiRequest(
    `/api/readings/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(readingData),
    },
    true,
  );
};

export const deleteReading = async (id) => {
  return apiRequest(
    `/api/readings/${id}`,
    {
      method: "DELETE",
    },
    true,
  );
};

export const getDailyReport = async (date) => {
  return apiRequest(
    `/api/reports/daily?date=${encodeURIComponent(date)}`,
    { method: "GET" },
    true,
  );
};

export const getMonthToDateReport = async () => {
  return apiRequest("/api/reports/month-to-date", { method: "GET" }, true);
};

export const getPreviousMonthReport = async () => {
  return apiRequest("/api/reports/previous-month", { method: "GET" }, true);
};
