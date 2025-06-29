import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const QuizListPage = () => {
    const { profile } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!profile) return;
            setLoading(true);

            if (profile.role === 'teacher') {
                const { data, error } = await supabase
                    .from('quizzes')
                    .select('*, quiz_attempts(count)') // Ambil jumlah pengerjaan
                    .eq('teacher_id', profile.id)
                    .order('id', { ascending: false });

                if (error) console.error("Error fetching teacher's quizzes:", error);
                else setQuizzes(data);

            } else if (profile.role === 'student') {
                // --- PERBAIKAN LOGIKA UNTUK MURID ---
                // Ambil SEMUA kuis, dan sertakan data percobaan (attempts) jika ada untuk murid ini.
                const { data, error } = await supabase
                    .from('quizzes')
                    .select(`
                        id,
                        title,
                        description,
                        quiz_attempts!left(id, status, total_score)
                    `)
                    .eq('quiz_attempts.student_id', profile.id); // Saring percobaan HANYA untuk murid ini

                if (error) console.error("Error fetching student quizzes:", error);
                else setQuizzes(data);
            }

            setLoading(false);
        };

        fetchQuizzes();
    }, [profile]);
    
    // ... (sisa fungsi handleDeleteQuiz sama persis)
    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm("Yakin ingin menghapus kuis ini beserta semua soal dan jawabannya?")) {
            const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
            if (error) {
                alert("Gagal menghapus kuis: " + error.message);
            } else {
                setQuizzes(quizzes.filter(q => q.id !== quizId));
            }
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    const pageTitle = profile?.role === 'teacher' ? 'Manage Quizzes' : 'List Quizzes';

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                {profile?.role === 'teacher' && (
                    <Link to="/dashboard/quizzes/build/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Create New Quiz
                    </Link>
                )}
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
                {quizzes.length === 0 ? (
                    <p>{profile?.role === 'teacher' ? 'Anda belum membuat kuis apapun.' : 'Saat ini belum ada kuis yang tersedia.'}</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {quizzes.map(quiz => {
                            const studentAttempt = quiz.quiz_attempts && quiz.quiz_attempts.length > 0 ? quiz.quiz_attempts[0] : null;

                            return (
                                <li key={quiz.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">{quiz.title}</h3>
                                        <p className="text-sm text-gray-600">{quiz.description}</p>
                                        {profile?.role === 'teacher' && <p className="text-xs text-blue-600 mt-1">Attempts Count: {quiz.quiz_attempts[0]?.count || 0}</p>}
                                    </div>

                                    {profile?.role === 'teacher' ? (
                                        <div className="flex gap-2">
                                            <Link to={`/dashboard/quizzes/build/${quiz.id}`} className="text-sm bg-yellow-400 text-white px-3 py-1 rounded">
                                                Manage
                                            </Link>
                                            <Link to={`/dashboard/quizzes/grade/${quiz.id}`} className="text-sm bg-green-500 text-white px-3 py-1 rounded">
                                                Result
                                            </Link>
                                            <button onClick={() => handleDeleteQuiz(quiz.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded">
                                                Delete
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            {studentAttempt ? (
                                                <Link to={`/dashboard/quizzes/results/${studentAttempt.id + 1}`} className="text-sm bg-indigo-500 text-white px-3 py-1 rounded">
                                                    Result
                                                </Link>
                                            ) : (
                                                <Link to={`/dashboard/quizzes/take/${quiz.id}`} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">
                                                    Attempt now
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default QuizListPage;