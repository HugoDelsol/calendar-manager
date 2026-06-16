import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const liens = [
    { path: '/', label: '🏠 Dashboard' },
    { path: '/rendez-vous', label: '📅 Rendez-vous' },
    { path: '/clients', label: '👥 Clients' },
    { path: '/services', label: '✂️ Services' },
    { path: '/horaires', label: '🕐 Horaires' },
    { path: '/parametres', label: '⚙️ Paramètres' },
];

export default function Navbar() {
    const { entreprise, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <nav style={styles.nav}>
            <div style={styles.logo}>
                <span style={styles.logoTexte}>📆 {entreprise?.nom}</span>
                <span style={styles.secteur}>{entreprise?.secteur}</span>
            </div>

            <div style={styles.liens}>
                {liens.map((lien) => (
                    <Link
                        key={lien.path}
                        to={lien.path}
                        style={{
                            ...styles.lien,
                            ...(location.pathname === lien.path ? styles.lienActif : {})
                        }}
                    >
                        {lien.label}
                    </Link>
                ))}
            </div>

            <button onClick={handleLogout} style={styles.boutonLogout}>
                Déconnexion
            </button>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#6366f1',
        padding: '0 24px',
        height: '60px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    logo: {
        display: 'flex',
        flexDirection: 'column',
    },
    logoTexte: {
        color: 'white',
        fontWeight: '700',
        fontSize: '16px'
    },
    secteur: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '11px',
        textTransform: 'capitalize'
    },
    liens: {
        display: 'flex',
        gap: '4px'
    },
    lien: {
        color: 'rgba(255,255,255,0.8)',
        textDecoration: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'background 0.2s'
    },
    lienActif: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: 'white',
    },
    boutonLogout: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
    }
};