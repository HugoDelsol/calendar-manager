const pool = require('../config/db');

async function getHoraires(entreprise_id) {
    const [rows] = await pool.query(
        'SELECT * FROM horaires_ouverture WHERE entreprise_id = ? ORDER BY jour_semaine, heure_debut',
        [entreprise_id]
    );
    return rows;
}

async function setHoraire(entreprise_id, jour_semaine, heure_debut, heure_fin) {
    const [result] = await pool.query(
        'INSERT INTO horaires_ouverture (entreprise_id, jour_semaine, heure_debut, heure_fin) VALUES (?, ?, ?, ?)',
        [entreprise_id, jour_semaine, heure_debut, heure_fin]
    );
    return result.insertId;
}

async function deleteHoraire(id, entreprise_id) {
    await pool.query('DELETE FROM horaires_ouverture WHERE id = ? AND entreprise_id = ?', [id, entreprise_id]);
}

// Vérifie si un créneau (date_heure + durée) est dans les horaires d'ouverture
async function isInHoraires(entreprise_id, date_heure, duree_minutes) {
    const date = new Date(date_heure);
    const jourSemaine = date.getDay(); // 0=Dim, 1=Lun...
    const heureDebut = date.toTimeString().slice(0, 8);
    const dateFin = new Date(date.getTime() + duree_minutes * 60000);
    const heureFin = dateFin.toTimeString().slice(0, 8);

    const [rows] = await pool.query(`
        SELECT id FROM horaires_ouverture
        WHERE entreprise_id = ?
          AND jour_semaine = ?
          AND heure_debut <= ?
          AND heure_fin >= ?
    `, [entreprise_id, jourSemaine, heureDebut, heureFin]);

    return rows.length > 0;
}

module.exports = {
    getHoraires,
    setHoraire,
    deleteHoraire,
    isInHoraires
};