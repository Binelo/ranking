import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import CategoryPicker from '../components/CategoryPicker.jsx';
import ItemPicker from '../components/ItemPicker.jsx';

export default function RankForm({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!edit) return;
    api.get(`/ranks/${id}`).then((res) => {
      const r = res.data.rank;
      setTitle(r.title);
      setDescription(r.description || '');
      setCategories((r.categories || []).map((c) => c._id));
      setItems((r.items || []).map((i) => i._id));
    });
  }, [edit, id]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (items.length < 2) return setError('Adicione pelo menos 2 itens ao rank.');
    setBusy(true);
    try {
      const body = { title, description, categories, items };
      const res = edit ? await api.put(`/ranks/${id}`, body) : await api.post('/ranks', body);
      navigate(`/rank/${res.data.rank._id}`);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <form className="form-card form-wide" onSubmit={submit}>
      <h1>{edit ? 'Editar rank' : 'Criar novo rank'}</h1>
      {error && <div className="error-box">{error}</div>}
      <div className="field">
        <label>Título</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Melhores músicas de Rock" />
      </div>
      <div className="field">
        <label>Descrição</label>
        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Sobre o que é esse rank?" />
      </div>
      <CategoryPicker selected={categories} onChange={setCategories} />
      <ItemPicker selected={items} onChange={setItems} />
      <button className="btn btn-primary" disabled={busy}>
        {busy ? 'Salvando…' : edit ? 'Salvar alterações' : 'Criar rank'}
      </button>
    </form>
  );
}
