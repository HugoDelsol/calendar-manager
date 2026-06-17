import { useState, useEffect } from 'react';
import axios from '../api/axios';

const JOURS = [
    { id: 1, label: 'Lundi' },
    { id: 2, label: 'Mardi' },
    { id: 3, label: 'Mercredi' },
    { id: 4, label: 'Jeudi' },
    { id: 5, label: 'Vendredi' },
    { id: 6, label: 'Samedi' },
    { id: 0, label: 'Dimanche' }
];

export default function Horaires() {
    const [horaires, setHoraires] = useState([]);
    const [fermetures, setFermetures] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [afficherFormHoraire, setAfficherFormHoraire] = useState(false);
    const [afficherFormFermeture, setAfficherFormFermeture] = useState(false);
    const [erreur, setErreur] = useState('');

    const [formHoraire, setFormHoraire] = useState({
        jour_semaine: '1', heure_debut: '', heure_fin: ''
    });
    const [formFermeture, setFormFermeture] = useState({
        date_debut: '', date_fin: '', motif: ''
    });

    useEffect(() => {
        chargerDonnees();
    }, []);

    async function chargerDonnees() {
        try {
            const [horairesRes, fermeturesRes] = await Promise.all([
                axios.get('/horaires'),
                axios.get('/fermetures')
            ]);
            setHoraires(horairesRes.data);
            setFermetures(fermeturesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    }

    // Regroupe les horaires par jour
    function getHorairesParJour(jourId) {
        return horaires.filter(h => h.jour_semaine === jourId);
    }

    async function ajouterHoraire(e) {
        e.preventDefault();
        setErreur('');
        try {
            await axios.post('/horaires', {
                jour_semaine: parseInt(formHoraire.jour_semaine),
                heure_debut: formHoraire.heure_debut,
                heure_fin: formHoraire.heure_fin
            });
            setFormHoraire({ jour_semaine: '1', heure_debut: '', heure_fin: '' });
            setAfficherFormHoraire(false);
            await chargerDonnees();
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur');
        }
    }

    async function supprimerHoraire(id) {
        if (!window.confirm('Supprimer cette plage horaire ?')) return;
        try {
            await axios.delete(`/horaires/${id}`);
            await chargerDonnees();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    }

    async function ajouterFermeture(e) {
        e.preventDefault();
        setErreur('');
        try {
            await axios.post('/fermetures', formFermeture);
            setFormFermeture({ date_debut: '', date_fin: '', motif: '' });
            setAfficherFormFermeture(false);
            await chargerDonnees();
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur');
        }
    }

    async function supprimerFermeture(id) {
        if (!window.confirm('Supprimer cette fermeture ?')) return;
        try {
            await axios.delete(`/fermetures/${id}`);
            await chargerDonnees();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    }

    function formaterDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    if (chargement) return <div style={styles.chargement}>Chargement...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.titre}>🕐 Horaires & Disponibilités</h1>

            {/* Section horaires */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitre}>Horaires d'ouverture</h2>
                    <button
                        onClick={() => { setAfficherFormHoraire(true); setErreur(''); }}
                        style={styles.boutonAjouter}
                    >
                        + Ajouter une plage
                    </button>
                </div>

                <p style={styles.info}>
                    💡 Pour ajouter une pause déjeuner, créez deux plages pour le même jour (ex: 9h-12h et 14h-18h)
                </p>

                {/* Formulaire horaire */}
                {afficherFormHoraire && (
                    <div style={styles.formCard}>
                        {erreur && <p style={styles.erreur}>{erreur}</p>}
                        <form onSubmit={ajouterHoraire} style={styles.formRangee}>
                            <div style={styles.champ}>
                                <label style={styles.label}>Jour</label>
                                <select
                                    value={formHoraire.jour_semaine}
                                    onChange={e => setFormHoraire({ ...formHoraire, jour_semaine: e.target.value })}
                                    style={styles.input}
                                >
                                    {JOURS.map(j => (
                                        <option key={j.id} value={j.id}>{j.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.champ}>
                                <label style={styles.label}>Heure début</label>
                                <input
                                    type="time"
                                    value={formHoraire.heure_debut}
                                    onChange={e => setFormHoraire({ ...formHoraire, heure_debut: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.champ}>
                                <label style={styles.label}>Heure fin</label>
                                <input
                                    type="time"
                                    value={formHoraire.heure_fin}
                                    onChange={e => setFormHoraire({ ...formHoraire, heure_fin: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.champBoutons}>
                                <button type="button" onClick={() => setAfficherFormHoraire(false)} style={styles.boutonAnnuler}>
                                    Annuler
                                </button>
                                <button type="submit" style={styles.boutonSauvegarder}>
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Grille des jours */}
                <div style={styles.grilleJours}>
                    {JOURS.map(jour => {
                        const plages = getHorairesParJour(jour.id);
                        return (
                            <div key={jour.id} style={styles.jourCard}>
                                <div style={styles.jourHeader}>
                                    <span style={styles.jourLabel}>{jour.label}</span>
                                    {plages.length === 0 && (
                                        <span style={styles.ferme}>Fermé</span>
                                    )}
                                </div>
                                <div style={styles.plages}>
                                    {plages.map(plage => (
                                        <div key={plage.id} style={styles.plage}>
                                            <span style={styles.plageHeure}>
                                                {plage.heure_debut.slice(0, 5)} - {plage.heure_fin.slice(0, 5)}
                                            </span>
                                            <button
                                                onClick={() => supprimerHoraire(plage.id)}
                                                style={styles.boutonSupprimerPlage}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section fermetures exceptionnelles */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitre}>Fermetures exceptionnelles</h2>
                    <button
                        onClick={() => { setAfficherFormFermeture(true); setErreur(''); }}
                        style={styles.boutonAjouter}
                    >
                        + Ajouter une fermeture
                    </button>
                </div>

                {/* Formulaire fermeture */}
                {afficherFormFermeture && (
                    <div style={styles.formCard}>
                        {erreur && <p style={styles.erreur}>{erreur}</p>}
                        <form onSubmit={ajouterFermeture} style={styles.formRangee}>
                            <div style={styles.champ}>
                                <label style={styles.label}>Date début</label>
                                <input
                                    type="date"
                                    value={formFermeture.date_debut}
                                    onChange={e => setFormFermeture({ ...formFermeture, date_debut: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.champ}>
                                <label style={styles.label}>Date fin</label>
                                <input
                                    type="date"
                                    value={formFermeture.date_fin}
                                    onChange={e => setFormFermeture({ ...formFermeture, date_fin: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.champ}>
                                <label style={styles.label}>Motif (optionnel)</label>
                                <input
                                    type="text"
                                    value={formFermeture.motif}
                                    onChange={e => setFormFermeture({ ...formFermeture, motif: e.target.value })}
                                    style={styles.input}
                                    placeholder="Vacances, travaux..."
                                />
                            </div>
                            <div style={styles.champBoutons}>
                                <button type="button" onClick={() => setAfficherFormFermeture(false)} style={styles.boutonAnnuler}>
                                    Annuler
                                </button>
                                <button type="submit" style={styles.boutonSauvegarder}>
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Liste fermetures */}
                {fermetures.length === 0 ? (
                    <p style={styles.aucune}>Aucune fermeture exceptionnelle prévue</p>
                ) : (
                    <div style={styles.listeFermetures}>
                        {fermetures.map(f => (
                            <div key={f.id} style={styles.fermetureCard}>
                                <span style={styles.fermetureIcon}>🔒</span>
                                <div style={styles.fermetureInfo}>
                                    <span style={styles.fermetureDates}>
                                        {formaterDate(f.date_debut)} → {formaterDate(f.date_fin)}
                                    </span>
                                    {f.motif && <span style={styles.fermetureMotif}>{f.motif}</span>}
                                </div>
                                <button
                                    onClick={() => supprimerFermeture(f.id)}
                                    style={styles.boutonSupprimerFermeture}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {  
        width: '60vw',
        margin: '0 auto',
        padding: '32px 24px'
    },
    chargement: {
        display: 'flex',
        justifyContent: 'center',
        padding: '60px',
        color: '#888'
    },
    titre: {
        fontSize: '28px',
        color: '#f0f0f0',
        margin: '32px 0'
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    sectionTitre: {
        fontSize: '18px',
        color: '#333',
        margin: 0
    },
    boutonAjouter: {
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    info: {
        color: '#888',
        fontSize: '13px',
        backgroundColor: '#f8f8ff',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    formCard: {
        backgroundColor: '#f8f8ff',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #e8e8ff'
    },
    formRangee: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
    },
    champ: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flex: 1,
        minWidth: '140px'
    },
    champBoutons: {
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end'
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#555'
    },
    input: {        
        color: ' rgba(0, 0, 0, 0.75)',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        backgroundColor: 'white'
    },
    boutonAnnuler: {
        color: ' rgba(0, 0, 0, 0.50)',
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '14px'
    },
    boutonSauvegarder: {
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#6366f1',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    },
    erreur: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '12px',
        fontSize: '14px'
    },
    grilleJours: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
    },
    jourCard: {
        backgroundColor: '#f8f8ff',
        borderRadius: '10px',
        padding: '14px',
        border: '1px solid #e8e8ff'
    },
    jourHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    jourLabel: {
        fontWeight: '700',
        fontSize: '14px',
        color: '#333'
    },
    ferme: {
        fontSize: '11px',
        color: '#dc2626',
        backgroundColor: '#fee2e2',
        padding: '2px 6px',
        borderRadius: '4px'
    },
    plages: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    plage: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid #e0e0ff'
    },
    plageHeure: {
        fontSize: '12px',
        color: '#6366f1',
        fontWeight: '600'
    },
    boutonSupprimerPlage: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#dc2626',
        fontSize: '12px',
        padding: '0',
        lineHeight: 1
    },
    aucune: {
        color: '#888',
        fontSize: '14px',
        textAlign: 'center',
        padding: '20px'
    },
    listeFermetures: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    fermetureCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        backgroundColor: '#fff7ed',
        borderRadius: '8px',
        border: '1px solid #fed7aa'
    },
    fermetureIcon: {
        fontSize: '20px'
    },
    fermetureInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    fermetureDates: {
        fontWeight: '600',
        color: '#333',
        fontSize: '14px'
    },
    fermetureMotif: {
        color: '#888',
        fontSize: '13px'
    },
    boutonSupprimerFermeture: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
    }
};