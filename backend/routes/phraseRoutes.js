const express = require('express');
const router = express.Router();
const PhraseController = require('../controllers/phraseController');
const PhraseService = require('../services/phraseService');

router.post('/', PhraseController.create);
router.get('/', PhraseController.getAll);
router.delete('/:id', PhraseController.delete);

// ✅ NEW MATCH ENDPOINT
router.post('/match', async (req, res) => {
    try {
        const { phrase } = req.body;

        if (!phrase) {
            return res.status(400).json({
                status: "error",
                message: "phrase is required"
            });
        }

        const match = await PhraseService.findPhraseMatch(phrase);

        if (!match) {
            return res.status(200).json({
                status: "not_found",
                data: null,
                message: "No magic phrase matched"
            });
        }

        return res.status(200).json({
            status: "success",
            data: match,
            message: "Magic phrase matched"
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

module.exports = router;
