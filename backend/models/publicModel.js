const pool = require('../config/db');

async function getEntrepriseInfo(entrepriseId) {
    const [rows] = await pool.query(
        'SELECT id, nom, telephone, secteur FROM entreprises WHERE id = ?',
        [entrepriseId]
    );
    return rows[0];
}

async function getServices(entrepriseId) {
    const [rows] = await pool.query(
        'SELECT id, nom, duree_minutes, prix, description FROM services WHERE entreprise_id = ?',
        [entrepriseId]
    );
    return rows;
}

async function getPlagesHoraires(entrepriseId, jourSemaine) {
    const [rows] = await pool.query(
        'SELECT heure_debut, heure_fin FROM horaires_ouverture WHERE entreprise_id = ? AND jour_semaine = ? ORDER BY heure_debut',
        [entrepriseId, jourSemaine]
    );
    return rows;
}

async function getFermetureJour(entrepriseId, date) {
    const [rows] = await pool.query(
        'SELECT id FROM fermetures_exceptionnelles WHERE entreprise_id = ? AND date_debut <= ? AND date_fin >= ?',
        [entrepriseId, date, date]
    );
    return rows;
}

async function getRdvsExistants(entrepriseId, date) {
    const [rows] = await pool.query(`
        SELECT rv.date_heure, s.duree_minutes
        FROM rendez_vous rv
        JOIN services s ON rv.service_id = s.id
        WHERE rv.entreprise_id = ?
          AND DATE(rv.date_heure) = ?
          AND rv.statut = 'confirme'
    `, [entrepriseId, date]);
    return rows;
}

async function getServiceById(serviceId, entrepriseId) {
    const [rows] = await pool.query(
        'SELECT * FROM services WHERE id = ? AND entreprise_id = ?',
        [serviceId, entrepriseId]
    );
    return rows[0];
}

async function getClientByEmail(email, entrepriseId) {
    const [rows] = await pool.query(
        'SELECT id FROM clients WHERE email = ? AND entreprise_id = ?',
        [email, entrepriseId]
    );
    return rows[0];
}

async function createRdv(entrepriseId, clientId, serviceId, dateHeure) {
    const [result] = await pool.query(
        'INSERT INTO rendez_vous (entreprise_id, client_id, service_id, date_heure) VALUES (?, ?, ?, ?)',
        [entrepriseId, clientId, serviceId, dateHeure]
    );
    return result.insertId;
}

async function checkChevauchement(entrepriseId, dateDebut, dateFin) {
    const [rows] = await pool.query(`
        SELECT rv.id FROM rendez_vous rv
        JOIN services s ON rv.service_id = s.id
        WHERE rv.entreprise_id = ?
          AND rv.statut = 'confirme'
          AND rv.date_heure < ?
          AND DATE_ADD(rv.date_heure, INTERVAL s.duree_minutes MINUTE) > ?
    `, [entrepriseId, dateFin, dateDebut]);
    return rows.length > 0;
}

module.exports = {
    getEntrepriseInfo,
    getServices,
    getPlagesHoraires,
    getFermetureJour,
    getRdvsExistants,
    getServiceById,
    getClientByEmail,
    createRdv,
    checkChevauchement
};