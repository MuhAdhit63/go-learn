import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { session, profile } = useAuth();

  // 1. Cek apakah sudah login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 2. Cek apakah profil sudah dimuat
  //    (Mungkin perlu state loading kecil di sini jika terjadi race condition)
  if (!profile) {
    return <div>Loading user data...</div>; // Tampilkan loading
  }

  // 3. Cek apakah peran pengguna diizinkan
  const isAllowed = allowedRoles.includes(profile.role);
  if (!isAllowed) {
    // Jika tidak diizinkan, arahkan ke halaman "unauthorized" atau dashboard utama
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleProtectedRoute;