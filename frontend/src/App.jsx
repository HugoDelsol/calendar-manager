import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Inscription from './pages/Inscription';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Clients from './pages/Clients';
import RendezVous from './pages/RendezVous';
import Horaires from './pages/Horaires';
import Parametres from './pages/Parametres';
import Booking from './pages/Booking';
import RappelTemplates from './pages/RappelTemplates';
import MotDePasseOublie from './pages/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';


export default function App() {
    const { token } = useAuth();

    return (
        <>
            {token && <Navbar />}
            <Routes>
                
                {/* Routes publiques */}
                <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
                <Route path="/inscription" element={!token ? <Inscription /> : <Navigate to="/" replace />} />
                <Route path="/booking/:entrepriseId" element={<Booking />} />
                <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
                <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />

                {/* Routes protégées */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/rendez-vous" element={<ProtectedRoute><RendezVous /></ProtectedRoute>} />
                <Route path="/horaires" element={<ProtectedRoute><Horaires /></ProtectedRoute>} />
                <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
                <Route path="/rappels" element={<ProtectedRoute><RappelTemplates /></ProtectedRoute>} />

                {/* Redirige les routes inconnues */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}