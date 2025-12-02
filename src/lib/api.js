const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiClient {
  constructor() {
    this.token = null;

    // Load token if already logged in
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("vesns_token");
      if (savedToken) this.token = savedToken;
    }
  }

  // Save token globally
  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("vesns_token", token);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${BASE}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Always send token if exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }


    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(url, config);
    const data = await res.json();
    return data;
  }

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  async signup(payload) {
    return this.request("/auth/signup", {
      method: "POST",
      body: payload,
    });
  }

  async login(payload) {
    const result = await this.request("/auth/login", {
      method: "POST",
      body: payload,
    });

    if (result?.token) {
      this.setToken(result.token);
    }

    return result;
  }

  // ==========================================
  // LOCATION ROUTES (Protected)
  // ==========================================
  async getLocations() {
    return this.request("/locations");
  }

  // ✅ REQUIRED FOR MAGIC PHRASES
  async getLocation(id) {
    return this.request(`/locations/${id}`);
  }

  async createLocation(location) {
    return this.request("/locations", {
      method: "POST",
      body: location,
    });
  }

  async deleteLocation(id) {
    return this.request(`/locations/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // MAGIC PHRASES (Protected)
  // ==========================================
  async getPhrases() {
    return this.request("/phrases");
  }

  async createPhrase(phrase) {
    return this.request("/phrases", {
      method: "POST",
      body: phrase,
    });
  }

  async deletePhrase(id) {
    return this.request(`/phrases/${id}`, {
      method: "DELETE",
    });
  }

  async findPhraseMatch({ phrase }) {
    return this.request("/phrases/match", {
      method: "POST",
      body: { phrase },
    });
  }
}

export const api = new ApiClient();
