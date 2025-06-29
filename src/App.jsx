import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute'; // Bisa tetap dipakai untuk rute umum
import RoleProtectedRoute from './components/RoleProtectedRoute'; // Komponen baru kita
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashbaord from './pages/StudentDashbaord';
// import { useAuth } from './context/AuthContext';
import Register from './pages/Register';
import MaterialsPage from './pages/MaterialsPage';
import DashboardLayout from './components/DashboardLayout'; // <-- IMPORT BARU
import DashboardIndex from './pages/DashboardIndex';

// Komponen untuk mengarahkan berdasarkan peran setelah login
// const DashboardRedirect = () => {
//   const { profile } = useAuth();
//   if (!profile) return <div>Loading...</div>; // Menunggu profil dimuat
//   return profile.role === 'teacher' ? <Navigate to="/teacher/dashboard" /> : <Navigate to="/student/dashboard" />;
// };

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Rute anak (child route) akan dirender di dalam <Outlet /> */}
          <Route index element={<DashboardIndex />} />
          <Route path="materials" element={<MaterialsPage />} />
          {/* Anda bisa menambahkan rute anak lainnya di sini */}
          {/* <Route path="quizzes" element={<QuizzesPage />} /> */}
          {/* <Route path="profile" element={<ProfilePage />} /> */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;