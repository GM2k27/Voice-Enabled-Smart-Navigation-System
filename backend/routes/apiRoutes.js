const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const PhraseController = require('../controllers/phraseController');

// API endpoints for Android integration
router.get('/locations', LocationController.getAll);
router.get('/phrases', PhraseController.getAll);

module.exports = router;

