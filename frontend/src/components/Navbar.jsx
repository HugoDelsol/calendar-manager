import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const liens = [
    { path: '/', label: '🏠 Dashboard' },
    { path: '/rendez-vous', label: '📅 Rendez-vous' },
    { path: '/clients', label: '👥 Clients' },
    { path: '/services', label: '✂️ Services' },
    { path: '/horaires', label: '🕐 Horaires' },
    { path: '/rappels', label: '🔔 Rappels' },
    { path: '/parametres', label: '⚙️ Paramètres' },
];

export default function Navbar() {
    const { entreprise, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOuvert, setMenuOuvert] = useState(false);

    function handleLogout() {
        logout();
        navigate('/login');
    }

    function handleLienClick() {
        setMenuOuvert(false);
    }

    return (
        <nav style={styles.nav}>
            {/* Logo */}
            <div style={styles.logo}>
                <span style={styles.logoTexte}>📆 {entreprise?.nom}</span>
                <span style={styles.secteur}>{entreprise?.secteur}</span>
            </div>

            {/* Liens desktop */}
            <div style={styles.liens} className="nav-liens">
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

            {/* Déconnexion desktop */}
            <button onClick={handleLogout} style={styles.boutonLogout} className="nav-logout">
                Déconnexion
            </button>

            {/* Bouton hamburger mobile */}
            <button
                onClick={() => setMenuOuvert(!menuOuvert)}
                style={styles.hamburger}
                className="nav-hamburger"
            >
                {menuOuvert ? '✕' : '☰'}
            </button>

            {/* Menu mobile */}
            {menuOuvert && (
                <div style={styles.menuMobile} className="nav-menu-mobile">
                    {liens.map((lien) => (
                        <Link
                            key={lien.path}
                            to={lien.path}
                            onClick={handleLienClick}
                            style={{
                                ...styles.lienMobile,
                                ...(location.pathname === lien.path ? styles.lienMobileActif : {})
                            }}
                        >
                            {lien.label}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        style={styles.boutonLogoutMobile}
                    >
                        Déconnexion
                    </button>
                </div>
            )}
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'relative'
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
        fontWeight: '500'
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
    },
    hamburger: {
        display: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '4px 8px'
    },
    menuMobile: {
        position: 'absolute',
        top: '60px',
        left: 0,
        right: 0,
        backgroundColor: '#6366f1',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000
    },
    lienMobile: {
        color: 'rgba(255,255,255,0.9)',
        textDecoration: 'none',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '500'
    },
    lienMobileActif: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: 'white'
    },
    boutonLogoutMobile: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        padding: '12px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '500',
        textAlign: 'left',
        marginTop: '8px'
    }
};