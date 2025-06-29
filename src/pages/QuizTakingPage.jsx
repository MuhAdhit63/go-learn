import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const QuizTakingPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [attemptId, setAttemptId] = useState(null);

    // --- PERBAIKAN UTAMA ADA DI SINI ---
    useEffect(() => {
        let isMounted = true;

        const setupQuiz = async () => {
            if (!profile || !isMounted) return;

            setLoading(true);

            // 1. Buat percobaan (attempt) baru HANYA SEKALI
            const { data: attemptData, error: attemptError } = await supabase
                .from('quiz_attempts')
                .insert({ quiz_id: quizId, student_id: profile.id, status: 'started' })
                .select()
                .single();

            if (attemptError) {
                if (isMounted) {
                    alert("Gagal memulai kuis: " + attemptError.message);
                    navigate('/dashboard/quizzes');
                }
                return;
            }
            if (!isMounted) return;
            setAttemptId(attemptData.id);

            // 2. Ambil detail kuis dan soal
            const { data: quizData, error: quizError } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
            if (quizError && isMounted) {
                alert("Kuis tidak ditemukan!");
                navigate('/dashboard/quizzes');
                return;
            }
            if (!isMounted) return;
            setQuiz(quizData);

            const { data: questionsData, error: questionsError } = await supabase.from('questions').select('*, question_options(*)').eq('quiz_id', quizId).order('id');
            if (questionsError && isMounted) {
                alert("Gagal memuat soal!");
                setQuestions([]);
            } else if (isMounted) {
                // --- PERBAIKAN 1: TAMBAHKAN PEMBUATAN SIGNED URL UNTUK AUDIO ---
                const processedQuestions = await Promise.all(
                    (questionsData || []).map(async (q) => {
                        if (q.question_type === 'listening_mcq' && q.audio_url) {
                            // Ekstrak path file dari URL publik yang tersimpan
                            const filePath = q.audio_url.split('/quizaudios/')[1];
                            if (filePath) {
                                // Buat URL baru yang memiliki token akses (valid selama 1 jam)
                                const { data, error } = await supabase.storage
                                    .from('quizaudios')
                                    .createSignedUrl(filePath, 3600); // 3600 detik = 1 jam

                                if (!error) {
                                    // Tambahkan properti baru ke objek soal
                                    return { ...q, signedAudioUrl: data.signedUrl };
                                }
                            }
                        }
                        return q;
                    })
                );
                setQuestions(processedQuestions);
            }

            if (isMounted) setLoading(false);
        };

        setupQuiz();

        return () => {
            isMounted = false;
        };
    }, [quizId, profile, navigate]);

    const handleAnswer = (questionId, questionType, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: { value, type: questionType } }));
    };

    const handleSubmitQuiz = async () => {
        if (!window.confirm("Apakah Anda yakin ingin menyelesaikan dan mengirim kuis ini?")) return;
        setLoading(true);

        const studentAnswersData = questions.map(question => {
            const answer = answers[question.id];
            if (!answer) return null;

            const answerPayload = {
                attempt_id: attemptId,
                question_id: question.id,
                chosen_option_id: null,
                essay_answer: null,
                score: 0
            };

            if (answer.type.includes('mcq')) {
                const chosenOption = question.question_options.find(opt => opt.id === answer.value);
                answerPayload.chosen_option_id = answer.value;
                if (chosenOption && chosenOption.is_correct) {
                    answerPayload.score = question.points;
                }
            } else if (answer.type === 'essay') {
                answerPayload.essay_answer = answer.value;
            } else if (answer.type === 'multiple_choice') {
                const chosenOption = question.question_options.find(opt => opt.id === answer.value);
                answerPayload.chosen_option_id = answer.value;
                if (chosenOption && chosenOption.is_correct) {
                    answerPayload.score = question.points;
                }
            }
            return answerPayload;
        }).filter(Boolean);

        try {
            if (studentAnswersData.length > 0) {
                const { error: answersError } = await supabase.from('student_answers').insert(studentAnswersData);
                if (answersError) throw answersError;
            }

            const finalScore = studentAnswersData.reduce((acc, ans) => acc + (ans.score || 0), 0);

            const { error: attemptError } = await supabase
                .from('quiz_attempts')
                .update({
                    status: 'submitted',
                    submitted_at: new Date().toISOString(),
                    total_score: finalScore
                })
                .eq('id', attemptId);
            if (attemptError) throw attemptError;

            alert("Kuis berhasil dikirim!");
            navigate(`/dashboard/quizzes/results/${attemptId}`);
        } catch (error) {
            alert("Gagal mengirim jawaban: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !attemptId) return <div className="p-4">Mempersiapkan Kuis...</div>;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion && !loading) return <div className="p-4">Tidak ada soal yang tersedia.</div>;

    return (
        // ... JSX Anda sama persis ...
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            {quiz && (
                <>
                    <h1 className="text-3xl font-bold">{quiz.title}</h1>
                    <p className="text-gray-600 mb-6">{quiz.description}</p>
                </>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">No. {currentQuestionIndex + 1} from {questions.length}</h3>
                    {currentQuestion && <span className="text-lg font-bold">{currentQuestion.points} point</span>}
                </div>

                {currentQuestion && <p className="text-lg mb-4">{currentQuestion.question_text}</p>}

                {currentQuestion?.question_type === "multiple_choice" && currentQuestion.question_options.map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 p-3 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 cursor-pointer">
                        <input type="radio" name={`q_${currentQuestion.id}`} value={opt.id}
                            onChange={(e) => handleAnswer(currentQuestion.id, currentQuestion.question_type, parseInt(e.target.value, 10))}
                            checked={answers[currentQuestion.id]?.value === opt.id}
                        />
                        <span>{opt.option_text}</span>
                    </label>
                ))}

                {currentQuestion?.question_type === 'listening_mcq' && currentQuestion.signedAudioUrl && (
                    <audio controls src={currentQuestion.signedAudioUrl} className="mb-4 w-full">Browser Anda tidak mendukung elemen audio.</audio>
                )}

                <div className="space-y-3">
                    {currentQuestion?.question_type.includes('mcq') && currentQuestion.question_options.map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 p-3 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 cursor-pointer">
                            <input type="radio" name={`q_${currentQuestion.id}`} value={opt.id}
                                onChange={(e) => handleAnswer(currentQuestion.id, currentQuestion.question_type, parseInt(e.target.value, 10))}
                                checked={answers[currentQuestion.id]?.value === opt.id}
                            />
                            <span>{opt.option_text}</span>
                        </label>
                    ))}
                    {currentQuestion?.question_type === 'essay' && (
                        <textarea
                            className="w-full p-2 border rounded-md"
                            rows="6"
                            placeholder="Type here..."
                            onChange={(e) => handleAnswer(currentQuestion.id, 'essay', e.target.value)}
                            value={answers[currentQuestion.id]?.value || ''}
                        ></textarea>
                    )}
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))} disabled={currentQuestionIndex === 0}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md disabled:opacity-50">
                    Back
                </button>
                {currentQuestionIndex === questions.length - 1 ? (
                    <button onClick={handleSubmitQuiz} disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                        {loading ? 'Sending...' : 'Finish & Submit'}
                    </button>
                ) : (
                    <button onClick={() => setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))} disabled={!currentQuestion}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizTakingPage;