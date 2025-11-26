const MagicPhrase = require('../models/MagicPhrase');
const Location = require('../models/Location');

class PhraseService {
  static async createPhrase(data) {
    // Validate required fields
    if (!data.phrase) {
      throw new Error('phrase is required');
    }

    if (!data.target_location_id) {
      throw new Error('target_location_id is required');
    }

    // Validate action_type
    if (data.action_type && data.action_type !== 'navigate') {
      throw new Error('action_type must be "navigate"');
    }

    // Verify target location exists
    const location = await Location.findById(data.target_location_id);
    if (!location) {
      throw new Error('Target location not found');
    }

    // Check for duplicate phrase
    const existing = await MagicPhrase.findByPhrase(data.phrase);
    if (existing) {
      throw new Error('Magic phrase already exists');
    }

    return await MagicPhrase.create({
      phrase: data.phrase.trim(),
      action_type: data.action_type || 'navigate',
      target_location_id: data.target_location_id,
    });
  }

  static async getAllPhrases() {
    return await MagicPhrase.findAll();
  }

  static async getPhraseById(id) {
    const phrase = await MagicPhrase.findById(id);
    if (!phrase) {
      throw new Error('Magic phrase not found');
    }
    return phrase;
  }

  static async deletePhrase(id) {
    const phrase = await MagicPhrase.findById(id);
    if (!phrase) {
      throw new Error('Magic phrase not found');
    }
    return await MagicPhrase.delete(id);
  }

  static async findPhraseMatch(spokenText) {
  return await MagicPhrase.findByPhrase(spokenText.toLowerCase().trim());
}

}

module.exports = PhraseService;

