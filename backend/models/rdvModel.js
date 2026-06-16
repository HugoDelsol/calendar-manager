const pool = require('../config/db');

async function getAllRdv(entreprise_id) {
    const [rows] = await pool.query(`
        SELECT 
            rv.id, rv.date_heure, rv.statut, rv.rappel_envoye,
            c.id AS client_id, c.nom AS client_nom, c.telephone AS client_telephone,
            s.id AS service_id, s.nom AS service_nom, s.duree_minutes, s.prix
        FROM rendez_vous rv
        JOIN clients c ON rv.client_id = c.id
        JOIN services s ON rv.service_id = s.id
        WHERE rv.entreprise_id = ?
        ORDER BY rv.date_heure ASC
    `, [entreprise_id]);
    return rows;
}

async function getRdvById(id, entreprise_id) {
    const [rows] = await pool.query(`
        SELECT 
            rv.id, rv.date_heure, rv.statut, rv.rappel_envoye,
            c.id AS client_id, c.nom AS client_nom, c.telephone AS client_telephone,
            s.id AS service_id, s.nom AS service_nom, s.duree_minutes, s.prix
        FROM rendez_vous rv
        JOIN clients c ON rv.client_id = c.id
        JOIN services s ON rv.service_id = s.id
        WHERE rv.id = ? AND rv.entreprise_id = ?
    `, [id, entreprise_id]);
    return rows[0];
}

async function createRdv(entreprise_id, client_id, service_id, date_heure) {
    const [result] = await pool.query(
        'INSERT INTO rendez_vous (entreprise_id, client_id, service_id, date_heure) VALUES (?, ?, ?, ?)',
        [entreprise_id, client_id, service_id, date_heure]
    );
    return result.insertId;
}

async function updateRdv(id, entreprise_id, date_heure, statut) {
    await pool.query(
        'UPDATE rendez_vous SET date_heure = ?, statut = ? WHERE id = ? AND entreprise_id = ?',
        [date_heure, statut, id, entreprise_id]
    );
}

async function deleteRdv(id, entreprise_id) {
    await pool.query('DELETE FROM rendez_vous WHERE id = ? AND entreprise_id = ?', [id, entreprise_id]);
}

async function checkCreneauDisponible(entreprise_id, date_heure, duree_minutes, excludeId = null) {
    const dateDebut = new Date(date_heure);
    const dateFin = new Date(dateDebut.getTime() + duree_minutes * 60000);

    let query = `
        SELECT rv.id FROM rendez_vous rv
        JOIN services s ON rv.service_id = s.id
        WHERE rv.entreprise_id = ?
          AND rv.statut = 'confirme'
          AND rv.date_heure < ?
          AND DATE_ADD(rv.date_heure, INTERVAL s.duree_minutes MINUTE) > ?
    `;
    const params = [entreprise_id, dateFin, dateDebut];

    if (excludeId) {
        query += ' AND rv.id != ?';
        params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length === 0;
}

async function getRdvAvantRappel() {
    const [rows] = await pool.query(`
        SELECT 
            rv.id, rv.date_heure,
            c.nom AS client_nom,
            c.telephone AS client_telephone,
            c.email AS client_email,
            s.nom AS service_nom,
            e.delai_rappel_heures
        FROM rendez_vous rv
        JOIN clients c ON rv.client_id = c.id
        JOIN services s ON rv.service_id = s.id
        JOIN entreprises e ON rv.entreprise_id = e.id
        WHERE rv.statut = 'confirme'
          AND rv.rappel_envoye = FALSE
          AND rv.date_heure BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL e.delai_rappel_heures HOUR)
    `);
    return rows;
}

async function marquerRappelEnvoye(id) {
    await pool.query('UPDATE rendez_vous SET rappel_envoye = TRUE WHERE id = ?', [id]);
}

module.exports = {
    getAllRdv,
    getRdvById,
    createRdv,
    updateRdv,
    deleteRdv,
    checkCreneauDisponible,
    getRdvAvantRappel,
    marquerRappelEnvoye
};