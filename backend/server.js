require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { limiterGlobal } = require('./middleware/rateLimiter');

const app = express();

// Sécurité headers HTTP
app.use(helmet());

// CORS - autorise uniquement le frontend
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' })); // limite la taille des requêtes
app.use(limiterGlobal); // rate limit global

app.use('/api/auth', require('./routes/auth'));
app.use('/api/entreprises', require('./routes/entreprises'));
app.use('/api/services', require('./routes/services'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/rendez-vous', require('./routes/rendezVous'));
app.use('/api/horaires', require('./routes/horaires'));
app.use('/api/fermetures', require('./routes/fermetures'));
app.use('/api/public', require('./routes/public'));

app.get('/', (req, res) => res.send('API Gestion RDV - OK'));

const { démarrerReminderJob } = require('./jobs/reminderJob');
démarrerReminderJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));