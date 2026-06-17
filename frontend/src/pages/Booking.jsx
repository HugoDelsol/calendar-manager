import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';

const ETAPES = ['Service', 'Date & Créneau', 'Vos infos', 'Confirmation'];

export default function Booking() {
    const { entrepriseId } = useParams();
    const { token } = useAuth();
    const [clients, setClients] = useState([]);
    const [nouveauClient, setNouveauClient] = useState(false);
    const [formNouveauClient, setFormNouveauClient] = useState({
        nom: '', telephone: '', email: '', adresse: '', informations: ''
    });
    const [recherche, setRecherche] = useState('');
    const [clientSelectionne, setClientSelectionne] = useState(null);
    const [etape, setEtape] = useState(0);
    const [entreprise, setEntreprise] = useState(null);
    const [services, setServices] = useState([]);
    const [creneaux, setCreneaux] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [chargementCreneaux, setChargementCreneaux] = useState(false);
    const [erreur, setErreur] = useState('');
    const [messageFerme, setMessageFerme] = useState('');

    const [selection, setSelection] = useState({
        service: null,
        date: '',
        creneau: '',
        nom: '',
        telephone: '',
        email: ''
    });

    useEffect(() => {
        async function charger() {
            try {
                const [entrepriseRes, servicesRes] = await Promise.all([
                    axios.get(`/public/${entrepriseId}/info`),
                    axios.get(`/public/${entrepriseId}/services`)
                ]);
                setEntreprise(entrepriseRes.data);
                setServices(servicesRes.data);

                // Si entreprise connectée, charge ses clients
                if (token) {
                    const clientsRes = await axios.get('/clients');
                    setClients(clientsRes.data);
                }
            } catch (err) {
                setErreur('Entreprise introuvable');
            } finally {
                setChargement(false);
            }
        }
        charger();
    }, [entrepriseId]);

    async function chargerCreneaux(date, serviceId) {
        setChargementCreneaux(true);
        setCreneaux([]);
        setMessageFerme('');
        try {
            const res = await axios.get(`/public/${entrepriseId}/creneaux?date=${date}&service_id=${serviceId}`);
            setCreneaux(res.data.creneaux);
            if (res.data.message) setMessageFerme(res.data.message);
        } catch (err) {
            setErreur('Erreur lors du chargement des créneaux');
        } finally {
            setChargementCreneaux(false);
        }
    }

    async function confirmerRdvEntreprise() {
        if (!clientSelectionne) return;
        setErreur('');
        try {
            await axios.post(`/public/${entrepriseId}/reserver`, {
                nom: clientSelectionne.nom,
                telephone: clientSelectionne.telephone,
                email: clientSelectionne.email,
                service_id: selection.service.id,
                date_heure: selection.creneau
            });
            setEtape(3);
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur lors de la réservation');
        }
    }

    async function creerClientEtConfirmer() {
        const { nom, telephone, email, informations, adresse } = formNouveauClient;
        if (!nom || !telephone || !email) {
            setErreur('Tous les champs sont requis');
            return;
        }
        setErreur('');
        try {
            // 1. Crée le client
            const res = await axios.post('/clients', { nom, telephone, email, informations, adresse });
            const nouveauClientId = res.data.id;

            // 2. Recharge la liste des clients
            const clientsRes = await axios.get('/clients');
            setClients(clientsRes.data);

            // 3. Confirme le RDV avec le nouveau client
            await axios.post(`/public/${entrepriseId}/reserver`, {
                nom, telephone, email,
                service_id: selection.service.id,
                date_heure: selection.creneau
            });

            setEtape(3);
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur lors de la création');
        }
    }

    function selectionnerService(service) {
        setSelection({ ...selection, service, date: '', creneau: '' });
        setEtape(1);
    }

    async function selectionnerDate(date) {
        setSelection({ ...selection, date, creneau: '' });
        await chargerCreneaux(date, selection.service.id);
    }

    function selectionnerCreneau(creneau) {
        setSelection({ ...selection, creneau });
        setEtape(2);
    }

    function handleChange(e) {
        setSelection({ ...selection, [e.target.name]: e.target.value });
    }

    async function confirmerRdv(e) {
        e.preventDefault();
        setErreur('');
        try {
            await axios.post(`/public/${entrepriseId}/reserver`, {
                nom: selection.nom,
                telephone: selection.telephone,
                email: selection.email,
                service_id: selection.service.id,
                date_heure: selection.creneau
            });
            setEtape(3);
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur lors de la réservation');
        }
    }

    function formaterCreneau(creneauStr) {
        const date = new Date(creneauStr);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function formaterDateComplete(creneauStr) {
        const date = new Date(creneauStr);
        return date.toLocaleString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long',
            hour: '2-digit', minute: '2-digit'
        });
    }

    // Date minimum = aujourd'hui
    const dateMin = new Date().toISOString().slice(0, 10);

    if (chargement) return <div style={styles.chargement}>Chargement...</div>;
    if (erreur && !entreprise) return <div style={styles.chargement}>{erreur}</div>;

    return (
        <div style={styles.page}>
            {/* Header */}
            {!token && (
                <div style={styles.header}>
                    <h1 style={styles.entrepriseNom}>{entreprise?.nom}</h1>
                    <span style={styles.secteur}>{entreprise?.secteur}</span>
                </div>
            )}

            <div style={styles.container}>
                {/* Barre de progression */}
                {!token && (
                    <div style={styles.progression}>
                        {ETAPES.map((e, i) => (
                            <div key={i} style={styles.etapeContainer}>
                                <div style={{
                                    ...styles.etapeBulle,
                                    backgroundColor: i <= etape ? '#6366f1' : '#ddd',
                                    color: i <= etape ? 'white' : '#888'
                                }}>
                                    {i < etape ? '✓' : i + 1}
                                </div>
                                <span style={{
                                    ...styles.etapeLabel,
                                    color: i <= etape ? '#6366f1' : '#888',
                                    fontWeight: i === etape ? '700' : '400'
                                }}>
                                    {e}
                                </span>
                                {i < ETAPES.length - 1 && (
                                    <div style={{
                                        ...styles.etapeLigne,
                                        backgroundColor: i < etape ? '#6366f1' : '#ddd'
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {erreur && <p style={styles.erreur}>{erreur}</p>}

                {/* Étape 0 : Choisir un service */}
                {etape === 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitre}>Choisissez un service</h2>
                        {services.length === 0 ? (
                            <p style={styles.vide}>Aucun service disponible</p>
                        ) : (
                            <div style={styles.grilleServices}>
                                {services.map(service => (
                                    <div
                                        key={service.id}
                                        style={styles.serviceCard}
                                        onClick={() => selectionnerService(service)}
                                    >
                                        <h3 style={styles.serviceNom}>{service.nom}</h3>
                                        {service.description && (
                                            <p style={styles.serviceDesc}>{service.description}</p>
                                        )}
                                        <div style={styles.serviceFooter}>
                                            <span style={styles.serviceDuree}>⏱ {service.duree_minutes} min</span>
                                            <span style={styles.servicePrix}>{service.prix} €</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Étape 1 : Choisir date et créneau */}
                {etape === 1 && (
                    <div style={styles.section}>
                        <button onClick={() => setEtape(0)} style={styles.boutonRetour}>← Retour</button>
                        <h2 style={styles.sectionTitre}>Choisissez une date</h2>

                        <div style={styles.recapService}>
                            <strong>{selection.service?.nom}</strong>
                            <span>{selection.service?.duree_minutes} min — {selection.service?.prix} €</span>
                        </div>

                        <div style={styles.champ}>
                            <label style={styles.label}>Date souhaitée</label>
                            <input
                                type="date"
                                value={selection.date}
                                min={dateMin}
                                onChange={e => selectionnerDate(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        {chargementCreneaux && (
                            <p style={styles.chargementCreneaux}>Chargement des créneaux...</p>
                        )}

                        {messageFerme && (
                            <div style={styles.ferme}>🔒 {messageFerme}</div>
                        )}

                        {creneaux.length > 0 && (
                            <>
                                <h3 style={styles.creneauxTitre}>Créneaux disponibles</h3>
                                <div style={styles.grilleCreneaux}>
                                    {creneaux.map(creneau => (
                                        <button
                                            key={creneau}
                                            onClick={() => selectionnerCreneau(creneau)}
                                            style={{
                                                ...styles.creneauBtn,
                                                ...(selection.creneau === creneau ? styles.creneauActif : {})
                                            }}
                                        >
                                            {formaterCreneau(creneau)}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Étape 2 : Informations client */}
                {etape === 2 && (
                    <div style={styles.section}>
                        <button onClick={() => setEtape(1)} style={styles.boutonRetour}>← Retour</button>
                        <h2 style={styles.sectionTitre}>
                            {token ? 'Sélectionner un client' : 'Vos informations'}
                        </h2>

                        <div style={styles.recapRdv}>
                            <p><strong>Service :</strong> {selection.service?.nom}</p>
                            <p><strong>Date :</strong> {formaterDateComplete(selection.creneau)}</p>
                        </div>

                        {/* MODE ENTREPRISE : recherche dans les clients existants */}
                        {token ? (
                            <div>
                                {!nouveauClient ? (
                                    <>
                                        <div style={styles.champ}>
                                            <label style={styles.label}>Rechercher un client</label>
                                            <input
                                                type="text"
                                                value={recherche}
                                                onChange={e => setRecherche(e.target.value)}
                                                style={styles.input}
                                                placeholder="Nom, téléphone ou email..."
                                                autoFocus
                                            />
                                        </div>

                                        <div style={styles.listeClients}>
                                            {clients
                                                .filter(c =>
                                                    c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
                                                    c.telephone.includes(recherche) ||
                                                    (c.email && c.email.toLowerCase().includes(recherche.toLowerCase()))
                                                )
                                                .map(client => (
                                                    <div
                                                        key={client.id}
                                                        onClick={() => setClientSelectionne(client)}
                                                        style={{
                                                            ...styles.clientLigne,
                                                            ...(clientSelectionne?.id === client.id ? styles.clientActif : {})
                                                        }}
                                                    >
                                                        <span style={styles.clientNom}>{client.nom}</span>
                                                        <span style={styles.clientInfo}>{client.telephone}</span>
                                                        <span style={styles.clientInfo}>{client.email}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>

                                        {/* Bouton créer nouveau client inline */}
                                        <div style={styles.separateur}>
                                            <span style={styles.separateurTexte}>Client introuvable ?</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setNouveauClient(true);
                                                setClientSelectionne(null);
                                                // Pré-remplit le nom si une recherche est en cours
                                                setFormNouveauClient({ nom: recherche, telephone: '', email: '' });
                                            }}
                                            style={styles.boutonNouveauClient}
                                        >
                                            + Créer un nouveau client
                                        </button>

                                        {/* Bouton confirmer si client sélectionné */}
                                        {clientSelectionne && (
                                            <div style={styles.clientSelectionneRecap}>
                                                <p>✅ <strong>{clientSelectionne.nom}</strong> sélectionné</p>
                                                <button onClick={confirmerRdvEntreprise} style={styles.boutonConfirmer}>
                                                    Confirmer le RDV
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Mini formulaire création client inline */
                                    <div style={styles.formNouveauClient}>
                                        <div style={styles.formNouveauClientHeader}>
                                            <h3 style={styles.formNouveauClientTitre}>Nouveau client</h3>
                                            <button
                                                onClick={() => setNouveauClient(false)}
                                                style={styles.boutonRetour}
                                            >
                                                ← Retour à la recherche
                                            </button>
                                        </div>

                                        {erreur && <p style={styles.erreur}>{erreur}</p>}

                                        <div style={styles.champ}>
                                            <label style={styles.label}>Nom complet</label>
                                            <input
                                                type="text"
                                                value={formNouveauClient.nom}
                                                onChange={e => setFormNouveauClient({ ...formNouveauClient, nom: e.target.value })}
                                                style={styles.input}
                                                placeholder="Marie Dupont"
                                                required
                                            />
                                        </div>
                                        <div style={styles.champ}>
                                            <label style={styles.label}>Téléphone</label>
                                            <input
                                                type="tel"
                                                value={formNouveauClient.telephone}
                                                onChange={e => setFormNouveauClient({ ...formNouveauClient, telephone: e.target.value })}
                                                style={styles.input}
                                                placeholder="+33612345678"
                                                required
                                            />
                                        </div>
                                        <div style={styles.champ}>
                                            <label style={styles.label}>Email</label>
                                            <input
                                                type="email"
                                                value={formNouveauClient.email}
                                                onChange={e => setFormNouveauClient({ ...formNouveauClient, email: e.target.value })}
                                                style={styles.input}
                                                placeholder="marie@example.com"
                                                required
                                            />
                                        </div>

                                        <div style={styles.champ}>
                                            <label style={styles.label}>Adresse (optionnel)</label>
                                            <input
                                                type="text"
                                                value={formNouveauClient.adresse}
                                                onChange={handleChange}
                                                style={styles.input}
                                                placeholder="12 rue de la Paix, 75001 Paris"
                                            />
                                        </div>

                                        <div style={styles.champ}>
                                            <label style={styles.label}>Informations (optionnel)</label>
                                            <textarea
                                                name="informations"
                                                value={formNouveauClient.informations}
                                                onChange={handleChange}
                                                style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                                placeholder="Allergies, préférences, notes particulières..."
                                            />
                                        </div>

                                        <button
                                            onClick={creerClientEtConfirmer}
                                            style={styles.boutonConfirmer}
                                        >
                                            Créer le client et confirmer le RDV
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* MODE PARTICULIER : formulaire classique */
                            <form onSubmit={confirmerRdv} style={styles.form}>
                                <div style={styles.champ}>
                                    <label style={styles.label}>Nom complet</label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={selection.nom}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Marie Dupont"
                                        required
                                    />
                                </div>
                                <div style={styles.champ}>
                                    <label style={styles.label}>Téléphone</label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={selection.telephone}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="+33612345678"
                                        required
                                    />
                                </div>
                                <div style={styles.champ}>
                                    <label style={styles.label}>Email (pour recevoir la confirmation)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={selection.email}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="marie@example.com"
                                        required
                                    />
                                </div>
                                <button type="submit" style={styles.boutonConfirmer}>
                                    Confirmer le rendez-vous
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Étape 3 : Confirmation */}
                {etape === 3 && (
                    <div style={styles.confirmation}>
                        <div style={styles.confirmationIcon}>✅</div>
                        <h2 style={styles.confirmationTitre}>Rendez-vous confirmé !</h2>
                        <p style={styles.confirmationTexte}>
                            {token ? (
                                // Mode entreprise
                                <>
                                    Rendez-vous créé pour <strong>
                                        {clientSelectionne?.nom || formNouveauClient.nom}
                                    </strong>.
                                </>
                            ) : (
                                // Mode particulier
                                <>
                                    Un email de confirmation a été envoyé à <strong>{selection.email}</strong>.
                                    Vous recevrez également un rappel automatique avant votre rendez-vous.
                                </>
                            )}
                        </p>
                        <div style={styles.recapRdv}>
                            <p><strong>Service :</strong> {selection.service?.nom}</p>
                            <p><strong>Date :</strong> {formaterDateComplete(selection.creneau)}</p>
                            <p><strong>Établissement :</strong> {entreprise?.nom}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    header: {
        backgroundColor: '#6366f1',
        padding: '24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
    },
    entrepriseNom: {
        color: 'white',
        margin: 0,
        fontSize: '26px'
    },
    secteur: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
        textTransform: 'capitalize'
    },
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
    progression: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
        gap: '0'
    },
    etapeContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    etapeBulle: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700',
        flexShrink: 0
    },
    etapeLabel: {
        fontSize: '13px',
        whiteSpace: 'nowrap'
    },
    etapeLigne: {
        height: '2px',
        width: '40px',
        flexShrink: 0
    },
    erreur: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    sectionTitre: {
        fontSize: '20px',
        color: '#333',
        margin: '0 0 20px 0'
    },
    vide: {
        color: '#888',
        textAlign: 'center',
        padding: '20px'
    },
    grilleServices: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
    },
    serviceCard: {
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid #e8e8ff',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    serviceNom: {
        margin: 0,
        fontSize: '16px',
        color: '#333'
    },
    serviceDesc: {
        margin: 0,
        fontSize: '13px',
        color: '#888',
        flex: 1
    },
    serviceFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        borderTop: '1px solid #f0f0f0'
    },
    serviceDuree: {
        fontSize: '13px',
        color: '#888'
    },
    servicePrix: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#6366f1'
    },
    boutonRetour: {
        background: 'none',
        border: 'none',
        color: '#6366f1',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '0',
        marginBottom: '16px',
        fontWeight: '600'
    },
    recapService: {
        backgroundColor: '#f8f8ff',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#555'
    },
    champ: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '16px'
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
    chargementCreneaux: {
        color: '#888',
        fontSize: '14px',
        textAlign: 'center',
        padding: '16px'
    },
    ferme: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        textAlign: 'center'
    },
    creneauxTitre: {
        fontSize: '16px',
        color: '#333',
        margin: '20px 0 12px 0'
    },
    grilleCreneaux: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '10px'
    },
    creneauBtn: {
        padding: '12px',
        borderRadius: '8px',
        border: '2px solid #e8e8ff',
        backgroundColor: 'white',
        color: '#333',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    creneauActif: {
        backgroundColor: '#6366f1',
        color: 'white',
        border: '2px solid #6366f1'
    },
    recapRdv: {
        backgroundColor: '#f8f8ff',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#555',
        lineHeight: '1.8'
    },
    form: {
        display: 'flex',
        flexDirection: 'column'
    },
    boutonConfirmer: {
        padding: '14px',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px'
    },
    confirmation: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        textAlign: 'center'
    },
    confirmationIcon: {
        fontSize: '30px',
        margin: '16px 0px'
    },
    confirmationTitre: {
        fontSize: '24px',
        color: '#333',
        margin: '0 0 12px 0'
    },
    confirmationTexte: {
        color: '#666',
        fontSize: '15px',
        marginBottom: '24px',
        lineHeight: '1.6'
    },
    listeClients: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '250px',
        overflowY: 'auto',
        marginBottom: '16px'
    },
    clientLigne: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 2fr',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '2px solid #e8e8ff',
        cursor: 'pointer',
        alignItems: 'center',
        gap: '8px'
    },
    clientActif: {
        border: '2px solid #6366f1',
        backgroundColor: '#f8f8ff'
    },
    clientNom: {
        fontWeight: '600',
        color: '#333',
        fontSize: '14px'
    },
    clientInfo: {
        color: '#888',
        fontSize: '13px'
    },
    separateur: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '16px 0',
        color: '#888',
        fontSize: '13px'
    },
    separateurTexte: {
        backgroundColor: 'white',
        padding: '0 8px',
        color: '#888'
    },
    boutonNouveauClient: {
        display: 'block',
        textAlign: 'center',
        padding: '12px',
        borderRadius: '8px',
        border: '2px dashed #6366f1',
        color: '#6366f1',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '20px'
    },
    clientSelectionneRecap: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
};