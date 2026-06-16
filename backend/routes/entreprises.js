const express = require('express');
const router = express.Router();
const entrepriseModel = require('../models/entrepriseModel');
const authMiddleware = require('../middleware/auth');

// GET /api/entreprises - liste (debug, à restreindre avec l'auth plus tard)
router.get('/', async (req, res) => {
    try {
        const entreprises = await entrepriseModel.getAllEntreprises();
        res.json(entreprises);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/entreprises/:id
router.get('/:id', async (req, res) => {
    try {
        const entreprise = await entrepriseModel.getEntrepriseById(req.params.id);
        if (!entreprise) {
            return res.status(404).json({ error: 'Entreprise non trouvée' });
        }
        res.json(entreprise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/entreprises - crée une entreprise (sans hash pour l'instant)
router.post('/', async (req, res) => {
    try {
        const { nom, email, mot_de_passe, telephone, secteur, delai_rappel_heures } = req.body;

        if (!nom || !email || !mot_de_passe) {
            return res.status(400).json({ error: 'nom, email et mot_de_passe sont requis' });
        }

        const existe = await entrepriseModel.getEntrepriseByEmail(email);
        if (existe) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

        const id = await entrepriseModel.createEntreprise(nom, email, mot_de_passe, telephone, secteur, delai_rappel_heures || 24);
        res.status(201).json({ id, nom, email, telephone, secteur, delai_rappel_heures: delai_rappel_heures || 24 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/entreprises/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { nom, telephone, secteur, delai_rappel_heures } = req.body;
        await entrepriseModel.updateEntreprise(req.params.id, nom, telephone, secteur, delai_rappel_heures);
        const entreprise = await entrepriseModel.getEntrepriseById(req.params.id);
        res.json(entreprise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;