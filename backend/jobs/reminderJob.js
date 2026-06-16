const cron = require('node-cron');
const rdvModel = require('../models/rdvModel');
const emailService = require('../services/emailService');

function démarrerReminderJob() {
    cron.schedule('*/15 * * * *', async () => {
        console.log('Vérification des rappels à envoyer...');

        try {
            const rdvs = await rdvModel.getRdvAvantRappel();

            if (rdvs.length === 0) {
                console.log('Aucun rappel à envoyer.');
                return;
            }

            for (const rdv of rdvs) {
                try {
                    if (!rdv.client_email) {
                        console.log(`RDV #${rdv.id} : client sans email, rappel ignoré`);
                        await rdvModel.marquerRappelEnvoye(rdv.id);
                        continue;
                    }

                    await emailService.envoyerRappelEmail(
                        rdv.client_email,
                        rdv.client_nom,
                        rdv.service_nom,
                        rdv.date_heure
                    );
                    await rdvModel.marquerRappelEnvoye(rdv.id);
                    console.log(`Rappel envoyé pour RDV #${rdv.id} (délai: ${rdv.delai_rappel_heures}h)`);
                } catch (err) {
                    console.error(`Échec rappel RDV #${rdv.id}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Erreur lors de la vérification des rappels:', err.message);
        }
    });

    console.log('Reminder job démarré (vérification toutes les 15 minutes)');
}

module.exports = { démarrerReminderJob };