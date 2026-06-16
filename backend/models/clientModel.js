const pool = require('../config/db');

async function getAllClients(entreprise_id) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE entreprise_id = ?', [entreprise_id]);
    return rows;
}

async function getClientById(id, entreprise_id) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ? AND entreprise_id = ?', [id, entreprise_id]);
    return rows[0];
}

async function createClient(entreprise_id, nom, telephone, email) {
    const [result] = await pool.query(
        'INSERT INTO clients (entreprise_id, nom, telephone, email) VALUES (?, ?, ?, ?)',
        [entreprise_id, nom, telephone, email]
    );
    return result.insertId;
}

async function updateClient(id, entreprise_id, nom, telephone, email) {
    await pool.query(
        'UPDATE clients SET nom = ?, telephone = ?, email = ? WHERE id = ? AND entreprise_id = ?',
        [nom, telephone, email, id, entreprise_id]
    );
}

async function deleteClient(id, entreprise_id) {
    await pool.query('DELETE FROM clients WHERE id = ? AND entreprise_id = ?', [id, entreprise_id]);
}

module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
};