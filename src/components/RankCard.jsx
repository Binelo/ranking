import { Link } from 'react-router-dom';

export default function RankCard({ rank }) {
  return (
    <Link to={`/rank/${rank._id}`} className="card">
      <h3>{rank.title}</h3>
      <p className="desc">{rank.description || 'Sem descrição'}</p>
      <div>
        {(rank.categories || []).map((c) => (
          <span key={c._id} className="tag">{c.name}</span>
        ))}
      </div>
      <div className="card-meta mt" style={{ marginTop: 10 }}>
        <span>📦 {rank.itemsCount ?? rank.items?.length ?? 0} itens</span>
        <span>▶ {rank.stats?.sessionsCount || 0} sessões</span>
        <span>👍 {rank.likesCount ?? rank.likes?.length ?? 0}</span>
        {rank.creator?.username && <span>por @{rank.creator.username}</span>}
      </div>
    </Link>
  );
}
