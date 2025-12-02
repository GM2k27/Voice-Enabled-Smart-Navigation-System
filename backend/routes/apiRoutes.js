const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const PhraseController = require('../controllers/phraseController');
const auth = require('../middleware/authMiddleware');

router.get('/locations', auth, LocationController.getAll);
router.get('/phrases', auth, PhraseController.getAll);

module.exports = router;
