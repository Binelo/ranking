import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import RankCard from '../components/RankCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MyRanks() {
  const { user } = useAuth();
  const [ranks, setRanks] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/ranks', { params: { creator: user._id, limit: 50 } }).then((res) => setRanks(res.data.ranks));
  }, [user]);

  if (!ranks) return <div className="spinner">Carregando…</div>;

  return (
    <>
      <div className="page-head">
        <h1>🏆 Meus ranks</h1>
        <Link to="/rank/novo" className="btn btn-primary">+ Criar rank</Link>
      </div>
      {!ranks.length && <div className="empty">Você ainda não criou nenhum rank.</div>}
      <div className="grid grid-ranks">
        {ranks.map((r) => <RankCard key={r._id} rank={r} />)}
      </div>
    </>
  );
}
