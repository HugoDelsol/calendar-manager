const express = require('express');
const router = express.Router();
const publicModel = require('../models/publicModel');
const clientModel = require('../models/clientModel');
const { envoyerConfirmation } = require('../services/emailService');

function genererCreneaux(plages, dureeMinutes, rdvsExistants, dateStr) {
    const creneaux = [];
    const maintenant = new Date();

    for (const plage of plages) {
        const [hDebut, mDebut] = plage.heure_debut.slice(0, 5).split(':').map(Number);
        const [hFin, mFin] = plage.heure_fin.slice(0, 5).split(':').map(Number);

        let cursor = hDebut * 60 + mDebut;
        const fin = hFin * 60 + mFin;

        while (cursor + dureeMinutes <= fin) {
            const heures = String(Math.floor(cursor / 60)).padStart(2, '0');
            const minutes = String(cursor % 60).padStart(2, '0');
            const creneauStr = `${dateStr}T${heures}:${minutes}:00`;
            const heureDebut = new Date(creneauStr);
            const heureFin = new Date(heureDebut.getTime() + dureeMinutes * 60000);

            if (heureDebut <= maintenant) {
                cursor += dureeMinutes;
                continue;
            }

            const chevauche = rdvsExistants.some(rdv => {
                const rdvDebut = new Date(rdv.date_heure);
                const rdvFin = new Date(rdvDebut.getTime() + rdv.duree_minutes * 60000);
                return heureDebut < rdvFin && heureFin > rdvDebut;
            });

            if (!chevauche) creneaux.push(creneauStr);
            cursor += dureeMinutes;
        }
    }

    return creneaux;
}

// GET /api/public/:entrepriseId/info
router.get('/:entrepriseId/info', async (req, res) => {
    try {
        const entreprise = await publicModel.getEntrepriseInfo(req.params.entrepriseId);
        if (!entreprise) return res.status(404).json({ error: 'Entreprise non trouvée' });
        res.json(entreprise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/public/:entrepriseId/services
router.get('/:entrepriseId/services', async (req, res) => {
    try {
        const services = await publicModel.getServices(req.params.entrepriseId);
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/public/:entrepriseId/creneaux?date=2026-06-22&service_id=1
router.get('/:entrepriseId/creneaux', async (req, res) => {
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
        const creneaux = genererCreneaux(plages, service.duree_minutes, rdvsExistants, date);

        res.json({ creneaux });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/public/:entrepriseId/reserver
router.post('/:entrepriseId/reserver', async (req, res) => {
    try {
        const { entrepriseId } = req.params;
        const { nom, telephone, email, service_id, date_heure } = req.body;

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
            clientId = await clientModel.createClient(entrepriseId, nom, telephone, email);
        }

        // Crée le RDV
        const rdvId = await publicModel.createRdv(entrepriseId, clientId, service_id, date_heure);

        // Email de confirmation
        const entreprise = await publicModel.getEntrepriseInfo(entrepriseId);
        await envoyerConfirmation(email, nom, service.nom, date_heure, entreprise.nom);

        res.status(201).json({
            message: 'Rendez-vous confirmé ! Un email de confirmation vous a été envoyé.',
            rdv_id: rdvId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;