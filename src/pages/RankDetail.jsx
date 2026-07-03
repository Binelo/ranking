import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ItemThumb from '../components/ItemThumb.jsx';
import Comments from '../components/Comments.jsx';

function timeAgo(date) {
  if (!date) return '—';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'agora mesmo';
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  return `há ${Math.floor(s / 86400)} dias`;
}

export default function RankDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rank, setRank] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [inProgress, setInProgress] = useState(null); // sessão em andamento neste rank

  useEffect(() => {
    api
      .get(`/ranks/${id}`)
      .then((res) => setRank(res.data.rank))
      .catch((err) => setError(errMsg(err)));
    if (localStorage.getItem('token')) {
      api
        .get('/sessions/mine', { params: { status: 'in_progress', rank: id } })
        .then((res) => setInProgress(res.data.sessions[0] || null))
        .catch(() => {});
    }
  }, [id]);

  async function startSession(mode) {
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/sessions', { rankId: id, mode });
      navigate(`/sessao/${res.data.session._id}`);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  async function toggleLike() {
    const res = await api.post(`/ranks/${id}/like`);
    setRank((r) => ({ ...r, likedByMe: res.data.liked, likesCount: res.data.likesCount }));
  }

  async function toggleFavorite() {
    const res = await api.post(`/ranks/${id}/favorite`);
    setRank((r) => ({ ...r, favoritedByMe: res.data.favorited }));
  }

  async function removeRank() {
    if (!confirm('Excluir este rank permanentemente?')) return;
    await api.delete(`/ranks/${id}`);
    navigate('/meus-ranks');
  }

  function share() {
    navigator.clipboard?.writeText(window.location.href);
    alert('Link copiado!');
  }

  if (error && !rank) return <div className="error-box mt">{error}</div>;
  if (!rank) return <div className="spinner">Carregando…</div>;

  const isOwner = user && rank.creator?._id === user._id;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{rank.title}</h1>
          <p className="sub">
            por @{rank.creator?.username} ·{' '}
            {(rank.categories || []).map((c) => <span key={c._id} className="tag">{c.name}</span>)}
          </p>
        </div>
        <div className="row">
          {user && (
            <>
              <button className="btn btn-sm" onClick={toggleLike}>
                {rank.likedByMe ? '👍 Curtido' : '👍 Curtir'} ({rank.likesCount})
              </button>
              <button className="btn btn-sm" onClick={toggleFavorite}>
                {rank.favoritedByMe ? '⭐ Favoritado' : '⭐ Favoritar'}
              </button>
            </>
          )}
          <button className="btn btn-sm" onClick={share}>🔗 Compartilhar</button>
          {isOwner && (
            <>
              <Link to={`/rank/${id}/editar`} className="btn btn-sm">✏ Editar</Link>
              <button className="btn btn-sm btn-danger" onClick={removeRank}>Excluir</button>
            </>
          )}
        </div>
      </div>

      {rank.description && <p className="muted mb">{rank.description}</p>}
      {error && <div className="error-box">{error}</div>}

      <div className="stats-grid">
        <div className="stat-box"><div className="value">{rank.items?.length || 0}</div><div className="label">itens</div></div>
        <div className="stat-box"><div className="value">{rank.stats?.sessionsCount || 0}</div><div className="label">sessões realizadas</div></div>
        <div className="stat-box"><div className="value">{rank.likesCount || 0}</div><div className="label">curtidas</div></div>
        <div className="stat-box"><div className="value" style={{ fontSize: '1rem', paddingTop: 8 }}>{timeAgo(rank.stats?.lastSessionAt)}</div><div className="label">última sessão</div></div>
      </div>

      <div className="center" style={{ margin: '28px 0' }}>
        {user ? (
          <>
            {inProgress && (
              <div className="mb">
                <Link to={`/sessao/${inProgress._id}`} className="btn btn-lg">▶ Continuar sessão em andamento</Link>
              </div>
            )}
            <div className="mode-choice">
              <button
                className="mode-card"
                onClick={() => startSession('elimination')}
                disabled={busy || (rank.items?.length || 0) < 2}
              >
                <span className="mode-title">⚔ Eliminação direta</span>
                <span className="mode-desc">Mata-mata clássico: perdeu, está fora. Rápido — {Math.max((rank.items?.length || 0) - 1, 0)} duelos.</span>
              </button>
              <button
                className="mode-card"
                onClick={() => startSession('tournament')}
                disabled={busy || (rank.items?.length || 0) < 4}
                title={(rank.items?.length || 0) < 4 ? 'Precisa de pelo menos 4 itens' : ''}
              >
                <span className="mode-title">🏆 Torneio</span>
                <span className="mode-desc">Fase de grupos (todos contra todos) + mata-mata. Mais duelos, resultado mais justo.</span>
              </button>
            </div>
            {busy && <p className="muted mt">Criando sessão…</p>}
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-lg">Entre para jogar</Link>
        )}
        {(rank.items?.length || 0) < 2 && <p className="muted mt">Este rank precisa de pelo menos 2 itens.</p>}
      </div>

      <h2 className="mb">📦 Itens ({rank.items?.length || 0})</h2>
      <div className="grid grid-items">
        {(rank.items || []).map((item) => (
          <Link key={item._id} to={`/item/${item._id}`} className="card item-card">
            <ItemThumb item={item} />
            <h3 style={{ fontSize: '0.95rem' }}>{item.name}</h3>
            <span className="tag tag-type">{item.type}</span>
          </Link>
        ))}
      </div>

      <Comments rankId={id} />
    </>
  );
}
