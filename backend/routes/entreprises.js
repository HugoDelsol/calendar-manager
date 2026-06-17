const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const entrepriseModel = require('../models/entrepriseModel');
const { reglesEntreprise, valider } = require('../middleware/sanitize');
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

// PUT /api/entreprises/:id
router.put('/:id', authMiddleware, reglesEntreprise, valider, async (req, res) => {
    try {
        const { nom, telephone, secteur, delai_rappel_heures } = req.body;
        await entrepriseModel.updateEntreprise(req.params.id, nom, telephone, secteur, delai_rappel_heures);
        const entreprise = await entrepriseModel.getEntrepriseById(req.params.id);
        res.json(entreprise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/entreprises/:id/mot-de-passe
router.put('/:id/mot-de-passe', authMiddleware, async (req, res) => {
    try {
        const { ancien, nouveau } = req.body;

        if (parseInt(req.params.id) !== req.entrepriseId) {
            return res.status(403).json({ error: 'Action non autorisée' });
        }

        const entreprise = await entrepriseModel.getEntrepriseByEmail(
            (await entrepriseModel.getEntrepriseById(req.params.id)).email
        );

        const valide = await bcrypt.compare(ancien, entreprise.mot_de_passe);
        if (!valide) return res.status(401).json({ error: 'Ancien mot de passe incorrect' });

        const hash = await bcrypt.hash(nouveau, 10);
        await entrepriseModel.updateMotDePasse(req.params.id, hash);

        res.json({ message: 'Mot de passe mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;