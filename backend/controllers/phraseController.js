const PhraseService = require('../services/phraseService');

class PhraseController {

  static async create(req, res) {
    try {
      const phrase = await PhraseService.createPhrase(req.body, req.userId);
      res.status(201).json({
        status: 'success',
        data: phrase,
        message: 'Magic phrase created successfully',
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
      const phrases = await PhraseService.getAllPhrases(req.userId);
      res.status(200).json({
        status: 'success',
        data: phrases,
        message: 'Magic phrases retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        data: null,
        message: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      await PhraseService.deletePhrase(req.params.id, req.userId);
      res.status(200).json({
        status: 'success',
        data: null,
        message: 'Magic phrase deleted successfully',
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

module.exports = PhraseController;
