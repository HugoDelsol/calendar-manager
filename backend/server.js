require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Route publique (pas de JWT requis)
app.use('/api/auth', require('./routes/auth'));

// Routes protégées (JWT requis via authMiddleware dans chaque router)
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