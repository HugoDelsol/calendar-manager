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

module.exports = { genererCreneaux };