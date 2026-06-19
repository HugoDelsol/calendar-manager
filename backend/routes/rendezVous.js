const express = require('express');
const router = express.Router();
const rdvModel = require('../models/rdvModel');
const serviceModel = require('../models/serviceModel');
const horaireModel = require('../models/horaireModel');
const fermetureModel = require('../models/fermetureModel');
const { reglesRdv, valider } = require('../middleware/sanitize');
const rappelModel = require('../models/rappelModel');

const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
    try {
        const rdvs = await rdvModel.getAllRdv(req.entrepriseId);
        res.json(rdvs);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const rdv = await rdvModel.getRdvById(req.params.id, req.entrepriseId);
        if (!rdv) return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        res.json(rdv);
    } catch (err) {
        next(err);
    }
});

router.post('/', reglesRdv, valider, async (req, res, next) => {
    try {
        const { client_id, service_id, date_heure } = req.body;
        if (!client_id || !service_id || !date_heure) {
            return res.status(400).json({ error: 'client_id, service_id et date_heure sont requis' });
        }

        // 1. Le service existe ?
        const service = await serviceModel.getServiceById(service_id, req.entrepriseId);
        if (!service) return res.status(404).json({ error: 'Service non trouvé' });

        // 2. Dans les horaires d'ouverture ?
        const dansHoraires = await horaireModel.isInHoraires(req.entrepriseId, date_heure, service.duree_minutes);
        if (!dansHoraires) return res.status(400).json({ error: "Ce créneau est en dehors des horaires d'ouverture" });

        // 3. Pas de fermeture exceptionnelle ?
        const estFerme = await fermetureModel.isDateFermee(req.entrepriseId, date_heure);
        if (estFerme) return res.status(400).json({ error: "L'entreprise est fermée à cette date" });

        // 4. Créneau libre (pas de chevauchement) ?
        const disponible = await rdvModel.checkCreneauDisponible(req.entrepriseId, date_heure, service.duree_minutes);
        if (!disponible) return res.status(409).json({ error: 'Ce créneau est déjà réservé' });

        // 5. Tout est OK, on crée le RDV
        const id = await rdvModel.createRdv(req.entrepriseId, client_id, service_id, date_heure);
        const rdv = await rdvModel.getRdvById(id, req.entrepriseId);
        res.status(201).json(rdv);

    } catch (err) {
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { date_heure, statut } = req.body;
        if (!date_heure || !statut) return res.status(400).json({ error: 'date_heure et statut sont requis' });

        const rdv = await rdvModel.getRdvById(req.params.id, req.entrepriseId);
        if (!rdv) return res.status(404).json({ error: 'Rendez-vous non trouvé' });

        const service = await serviceModel.getServiceById(rdv.service_id, req.entrepriseId);
        const disponible = await rdvModel.checkCreneauDisponible(req.entrepriseId, date_heure, service.duree_minutes, req.params.id);
        if (!disponible) return res.status(409).json({ error: 'Ce créneau est déjà réservé' });

        await rdvModel.updateRdv(req.params.id, req.entrepriseId, date_heure, statut);

        // Génère les rappels si le RDV vient d'être marqué terminé
        if (statut === 'termine' && rdv.statut !== 'termine') {
            const nbRappels = await rappelModel.genererRappels(
                req.entrepriseId,
                req.params.id,
                rdv.service_id,
                rdv.client_id,
                date_heure
            );
            console.log(`${nbRappels} rappel(s) généré(s) pour le RDV #${req.params.id}`);
        }

        const rdvMaj = await rdvModel.getRdvById(req.params.id, req.entrepriseId);
        res.json(rdvMaj);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await rdvModel.deleteRdv(req.params.id, req.entrepriseId);
        res.json({ message: 'Rendez-vous supprimé' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;