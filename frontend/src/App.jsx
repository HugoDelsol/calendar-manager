import { Routes, Route, Navigate } from 'react-router-dom';
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
import { useAuth } from './context/AuthContext';
import Booking from './pages/Booking';

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

                {/* Routes protégées */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/rendez-vous" element={<ProtectedRoute><RendezVous /></ProtectedRoute>} />
                <Route path="/horaires" element={<ProtectedRoute><Horaires /></ProtectedRoute>} />
                <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />

                {/* Redirige les routes inconnues */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}