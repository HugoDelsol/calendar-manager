const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const entrepriseModel = require('../models/entrepriseModel');
const { reglesEntreprise, valider } = require('../middleware/sanitize');
const authMiddleware = require('../middleware/auth');

// GET /api/entreprises - liste (debug, à restreindre avec l'auth plus tard)
router.get('/', async (req, res, next) => {
    try {
        const entreprises = await entrepriseModel.getAllEntreprises();
        res.json(entreprises);
    } catch (err) {
        next(err);
    }
});

// GET /api/entreprises/:id
router.get('/:id', async (req, res, next) => {
    try {
        const entreprise = await entrepriseModel.getEntrepriseById(req.params.id);
        if (!entreprise) {
            return res.status(404).json({ error: 'Entreprise non trouvée' });
        }
        res.json(entreprise);
    } catch (err) {
        next(err);
    }
});

// PUT /api/entreprises/:id
router.put('/:id', authMiddleware, reglesEntreprise, valider, async (req, res, next) => {
    try {
        const { nom, telephone, secteur, delai_rappel_heures } = req.body;
        await entrepriseModel.updateEntreprise(req.params.id, nom, telephone, secteur, delai_rappel_heures);
        const entreprise = await entrepriseModel.getEntrepriseById(req.params.id);
        res.json(entreprise);
    } catch (err) {
        next(err);
    }
});

// PUT /api/entreprises/:id/mot-de-passe
router.put('/:id/mot-de-passe', authMiddleware, async (req, res, next) => {
    try {
        const { ancien, nouveau } = req.body;

        if (parseInt(req.params.id) !== req.entrepriseId) {
            return res.status(403).json({ error: 'Action non autorisée' });
        }

        const entreprise = await entrepriseModel.getEntrepriseByEmail(
            (await entrepriseModel.getEntrepriseById(req.params.id)).email
        );

        const valide = await bcrypt.compare(ancien, entreprise.mot_de_passe);
        if (!valide) return res.status(403).json({ error: 'Ancien mot de passe incorrect' });

        const hash = await bcrypt.hash(nouveau, 10);
        await entrepriseModel.updateMotDePasse(req.params.id, hash);
        //await entrepriseModel.revoquerTokensExistants(entreprise.id);

        // Génère un nouveau token valide pour la session courante
       /*  const nouveauToken = jwt.sign(
            { entrepriseId: entreprise.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        ); */

        res.json({ message: 'Mot de passe mis à jour'});
    } catch (err) {
        next(err);
    }
});

module.exports = router;