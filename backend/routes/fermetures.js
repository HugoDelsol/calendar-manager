const express = require('express');
const router = express.Router();
const fermetureModel = require('../models/fermetureModel');

const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

// GET /api/fermetures
router.get('/', async (req, res) => {
    try {
        const fermetures = await fermetureModel.getFermetures(req.entrepriseId);
        res.json(fermetures);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/fermetures
router.post('/', async (req, res) => {
    try {
        const { date_debut, date_fin, motif } = req.body;
        if (!date_debut || !date_fin) return res.status(400).json({ error: 'date_debut et date_fin sont requis' });
        const id = await fermetureModel.createFermeture(req.entrepriseId, date_debut, date_fin, motif);
        res.status(201).json({ id, date_debut, date_fin, motif });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/fermetures/:id
router.delete('/:id', async (req, res) => {
    try {
        await fermetureModel.deleteFermeture(req.params.id, req.entrepriseId);
        res.json({ message: 'Fermeture supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;