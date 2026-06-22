import { useState, useEffect } from 'react';
import axios from '../api/axios';
import './Global.css';
import './RappelTemplates.css'

export default function RappelTemplates() {
    const [templates, setTemplates] = useState([]);
    const [services, setServices] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [afficherFormulaire, setAfficherFormulaire] = useState(false);
    const [templateEnEdition, setTemplateEnEdition] = useState(null);
    const [erreur, setErreur] = useState('');
    const [form, setForm] = useState({
        titre: '', message: '', delai_jours: '', service_id: '', actif: true
    });

    useEffect(() => {
        chargerDonnees();
    }, []);

    async function chargerDonnees() {
        try {
            const [templatesRes, servicesRes] = await Promise.all([
                axios.get('/rappels/templates'),
                axios.get('/services')
            ]);
            setTemplates(templatesRes.data);
            setServices(servicesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    }

    function ouvrirFormulaire(template = null) {
        if (template) {
            setTemplateEnEdition(template);
            setForm({
                titre: template.titre,
                message: template.message || '',
                delai_jours: template.delai_jours,
                service_id: template.service_id || '',
                actif: template.actif
            });
        } else {
            setTemplateEnEdition(null);
            setForm({ titre: '', message: '', delai_jours: '', service_id: '', actif: true });
        }
        setAfficherFormulaire(true);
        setErreur('');
    }

    function fermerFormulaire() {
        setAfficherFormulaire(false);
        setTemplateEnEdition(null);
        setErreur('');
    }

    function handleChange(e) {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur('');
        try {
            if (templateEnEdition) {
                await axios.put(`/rappels/templates/${templateEnEdition.id}`, form);
            } else {
                await axios.post('/rappels/templates', form);
            }
            await chargerDonnees();
            fermerFormulaire();
        } catch (err) {
            setErreur(err.response?.data?.error || 'Une erreur est survenue');
        }
    }

    async function supprimerTemplate(id) {
        if (!window.confirm('Supprimer ce template ?')) return;
        try {
            await axios.delete(`/rappels/templates/${id}`);
            await chargerDonnees();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    }

    async function toggleActif(template) {
        try {
            await axios.put(`/rappels/templates/${template.id}`, {
                ...template,
                service_id: template.service_id || '',
                actif: !template.actif
            });
            await chargerDonnees();
        } catch (err) {
            alert('Erreur');
        }
    }

    function formaterDelai(jours) {
        if (jours >= 365) return `${Math.round(jours / 365)} an(s)`
        if (jours >= 30) return `${Math.round(jours / 30)} mois`
        if (jours >= 7) return `${Math.round(jours / 7)} semaine(s)`
        return `${jours} jour(s)`
    }

    if (chargement) return <div style={styles.chargement}>Chargement...</div>;

    return (
        <div style={styles.container} className='container'>
            <div style={styles.header} className='header'>
                <div>
                    <h1 style={styles.titre}>🔔 Templates de rappel</h1>
                    <p style={styles.sousTitre}>
                        Configurez des rappels automatiques envoyés après chaque rendez-vous terminé
                    </p>
                </div>
                <button onClick={() => ouvrirFormulaire()} style={styles.boutonAjouter} className='bouton-ajouter'>
                    + Nouveau template
                </button>
            </div>

            {/* Formulaire */}
            {afficherFormulaire && (
                <div style={styles.overlay}>
                    <div style={styles.modal} className='modal'>
                        <h2 style={styles.modalTitre}>
                            {templateEnEdition ? 'Modifier le template' : 'Nouveau template'}
                        </h2>

                        {erreur && <p style={styles.erreur}>{erreur}</p>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.champ}>
                                <label style={styles.label}>Titre du rappel</label>
                                <input
                                    type="text"
                                    name="titre"
                                    value={form.titre}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Ex: Révision annuelle chaudière"
                                    required
                                />
                            </div>

                            <div style={styles.champ}>
                                <label style={styles.label}>Message</label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                                    placeholder="Ex: Il est temps de réviser votre chaudière !"
                                />
                            </div>

                            <div style={styles.rangee} className='rangee'>
                                <div style={styles.champ}>
                                    <label style={styles.label}>Délai après RDV (jours)</label>
                                    <input
                                        type="number"
                                        name="delai_jours"
                                        value={form.delai_jours}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="365"
                                        min="1"
                                        required
                                    />
                                    {form.delai_jours && (
                                        <span style={styles.delaiInfo}>
                                            → {formaterDelai(parseInt(form.delai_jours))}
                                        </span>
                                    )}
                                </div>

                                <div style={styles.champ}>
                                    <label style={styles.label}>Service concerné</label>
                                    <select
                                        name="service_id"
                                        value={form.service_id}
                                        onChange={handleChange}
                                        style={styles.input}
                                        required
                                    >
                                        <option value="">Choisir un service</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.nom}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {templateEnEdition && (
                                <div style={styles.champCheckbox}>
                                    <input
                                        type="checkbox"
                                        name="actif"
                                        checked={form.actif}
                                        onChange={handleChange}
                                        id="actif"
                                    />
                                    <label htmlFor="actif" style={styles.labelCheckbox}>
                                        Template actif
                                    </label>
                                </div>
                            )}

                            <div style={styles.boutons}>
                                <button type="button" onClick={fermerFormulaire} style={styles.boutonAnnuler}>
                                    Annuler
                                </button>
                                <button type="submit" style={styles.boutonSauvegarder}>
                                    {templateEnEdition ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Liste templates */}
            {templates.length === 0 ? (
                <div style={styles.vide}>
                    <p style={styles.videTexte}>🔔 Aucun template configuré</p>
                    <p style={styles.videDesc}>
                        Créez des templates pour envoyer automatiquement des rappels à vos clients après leurs rendez-vous
                    </p>
                    <button onClick={() => ouvrirFormulaire()} style={styles.boutonAjouter}>
                        + Créer mon premier template
                    </button>
                </div>
            ) : (
                <div style={styles.liste}>
                    {templates.map(template => (
                        <div key={template.id} className='template-card' style={{
                            ...styles.templateCard,
                            opacity: template.actif ? 1 : 0.6
                        }}>
                            <div style={styles.templateLeft} >
                                <div style={styles.templateHeader} className='template-header'>
                                    <h3 style={styles.templateTitre}>{template.titre}</h3>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: template.actif ? '#dcfce7' : '#f3f4f6',
                                        color: template.actif ? '#16a34a' : '#888'
                                    }}>
                                        {template.actif ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                                {template.message && (
                                    <p style={styles.templateMessage}>{template.message}</p>
                                )}
                                <div style={styles.templateMeta} className='template-meta'>
                                    <span style={styles.metaItem}>
                                        ⏱ Envoyé {formaterDelai(template.delai_jours)} après le RDV
                                    </span>
                                    <span style={styles.metaItem}>
                                        ✂️ {template.service_nom}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.templateActions}>
                                <button
                                    onClick={() => toggleActif(template)}
                                    style={styles.boutonToggle}
                                    title={template.actif ? 'Désactiver' : 'Activer'}
                                >
                                    {template.actif ? '⏸' : '▶️'}
                                </button>
                                <button
                                    onClick={() => ouvrirFormulaire(template)}
                                    style={styles.boutonEditer}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => supprimerTemplate(template.id)}
                                    style={styles.boutonSupprimer}
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
        alignItems: 'flex-start',
        marginBottom: '32px'
    },
    titre: {
        fontSize: '28px',
        color: 'rgb(240, 240, 240)',
        margin: '0 0 10px 0',
        textAlign: 'left',
    },
    sousTitre: {
        color: '#888',
        fontSize: '14px',
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
        cursor: 'pointer',
        flexShrink: 0
    },
    vide: {
        textAlign: 'center',
        padding: '60px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
    },
    videTexte: {
        fontSize: '20px',
        color: '#333',
        margin: 0
    },
    videDesc: {
        color: '#888',
        fontSize: '14px',
        maxWidth: '400px',
        lineHeight: '1.6',
        margin: 0
    },
    liste: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    templateCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
    },
    templateLeft: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    templateHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    templateTitre: {
        margin: 0,
        fontSize: '16px',
        color: '#333',
        fontWeight: '600'
    },
    badge: {
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    },
    templateMessage: {
        margin: 0,
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.4',
        textAlign: 'left',
        fontStyle: 'italic'
    },
    templateMeta: {
        display: 'flex',
        gap: '16px'
    },
    metaItem: {
        fontSize: '13px',
        color: '#888'
    },
    templateActions: {
        display: 'flex',
        gap: '8px',
        flexShrink: 0
    },
    boutonToggle: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
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
        maxWidth: '520px',
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
    delaiInfo: {
        fontSize: '12px',
        color: '#6366f1',
        fontWeight: '600'
    },
    champCheckbox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    labelCheckbox: {
        fontSize: '14px',
        color: '#555',
        cursor: 'pointer'
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