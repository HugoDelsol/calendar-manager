import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', mot_de_passe: '' });
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
            const res = await axios.post('/auth/login', form);
            login(res.data.token, res.data.entreprise);
            navigate('/');
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur de connexion');
        } finally {
            setChargement(false);
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.titre}>Connexion</h1>
                <p style={styles.sousTitre}>Gérez vos rendez-vous</p>

                {erreur && <p style={styles.erreur}>{erreur}</p>}

                <form onSubmit={handleSubmit} style={styles.form}>
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
                    </div>

                    <button type="submit" style={styles.bouton} disabled={chargement}>
                        {chargement ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p style={styles.lien}>
                    Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
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
        maxWidth: '400px'
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
    }
};