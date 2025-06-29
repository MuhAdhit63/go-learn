import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

  const handleCreateNew = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  if (loading) return <p>Loading materi...</p>;

  return (
    <div>
      <h1>Halaman Materi</h1>

      {/* Tombol ini hanya muncul untuk GURU */}
      {profile?.role === 'teacher' && !showForm && (
        <button onClick={handleCreateNew}>Buat Materi Baru</button>
      )}

      {/* Form ini hanya muncul jika showForm true (saat buat/edit) */}
      {showForm && profile?.role === 'teacher' && (
        <MaterialForm
          existingMaterial={editingMaterial}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingMaterial(null); }}
        />
      )}

      <hr />

      {materials.length === 0 ? (
        <p>Belum ada materi yang tersedia.</p>
      ) : (
        materials.map((material) => (
          <div key={material.id} style={{ border: '1px solid black', padding: '10px', margin: '10px 0' }}>
            <h2>{material.title}</h2>
            <p>{material.content}</p>

            {/* Tombol Edit/Delete hanya muncul untuk GURU yang memiliki materi ini */}
            {profile?.role === 'teacher' && profile?.id === material.user_id && (
              <div>
                <button onClick={() => handleEdit(material)}>Edit</button>
                <button onClick={() => handleDelete(material.id)}>Delete</button>
              </div>
            )}
            <Link to="/dashboard"/>
          </div>
        ))
      )}
    </div>
  );
};

export default MaterialsPage;