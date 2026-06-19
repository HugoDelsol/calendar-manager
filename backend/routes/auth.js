const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const entrepriseModel = require('../models/entrepriseModel');
const { limiterAuth } = require('../middleware/rateLimiter');
const { reglesInscription, reglesLogin, regleMotDePasse, valider } = require('../middleware/sanitize');
const emailService = require('../services/emailService');
const { error } = require('console');


// POST /api/auth/inscription
router.post('/inscription', limiterAuth, reglesInscription, valider, async (req, res, next) => {
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
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', limiterAuth, reglesLogin, valider, async (req, res, next) => {
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
        next(err);
    }
});

// POST /api/auth/mot-de-passe-oublie
router.post('/mot-de-passe-oublie', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email requis' });

        const entreprise = await entrepriseModel.getEntrepriseByEmail(email);

        // On répond toujours OK pour ne pas révéler si l'email existe
        if (!entreprise) {
            return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
        }

        // Génère un token unique
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // expire dans 1h

        await entrepriseModel.saveResetToken(email, token, expiry);

        // Envoie l'email
        await emailService.envoyerResetMotDePasse(email, entreprise.nom, token);

        res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/reinitialiser-mot-de-passe
router.post('/reinitialiser-mot-de-passe', regleMotDePasse, valider, async (req, res, next) => {
    try {
        const { token, nouveau_mot_de_passe } = req.body;
        if (!token || !nouveau_mot_de_passe) {
            return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
        }

        if (nouveau_mot_de_passe.length < 8) {
            return res.status(400).json({ error: '8 caractères minimum' });
        }

        const entreprise = await entrepriseModel.getEntrepriseByResetToken(token);
        if (!entreprise) {
            return res.status(400).json({ error: 'Lien invalide ou expiré' });
        }

        const hash = await bcrypt.hash(nouveau_mot_de_passe, 10);
        await entrepriseModel.updateMotDePasse(entreprise.id, hash);
        //await entrepriseModel.revoquerTokensExistants(entreprise.id);
        await entrepriseModel.clearResetToken(entreprise.id);

        res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;