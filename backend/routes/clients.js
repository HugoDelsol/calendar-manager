const express = require('express');
const router = express.Router();
const clientModel = require('../models/clientModel');

const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const clients = await clientModel.getAllClients(req.entrepriseId);
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const client = await clientModel.getClientById(req.params.id, req.entrepriseId);
        if (!client) return res.status(404).json({ error: 'Client non trouvé' });
        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nom, telephone, email, informations } = req.body;
        if (!nom || !telephone) return res.status(400).json({ error: 'nom et telephone sont requis' });
        const id = await clientModel.createClient(req.entrepriseId, nom, telephone, email, informations);
        res.status(201).json({ id, nom, telephone, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { nom, telephone, email, informations } = req.body;
        await clientModel.updateClient(req.params.id, req.entrepriseId, nom, telephone, email, informations);
        res.json({ message: 'Client mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await clientModel.deleteClient(req.params.id, req.entrepriseId);
        res.json({ message: 'Client supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;