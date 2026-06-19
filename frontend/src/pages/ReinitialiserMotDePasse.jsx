import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from '../api/axios';

export default function ReinitialiserMotDePasse() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [form, setForm] = useState({ nouveau: '', confirmation: '' });
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur('');

        if (form.nouveau !== form.confirmation) {
            return setErreur('Les mots de passe ne correspondent pas');
        }

        setChargement(true);
        try {
            await axios.post('/auth/reinitialiser-mot-de-passe', {
                token,
                nouveau_mot_de_passe: form.nouveau
            });
            navigate('/login', { state: { message: 'Mot de passe réinitialisé, connectez-vous !' } });
        } catch (err) {
            setErreur(err.response?.data?.error || 'Lien invalide ou expiré');
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

    const force = evaluerForce(form.nouveau);
    const forceCouleurs = ['#ddd', '#dc2626', '#f97316', '#eab308', '#16a34a', '#15803d'];

    if (!token) return (
        <div style={styles.container}>
            <div style={styles.card}>
                <p style={styles.erreur}>Lien invalide.</p>
                <Link to="/login">Retour à la connexion</Link>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.titre}>Nouveau mot de passe</h1>
                {erreur && <p style={styles.erreur}>{erreur}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.champ}>
                        <label style={styles.label}>Nouveau mot de passe</label>
                        <input
                            type="password"
                            value={form.nouveau}
                            onChange={e => setForm({ ...form, nouveau: e.target.value })}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                        {form.nouveau && (
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
                        <label style={styles.label}>Confirmer</label>
                        <input
                            type="password"
                            value={form.confirmation}
                            onChange={e => setForm({ ...form, confirmation: e.target.value })}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" style={styles.bouton} disabled={chargement}>
                        {chargement ? 'Mise à jour...' : 'Réinitialiser'}
                    </button>
                </form>
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
        margin: '0 0 24px 0',
        color: '#333',
        fontSize: '24px'
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
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer'
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
    },
};