import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import './RendezVous.css';
import './Global.css';

const STATUTS = {
    confirme: { label: 'Confirmé', couleur: '#6366f1', bg: '#eef2ff' },
    annule: { label: 'Annulé', couleur: '#dc2626', bg: '#fee2e2' },
    termine: { label: 'Terminé', couleur: '#16a34a', bg: '#dcfce7' }
};

export default function RendezVous() {
    const { entreprise } = useAuth();
    const [rdvs, setRdvs] = useState([]);
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [afficherTout, setAfficherTout] = useState(false);
    const [afficherFormulaire, setAfficherFormulaire] = useState(false);
    const [rdvEnEdition, setRdvEnEdition] = useState(null);
    const [erreur, setErreur] = useState('');
    const [form, setForm] = useState({
        client_id: '', service_id: '', date_heure: '', statut: 'confirme'
    });

    useEffect(() => {
        chargerDonnees();
    }, []);

    async function chargerDonnees() {
        try {
            const [rdvRes, clientRes, serviceRes, fermeturesRes] = await Promise.all([
                axios.get('/rendez-vous'),
                axios.get('/clients'),
                axios.get('/services'),
            ]);
            setRdvs(rdvRes.data);
            setClients(clientRes.data);
            setServices(serviceRes.data);
            setServices(serviceRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    }

    // Filtre cette semaine
    function getRdvsSemaine() {
        const maintenant = new Date();
        const debutSemaine = new Date(maintenant);
        debutSemaine.setDate(maintenant.getDate() - maintenant.getDay() + 1);
        debutSemaine.setHours(0, 0, 0, 0);
        const finSemaine = new Date(debutSemaine);
        finSemaine.setDate(debutSemaine.getDate() + 6);
        finSemaine.setHours(23, 59, 59, 999);

        return rdvs.filter(r => {
            const date = new Date(r.date_heure);
            return date >= debutSemaine && date <= finSemaine;
        });
    }

    const rdvsAffiches = afficherTout ? rdvs : getRdvsSemaine();

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur('');
        try {
            if (rdvEnEdition) {
                await axios.put(`/rendez-vous/${rdvEnEdition.id}`, {
                    date_heure: form.date_heure,
                    statut: form.statut
                });
            } else {
                await axios.post('/rendez-vous', {
                    client_id: parseInt(form.client_id),
                    service_id: parseInt(form.service_id),
                    date_heure: form.date_heure
                });
            }
            await chargerDonnees();
            fermerFormulaire();
        } catch (err) {
            setErreur(err.response?.data?.error || 'Une erreur est survenue');
        }
    }

    function ouvrirFormulaire(rdv) {
        setRdvEnEdition(rdv);
        const date = new Date(rdv.date_heure);
        const dateLocale = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);
        setForm({
            client_id: rdv.client_id,
            service_id: rdv.service_id,
            date_heure: dateLocale,
            statut: rdv.statut
        });
        setAfficherFormulaire(true);
        setErreur('');
    }

    function fermerFormulaire() {
        setAfficherFormulaire(false);
        setRdvEnEdition(null);
        setErreur('');
    }

    async function supprimerRdv(id) {
        if (!window.confirm('Supprimer ce rendez-vous ?')) return;
        try {
            await axios.delete(`/rendez-vous/${id}`);
            await chargerDonnees();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur lors de la suppression');
        }
    }

    async function changerStatut(rdv, statut) {
        try {
            const date = new Date(rdv.date_heure);
            const dateLocale = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            await axios.put(`/rendez-vous/${rdv.id}`, { date_heure: dateLocale, statut });
            await chargerDonnees();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur');
        }
    }

    function formaterDate(dateHeure) {
        return new Date(dateHeure).toLocaleDateString('fr-FR', {
            weekday: 'short', day: 'numeric', month: 'short'
        });
    }

    function formaterHeure(dateHeure) {
        return new Date(dateHeure).toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
        });
    }

    if (chargement) return <div style={styles.chargement}>Chargement...</div>;

    return (
        <div style={styles.container} className='container'>
            <div style={styles.header} className='header'>

                <h1 style={styles.titre} className='titre'>📅 Rendez-vous</h1>
                <Link
                    to={`/booking/${entreprise?.id}`}
                >
                    <button style={styles.boutonAjouter}>+ Nouveau RDV</button>
                </Link>
            </div>

            {/* Toggle semaine / tout */}
            <div style={styles.toggle} className='toggle'>
                <button
                    onClick={() => setAfficherTout(false)}
                    style={{ ...styles.toggleBtn, ...(afficherTout ? {} : styles.toggleActif) }}
                >
                    Cette semaine ({getRdvsSemaine().length})
                </button>
                <button
                    onClick={() => setAfficherTout(true)}
                    style={{ ...styles.toggleBtn, ...(afficherTout ? styles.toggleActif : {}) }}
                >
                    Tous les RDV ({rdvs.length})
                </button>
            </div>

            {/* Formulaire */}
            {afficherFormulaire && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitre}>
                            {rdvEnEdition ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
                        </h2>

                        {erreur && <p style={styles.erreur}>{erreur}</p>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            {!rdvEnEdition && (
                                <>
                                    <div style={styles.champ}>
                                        <label style={styles.label}>Client</label>
                                        <select
                                            name="client_id"
                                            value={form.client_id}
                                            onChange={handleChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Choisir un client</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.nom}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.champ}>
                                        <label style={styles.label}>Service</label>
                                        <select
                                            name="service_id"
                                            value={form.service_id}
                                            onChange={handleChange}
                                            style={styles.input}
                                            required
                                        >
                                            <option value="">Choisir un service</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nom} — {s.duree_minutes}min — {s.prix}€
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div style={styles.champ}>
                                <label style={styles.label}>Date et heure</label>
                                <input
                                    type="datetime-local"
                                    name="date_heure"
                                    value={form.date_heure}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            {rdvEnEdition && (
                                <div style={styles.champ}>
                                    <label style={styles.label}>Statut</label>
                                    <select
                                        name="statut"
                                        value={form.statut}
                                        onChange={handleChange}
                                        style={styles.input}
                                    >
                                        <option value="confirme">Confirmé</option>
                                        <option value="annule">Annulé</option>
                                        <option value="termine">Terminé</option>
                                    </select>
                                </div>
                            )}

                            <div style={styles.boutons}>
                                <button type="button" onClick={fermerFormulaire} style={styles.boutonAnnuler}>
                                    Annuler
                                </button>
                                <button type="submit" style={styles.boutonSauvegarder}>
                                    {rdvEnEdition ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Liste RDV */}
            {rdvsAffiches.length === 0 ? (
                <div style={styles.vide}>
                    <p>{afficherTout ? 'Aucun rendez-vous' : 'Aucun rendez-vous cette semaine'}</p>
                    <Link
                        to={`/booking/${entreprise?.id}`}
                    >
                        <button style={styles.boutonAjouter}>+ Créer un rendez-vous</button>
                    </Link>
                </div>
            ) : (
                <div style={styles.liste}>
                    {rdvsAffiches
                        .sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure))
                        .map(rdv => (
                            <div key={rdv.id} style={styles.rdvCard} className='rdv-card'>
                                <div style={styles.rdvDate} className='rdv-date'>
                                    <span style={styles.rdvJour}>{formaterDate(rdv.date_heure)}</span>
                                    <span style={styles.rdvHeure}>{formaterHeure(rdv.date_heure)}</span>
                                </div>

                                <div style={styles.rdvInfo}>
                                    <span style={styles.rdvClient}>{rdv.client_nom}</span>
                                    <span style={styles.rdvService}>{rdv.service_nom} — {rdv.duree_minutes}min — {rdv.prix}€</span>
                                </div>

                                <div style={{
                                    ...styles.statut,
                                    color: STATUTS[rdv.statut].couleur,
                                    backgroundColor: STATUTS[rdv.statut].bg
                                }}>
                                    {STATUTS[rdv.statut].label}
                                </div>

                                <div style={styles.rdvActions}>
                                    {rdv.statut === 'confirme' && (
                                        <button
                                            onClick={() => changerStatut(rdv, 'termine')}
                                            style={styles.boutonTerminer}
                                            title="Marquer comme terminé"
                                        >
                                            ✅
                                        </button>
                                    )}
                                    <button
                                        onClick={() => ouvrirFormulaire(rdv)}
                                        style={styles.boutonEditer}
                                        title="Modifier"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => supprimerRdv(rdv.id)}
                                        style={styles.boutonSupprimer}
                                        title="Supprimer"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
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
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    titre: {
        fontSize: '28px',
        color: '#f0f0f0',
        margin: '0'
    },
    boutonAjouter: {
        textDecoration: 'none',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    toggle: {
        display: 'flex',
        gap: '8px',
        marginBottom: '24px'
    },
    toggleBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#888'
    },
    toggleActif: {
        backgroundColor: '#6366f1',
        color: 'white',
        border: '1px solid #6366f1'
    },
    vide: {
        textAlign: 'center',
        padding: '60px',
        color: '#888',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    liste: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    rdvCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    rdvDate: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '80px',
        padding: '8px',
        backgroundColor: '#f8f8ff',
        borderRadius: '8px'
    },
    rdvJour: {
        fontSize: '12px',
        color: '#888',
        textTransform: 'capitalize'
    },
    rdvHeure: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#6366f1'
    },
    rdvInfo: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: '4px'
    },
    rdvClient: {
        fontWeight: '600',
        color: '#333',
        fontSize: '15px'
    },
    rdvService: {
        color: '#888',
        fontSize: '13px'
    },
    statut: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    },
    rdvActions: {
        display: 'flex',
        gap: '8px'
    },
    boutonTerminer: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px'
    },
    boutonEditer: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px'
    },
    boutonSupprimer: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px'
    },
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    modalTitre: {
        margin: '0 0 24px 0',
        fontSize: '20px',
        color: '#333'
    },
    erreur: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    champ: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#555'
    },
    input: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit'
    },
    boutons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '8px'
    },
    boutonAnnuler: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '14px'
    },
    boutonSauvegarder: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#6366f1',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    }
};