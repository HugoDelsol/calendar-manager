const pool = require('../config/db');

// ── TEMPLATES ──────────────────────────────────────────────

async function getTemplates(entreprise_id) {
    const [rows] = await pool.query(`
        SELECT rt.*, s.nom AS service_nom
        FROM rappel_templates rt
        LEFT JOIN services s ON rt.service_id = s.id
        WHERE rt.entreprise_id = ?
        ORDER BY rt.created_at DESC
    `, [entreprise_id]);
    return rows;
}

async function createTemplate(entreprise_id, service_id, titre, message, delai_jours) {
    const [result] = await pool.query(
        'INSERT INTO rappel_templates (entreprise_id, service_id, titre, message, delai_jours) VALUES (?, ?, ?, ?, ?)',
        [entreprise_id, service_id || null, titre, message, delai_jours]
    );
    return result.insertId;
}

async function updateTemplate(id, entreprise_id, service_id, titre, message, delai_jours, actif) {
    await pool.query(
        'UPDATE rappel_templates SET service_id = ?, titre = ?, message = ?, delai_jours = ?, actif = ? WHERE id = ? AND entreprise_id = ?',
        [service_id || null, titre, message, delai_jours, actif, id, entreprise_id]
    );
}

async function deleteTemplate(id, entreprise_id) {
    await pool.query(
        'DELETE FROM rappel_templates WHERE id = ? AND entreprise_id = ?',
        [id, entreprise_id]
    );
}

// ── RAPPELS PROGRAMMES ─────────────────────────────────────

// Appelé quand un RDV est marqué terminé
async function genererRappels(entreprise_id, rdv_id, service_id, client_id, date_rdv) {
    // Cherche les templates actifs pour ce service OU globaux (service_id NULL)
    const [templates] = await pool.query(`
        SELECT * FROM rappel_templates
        WHERE entreprise_id = ?
          AND actif = TRUE
          AND (service_id = ? OR service_id IS NULL)
    `, [entreprise_id, service_id]);

    for (const template of templates) {
        const dateRappel = new Date(date_rdv);
        dateRappel.setDate(dateRappel.getDate() + template.delai_jours);

        await pool.query(
            'INSERT INTO rappels_programmes (entreprise_id, client_id, rdv_id, titre, message, date_rappel) VALUES (?, ?, ?, ?, ?, ?)',
            [entreprise_id, client_id, rdv_id, template.titre, template.message, dateRappel.toISOString().slice(0, 10)]
        );
    }

    return templates.length; // nombre de rappels générés
}

// Appelé par le cron job
async function getRappelsDuJour() {
    const [rows] = await pool.query(`
        SELECT 
            rp.*,
            c.nom AS client_nom,
            c.email AS client_email,
            e.nom AS entreprise_nom
        FROM rappels_programmes rp
        JOIN clients c ON rp.client_id = c.id
        JOIN entreprises e ON rp.entreprise_id = e.id
        WHERE rp.date_rappel = CURDATE()
          AND rp.envoye = FALSE
    `);
    return rows;
}

async function marquerRappelEnvoye(id) {
    await pool.query('UPDATE rappels_programmes SET envoye = TRUE WHERE id = ?', [id]);
}

async function getRappelsProgrammes(entreprise_id) {
    const [rows] = await pool.query(`
        SELECT 
            rp.*,
            c.nom AS client_nom,
            c.email AS client_email
        FROM rappels_programmes rp
        JOIN clients c ON rp.client_id = c.id
        WHERE rp.entreprise_id = ?
        ORDER BY rp.date_rappel ASC
    `, [entreprise_id]);
    return rows;
}

module.exports = {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    genererRappels,
    getRappelsDuJour,
    marquerRappelEnvoye,
    getRappelsProgrammes
};