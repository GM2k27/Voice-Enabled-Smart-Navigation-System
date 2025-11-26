const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Location endpoints
  async getLocations() {
    return this.request('/locations');
  }

  async getLocation(id) {
    return this.request(`/locations/${id}`);
  }

  async createLocation(location) {
    return this.request('/locations', {
      method: 'POST',
      body: location,
    });
  }

  async updateLocation(id, location) {
    return this.request(`/locations/${id}`, {
      method: 'PUT',
      body: location,
    });
  }

  async deleteLocation(id) {
    return this.request(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  async searchLocations(query) {
    // For now, we'll filter on the frontend, but this could be a backend endpoint
    const result = await this.getLocations();
    if (!query) return result;
    
    const searchLower = query.toLowerCase();
    const filtered = result.data.filter(loc => 
      loc.location_name.toLowerCase().includes(searchLower) ||
      loc.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
    
    return { ...result, data: filtered };
  }

  // Magic phrase endpoints
  async getPhrases() {
    return this.request('/phrases');
  }

  async createPhrase(phrase) {
    return this.request('/phrases', {
      method: 'POST',
      body: phrase,
    });
  }

  async deletePhrase(id) {
    return this.request(`/phrases/${id}`, {
      method: 'DELETE',
    });
  }

  // Voice search integration
  async findPhraseMatch({ phrase }) {
    return this.request("/phrases/match", {
      method: "POST",
      body: { phrase },
    });
  }

  async findLocationByName(name) {
    const locations = await this.getLocations();
    const normalized = name.toLowerCase().trim();
    
    const match = locations.data.find(loc => 
      loc.location_name.toLowerCase() === normalized
    );
    
    return match || null;
  }
}

export const api = new ApiClient();

