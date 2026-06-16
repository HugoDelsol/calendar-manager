const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const entrepriseModel = require('../models/entrepriseModel');

// POST /api/auth/inscription
router.post('/inscription', async (req, res) => {
    try {
        const { nom, email, mot_de_passe, telephone, secteur, delai_rappel_heures } = req.body;

        if (!nom || !email || !mot_de_passe) {
            return res.status(400).json({ error: 'nom, email et mot_de_passe sont requis' });
        }

        // Vérifie si l'email existe déjà
        const existe = await entrepriseModel.getEntrepriseByEmail(email);
        if (existe) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

        // Hash du mot de passe
        const hash = await bcrypt.hash(mot_de_passe, 10);

        const id = await entrepriseModel.createEntreprise(
            nom, email, hash, telephone, secteur, delai_rappel_heures || 24
        );

        // Génère le token JWT
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
router.post('/login', async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        if (!email || !mot_de_passe) {
            return res.status(400).json({ error: 'email et mot_de_passe sont requis' });
        }

        // Vérifie que l'entreprise existe
        const entreprise = await entrepriseModel.getEntrepriseByEmail(email);
        if (!entreprise) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

        // Vérifie le mot de passe
        const valide = await bcrypt.compare(mot_de_passe, entreprise.mot_de_passe);
        if (!valide) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

        // Génère le token JWT
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