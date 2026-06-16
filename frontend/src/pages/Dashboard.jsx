import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { entreprise } = useAuth();
    const [rdvs, setRdvs] = useState([]);
    const [stats, setStats] = useState({ total: 0, aujourdhui: 0, aVenir: 0 });
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        async function chargerDonnees() {
            try {
                const res = await axios.get('/rendez-vous');
                const tous = res.data;

                const aujourdhuiStr = new Date().toISOString().slice(0, 10);
                const maintenant = new Date();

                const aujourdhui = tous.filter(r =>
                    new Date(r.date_heure).toISOString().slice(0, 10) === aujourdhuiStr
                    && r.statut === 'confirme'
                );

                const aVenir = tous.filter(r =>
                    new Date(r.date_heure) > maintenant
                    && r.statut === 'confirme'
                );

                setRdvs(aujourdhui);
                setStats({
                    total: tous.length,
                    aujourdhui: aujourdhui.length,
                    aVenir: aVenir.length
                });
            } catch (err) {
                console.error(err);
            } finally {
                setChargement(false);
            }
        }
        chargerDonnees();
    }, []);

    function formaterHeure(dateHeure) {
        return new Date(dateHeure).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (chargement) return <div style={styles.chargement}>Chargement...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.titre}>Bonjour, {entreprise?.nom} 👋</h1>
            <p style={styles.date}>{new Date().toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}</p>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statNombre}>{stats.aujourdhui}</span>
                    <span style={styles.statLabel}>RDV aujourd'hui</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNombre}>{stats.aVenir}</span>
                    <span style={styles.statLabel}>RDV à venir</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNombre}>{stats.total}</span>
                    <span style={styles.statLabel}>RDV total</span>
                </div>
            </div>

            {/* RDV du jour */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitre}>📅 Rendez-vous du jour</h2>
                    <Link to="/rendez-vous" style={styles.voirTout}>Voir tout →</Link>
                </div>

                {rdvs.length === 0 ? (
                    <div style={styles.vide}>
                        <p>Aucun rendez-vous aujourd'hui</p>
                        <Link to="/rendez-vous" style={styles.boutonAjouter}>
                            + Ajouter un rendez-vous
                        </Link>
                    </div>
                ) : (
                    <div style={styles.liste}>
                        {rdvs.map(rdv => (
                            <div key={rdv.id} style={styles.rdvCard}>
                                <div style={styles.rdvHeure}>
                                    {formaterHeure(rdv.date_heure)}
                                </div>
                                <div style={styles.rdvInfo}>
                                    <span style={styles.rdvClient}>{rdv.client_nom}</span>
                                    <span style={styles.rdvService}>{rdv.service_nom}</span>
                                </div>
                                <div style={styles.rdvDuree}>
                                    {rdv.duree_minutes} min
                                </div>
                                <div style={styles.rdvPrix}>
                                    {rdv.prix} €
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Raccourcis */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitre}>Accès rapide</h2>
                <div style={styles.raccourcis}>
                    <Link to="/rendez-vous" style={styles.raccourci}>
                        <span style={styles.raccourciIcon}>📅</span>
                        <span>Nouveau RDV</span>
                    </Link>
                    <Link to="/clients" style={styles.raccourci}>
                        <span style={styles.raccourciIcon}>👥</span>
                        <span>Clients</span>
                    </Link>
                    <Link to="/services" style={styles.raccourci}>
                        <span style={styles.raccourciIcon}>✂️</span>
                        <span>Services</span>
                    </Link>
                    <Link to="/horaires" style={styles.raccourci}>
                        <span style={styles.raccourciIcon}>🕐</span>
                        <span>Horaires</span>
                    </Link>
                </div>
            </div>
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
    titre: {
        fontSize: '28px',
        color: '#333',
        margin: '0 0 4px 0'
    },
    date: {
        color: '#888',
        fontSize: '14px',
        margin: '0 0 32px 0',
        textTransform: 'capitalize'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
    },
    statNombre: {
        fontSize: '40px',
        fontWeight: '700',
        color: '#6366f1'
    },
    statLabel: {
        fontSize: '13px',
        color: '#888',
        textAlign: 'center'
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    sectionTitre: {
        fontSize: '18px',
        color: '#333',
        margin: '0 0 16px 0'
    },
    voirTout: {
        color: '#6366f1',
        textDecoration: 'none',
        fontSize: '14px'
    },
    vide: {
        textAlign: 'center',
        padding: '32px',
        color: '#888',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center'
    },
    boutonAjouter: {
        backgroundColor: '#6366f1',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600'
    },
    liste: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    rdvCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f8f8ff',
        borderRadius: '8px',
        borderLeft: '4px solid #6366f1'
    },
    rdvHeure: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#6366f1',
        minWidth: '60px'
    },
    rdvInfo: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    rdvClient: {
        fontWeight: '600',
        color: '#333',
        fontSize: '15px'
    },
    rdvService: {
        color: '#888',
        fontSize: '13px'
    },
    rdvDuree: {
        color: '#888',
        fontSize: '13px'
    },
    rdvPrix: {
        fontWeight: '600',
        color: '#333',
        fontSize: '15px'
    },
    raccourcis: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
    },
    raccourci: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '20px',
        backgroundColor: '#f8f8ff',
        borderRadius: '10px',
        textDecoration: 'none',
        color: '#333',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #e8e8ff'
    },
    raccourciIcon: {
        fontSize: '28px'
    }
};