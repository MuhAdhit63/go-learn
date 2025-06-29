import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Chapter1 from './Chapter1';
import Chapter2 from './Chapter2';
import Chapter3 from './Chapter3';

// Komponen Form bisa ditaruh di file terpisah jika kompleks,
// tapi untuk contoh ini kita satukan.
const MaterialForm = ({ existingMaterial, onSave, onCancel }) => {
    const { profile } = useAuth();
    const [title, setTitle] = useState(existingMaterial?.title || '');
    const [content, setContent] = useState(existingMaterial?.content || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const materialData = { title, content };
        let error;

        if (existingMaterial) {
            // Update
            ({ error } = await supabase.from('materials').update(materialData).eq('id', existingMaterial.id));
        } else {
            // Create
            ({ error } = await supabase.from('materials').insert({ ...materialData, user_id: profile.id }));
        }

        if (error) {
            alert(error.message);
        } else {
            onSave(); // Beritahu parent component untuk refresh data
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{existingMaterial ? 'Edit Materi' : 'Buat Materi Baru'}</h3>
            <input type="text" placeholder="Judul Materi" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <br /><br />
            <textarea placeholder="Konten Materi" value={content} onChange={(e) => setContent(e.target.value)} required style={{ width: '300px', height: '150px' }}></textarea>
            <br /><br />
            <button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" onClick={onCancel}>Batal</button>
        </form>
    );
};


const MaterialsPage = () => {
    const { profile } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);

    const fetchMaterials = async () => {
        setLoading(true);
        // Langsung select semua data tanpa pengurutan
        const { data, error } = await supabase
            .from('materials')
            .select('*');

        if (error) {
            console.error('Error fetching materials:', error);
        } else {
            setMaterials(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleDelete = async (materialId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
            const { error } = await supabase.from('materials').delete().eq('id', materialId);
            if (error) {
                alert(error.message);
            } else {
                fetchMaterials(); // Refresh list setelah delete
            }
        }
    };

    const handleSave = () => {
        setShowForm(false);
        setEditingMaterial(null);
        fetchMaterials();
    };

    const handleEdit = (material) => {
        setEditingMaterial(material);
        setShowForm(true);
    };

    const navigate = useNavigate();
    const handleChapter = (chapter) => {
        switch (chapter) {
            case "Chapter 1":
            navigate('/dashboard/chapter-1');
                break;
            case "Chapter 2":
            navigate('/dashboard/chapter-2');
                break;
            case "Chapter 3":
            navigate('/dashboard/chapter-3');
                break;
        
            default:
                break;
        }
    }

    const handleCreateNew = () => {
        setEditingMaterial(null);
        setShowForm(true);
    };
    if (loading) return <p>Loading materi...</p>;

    return (
        <div>
            {/* <h1>Halaman Materi</h1>
      {profile?.role === 'teacher' && !showForm && (
        <button onClick={handleCreateNew}>Buat Materi Baru</button>
      )}

      {showForm && profile?.role === 'teacher' && (
        <MaterialForm
          existingMaterial={editingMaterial}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingMaterial(null); }}
        />
      )} */}

            <hr />
            <div className='p-4'>
                <h1 className='mb-4 font-bold text-2xl'>Materials</h1>
                <div className="grid grid-cols-3 gap-6 mb-6">

                    {materials.length === 0 ? (
                        <p>Belum ada materi yang tersedia.</p>
                    ) : (

                        materials.map((material) => (
                            <div onClick={() => handleChapter(material.title)} className="bg-white text-black p-6 rounded-lg shadow flex flex-col justify-center cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="">
                                        <p className='text-3xl font-bold'>{material.title}</p>
                                        <p>{material.content}</p>
                                    </div>
                                    {/* <button onClick={() => handleChapter(material.title)}>Read</button> */}
                                    
                                </div>
                            </div>

                            /* {profile?.role === 'teacher' && profile?.id === material.user_id && (
              <div>
                <button onClick={() => handleEdit(material)}>Edit</button>
                <button onClick={() => handleDelete(material.id)}>Delete</button>
              </div>
            )} */
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialsPage;