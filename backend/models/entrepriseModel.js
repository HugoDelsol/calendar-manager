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

module.exports = {
    getAllEntreprises,
    getEntrepriseById,
    getEntrepriseByEmail,
    createEntreprise,
    updateEntreprise
};