import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Inscription() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nom: '',
        email: '',
        mot_de_passe: '',
        telephone: '',
        secteur: '',
        delai_rappel_heures: 24
    });
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur('');
        setChargement(true);

        try {
            const res = await axios.post('/auth/inscription', form);
            login(res.data.token, res.data.entreprise);
            navigate('/');
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur lors de l\'inscription');
        } finally {
            setChargement(false);
        }
    }

    function evaluerForce(mdp) {
        let force = 0;
        if (mdp.length >= 8) force++;
        if (/[A-Z]/.test(mdp)) force++;
        if (/[a-z]/.test(mdp)) force++;
        if (/[0-9]/.test(mdp)) force++;
        if (/[@$!%*?&_\-#]/.test(mdp)) force++;
        return force;
    }

    const force = evaluerForce(form.mot_de_passe);
    const forceCouleurs = ['#ddd', '#dc2626', '#f97316', '#eab308', '#16a34a', '#15803d'];

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.titre}>Créer un compte</h1>
                <p style={styles.sousTitre}>Rejoignez la plateforme de gestion RDV</p>

                {erreur && <p style={styles.erreur}>{erreur}</p>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.champ}>
                        <label style={styles.label}>Nom de l'entreprise</label>
                        <input
                            type="text"
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Mon Salon"
                            required
                        />
                    </div>

                    <div style={styles.champ}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="contact@monentreprise.fr"
                            required
                        />
                    </div>

                    <div style={styles.champ}>
                        <label style={styles.label}>Mot de passe</label>
                        <input
                            type="password"
                            name="mot_de_passe"
                            value={form.mot_de_passe}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                        {form.mot_de_passe && (
                            <>
                                <div style={styles.barreForceContainer}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} style={{
                                            ...styles.barreForceSegment,
                                            backgroundColor: i <= force ? forceCouleurs[force] : '#ddd'
                                        }} />
                                    ))}
                                </div>                              
                            </>
                        )}
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
                            required
                        >
                            <option value="">Choisir un secteur</option>
                            <option value="coiffure">Coiffure</option>
                            <option value="beaute">Beauté / Esthétique</option>
                            <option value="plomberie">Plomberie</option>
                            <option value="electricite">Électricité</option>
                            <option value="medical">Médical / Paramédical</option>
                            <option value="autre">Autre</option>
                        </select>
                    </div>

                    <div style={styles.champ}>
                        <label style={styles.label}>Délai de rappel email (heures avant RDV)</label>
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
                        {chargement ? 'Création...' : 'Créer mon compte'}
                    </button>
                </form>

                <p style={styles.lien}>
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
    },
    titre: {
        margin: '0 0 8px 0',
        color: '#333',
        fontSize: '28px'
    },
    sousTitre: {
        margin: '0 0 24px 0',
        color: '#888',
        fontSize: '14px'
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
    bouton: {
        padding: '12px',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px'
    },
    lien: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '14px',
        color: '#888'
    }, 
    barreForceContainer: {
        display: 'flex',
        gap: '4px',
        marginTop: '6px'
    },
    barreForceSegment: {
        height: '4px',
        flex: 1,
        borderRadius: '2px',
        transition: 'background-color 0.3s'
    }
};