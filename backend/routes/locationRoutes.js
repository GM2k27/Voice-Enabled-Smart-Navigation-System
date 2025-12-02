const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const auth = require("../middleware/authMiddleware");

router.post('/', auth, LocationController.create);
router.get('/', auth, LocationController.getAll);
router.get('/:id', auth, LocationController.getById);
router.put('/:id', auth, LocationController.update);
router.delete('/:id', auth, LocationController.delete);

module.exports = router;

