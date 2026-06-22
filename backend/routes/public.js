const express = require('express');
const router = express.Router();
const publicModel = require('../models/publicModel');
const clientModel = require('../models/clientModel');
const emailService = require('../services/emailService');
const creneauxService = require('../services/creneauxService');
const fermetureModel = require('../models/fermetureModel');
const horaireModel = require('../models/horaireModel');
const authOptionnel = require('../middleware/authOptionnel');
const { reglesReservation, reglesParamEntrepriseId, valider } = require('../middleware/sanitize');
const { limiterReservation } = require('../middleware/rateLimiter');


// GET /api/public/:entrepriseId/info
router.get('/:entrepriseId/info', reglesParamEntrepriseId, valider, async (req, res, next) => {
    try {
        const entreprise = await publicModel.getEntrepriseInfo(req.params.entrepriseId);
        if (!entreprise) return res.status(404).json({ error: 'Entreprise non trouvée' });
        res.json(entreprise);
    } catch (err) {
        next(err);
    }
});

// GET /api/public/:entrepriseId/services
router.get('/:entrepriseId/services', reglesParamEntrepriseId, valider, async (req, res, next) => {
    try {
        const services = await publicModel.getServices(req.params.entrepriseId);
        res.json(services);
    } catch (err) {
        next(err);
    }
});

// GET /api/public/:entrepriseId/fermetures
router.get('/:entrepriseId/fermetures', reglesParamEntrepriseId, valider, async (req, res, next) => {
    try {
        const fermetures = await fermetureModel.getFermetures(req.params.entrepriseId);
        res.json(fermetures);
    } catch (err) {
        next(err);
    }
});

// GET /api/public/:entrepriseId/horaires
router.get('/:entrepriseId/horaires', reglesParamEntrepriseId, valider, async (req, res, next) => {
    try {
        const horaires = await horaireModel.getHoraires(req.params.entrepriseId);
        res.json(horaires);
    } catch (err) {
        next(err);
    }
});

// GET /api/public/:entrepriseId/creneaux?date=2026-06-22&service_id=1
router.get('/:entrepriseId/creneaux', reglesParamEntrepriseId, valider, async (req, res, next) => {
    try {
        const { date, service_id } = req.query;
        const { entrepriseId } = req.params;

        if (!date || !service_id) {
            return res.status(400).json({ error: 'date et service_id sont requis' });
        }

        const dateObj = new Date(date);
        const jourSemaine = dateObj.getDay();

        const fermetures = await publicModel.getFermetureJour(entrepriseId, date);
        if (fermetures.length > 0) {
            return res.json({ creneaux: [], message: 'Entreprise fermée ce jour' });
        }

        const plages = await publicModel.getPlagesHoraires(entrepriseId, jourSemaine);
        if (plages.length === 0) {
            return res.json({ creneaux: [], message: 'Entreprise fermée ce jour' });
        }

        const service = await publicModel.getServiceById(service_id, entrepriseId);
        if (!service) return res.status(404).json({ error: 'Service non trouvé' });

        const rdvsExistants = await publicModel.getRdvsExistants(entrepriseId, date);
        const creneaux = creneauxService.genererCreneaux(plages, service.duree_minutes, rdvsExistants, date);

        res.json({ creneaux });
    } catch (err) {
        next(err);
    }
});

// POST /api/public/:entrepriseId/reserver
router.post('/:entrepriseId/reserver', authOptionnel, limiterReservation, reglesParamEntrepriseId, reglesReservation, valider, async (req, res, next) => {
    try {
        const { entrepriseId } = req.params;
        const { nom, telephone, email, service_id, date_heure, adresse, informations } = req.body;

        if (req.entrepriseIdConnectee && parseInt(entrepriseId) !== req.entrepriseIdConnectee) {
            return res.status(403).json({ error: 'Action non autorisée' });
        }

        if (!nom || !telephone || !email || !service_id || !date_heure) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const service = await publicModel.getServiceById(service_id, entrepriseId);
        if (!service) return res.status(404).json({ error: 'Service non trouvé' });

        // Vérifie chevauchement
        const dateDebut = new Date(date_heure);
        const dateFin = new Date(dateDebut.getTime() + service.duree_minutes * 60000);
        const chevauche = await publicModel.checkChevauchement(entrepriseId, dateFin, dateDebut);
        if (chevauche) return res.status(409).json({ error: 'Ce créneau vient d\'être réservé' });

        // Client existant ou nouveau
        let client = await publicModel.getClientByEmail(email, entrepriseId);
        let clientId;
        if (client) {
            clientId = client.id;
        } else {
            clientId = await clientModel.createClient(entrepriseId, nom, telephone, email, informations, adresse);
        }

        // Crée le RDV
        const rdvId = await publicModel.createRdv(entrepriseId, clientId, service_id, date_heure);

        // Email de confirmation
        const entreprise = await publicModel.getEntrepriseInfo(entrepriseId);
        await emailService.envoyerConfirmationEmail(email, nom, service.nom, date_heure, entreprise.nom);

        res.status(201).json({
            message: 'Rendez-vous confirmé ! Un email de confirmation vous a été envoyé.',
            rdv_id: rdvId
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;