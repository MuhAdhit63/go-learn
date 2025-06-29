import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import QuestionForm from './QuestionForm';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const QuizBuilderPage = () => {
    // useParams akan mengambil nilai dari URL, misal: 'new' atau '123'
    const { quizId } = useParams(); 
    const navigate = useNavigate();
    
    // Cek apakah ini mode pembuatan kuis baru atau mode edit
    const isNewQuiz = quizId === 'new';
    
    const [quiz, setQuiz] = useState({ title: '', description: '' });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false); // Default false
    const [showForm, setShowForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // useCallback untuk mencegah fungsi dibuat ulang di setiap render
    const fetchQuizAndQuestions = useCallback(async () => {
        // --- INI BAGIAN PENTING SEBAGAI PENJAGA ---
        // Jika ini kuis baru, JANGAN lakukan apa-apa. Langsung keluar dari fungsi.
        if (isNewQuiz) {
            setLoading(false);
            console.log("kamu berada di is new quiz");
            return;
        }

        setLoading(true);
        // Ambil detail kuis
        const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();

        if (quizError) {
            console.error('Error fetching quiz', quizError);
            alert("Kuis tidak ditemukan!");
            navigate('/dashboard/quizzes');
            return;
        }
        setQuiz(quizData);

        // Ambil soal-soal terkait
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*, question_options(*)')
            .eq('quiz_id', quizId)
            .order('id', { ascending: true });

        if (questionsError) console.error('Error fetching questions', questionsError);
        else setQuestions(questionsData);

        setLoading(false);
    }, [quizId, isNewQuiz, navigate]);

    // useEffect akan berjalan saat komponen pertama kali dimuat
    useEffect(() => {
        fetchQuizAndQuestions();
    }, [fetchQuizAndQuestions]);

    const handleQuizDetailChange = (e) => {
        const { name, value } = e.target;
        setQuiz(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveQuizDetails = async () => {
        if (!quiz.title) {
            alert("Judul kuis tidak boleh kosong.");
            return;
        }
        setLoading(true);
        if (isNewQuiz) {
            const { data, error } = await supabase
                .from('quizzes')
                .insert({ title: quiz.title, description: quiz.description })
                .select()
                .single();
            if (error) {
                alert("Gagal membuat kuis: " + error.message);
            } else {
                // Setelah kuis berhasil dibuat, arahkan ke halaman edit dengan ID baru
                navigate(`/dashboard/quizzes/build/${data.id}`, { replace: true });
            }
        } else {
            const { error } = await supabase
                .from('quizzes')
                .update({ title: quiz.title, description: quiz.description })
                .eq('id', quizId);
            if (error) alert("Gagal menyimpan detail kuis: " + error.message);
            else alert("Detail kuis berhasil disimpan!");
        }
        setLoading(false);
    };

    const handleShowForm = (question = null) => {
        setEditingQuestion(question);
        setShowForm(true);
    };
    
    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm("Yakin ingin menghapus soal ini?")) {
            const { error } = await supabase.from('questions').delete().eq('id', questionId);
            if(error) alert("Gagal menghapus: " + error.message);
            else fetchQuizAndQuestions();
        }
    }

    if (loading) return <div className="p-4">Loading Quiz Builder...</div>;

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-3xl font-bold mb-6">{isNewQuiz ? 'Buat Kuis Baru' : 'Edit Kuis'}</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" value={quiz.title} onChange={handleQuizDetailChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={quiz.description} onChange={handleQuizDetailChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" rows="3"></textarea>
                </div>
                <button onClick={handleSaveQuizDetails} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                    {loading ? 'Menyimpan...' : (isNewQuiz ? 'Create Quiz' : 'Save')}
                </button>
            </div>
            
            {/* Bagian untuk menambah soal hanya muncul setelah kuis dibuat (bukan mode 'new') */}
            {!isNewQuiz && (
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Questions List</h2>
                        <button onClick={() => handleShowForm()} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center gap-2"><FaPlus/> Add Question</button>
                    </div>

                    {showForm ? (
                        <QuestionForm 
                            quizId={quizId}
                            existingQuestion={editingQuestion}
                            onSave={() => { setShowForm(false); fetchQuizAndQuestions(); }}
                            onCancel={() => setShowForm(false)}
                        />
                    ) : (
                        questions.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {questions.map((q, index) => (
                                    <li key={q.id} className="py-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{index + 1}. {q.question_text}</p>
                                                <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{q.question_type} - {q.points} poin</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleShowForm(q)} className="text-blue-500 hover:text-blue-700 p-2"><FaEdit/></button>
                                                <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:text-red-700 p-2"><FaTrash/></button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>There is no any question yet.</p>
                        )
                    )}
                 </div>
            )}
        </div>
    );
};

export default QuizBuilderPage;