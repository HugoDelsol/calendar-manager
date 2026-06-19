import { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Parametres() {
    const { entreprise, login } = useAuth();
    const [erreur, setErreur] = useState('');
    const [succes, setSucces] = useState('');
    const [chargement, setChargement] = useState(false);

    const [form, setForm] = useState({
        nom: entreprise?.nom || '',
        email: entreprise?.email || '',
        telephone: entreprise?.telephone || '',
        secteur: entreprise?.secteur || '',
        delai_rappel_heures: entreprise?.delai_rappel_heures || 24
    });

    const [formMotDePasse, setFormMotDePasse] = useState({
        ancien: '',
        nouveau: '',
        confirmation: ''
    });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleChangeMdp(e) {
        setFormMotDePasse({ ...formMotDePasse, [e.target.name]: e.target.value });
    }

    async function handleSubmitProfil(e) {
        e.preventDefault();
        setErreur('');
        setSucces('');
        setChargement(true);
        try {
            const res = await axios.put(`/entreprises/${entreprise.id}`, form);
            // Met à jour le contexte avec les nouvelles infos
            const token = localStorage.getItem('token');
            login(token, { ...entreprise, ...res.data });
            setSucces('Profil mis à jour avec succès');
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur lors de la mise à jour');
        } finally {
            setChargement(false);
        }
    }

    async function handleSubmitMotDePasse(e) {
        e.preventDefault();
        setErreur('');
        setSucces('');

        if (formMotDePasse.nouveau !== formMotDePasse.confirmation) {
            setErreur('Les mots de passe ne correspondent pas');
            return;
        }

        if (formMotDePasse.nouveau.length < 6) {
            setErreur('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setChargement(true);
        try {
            await axios.put(`/entreprises/${entreprise.id}/mot-de-passe`, {
                ancien: formMotDePasse.ancien,
                nouveau: formMotDePasse.nouveau
            });

            setSucces('Mot de passe mis à jour avec succès');
            setFormMotDePasse({ ancien: '', nouveau: '', confirmation: '' });
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur lors de la mise à jour');
        } finally {
            setChargement(false);
        }
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.titre}>⚙️ Paramètres</h1>

            {erreur && <p style={styles.erreur}>{erreur}</p>}
            {succes && <p style={styles.succes}>{succes}</p>}

            {/* Profil entreprise */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitre}>Profil de l'entreprise</h2>
                <form onSubmit={handleSubmitProfil} style={styles.form}>
                    <div style={styles.champ}>
                        <label style={styles.label}>Nom de l'entreprise</label>
                        <input
                            type="text"
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            style={styles.input}
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
                            placeholder="+33600000000"
                        />
                    </div>

                    <div style={styles.champ}>
                        <label style={styles.label}>Secteur d'activité</label>
                        <select
                            name="secteur"
                            value={form.secteur}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="coiffure">Coiffure</option>
                            <option value="beaute">Beauté / Esthétique</option>
                            <option value="plomberie">Plomberie</option>
                            <option value="electricite">Électricité</option>
                            <option value="medical">Médical / Paramédical</option>
                            <option value="autre">Autre</option>
                        </select>
                    </div>

                    <div style={styles.champ}>
                        <label style={styles.label}>Délai de rappel email</label>
                        <select
                            name="delai_rappel_heures"
                            value={form.delai_rappel_heures}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value={24}>24 heures avant</option>
                            <option value={48}>48 heures avant</option>
                            <option value={168}>1 semaine avant</option>
                            <option value={720}>1 mois avant</option>
                        </select>
                    </div>

                    <button type="submit" style={styles.bouton} disabled={chargement}>
                        {chargement ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </form>
            </div>

            {/* Changement mot de passe */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitre}>Changer le mot de passe</h2>
                <form onSubmit={handleSubmitMotDePasse} style={styles.form}>
                    <div style={styles.champ}>
                        <label style={styles.label}>Ancien mot de passe</label>
                        <input
                            type="password"
                            name="ancien"
                            value={formMotDePasse.ancien}
                            onChange={handleChangeMdp}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div style={styles.champ}>
                        <label style={styles.label}>Nouveau mot de passe</label>
                        <input
                            type="password"
                            name="nouveau"
                            value={formMotDePasse.nouveau}
                            onChange={handleChangeMdp}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div style={styles.champ}>
                        <label style={styles.label}>Confirmer le nouveau mot de passe</label>
                        <input
                            type="password"
                            name="confirmation"
                            value={formMotDePasse.confirmation}
                            onChange={handleChangeMdp}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" style={styles.bouton} disabled={chargement}>
                        {chargement ? 'Mise à jour...' : 'Changer le mot de passe'}
                    </button>
                </form>
            </div>

            {/* Infos compte */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitre}>Informations du compte</h2>
                <div style={styles.infoLigne}>
                    <span style={styles.infoLabel}>Email</span>
                    <span style={styles.infoValeur}>{form?.email}</span>
                </div>
                <div style={styles.infoLigne}>
                    <span style={styles.infoLabel}>Secteur</span>
                    <span style={styles.infoValeur}>{form?.secteur}</span>
                </div>
                <div style={styles.infoLigne}>
                    <span style={styles.infoLabel}>Délai rappel actuel</span>
                    <span style={styles.infoValeur}>{form?.delai_rappel_heures}h avant le RDV</span>
                </div>
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
    titre: {
        fontSize: '28px',
        color: '#f0f0f0',
        margin: '32px 0'
    },
    erreur: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    succes: {
        backgroundColor: '#dcfce7',
        color: '#16a34a',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px'
    },
    sectionTitre: {
        fontSize: '18px',
        color: '#333',
        margin: '0 0 20px 0'
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
        color: ' rgba(0, 0, 0, 0.75)',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        backgroundColor: 'rgb(248, 248, 255)'
    },
    bouton: {
        padding: '12px',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px'
    },
    infoLigne: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f0f0f0'
    },
    infoLabel: {
        fontSize: '14px',
        color: '#888'
    },
    infoValeur: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#333'
    }
};