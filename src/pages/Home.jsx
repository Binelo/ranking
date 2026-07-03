import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import RankCard from '../components/RankCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [ranks, setRanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get('/ranks', { params: { search, category, sort, limit: 24 } })
        .then((res) => setRanks(res.data.ranks))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, category, sort]);

  return (
    <>
      <div className="hero">
        <h1>Ranqueie <span>qualquer coisa</span> por duelos</h1>
        <p>Músicas, filmes, jogos, comidas… escolha um rank, decida duelo por duelo e descubra seu campeão.</p>
        {user ? (
          <Link to="/rank/novo" className="btn btn-primary btn-lg">+ Criar meu rank</Link>
        ) : (
          <Link to="/registro" className="btn btn-primary btn-lg">Começar agora</Link>
        )}
      </div>

      <div className="toolbar">
        <input className="input" placeholder="🔍 Buscar ranks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Mais recentes</option>
          <option value="popular">Mais jogados</option>
          <option value="likes">Mais curtidos</option>
          <option value="title">A-Z</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner">Carregando…</div>
      ) : ranks.length ? (
        <div className="grid grid-ranks">
          {ranks.map((r) => <RankCard key={r._id} rank={r} />)}
        </div>
      ) : (
        <div className="empty">Nenhum rank encontrado. Que tal criar o primeiro?</div>
      )}
    </>
  );
}
