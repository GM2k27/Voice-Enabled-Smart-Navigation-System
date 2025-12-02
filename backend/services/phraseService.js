const MagicPhrase = require('../models/MagicPhrase');
const Location = require('../models/Location');

class PhraseService {
  static async createPhrase(data, userId) {
    if (!data.phrase) throw new Error('phrase is required');
    if (!data.target_location_id) throw new Error('target_location_id is required');

    // Verify location belongs to user
    const location = await Location.findById(data.target_location_id, userId);
    if (!location) {
      throw new Error('Target location not found');
    }

    // Check duplicates for this user only
    const existing = await MagicPhrase.findByPhrase(data.phrase, userId);
    if (existing) {
      throw new Error('Magic phrase already exists');
    }

    // INSERT with userId 🔥
    return await MagicPhrase.create({
      phrase: data.phrase.trim(),
      action_type: data.action_type || 'navigate',
      target_location_id: data.target_location_id,
    }, userId);
  }


  static async getAllPhrases(userId) {
    return await MagicPhrase.findAll(userId);
  }

  static async getPhraseById(id) {
    const phrase = await MagicPhrase.findById(id);
    if (!phrase) {
      throw new Error('Magic phrase not found');
    }
    return phrase;
  }

  static async deletePhrase(id, userId) {
    const phrase = await MagicPhrase.findById(id, userId);
    if (!phrase) throw new Error('Magic phrase not found');
    return await MagicPhrase.delete(id, userId);
  }


  static async findPhraseMatch(spokenText, userId) {
    const cleaned = spokenText.toLowerCase().trim();
    console.log("🔎 findPhraseMatch input:", { cleaned, userId });

    const match = await MagicPhrase.findByPhrase(cleaned, userId);

    console.log("✅ DB match result:", match);

    return match;
  }


}

module.exports = PhraseService;

