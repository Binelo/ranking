import { useEffect, useState } from 'react';
import api from '../api.js';
import RankCard from '../components/RankCard.jsx';

export default function Favorites() {
  const [ranks, setRanks] = useState(null);

  useEffect(() => {
    api.get('/users/me/favorites').then((res) => setRanks(res.data.ranks));
  }, []);

  if (!ranks) return <div className="spinner">Carregando…</div>;

  return (
    <>
      <div className="page-head"><h1>⭐ Meus favoritos</h1></div>
      {!ranks.length && <div className="empty">Nenhum favorito ainda. Explore ranks e favorite os melhores!</div>}
      <div className="grid grid-ranks">
        {ranks.map((r) => <RankCard key={r._id} rank={r} />)}
      </div>
    </>
  );
}
