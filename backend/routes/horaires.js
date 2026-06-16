const express = require('express');
const router = express.Router();
const horaireModel = require('../models/horaireModel');

function getEntrepriseId(req, res, next) {
    const entrepriseId = req.headers['x-entreprise-id'];
    if (!entrepriseId) return res.status(400).json({ error: 'Header x-entreprise-id requis' });
    req.entrepriseId = parseInt(entrepriseId);
    next();
}

router.use(getEntrepriseId);

// GET /api/horaires - liste les horaires d'ouverture
router.get('/', async (req, res) => {
    try {
        const horaires = await horaireModel.getHoraires(req.entrepriseId);
        res.json(horaires);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/horaires - ajoute une plage horaire
router.post('/', async (req, res) => {
    try {
        const { jour_semaine, heure_debut, heure_fin } = req.body;
        if (jour_semaine === undefined || !heure_debut || !heure_fin) {
            return res.status(400).json({ error: 'jour_semaine, heure_debut et heure_fin sont requis' });
        }
        const id = await horaireModel.setHoraire(req.entrepriseId, jour_semaine, heure_debut, heure_fin);
        res.status(201).json({ id, jour_semaine, heure_debut, heure_fin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/horaires/:id - supprime une plage horaire
router.delete('/:id', async (req, res) => {
    try {
        await horaireModel.deleteHoraire(req.params.id, req.entrepriseId);
        res.json({ message: 'Horaire supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;