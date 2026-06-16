import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [afficherFormulaire, setAfficherFormulaire] = useState(false);
    const [clientEnEdition, setClientEnEdition] = useState(null);
    const [recherche, setRecherche] = useState('');
    const [erreur, setErreur] = useState('');
    const [form, setForm] = useState({ nom: '', telephone: '', email: '', informations: '' });

    useEffect(() => {
        chargerClients();
    }, []);

    async function chargerClients() {
        try {
            const res = await axios.get('/clients');
            setClients(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    }

    function ouvrirFormulaire(client = null) {
        if (client) {
            setClientEnEdition(client);
            setForm({
                nom: client.nom,
                telephone: client.telephone,
                email: client.email || '',
                informations: client.informations || ''
            });
        } else {
            setClientEnEdition(null);
            setForm({ nom: '', telephone: '', email: '' });
        }
        setAfficherFormulaire(true);
        setErreur('');
    }

    function fermerFormulaire() {
        setAfficherFormulaire(false);
        setClientEnEdition(null);
        setErreur('');
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur('');
        try {
            if (clientEnEdition) {
                await axios.put(`/clients/${clientEnEdition.id}`, form);
            } else {
                await axios.post('/clients', form);
            }
            await chargerClients();
            fermerFormulaire();
        } catch (err) {
            setErreur(err.response?.data?.error || 'Une erreur est survenue');
        }
    }

    async function supprimerClient(id) {
        if (!window.confirm('Supprimer ce client ?')) return;
        try {
            await axios.delete(`/clients/${id}`);
            await chargerClients();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur lors de la suppression');
        }
    }

    const clientsFiltres = clients.filter(c =>
        c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        c.telephone.includes(recherche) ||
        (c.email && c.email.toLowerCase().includes(recherche.toLowerCase()))
    );

    if (chargement) return <div style={styles.chargement}>Chargement...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.titre}>👥 Clients</h1>
                <button onClick={() => ouvrirFormulaire()} style={styles.boutonAjouter}>
                    + Nouveau client
                </button>
            </div>

            {/* Barre de recherche */}
            <input
                type="text"
                placeholder="🔍 Rechercher par nom, téléphone ou email..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                style={styles.recherche}
            />

            {/* Formulaire */}
            {afficherFormulaire && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitre}>
                            {clientEnEdition ? 'Modifier le client' : 'Nouveau client'}
                        </h2>

                        {erreur && <p style={styles.erreur}>{erreur}</p>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.champ}>
                                <label style={styles.label}>Nom complet</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={form.nom}
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
                                    value={form.telephone}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="+33612345678"
                                    required
                                />
                            </div>

                            <div style={styles.champ}>
                                <label style={styles.label}>Email (optionnel)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="marie@example.com"
                                />
                            </div>

                            <div style={styles.champ}>
                                <label style={styles.label}>Informations (optionnel)</label>
                                <textarea
                                    name="informations"
                                    value={form.informations}
                                    onChange={handleChange}
                                    style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                    placeholder="Allergies, préférences, notes particulières..."
                                />
                            </div>

                            <div style={styles.boutons}>
                                <button type="button" onClick={fermerFormulaire} style={styles.boutonAnnuler}>
                                    Annuler
                                </button>
                                <button type="submit" style={styles.boutonSauvegarder}>
                                    {clientEnEdition ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Liste */}
            {clientsFiltres.length === 0 ? (
                <div style={styles.vide}>
                    <p>{recherche ? 'Aucun client trouvé' : 'Aucun client enregistré'}</p>
                    {!recherche && (
                        <button onClick={() => ouvrirFormulaire()} style={styles.boutonAjouter}>
                            + Ajouter mon premier client
                        </button>
                    )}
                </div>
            ) : (
                <div style={styles.liste}>
                    <div style={styles.listeHeader}>
                        <span>Nom</span>
                        <span>Téléphone</span>
                        <span>Email</span>
                        <span>Informations</span>
                        <span>Actions</span>
                    </div>
                    {clientsFiltres.map(client => (
                        <div key={client.id} style={styles.ligneClient}>
                            <span style={styles.clientNom}>{client.nom}</span>
                            <span style={styles.clientInfo}>{client.telephone}</span>
                            <span style={styles.clientInfo}>{client.email || '—'}</span>
                            <span style={styles.clientInfo}>{client.informations || '—'}</span>
                            <div style={styles.actions}>
                                <button
                                    onClick={() => ouvrirFormulaire(client)}
                                    style={styles.boutonEditer}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => supprimerClient(client.id)}
                                    style={styles.boutonSupprimer}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p style={styles.total}>{clientsFiltres.length} client{clientsFiltres.length > 1 ? 's' : ''}</p>
        </div>
    );
}

const styles = {
    container: {        
        width: '90vw',
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
        color: '#333',
        margin: 0
    },
    boutonAjouter: {
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    recherche: {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        marginBottom: '24px',
        boxSizing: 'border-box',
        outline: 'none'
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
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
    },
    listeHeader: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 2fr 1fr 2fr',
        padding: '12px 20px',
        backgroundColor: '#f8f8ff',
        fontSize: '12px',
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    ligneClient: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 2fr 1fr 2fr',
        padding: '16px 20px',
        alignItems: 'center',
        borderTop: '1px solid #f0f0f0'
    },
    clientNom: {
        fontWeight: '600',
        color: '#333',
        fontSize: '15px'
    },
    clientInfo: {
        color: '#666',
        fontSize: '14px'
    },
    actions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px'
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
    total: {
        color: '#888',
        fontSize: '13px',
        marginTop: '12px',
        textAlign: 'right'
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
        maxWidth: '440px',
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
        outline: 'none'
    },
    boutons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '8px'
    },
    boutonAnnuler: {
        color: 'black',
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