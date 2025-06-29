import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { session } = useAuth();

  if (!session) {
    // Jika tidak ada sesi, arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;