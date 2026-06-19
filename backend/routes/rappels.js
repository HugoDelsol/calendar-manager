const express = require('express');
const router = express.Router();
const rappelModel = require('../models/rappelModel');
const {reglesTemplate, valider} = require('../middleware/sanitize');
const { body, validationResult } = require('express-validator');

const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

// GET /api/rappels/templates
router.get('/templates', async (req, res, next) => {
    try {
        const templates = await rappelModel.getTemplates(req.entrepriseId);
        res.json(templates);
    } catch (err) {
        next(err);
    }
});

// POST /api/rappels/templates
router.post('/templates', reglesTemplate, valider, async (req, res, next) => {
    try {
        const { service_id, titre, message, delai_jours } = req.body;

        const existeDeja = await rappelModel.getTemplateActifParService(req.entrepriseId, service_id);
        if (existeDeja) {
            return res.status(409).json({ error: 'Un template actif existe déjà pour ce service' });
        }

        const id = await rappelModel.createTemplate(req.entrepriseId, service_id, titre, message, delai_jours);
        res.status(201).json({ id, titre, message, delai_jours, service_id });
    } catch (err) {
        next(err);
    }
});

// PUT /api/rappels/templates/:id
router.put('/templates/:id', reglesTemplate, valider, async (req, res, next) => {
    try {
        const { service_id, titre, message, delai_jours, actif } = req.body;

        if (actif) {
            const existeDeja = await rappelModel.getTemplateActifParService(req.entrepriseId, service_id, req.params.id);
            if (existeDeja) {
                return res.status(409).json({ error: 'Un template actif existe déjà pour ce service' });
            }
        }

        await rappelModel.updateTemplate(req.params.id, req.entrepriseId, service_id, titre, message, delai_jours, actif ?? true);
        res.json({ message: 'Template mis à jour' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/rappels/templates/:id
router.delete('/templates/:id', async (req, res, next) => {
    try {
        await rappelModel.deleteTemplate(req.params.id, req.entrepriseId);
        res.json({ message: 'Template supprimé' });
    } catch (err) {
        next(err);
    }
});

// GET /api/rappels/programmes - liste les rappels programmés
router.get('/programmes', async (req, res, next) => {
    try {
        const rappels = await rappelModel.getRappelsProgrammes(req.entrepriseId);
        res.json(rappels);
    } catch (err) {
        next(err);
    }
});

module.exports = router;