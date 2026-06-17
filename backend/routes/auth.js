const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const entrepriseModel = require('../models/entrepriseModel');
const { limiterAuth } = require('../middleware/rateLimiter');
const { reglesInscription, reglesLogin, valider } = require('../middleware/sanitize');


// POST /api/auth/inscription
router.post('/inscription', limiterAuth, reglesInscription, valider, async (req, res) => {
    try {
        const { nom, email, mot_de_passe, telephone, secteur, delai_rappel_heures } = req.body;

        const existe = await entrepriseModel.getEntrepriseByEmail(email);
        if (existe) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

        const hash = await bcrypt.hash(mot_de_passe, 10);
        const id = await entrepriseModel.createEntreprise(
            nom, email, hash, telephone, secteur, delai_rappel_heures || 24
        );

        const token = jwt.sign(
            { entrepriseId: id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({ token, entreprise: { id, nom, email, telephone, secteur } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', limiterAuth, reglesLogin, valider, async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        const entreprise = await entrepriseModel.getEntrepriseByEmail(email);

        // On compare même si l'entreprise n'existe pas (évite le timing attack)
        const hashFactice = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
        const valide = entreprise
            ? await bcrypt.compare(mot_de_passe, entreprise.mot_de_passe)
            : await bcrypt.compare(mot_de_passe, hashFactice);

        if (!entreprise || !valide) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { entrepriseId: entreprise.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            entreprise: {
                id: entreprise.id,
                nom: entreprise.nom,
                email: entreprise.email,
                telephone: entreprise.telephone,
                secteur: entreprise.secteur,
                delai_rappel_heures: entreprise.delai_rappel_heures
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;