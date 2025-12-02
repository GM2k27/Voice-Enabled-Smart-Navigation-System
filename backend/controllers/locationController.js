const LocationService = require('../services/locationService');

class LocationController {
  static async create(req, res) {
    try {
      const location = await LocationService.createLocation(req.body, req.userId);
      res.status(201).json({
        status: 'success',
        data: location,
        message: 'Location created successfully',
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        data: null,
        message: error.message,
      });
    }
  }

  static async getAll(req, res) {
    try {
      const locations = await LocationService.getAllLocations(req.userId);
      res.status(200).json({
        status: 'success',
        data: locations,
        message: 'Locations retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        data: null,
        message: error.message,
      });
    }
  }

  static async getById(req, res) {
    try {
      const location = await LocationService.getLocationById(req.params.id, req.userId);
      res.status(200).json({
        status: 'success',
        data: location,
        message: 'Location retrieved successfully',
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        data: null,
        message: error.message,
      });
    }
  }

  static async update(req, res) {
    try {
      const location = await LocationService.updateLocation(req.params.id, req.body, req.userId);
      res.status(200).json({
        status: 'success',
        data: location,
        message: 'Location updated successfully',
      });
    } catch (error) {
      const statusCode = error.message === 'Location not found' ? 404 : 400;
      res.status(statusCode).json({
        status: 'error',
        data: null,
        message: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      await LocationService.deleteLocation(req.params.id, req.userId);
      res.status(200).json({
        status: 'success',
        data: null,
        message: 'Location deleted successfully',
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        data: null,
        message: error.message,
      });
    }
  }
}

module.exports = LocationController;

