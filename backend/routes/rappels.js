const express = require('express');
const router = express.Router();
const rappelModel = require('../models/rappelModel');
const {reglesTemplate, valider} = require('../middleware/sanitize');
const { body, validationResult } = require('express-validator');

const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

// GET /api/rappels/templates
router.get('/templates', async (req, res) => {
    try {
        const templates = await rappelModel.getTemplates(req.entrepriseId);
        res.json(templates);
    } catch (err) {
        console.error('Erreur GET templates:', err); // ← ajoute ça
        res.status(500).json({ error: err.message });
    }
});

// POST /api/rappels/templates
router.post('/templates', reglesTemplate, valider, async (req, res) => {
    try {
        const { service_id, titre, message, delai_jours } = req.body;
        const id = await rappelModel.createTemplate(req.entrepriseId, service_id, titre, message, delai_jours);
        res.status(201).json({ id, titre, message, delai_jours, service_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/rappels/templates/:id
router.put('/templates/:id', reglesTemplate, valider, async (req, res) => {
    try {
        const { service_id, titre, message, delai_jours, actif } = req.body;
        await rappelModel.updateTemplate(req.params.id, req.entrepriseId, service_id, titre, message, delai_jours, actif ?? true);
        res.json({ message: 'Template mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/rappels/templates/:id
router.delete('/templates/:id', async (req, res) => {
    try {
        await rappelModel.deleteTemplate(req.params.id, req.entrepriseId);
        res.json({ message: 'Template supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/rappels/programmes - liste les rappels programmés
router.get('/programmes', async (req, res) => {
    try {
        const rappels = await rappelModel.getRappelsProgrammes(req.entrepriseId);
        res.json(rappels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;