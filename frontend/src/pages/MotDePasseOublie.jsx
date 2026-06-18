import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

export default function MotDePasseOublie() {
    const [email, setEmail] = useState('');
    const [succes, setSucces] = useState(false);
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur('');
        setChargement(true);
        try {
            await axios.post('/auth/mot-de-passe-oublie', { email });
            setSucces(true);
        } catch (err) {
            setErreur(err.response?.data?.error || 'Erreur');
        } finally {
            setChargement(false);
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.titre}>Mot de passe oublié</h1>

                {succes ? (
                    <div style={styles.succes}>
                        <p>📧 Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.</p>
                        <p>Vérifiez votre boîte mail (et vos spams).</p>
                        <Link to="/login" style={styles.lien}>Retour à la connexion</Link>
                    </div>
                ) : (
                    <>
                        <p style={styles.desc}>
                            Saisissez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </p>
                        {erreur && <p style={styles.erreur}>{erreur}</p>}
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.champ}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={styles.input}
                                    placeholder="contact@monentreprise.fr"
                                    required
                                />
                            </div>
                            <button type="submit" style={styles.bouton} disabled={chargement}>
                                {chargement ? 'Envoi...' : 'Envoyer le lien'}
                            </button>
                        </form>
                        <p style={styles.retour}>
                            <Link to="/login">← Retour à la connexion</Link>
                        </p>
                    </>
                )}
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
        margin: '0 0 16px 0',
        color: '#333',
        fontSize: '24px'
    },
    desc: {
        color: '#888',
        fontSize: '14px',
        marginBottom: '24px',
        lineHeight: '1.5'
    },
    erreur: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    succes: {
        color: '#16a34a',
        fontSize: '14px',
        lineHeight: '1.6'
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
    retour: {
        textAlign: 'center',
        marginTop: '16px',
        fontSize: '14px'
    },
    lien: {
        color: '#6366f1',
        textDecoration: 'none'
    }
};