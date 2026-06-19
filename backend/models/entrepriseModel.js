const pool = require('../config/db');

async function getAllEntreprises() {
    const [rows] = await pool.query(
        'SELECT id, nom, email, telephone, secteur, delai_rappel_heures, created_at FROM entreprises'
    );
    return rows;
}

async function getEntrepriseById(id) {
    const [rows] = await pool.query(
        'SELECT id, nom, email, telephone, secteur, delai_rappel_heures, created_at FROM entreprises WHERE id = ?',
        [id]
    );
    return rows[0];
}

async function getEntrepriseByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM entreprises WHERE email = ?', [email]);
    return rows[0];
}

async function createEntreprise(nom, email, mot_de_passe, telephone, secteur, delai_rappel_heures = 24) {
    const [result] = await pool.query(
        'INSERT INTO entreprises (nom, email, mot_de_passe, telephone, secteur, delai_rappel_heures) VALUES (?, ?, ?, ?, ?, ?)',
        [nom, email, mot_de_passe, telephone, secteur, delai_rappel_heures]
    );
    return result.insertId;
}

async function updateEntreprise(id, nom, telephone, secteur, delai_rappel_heures) {
    await pool.query(
        'UPDATE entreprises SET nom = ?, telephone = ?, secteur = ?, delai_rappel_heures = ? WHERE id = ?',
        [nom, telephone, secteur, delai_rappel_heures, id]
    );
}

async function updateMotDePasse(id, hash) {
    await pool.query('UPDATE entreprises SET mot_de_passe = ? WHERE id = ?', [hash, id]);
}

async function saveResetToken(email, token, expiry) {
    await pool.query(
        'UPDATE entreprises SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
        [token, expiry, email]
    );
}

async function getEntrepriseByResetToken(token) {
    const [rows] = await pool.query(
        'SELECT * FROM entreprises WHERE reset_token = ? AND reset_token_expiry > NOW()',
        [token]
    );
    return rows[0];
}

async function clearResetToken(id) {
    await pool.query(
        'UPDATE entreprises SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [id]
    );
}

async function revoquerTokensExistants(id) {
    await pool.query(
        'UPDATE entreprises SET tokens_revoques_avant = NOW() WHERE id = ?',
        [id]
    );
}

async function getDateRevocation(id) {
    const [rows] = await pool.query(
        'SELECT tokens_revoques_avant FROM entreprises WHERE id = ?',
        [id]
    );
    return rows[0]?.tokens_revoques_avant;
}

module.exports = {
    getAllEntreprises,
    getEntrepriseById,
    getEntrepriseByEmail,
    createEntreprise,
    updateEntreprise,
    updateMotDePasse,
    saveResetToken,
    getEntrepriseByResetToken,
    clearResetToken,
    revoquerTokensExistants,
    getDateRevocation,
};