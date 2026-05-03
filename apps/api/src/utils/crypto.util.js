const crypto = require('crypto');

/**
 * Generate ID Konsisten: ACC-[ROLE]-[4-DIGIT-HEX]
 * Contoh: ACC-VEN-E92A, ACC-GOV-1B2F
 */
const createId = (prefix) => {
    const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${prefix}-${suffix}`;
};

/**
 * Hash data untuk Zero-Trust
 */
const generateHash = (data) => {
    if (!data) return null;
    return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
    createId,
    generateHash
};
