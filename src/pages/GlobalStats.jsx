import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import ItemThumb from '../components/ItemThumb.jsx';

const TABS = [
  ['elo', '⚡ ELO'],
  ['champions', '🏆 Mais campeões'],
  ['avgPosition', '📊 Melhor posição média'],
  ['mostUsed', '📦 Mais utilizados'],
  ['winRate', '⚔ Melhor taxa de vitória'],
];

export default function GlobalStats() {
  const [by, setBy] = useState('champions');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setItems(null);
    api.get('/stats/items', { params: { by, category, limit: 25 } }).then((res) => setItems(res.data.items));
  }, [by, category]);

  function statLabel(item) {
    const s = item.stats || {};
    switch (by) {
      case 'elo': return `${s.elo ?? 1000} pts`;
      case 'champions': return `${s.winCount || 0} títulos`;
      case 'avgPosition': return `posição média ${(item.avgPosition ?? 0).toFixed(2)}`;
      case 'mostUsed': return `${s.timesRanked || 0} sessões`;
      case 'winRate': return `${(item.winRate ?? 0).toFixed(1)}% de vitórias`;
      default: return '';
    }
  }

  const categoryName = category ? categories.find((c) => c._id === category)?.name : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>📈 Ranking global de itens</h1>
          <p className="sub">{categoryName ? `Categoria: ${categoryName}` : 'Todas as categorias'}</p>
        </div>
        <select className="input" style={{ width: 'auto', minWidth: 180 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="toolbar">
        {TABS.map(([key, label]) => (
          <button key={key} className={`btn btn-sm ${by === key ? 'btn-primary' : ''}`} onClick={() => setBy(key)}>
            {label}
          </button>
        ))}
      </div>

      {!items ? (
        <div className="spinner">Carregando…</div>
      ) : !items.length ? (
        <div className="empty">
          {category
            ? 'Sem dados nessa categoria ainda — complete sessões com itens dela!'
            : 'Sem dados ainda — complete algumas sessões de ranking!'}
        </div>
      ) : (
        <div className="podium" style={{ maxWidth: 720 }}>
          {items.map((item, idx) => (
            <Link key={item._id} to={`/item/${item._id}`} className={`podium-row ${idx === 0 ? 'first' : ''}`}>
              <span className="podium-pos">{idx + 1}°</span>
              <ItemThumb item={item} className="" size={46} />
              <div style={{ flex: 1 }}>
                <p className="podium-name">{item.name}</p>
                <p className="muted" style={{ fontSize: '0.8rem' }}>{item.type}</p>
              </div>
              <span className="muted">{statLabel(item)}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
