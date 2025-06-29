import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashbaord from './StudentDashbaord';
import TeacherDashboard from './TeacherDashboard';

// Komponen ini akan menjadi halaman "index" dari layout dashboard.
// Ia akan menampilkan dashboard yang sesuai dengan peran pengguna.
const DashboardIndex = () => {
    const { profile } = useAuth();

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    return profile.role === 'teacher' ? <TeacherDashboard /> : <StudentDashbaord />;
};

export default DashboardIndex;