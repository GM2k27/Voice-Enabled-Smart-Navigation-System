const express = require("express");
const router = express.Router();
const PhraseController = require("../controllers/phraseController");
const PhraseService = require("../services/phraseService");
const auth = require("../middleware/authMiddleware");

// CRUD
router.post("/", auth, PhraseController.create);
router.get("/", auth, PhraseController.getAll);
router.delete("/:id", auth, PhraseController.delete);

// 🔥 MAGIC PHRASE MATCH ENDPOINT
router.post("/match", auth, async (req, res) => {
    try {
        const { phrase } = req.body;

        if (!phrase) {
            return res.status(400).json({
                status: "error",
                message: "Phrase is required",
            });
        }

        const match = await PhraseService.findPhraseMatch(phrase, req.userId);

        if (!match) {
            return res.json({
                status: "not_found",
                data: null,
                message: "No matching magic phrase",
            });
        }

        return res.json({
            status: "success",
            data: match,
            message: "Magic phrase matched",
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

module.exports = router;
