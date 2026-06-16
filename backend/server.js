require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/entreprises', require('./routes/entreprises'));
app.use('/api/services', require('./routes/services'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/rendez-vous', require('./routes/rendezVous'));
app.use('/api/horaires', require('./routes/horaires'));
app.use('/api/fermetures', require('./routes/fermetures'));

app.get('/', (req, res) => res.send('API Gestion RDV - OK'));

const { démarrerReminderJob } = require('./jobs/reminderJob');
démarrerReminderJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

const emailService = require('./services/emailService');

app.get('/api/test-email', async (req, res) => {
    try {
        await emailService.envoyerRappelEmail(
            'hugo.delsol64@gmail.com',       // ton vrai email pour tester
            'Jean Test',
            'Coupe femme',
            new Date(Date.now() + 24 * 60 * 60 * 1000)  // demain
        );
        res.json({ message: 'Email envoyé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});