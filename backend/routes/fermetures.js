const express = require('express');
const router = express.Router();
const fermetureModel = require('../models/fermetureModel');
const { reglesFermeture, valider } = require('../middleware/sanitize');
const authOptionnel = require('../middleware/authOptionnel');


const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

// GET /api/fermetures
router.get('/', async (req, res, next) => {
    try {
        const fermetures = await fermetureModel.getFermetures(req.entrepriseId);
        res.json(fermetures);
    } catch (err) {
        next(err);
    }
});

// POST /api/fermetures
router.post('/', reglesFermeture, valider, async (req, res, next) => {
    try {
        const { date_debut, date_fin, motif } = req.body;
        if (!date_debut || !date_fin) return res.status(400).json({ error: 'date_debut et date_fin sont requis' });
        const id = await fermetureModel.createFermeture(req.entrepriseId, date_debut, date_fin, motif);
        res.status(201).json({ id, date_debut, date_fin, motif });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/fermetures/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await fermetureModel.deleteFermeture(req.params.id, req.entrepriseId);
        res.json({ message: 'Fermeture supprimée' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;