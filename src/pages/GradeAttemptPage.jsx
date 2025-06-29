import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const GradeAttemptPage = () => {
    // --- PERBAIKAN 1: Ambil quizId dari URL ---
    const { attemptId, quizId } = useParams(); 
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAttemptDetails = useCallback(async () => {
        setLoading(true);
        const { data: attemptData, error: attemptError } = await supabase
            .from('quiz_attempts')
            .select('*, quizzes(title), profiles(full_name)')
            .eq('id', attemptId)
            .single();

        if (attemptError) {
            alert("Percobaan tidak ditemukan: " + attemptError.message);
            navigate(-1);
            return;
        }
        setAttempt(attemptData);

        const { data: answersData, error: answersError } = await supabase
            .from('student_answers')
            .select('*, questions(*, question_options(*))')
            .eq('attempt_id', attemptId);

        if (answersError) alert("Gagal memuat jawaban");
        else setAnswers(answersData);
        setLoading(false);
    }, [attemptId, navigate]);

    useEffect(() => {
        fetchAttemptDetails();
    }, [fetchAttemptDetails]);

    const handleGradeChange = (answerId, value) => {
        setAnswers(prevAnswers =>
            prevAnswers.map(ans =>
                ans.id === answerId ? { ...ans, score: value, isModified: true } : ans
            )
        );
    };

    const handleFeedbackChange = (answerId, value) => {
         setAnswers(prevAnswers =>
            prevAnswers.map(ans =>
                ans.id === answerId ? { ...ans, teacher_feedback: value, isModified: true } : ans
            )
        );
    };

    const handleSaveGrades = async () => {
        setLoading(true);
        const modifiedAnswers = answers.filter(ans => ans.isModified);
        if (modifiedAnswers.length > 0) {
            const updatePromises = modifiedAnswers.map(ans =>
                supabase
                    .from('student_answers')
                    .update({ score: ans.score, teacher_feedback: ans.teacher_feedback })
                    .eq('id', ans.id)
            );
            try {
                await Promise.all(updatePromises);
            } catch (error) {
                alert("Gagal menyimpan sebagian penilaian: " + error.message);
                setLoading(false);
                return;
            }
        }
        
        try {
            const totalScore = answers.reduce((acc, ans) => acc + (ans.score || 0), 0);
            
            const { error: attemptError } = await supabase
                .from('quiz_attempts')
                .update({ total_score: totalScore, status: 'graded' })
                .eq('id', attemptId);

            if (attemptError) throw attemptError;

            alert("Penilaian berhasil disimpan!");
            // --- PERBAIKAN 2: Gunakan quizId dari useParams ---
            navigate(`/dashboard/quizzes/grade/${quizId}`);
        } catch (error) {
            alert("Gagal menyimpan penilaian akhir: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Loading jawaban murid...</div>;

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Grade quiz: {attempt?.quizzes?.title}</h1>
            <p className="text-lg text-gray-600 mb-6">Student: {attempt?.profiles?.full_name || 'Nama Tidak Tersedia'}</p>

            <div className="space-y-6">
                {answers.map((answer, index) => (
                    <div key={answer.id} className="bg-white p-5 rounded-lg shadow">
                        <p className="font-bold text-lg mb-2">{index + 1}. {answer.questions.question_text}</p>
                        
                        {answer.questions.question_type.includes('mcq') && (
                            <div className="pl-4">
                                <p className="text-sm text-gray-500">Student Answer:</p>
                                <p className={`p-2 rounded ${answer.score > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {answer.question_options?.find(opt => opt.id === answer.chosen_option_id)?.option_text || "Tidak dijawab"}
                                </p>
                                <p className="text-sm font-semibold mt-2">Score: {answer.score}/{answer.questions.points}</p>
                            </div>
                        )}

                        {answer.questions.question_type === 'essay' && (
                            <div className="pl-4 space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Student Answer:</p>
                                    <p className="p-3 bg-gray-50 border rounded whitespace-pre-wrap">{answer.essay_answer || "Tidak dijawab"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Feedback </label>
                                    <textarea onChange={(e) => handleFeedbackChange(answer.id, e.target.value)} defaultValue={answer.teacher_feedback || ''} rows="2" className="mt-1 w-full border-gray-300 rounded-md p-2"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Skor</label>
                                    <input type="number" onChange={(e) => handleGradeChange(answer.id, parseInt(e.target.value, 10))} defaultValue={answer.score || 0} max={answer.questions.points} min="0" className="mt-1 w-24 border-gray-300 rounded-md p-2"/> / {answer.questions.points}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 text-right">
                <button onClick={handleSaveGrades} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                    {loading ? "Saving..." : "Save All"}
                </button>
            </div>
        </div>
    );
};

export default GradeAttemptPage;