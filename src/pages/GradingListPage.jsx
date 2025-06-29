import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaEdit } from 'react-icons/fa';

const GradingListPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizAndAttempts = useCallback(async () => {
        setLoading(true);
        // Ambil detail kuis
        const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .select('title')
            .eq('id', quizId)
            .single();

        if (quizError) {
            alert("Kuis tidak ditemukan");
            navigate('/dashboard/quizzes');
            return;
        }
        setQuiz(quizData);

        // Ambil semua percobaan (attempts) untuk kuis ini, beserta data profil murid
        const { data: attemptsData, error: attemptsError } = await supabase
            .from('quiz_attempts')
            .select(`
                id,
                submitted_at,
                total_score,
                status,
                profiles ( id, full_name )
            `)
            .eq('quiz_id', quizId)
            .order('submitted_at', { ascending: false });

        if (attemptsError) {
            console.error("Gagal memuat data percobaan:", attemptsError);
        } else {
            setAttempts(attemptsData);
        }

        setLoading(false);
    }, [quizId, navigate]);

    useEffect(() => {
        fetchQuizAndAttempts();
    }, [fetchQuizAndAttempts]);

    if (loading) return <div className="p-6">Loading data penilaian...</div>;

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-3xl font-bold mb-2">Quiz Grading</h1>
            <h2 className="text-xl text-gray-700 mb-6">"{quiz?.title}"</h2>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                {attempts.length === 0 ? (
                    <p>No one attempts yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted at</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {attempts.map(attempt => (
                                    <tr key={attempt.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{attempt.profiles.full_name || attempt.profiles.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(attempt.submitted_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attempt.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {attempt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{attempt.total_score ?? '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/dashboard/quizzes/grade/${quizId}/attempt/${attempt.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                                                <FaEdit /> Grade
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradingListPage;