import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaPlus, FaTrash } from 'react-icons/fa';

const QuestionForm = ({ quizId, existingQuestion, onSave, onCancel }) => {
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('multiple_choice');
    const [points, setPoints] = useState(10);
    const [audioUrl, setAudioUrl] = useState('');
    const [options, setOptions] = useState([{ option_text: '', is_correct: false }]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (existingQuestion) {
            setQuestionText(existingQuestion.question_text);
            setQuestionType(existingQuestion.question_type);
            setPoints(existingQuestion.points);
            setAudioUrl(existingQuestion.audio_url || '');
            if (existingQuestion.question_options && existingQuestion.question_options.length > 0) {
                setOptions(existingQuestion.question_options);
            } else {
                 setOptions([{ option_text: '', is_correct: false }]);
            }
        }
    }, [existingQuestion]);

    const handleAddOption = () => {
        setOptions([...options, { option_text: '', is_correct: false }]);
    };

    const handleRemoveOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleOptionTextChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index].option_text = value;
        setOptions(newOptions);
    };

    const handleCorrectOptionChange = (index) => {
        const newOptions = options.map((option, i) => ({
            ...option,
            is_correct: i === index
        }));
        setOptions(newOptions);
    };

    const handleAudioUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('quizaudios').upload(fileName, file);
        
        if (error) {
            alert("Error uploading audio: " + error.message);
        } else {
            const { data } = supabase.storage.from('quizaudios').getPublicUrl(fileName);
            setAudioUrl(data.publicUrl);
        }
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const questionData = {
            quiz_id: quizId,
            question_text: questionText,
            question_type: questionType,
            points: points,
            audio_url: audioUrl || null,
        };

        try {
            if (existingQuestion) {
                // UPDATE LOGIC
                const { data: updatedQuestion, error: questionError } = await supabase
                    .from('questions')
                    .update(questionData)
                    .eq('id', existingQuestion.id)
                    .select()
                    .single();

                if (questionError) throw questionError;

                if (questionType.includes('multiple_choice') || questionType.includes('listening_mcq')) {
                    // Simple approach: delete old options and insert new ones
                    await supabase.from('question_options').delete().eq('question_id', updatedQuestion.id);
                    const newOptionsData = options.map(opt => ({
                        question_id: updatedQuestion.id,
                        option_text: opt.option_text,
                        is_correct: opt.is_correct
                    }));
                    const { error: optionsError } = await supabase.from('question_options').insert(newOptionsData);
                    if (optionsError) throw optionsError;
                }
            } else {
                // CREATE LOGIC
                const { data: newQuestion, error: questionError } = await supabase
                    .from('questions')
                    .insert(questionData)
                    .select()
                    .single();

                if (questionError) throw questionError;

                if (questionType.includes('multiple_choice') || questionType.includes('listening_mcq')) {
                    const optionsData = options.map(opt => ({
                        question_id: newQuestion.id,
                        option_text: opt.option_text,
                        is_correct: opt.is_correct,
                    }));
                    const { error: optionsError } = await supabase.from('question_options').insert(optionsData);
                    if (optionsError) throw optionsError;
                }
            }
            onSave();
        } catch (error) {
            alert('Error saving question: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <form onSubmit={handleSubmit}>
                <h3 className="text-xl font-bold mb-4">{existingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Question Type</label>
                    <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                        <option value="multiple_choice">Multiple Choices</option>
                        <option value="essay">Essay</option>
                        <option value="listening_mcq">Listening (Multiple Choices)</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Question Text</label>
                    <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" rows="3" required></textarea>
                </div>
                
                {questionType === 'listening_mcq' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Audio File</label>
                        <input type="file" accept="audio/*" onChange={handleAudioUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {uploading && <p>Uploading...</p>}
                        {audioUrl && <audio controls src={audioUrl} className="mt-2">Your browser is not support audio file.</audio>}
                    </div>
                )}
                
                {(questionType === 'multiple_choice' || questionType === 'listening_mcq') && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select an Answer</label>
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input type="radio" name="correct_option" checked={option.is_correct} onChange={() => handleCorrectOptionChange(index)} className="h-5 w-5 text-blue-600"/>
                                <input type="text" placeholder={`Pilihan ${index + 1}`} value={option.option_text} onChange={(e) => handleOptionTextChange(index, e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md" required/>
                                <button type="button" onClick={() => handleRemoveOption(index)} className="text-red-500 hover:text-red-700 p-2"><FaTrash/></button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddOption} className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"><FaPlus/> Add Choices</button>
                    </div>
                )}
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Point</label>
                    <input type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value, 10))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" min="1" required/>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Batal</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionForm;