import { useEffect, useState } from 'react';
import api from '../api.js';

// Seleção múltipla de categorias com criação inline
export default function CategoryPicker({ selected, onChange }) {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  async function create() {
    const name = newName.trim();
    if (!name) return;
    const res = await api.post('/categories', { name });
    const cat = res.data.category;
    setCategories((prev) => (prev.some((c) => c._id === cat._id) ? prev : [...prev, cat]));
    if (!selected.includes(cat._id)) onChange([...selected, cat._id]);
    setNewName('');
  }

  return (
    <div className="field">
      <label>Categorias</label>
      <div className="row" style={{ marginBottom: 8 }}>
        {categories.map((c) => (
          <button
            type="button"
            key={c._id}
            className={`btn btn-sm ${selected.includes(c._id) ? 'btn-primary' : ''}`}
            onClick={() => toggle(c._id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="row">
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Nova categoria…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), create())}
        />
        <button type="button" className="btn btn-sm" onClick={create}>Adicionar</button>
      </div>
    </div>
  );
}
