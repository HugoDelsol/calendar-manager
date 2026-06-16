const pool = require('../config/db');

async function getAllServices(entreprise_id) {
    const [rows] = await pool.query('SELECT * FROM services WHERE entreprise_id = ?', [entreprise_id]);
    return rows;
}

async function getServiceById(id, entreprise_id) {
    const [rows] = await pool.query('SELECT * FROM services WHERE id = ? AND entreprise_id = ?', [id, entreprise_id]);
    return rows[0];
}

async function createService(entreprise_id, nom, duree_minutes, prix, description) {
    const [result] = await pool.query(
        'INSERT INTO services (entreprise_id, nom, duree_minutes, prix, description) VALUES (?, ?, ?, ?, ?)',
        [entreprise_id, nom, duree_minutes, prix, description]
    );
    return result.insertId;
}

async function updateService(id, entreprise_id, nom, duree_minutes, prix, description) {
    await pool.query(
        'UPDATE services SET nom = ?, duree_minutes = ?, prix = ?, description = ? WHERE id = ? AND entreprise_id = ?',
        [nom, duree_minutes, prix, description, id, entreprise_id]
    );
}

async function deleteService(id, entreprise_id) {
    await pool.query('DELETE FROM services WHERE id = ? AND entreprise_id = ?', [id, entreprise_id]);
}

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};