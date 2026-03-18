import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Peminjaman from './pages/Peminjaman';
import Edukasi from './pages/Edukasi';
import Login from './pages/Login';
import Kapal from './pages/Kapal';
import Nakhoda from './pages/Nakhoda';
import Inventaris from './pages/Inventaris';
import Laporan from './pages/Laporan';
import Profile from './pages/Profile';
import Pengaturan from './pages/Pengaturan';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="kapal" element={<Kapal />} />
        <Route path="nakhoda" element={<Nakhoda />} />
        <Route path="inventaris" element={<Inventaris />} />
        <Route path="checkout" element={<Peminjaman />} />
        <Route path="laporan" element={<Laporan />} />
        <Route path="edukasi" element={<Edukasi />} />
        <Route path="profile" element={<Profile />} />
        <Route path="pengaturan" element={<AdminRoute><Pengaturan /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
