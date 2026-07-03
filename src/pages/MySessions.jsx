import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

export default function MySessions() {
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    api.get('/sessions/mine').then((res) => setSessions(res.data.sessions));
  }, []);

  async function abandon(id) {
    if (!confirm('Abandonar esta sessão?')) return;
    await api.delete(`/sessions/${id}`);
    setSessions((prev) => prev.filter((s) => s._id !== id));
  }

  if (!sessions) return <div className="spinner">Carregando…</div>;

  return (
    <>
      <div className="page-head"><h1>▶ Minhas sessões</h1></div>
      {!sessions.length && <div className="empty">Nenhuma sessão ainda. Escolha um rank e comece a duelar!</div>}
      <div className="podium">
        {sessions.map((s) => (
          <div key={s._id} className="podium-row">
            <div style={{ flex: 1 }}>
              <p className="podium-name">{s.rank?.title || 'Rank removido'}</p>
              <p className="muted" style={{ fontSize: '0.82rem' }}>
                {s.mode === 'tournament' ? '🏆 Torneio · ' : '⚔ Eliminação · '}
                {s.status === 'finished'
                  ? `Concluída · campeão: ${s.champion?.name || '—'} · ${new Date(s.finishedAt).toLocaleDateString('pt-BR')}`
                  : `Em andamento · ${s.mode === 'tournament' && s.phase === 'groups' ? 'fase de grupos' : `rodada ${s.currentRound}`} · ${s.progress?.duelsDone || 0}/${s.progress?.duelsTotal || 0} duelos`}
              </p>
            </div>
            <Link to={`/sessao/${s._id}`} className="btn btn-sm btn-primary">
              {s.status === 'finished' ? 'Ver resultado' : 'Continuar'}
            </Link>
            {s.status === 'in_progress' && (
              <button className="btn btn-sm btn-danger" onClick={() => abandon(s._id)}>Abandonar</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
