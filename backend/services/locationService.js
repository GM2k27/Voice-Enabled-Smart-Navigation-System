const Location = require('../models/Location');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class LocationService {
  static async createLocation(data, userId) {
    if (!data.location_name || !data.latitude || !data.longitude) {
      throw new Error('location_name, latitude, and longitude are required');
    }

    if (data.latitude < -90 || data.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (data.longitude < -180 || data.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    const existing = await Location.findByName(data.location_name, userId);
    if (existing) {
      throw new Error('Location with this name already exists');
    }

    const tags = Array.isArray(data.tags) ? data.tags : [];

    return await Location.create(
      {
        ...data,
        tags,
        notes: data.notes || '',
      },
      userId
    );
  }

  static async getAllLocations(userId) {
    return await Location.findAll(userId);
  }

  static async getLocationById(id) {
    const location = await Location.findById(id);
    if (!location) {
      throw new Error('Location not found');
    }
    return location;
  }

  static async updateLocation(id, data, userId) {
    const existing = await Location.findById(id, userId);
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
      const duplicate = await Location.findByName(data.location_name, userId);
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
    }, userId);
  }

  static async deleteLocation(id, userId) {
    const location = await Location.findById(id, userId);
    if (!location) {
      throw new Error('Location not found');
    }
    return await Location.delete(id, userId);
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
