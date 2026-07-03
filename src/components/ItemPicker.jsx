import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import ItemThumb from './ItemThumb.jsx';

// Busca e seleciona itens existentes para compor um rank
export default function ItemPicker({ selected, onChange }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // objetos dos selecionados

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/items', { params: { search, limit: 30 } }).then((res) => setResults(res.data.items));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // carrega dados dos itens já selecionados (modo edição)
  useEffect(() => {
    const missing = selected.filter((id) => !selectedItems.some((i) => i._id === id));
    if (!missing.length) return;
    Promise.all(missing.map((id) => api.get(`/items/${id}`).then((r) => r.data.item).catch(() => null))).then(
      (items) => setSelectedItems((prev) => [...prev, ...items.filter(Boolean)])
    );
  }, [selected]); // eslint-disable-line

  function toggle(item) {
    if (selected.includes(item._id)) {
      onChange(selected.filter((id) => id !== item._id));
      setSelectedItems((prev) => prev.filter((i) => i._id !== item._id));
    } else {
      onChange([...selected, item._id]);
      setSelectedItems((prev) => [...prev, item]);
    }
  }

  return (
    <div className="field">
      <div className="row spread">
        <label style={{ marginBottom: 0 }}>Itens do rank ({selected.length})</label>
        <Link to="/item/novo" target="_blank" className="btn btn-sm">+ Criar item novo</Link>
      </div>

      {selectedItems.length > 0 && (
        <div className="picker-list" style={{ maxHeight: 180, marginBottom: 6 }}>
          {selectedItems.map((item) => (
            <div key={item._id} className="picker-row selected" onClick={() => toggle(item)}>
              <ItemThumb item={item} className="" size={34} />
              <span>{item.name}</span>
              <span style={{ marginLeft: 'auto' }}>✕</span>
            </div>
          ))}
        </div>
      )}

      <input
        className="input"
        placeholder="Buscar itens existentes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="picker-list">
        {results
          .filter((i) => !selected.includes(i._id))
          .map((item) => (
            <div key={item._id} className="picker-row" onClick={() => toggle(item)}>
              <ItemThumb item={item} className="" size={34} />
              <span>{item.name}</span>
              <span className="muted" style={{ marginLeft: 'auto' }}>{item.type}</span>
            </div>
          ))}
        {!results.length && <p className="muted">Nenhum item encontrado. Crie um novo!</p>}
      </div>
    </div>
  );
}
