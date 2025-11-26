const Location = require('../models/Location');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class LocationService {
  static async createLocation(data) {
    // Validate required fields
    if (!data.location_name || !data.latitude || !data.longitude) {
      throw new Error('location_name, latitude, and longitude are required');
    }

    // Validate latitude
    if (data.latitude < -90 || data.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    // Validate longitude
    if (data.longitude < -180 || data.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Check for duplicate name
    const existing = await Location.findByName(data.location_name);
    if (existing) {
      throw new Error('Location with this name already exists');
    }

    // Normalize tags
    const tags = Array.isArray(data.tags) ? data.tags : [];

    return await Location.create({
      ...data,
      tags,
      notes: data.notes || '',
    });
  }

  static async getAllLocations() {
    return await Location.findAll();
  }

  static async getLocationById(id) {
    const location = await Location.findById(id);
    if (!location) {
      throw new Error('Location not found');
    }
    return location;
  }

  static async updateLocation(id, data) {
    const existing = await Location.findById(id);
    if (!existing) {
      throw new Error('Location not found');
    }

    // Validate latitude if provided
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      throw new Error('Latitude must be between -90 and 90');
    }

    // Validate longitude if provided
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Check for duplicate name if name is being changed
    if (data.location_name && data.location_name !== existing.location_name) {
      const duplicate = await Location.findByName(data.location_name);
      if (duplicate) {
        throw new Error('Location with this name already exists');
      }
    }

    // Normalize tags
    if (data.tags !== undefined) {
      data.tags = Array.isArray(data.tags) ? data.tags : [];
    }

    return await Location.update(id, {
      location_name: data.location_name || existing.location_name,
      latitude: data.latitude !== undefined ? data.latitude : existing.latitude,
      longitude: data.longitude !== undefined ? data.longitude : existing.longitude,
      tags: data.tags !== undefined ? data.tags : existing.tags,
      notes: data.notes !== undefined ? data.notes : existing.notes,
    });
  }

  static async deleteLocation(id) {
    const location = await Location.findById(id);
    if (!location) {
      throw new Error('Location not found');
    }
    return await Location.delete(id);
  }

  static async searchLocations(query) {
    if (!query || query.trim().length === 0) {
      return await Location.findAll();
    }

    const trimmedQuery = query.trim();
    const dbResults = await Location.search(trimmedQuery);
    if (dbResults && dbResults.length > 0) {
      return dbResults;
    }

    return await this.searchGeocode(trimmedQuery);
  }

  static async searchGeocode(query) {
    try {
      const url = 'https://nominatim.openstreetmap.org/search';
      const params = {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
      };

      const response = await axios.get(url, { params, headers: { 'User-Agent': 'VESNS-App' } });
      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Map Nominatim results to Location model compatible objects
      const results = response.data.map(place => ({
        id: uuidv4(),
        location_name: place.display_name || place.name || query,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        tags: [],
        notes: '',
      }));

      return results;
    } catch (error) {
      console.error('Error fetching geocode data:', error.message);
      return [];
    }
  }
}

module.exports = LocationService;
