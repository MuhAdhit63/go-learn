import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashbaord from './pages/StudentDashbaord';
import Register from './pages/Register';
import MaterialsPage from './pages/MaterialsPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardIndex from './pages/DashboardIndex';
import QuizBuilderPage from './pages/QuizBuilderPage';
import QuizTakingPage from './pages/QuizTakingPage';
import GradingListPage from './pages/GradingListPage';
import GradeAttemptPage from './pages/GradeAttemptPage';
import ResultsPage from './pages/ResultsPage';
import QuizListPage from './pages/QuizListPage';
import Chapter1 from './pages/Chapter1.jsx';
import Chapter2 from './pages/Chapter2.jsx';
import Chapter3 from './pages/Chapter3.jsx';

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
          <Route path="chapter-1" element={<Chapter1 />} />
          <Route path="chapter-2" element={<Chapter2 />} />
          <Route path="chapter-3" element={<Chapter3 />} />

          
          {/* Baris ini sudah benar, mengarah ke halaman daftar kuis */}
          <Route path="quizzes" element={<QuizListPage />} />

          {/* Rute khusus Guru */}
          <Route path="quizzes/build/:quizId" element={<RoleProtectedRoute allowedRoles={['teacher']}><QuizBuilderPage /></RoleProtectedRoute>} />
          <Route path="quizzes/grade/:quizId" element={<RoleProtectedRoute allowedRoles={['teacher']}><GradingListPage /></RoleProtectedRoute>} />
          <Route path="quizzes/grade/:quizId/attempt/:attemptId" element={<RoleProtectedRoute allowedRoles={['teacher']}><GradeAttemptPage /></RoleProtectedRoute>} />
          
          {/* Rute khusus Murid */}
          <Route path="quizzes/take/:quizId" element={<RoleProtectedRoute allowedRoles={['student']}><QuizTakingPage /></RoleProtectedRoute>} />
          <Route path="quizzes/results/:attemptId" element={<RoleProtectedRoute allowedRoles={['student']}><ResultsPage /></RoleProtectedRoute>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;