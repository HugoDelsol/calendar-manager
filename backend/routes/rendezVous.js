const express = require('express');
const router = express.Router();
const rdvModel = require('../models/rdvModel');
const serviceModel = require('../models/serviceModel');
const horaireModel = require('../models/horaireModel');
const fermetureModel = require('../models/fermetureModel');

function getEntrepriseId(req, res, next) {
    const entrepriseId = req.headers['x-entreprise-id'];
    if (!entrepriseId) return res.status(400).json({ error: 'Header x-entreprise-id requis' });
    req.entrepriseId = parseInt(entrepriseId);
    next();
}

router.use(getEntrepriseId);

router.get('/', async (req, res) => {
    try {
        const rdvs = await rdvModel.getAllRdv(req.entrepriseId);
        res.json(rdvs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const rdv = await rdvModel.getRdvById(req.params.id, req.entrepriseId);
        if (!rdv) return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        res.json(rdv);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
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
        
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { date_heure, statut } = req.body;
        if (!date_heure || !statut) return res.status(400).json({ error: 'date_heure et statut sont requis' });

        const rdv = await rdvModel.getRdvById(req.params.id, req.entrepriseId);
        if (!rdv) return res.status(404).json({ error: 'Rendez-vous non trouvé' });

        const service = await serviceModel.getServiceById(rdv.service_id, req.entrepriseId);
        const disponible = await rdvModel.checkCreneauDisponible(req.entrepriseId, date_heure, service.duree_minutes, req.params.id);
        if (!disponible) return res.status(409).json({ error: 'Ce créneau est déjà réservé' });

        await rdvModel.updateRdv(req.params.id, req.entrepriseId, date_heure, statut);
        const rdvMaj = await rdvModel.getRdvById(req.params.id, req.entrepriseId);
        res.json(rdvMaj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await rdvModel.deleteRdv(req.params.id, req.entrepriseId);
        res.json({ message: 'Rendez-vous supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;