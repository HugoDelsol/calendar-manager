const express = require('express');
const router = express.Router();
const serviceModel = require('../models/serviceModel');
const { reglesService, valider } = require('../middleware/sanitize');

const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);


router.get('/', async (req, res) => {
    try {
        const services = await serviceModel.getAllServices(req.entrepriseId);
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const service = await serviceModel.getServiceById(req.params.id, req.entrepriseId);
        if (!service) {
            return res.status(404).json({ error: 'Service non trouvé' });
        }
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', reglesService, valider, async (req, res) => {
    try {
        const { nom, duree_minutes, prix, description } = req.body;

        if (!nom || !duree_minutes || !prix) {
            return res.status(400).json({ error: 'nom, duree_minutes et prix sont requis' });
        }

        const id = await serviceModel.createService(req.entrepriseId, nom, duree_minutes, prix, description);
        res.status(201).json({ id, nom, duree_minutes, prix, description });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', reglesService, valider, async (req, res) => {
    try {
        const { nom, duree_minutes, prix, description } = req.body;
        await serviceModel.updateService(req.params.id, req.entrepriseId, nom, duree_minutes, prix, description);
        res.json({ message: 'Service mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await serviceModel.deleteService(req.params.id, req.entrepriseId);
        res.json({ message: 'Service supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;