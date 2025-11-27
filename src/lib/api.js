const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${BASE}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(url, config);
    const data = await res.json();
    return data;
  }

  // 🔥 CORRECT BACKEND ROUTES

  // Get ALL locations
  async getLocations() {
    return this.request("/locations");
  }

  // Get location by ID
  async getLocation(id) {
    return this.request(`/locations/${id}`);
  }

  // Add new location
  async createLocation(location) {
    return this.request("/locations", {
      method: "POST",
      body: location,
    });
  }

  // Update location
  async updateLocation(id, location) {
    return this.request(`/locations/${id}`, {
      method: "PUT",
      body: location,
    });
  }

  // Delete location
  async deleteLocation(id) {
    return this.request(`/locations/${id}`, {
      method: "DELETE",
    });
  }

  // 🔥 SEARCH using backend
  async searchLocations(query) {
    return this.request(`/locations/search/${encodeURIComponent(query)}`);
  }

  // 🔥 FIND by name using backend
  async findLocationByName(name) {
    return this.request(`/locations/name/${encodeURIComponent(name)}`);
  }

  // -------------------------------
  // MAGIC PHRASES (unchanged)
  // -------------------------------
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

  // Match spoken phrase
  async findPhraseMatch({ phrase }) {
    return this.request("/phrases/match", {
      method: "POST",
      body: { phrase },
    });
  }
}

export const api = new ApiClient();