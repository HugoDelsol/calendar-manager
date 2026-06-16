const pool = require('../config/db');

async function getFermetures(entreprise_id) {
    const [rows] = await pool.query(
        'SELECT * FROM fermetures_exceptionnelles WHERE entreprise_id = ? ORDER BY date_debut',
        [entreprise_id]
    );
    return rows;
}

async function createFermeture(entreprise_id, date_debut, date_fin, motif) {
    const [result] = await pool.query(
        'INSERT INTO fermetures_exceptionnelles (entreprise_id, date_debut, date_fin, motif) VALUES (?, ?, ?, ?)',
        [entreprise_id, date_debut, date_fin, motif]
    );
    return result.insertId;
}

async function deleteFermeture(id, entreprise_id) {
    await pool.query('DELETE FROM fermetures_exceptionnelles WHERE id = ? AND entreprise_id = ?', [id, entreprise_id]);
}

// Vérifie si une date tombe dans une fermeture exceptionnelle
async function isDateFermee(entreprise_id, date_heure) {
    const date = new Date(date_heure).toISOString().slice(0, 10);
    const [rows] = await pool.query(`
        SELECT id FROM fermetures_exceptionnelles
        WHERE entreprise_id = ?
          AND date_debut <= ?
          AND date_fin >= ?
    `, [entreprise_id, date, date]);
    return rows.length > 0;
}

module.exports = {
    getFermetures,
    createFermeture,
    deleteFermeture,
    isDateFermee
};