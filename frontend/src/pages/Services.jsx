import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function Services() {
    const [services, setServices] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [afficherFormulaire, setAfficherFormulaire] = useState(false);
    const [serviceEnEdition, setServiceEnEdition] = useState(null);
    const [erreur, setErreur] = useState('');
    const [form, setForm] = useState({
        nom: '', duree_minutes: '', prix: '', description: ''
    });

    useEffect(() => {
        chargerServices();
    }, []);

    async function chargerServices() {
        try {
            const res = await axios.get('/services');
            setServices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    }

    function ouvrirFormulaire(service = null) {
        if (service) {
            setServiceEnEdition(service);
            setForm({
                nom: service.nom,
                duree_minutes: service.duree_minutes,
                prix: service.prix,
                description: service.description || ''
            });
        } else {
            setServiceEnEdition(null);
            setForm({ nom: '', duree_minutes: '', prix: '', description: '' });
        }
        setAfficherFormulaire(true);
        setErreur('');
    }

    function fermerFormulaire() {
        setAfficherFormulaire(false);
        setServiceEnEdition(null);
        setErreur('');
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur('');
        try {
            if (serviceEnEdition) {
                await axios.put(`/services/${serviceEnEdition.id}`, form);
            } else {
                await axios.post('/services', form);
            }
            await chargerServices();
            fermerFormulaire();
        } catch (err) {
            setErreur(err.response?.data?.error || 'Une erreur est survenue');
        }
    }

    async function supprimerService(id) {
        if (!window.confirm('Supprimer ce service ?')) return;
        try {
            await axios.delete(`/services/${id}`);
            await chargerServices();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur lors de la suppression');
        }
    }

    if (chargement) return <div style={styles.chargement}>Chargement...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.titre}>✂️ Services</h1>
                <button onClick={() => ouvrirFormulaire()} style={styles.boutonAjouter}>
                    + Nouveau service
                </button>
            </div>

            {/* Formulaire ajout/édition */}
            {afficherFormulaire && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitre}>
                            {serviceEnEdition ? 'Modifier le service' : 'Nouveau service'}
                        </h2>

                        {erreur && <p style={styles.erreur}>{erreur}</p>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.champ}>
                                <label style={styles.label}>Nom du service</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Ex: Coupe femme"
                                    required
                                />
                            </div>

                            <div style={styles.rangee}>
                                <div style={styles.champ}>
                                    <label style={styles.label}>Durée (minutes)</label>
                                    <input
                                        type="number"
                                        name="duree_minutes"
                                        value={form.duree_minutes}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="30"
                                        min="5"
                                        required
                                    />
                                </div>
                                <div style={styles.champ}>
                                    <label style={styles.label}>Prix (€)</label>
                                    <input
                                        type="number"
                                        name="prix"
                                        value={form.prix}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="25.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.champ}>
                                <label style={styles.label}>Description (optionnel)</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                    placeholder="Description du service..."
                                />
                            </div>

                            <div style={styles.boutons}>
                                <button type="button" onClick={fermerFormulaire} style={styles.boutonAnnuler}>
                                    Annuler
                                </button>
                                <button type="submit" style={styles.boutonSauvegarder}>
                                    {serviceEnEdition ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Liste des services */}
            {services.length === 0 ? (
                <div style={styles.vide}>
                    <p>Aucun service créé pour l'instant</p>
                    <button onClick={() => ouvrirFormulaire()} style={styles.boutonAjouter}>
                        + Créer mon premier service
                    </button>
                </div>
            ) : (
                <div style={styles.grille}>
                    {services.map(service => (
                        <div key={service.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardNom}>{service.nom}</h3>
                                <div style={styles.cardActions}>
                                    <button
                                        onClick={() => ouvrirFormulaire(service)}
                                        style={styles.boutonEditer}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => supprimerService(service.id)}
                                        style={styles.boutonSupprimer}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            {service.description && (
                                <p style={styles.cardDescription}>{service.description}</p>
                            )}
                            <div style={styles.cardFooter}>
                                <span style={styles.cardDuree}>⏱ {service.duree_minutes} min</span>
                                <span style={styles.cardPrix}>{service.prix} €</span>
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
        marginBottom: '32px'
    },
    titre: {
        fontSize: '28px',
        color: '#f0f0f0',
        margin: '0'
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
    grille: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    cardNom: {
        margin: 0,
        fontSize: '16px',
        color: '#333',
        fontWeight: '600'
    },
    cardActions: {
        display: 'flex',
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
    cardDescription: {
        color: '#888',
        fontSize: '13px',
        margin: 0,
        lineHeight: '1.4'
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
    },
    cardDuree: {
        color: '#888',
        fontSize: '13px'
    },
    cardPrix: {
        fontWeight: '700',
        color: '#6366f1',
        fontSize: '18px'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
    rangee: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
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