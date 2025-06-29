import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ResultsPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        const { data: attemptData, error: attemptError } = await supabase
            .from('quiz_attempts')
            .select('*, quizzes(title)')
            .eq('id', attemptId)
            .single();

        if (attemptError) {
            alert("Hasil tidak ditemukan!");
            navigate('/dashboard/quizzes');
            return;
        }
        setAttempt(attemptData);

        const { data: answersData, error: answersError } = await supabase
            .from('student_answers')
            .select('*, questions(*, question_options(*))')
            .eq('attempt_id', attemptId);

        if (answersError) alert("Gagal memuat detail jawaban");
        else setAnswers(answersData);
        setLoading(false);
    }, [attemptId, navigate]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    if (loading) return <div className="p-6">Memuat hasil kuis...</div>;

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Result: {attempt?.quizzes.title}</h1>
            
            <div className="my-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Score: {attempt?.total_score ?? "Belum Dinilai"}</p>
                <p>Status: <span className="font-semibold">{attempt?.status}</span></p>
            </div>

            <div className="space-y-6">
                {answers.map((answer, index) => (
                    <div key={answer.id} className="bg-white p-5 rounded-lg shadow">
                        <p className="font-bold text-lg mb-2">{index + 1}. {answer.questions.question_text}</p>
                        {answer.questions.question_type === 'multiple_choice' && (
                            <div className="pl-4">
                                {answer.questions.question_options.map(opt => (
                                    <div key={opt.id} className={`flex items-center gap-2 p-2 rounded 
                                        ${opt.id === answer.chosen_option_id && !opt.is_correct ? 'bg-red-100' : ''}
                                        ${opt.is_correct ? 'bg-green-100' : ''}`}>
                                        
                                        {opt.is_correct && <FaCheckCircle className="text-green-500" />}
                                        {opt.id === answer.chosen_option_id && !opt.is_correct && <FaTimesCircle className="text-red-500" />}
                                        
                                        <span className={`${opt.id === answer.chosen_option_id ? 'font-bold' : ''}`}>{opt.option_text}</span>
                                        {opt.id === answer.chosen_option_id && <span className="text-xs font-semibold">(Jawaban Anda)</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {answer.questions.question_type.includes('mcq') && (
                            <div className="pl-4">
                                {answer.questions.question_options.map(opt => (
                                    <div key={opt.id} className={`flex items-center gap-2 p-2 rounded 
                                        ${opt.id === answer.chosen_option_id && !opt.is_correct ? 'bg-red-100' : ''}
                                        ${opt.is_correct ? 'bg-green-100' : ''}`}>
                                        
                                        {opt.is_correct && <FaCheckCircle className="text-green-500" />}
                                        {opt.id === answer.chosen_option_id && !opt.is_correct && <FaTimesCircle className="text-red-500" />}
                                        
                                        <span className={`${opt.id === answer.chosen_option_id ? 'font-bold' : ''}`}>{opt.option_text}</span>
                                        {opt.id === answer.chosen_option_id && <span className="text-xs font-semibold">(Jawaban Anda)</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {answer.questions.question_type === 'essay' && (
                            <div className="pl-4 space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Jawaban Anda:</p>
                                    <p className="p-3 bg-gray-50 border rounded whitespace-pre-wrap">{answer.essay_answer || "Tidak dijawab"}</p>
                                </div>
                                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                                    <p className="text-sm font-semibold">Skor: {answer.score ?? "Belum dinilai"} / {answer.questions.points}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-semibold">Feedback:</span> {answer.teacher_feedback || "-"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
             <div className="mt-8 text-center">
                <Link to="/dashboard/quizzes" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">
                    Back
                </Link>
            </div>
        </div>
    );
};

export default ResultsPage;