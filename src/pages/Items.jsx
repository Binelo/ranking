import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import ItemThumb from '../components/ItemThumb.jsx';
import Pagination from '../components/Pagination.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LIMIT = 24;

export default function Items() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  // volta para a página 1 quando os filtros mudam
  useEffect(() => setPage(1), [search, type, category, sort]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get('/items', { params: { search, type, category, sort, page, limit: LIMIT } })
        .then((res) => {
          setItems(res.data.items);
          setTotal(res.data.total);
          setTypes(res.data.types || []);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, type, category, sort, page]);

  function changePage(p) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>📦 Biblioteca de itens</h1>
          <p className="sub">{total} {total === 1 ? 'item' : 'itens'}</p>
        </div>
        {user && <Link to="/item/novo" className="btn btn-primary">+ Novo item</Link>}
      </div>

      <div className="toolbar">
        <input className="input" placeholder="🔍 Buscar itens…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos tipos</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas categorias</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Mais recentes</option>
          <option value="name">A-Z</option>
          <option value="champions">Mais campeões</option>
          <option value="mostUsed">Mais utilizados</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner">Carregando…</div>
      ) : (
        <>
          <div className="grid grid-items">
            {items.map((item) => (
              <Link key={item._id} to={`/item/${item._id}`} className="card item-card">
                <ItemThumb item={item} />
                <h3 style={{ fontSize: '0.95rem' }}>{item.name}</h3>
                <span className="tag tag-type">{item.type}</span>
                {item.stats?.winCount > 0 && <div className="muted" style={{ marginTop: 6 }}>🏆 {item.stats.winCount}</div>}
              </Link>
            ))}
            {!items.length && <div className="empty">Nenhum item encontrado.</div>}
          </div>
          <Pagination page={page} total={total} limit={LIMIT} onChange={changePage} />
        </>
      )}
    </>
  );
}
