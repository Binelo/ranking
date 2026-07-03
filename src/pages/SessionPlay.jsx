import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { metadataFields } from '../components/MetadataFields.jsx';
import ItemThumb from '../components/ItemThumb.jsx';
import Bracket from '../components/Bracket.jsx';

function DuelCard({ item, onPick, disabled }) {
  const meta = metadataFields(item.type)
    .filter((f) => item.metadata?.[f.key] && !String(item.metadata[f.key]).startsWith('http'))
    .slice(0, 2);
  return (
    <button className="duel-card" onClick={() => onPick(item._id)} disabled={disabled} style={{ width: '100%' }}>
      {item.image ? (
        <img src={item.image} alt={item.name} />
      ) : (
        <div className="duel-placeholder">{item.name[0].toUpperCase()}</div>
      )}
      <h2>{item.name}</h2>
      {meta.map((f) => (
        <p className="meta" key={f.key}>{f.label}: {item.metadata[f.key]}</p>
      ))}
      {item.metadata?.youtubeUrl && (
        <p className="meta">
          <a href={item.metadata.youtubeUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--blue)' }}>
            ▶ Ouvir no YouTube
          </a>
        </p>
      )}
    </button>
  );
}

function GroupTables({ tables }) {
  return (
    <div className="groups-grid mt">
      {tables.map((g) => (
        <div key={g.name} className="group-table">
          <div className="group-head">
            <b>Grupo {g.name}</b>
            <span className="muted">{g.duelsDone}/{g.duelsTotal} duelos</span>
          </div>
          {g.standings.map((row, idx) => (
            <div key={row.item._id} className={`group-row ${row.qualifies ? 'qualifies' : ''}`}>
              <span className="group-pos">{idx + 1}</span>
              <ItemThumb item={row.item} className="" size={28} />
              <span className="group-name">{row.item.name}</span>
              <span className="group-wins">{row.wins} vit.</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FinalRanking({ session }) {
  const [showHistory, setShowHistory] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  const hadKnockout = session.history?.some((d) => d.stage !== 'grupos');
  const ranking = session.finalRanking || [];
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <div className="center mb">
        <h1 style={{ fontSize: '1.8rem' }}>🏆 Ranking final</h1>
        <p className="muted">
          {session.rank?.title}
          {session.mode === 'tournament' && ' · modo torneio'}
        </p>
      </div>

      <div className="podium">
        {ranking.map((item, idx) => (
          <Link key={item._id} to={`/item/${item._id}`} className={`podium-row ${idx === 0 ? 'first' : ''}`}>
            <span className="podium-pos">{medals[idx] || `${idx + 1}°`}</span>
            {item.image ? <img src={item.image} alt="" /> : <div className="item-thumb-placeholder" style={{ width: 52, height: 52, margin: 0, fontSize: '1.2rem' }}>{item.name[0]}</div>}
            <span className="podium-name">{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="center mt row" style={{ justifyContent: 'center' }}>
        {session.mode === 'tournament' && session.groupTables?.length > 0 && (
          <button className="btn" onClick={() => setShowGroups((v) => !v)}>
            {showGroups ? 'Ocultar grupos' : '📊 Ver fase de grupos'}
          </button>
        )}
        {hadKnockout && (
          <button className="btn" onClick={() => setShowBracket((v) => !v)}>
            {showBracket ? 'Ocultar chaveamento' : '🗂 Ver chaveamento'}
          </button>
        )}
        <button className="btn" onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? 'Ocultar histórico' : `📝 Ver histórico (${session.history?.length || 0} duelos)`}
        </button>
        {session.rank && (
          <Link to={`/rank/${session.rank._id}`} className="btn btn-primary">
            Voltar ao rank
          </Link>
        )}
      </div>

      {showBracket && <Bracket session={session} />}

      {showGroups && <GroupTables tables={session.groupTables} />}

      {showHistory && (
        <div className="history-list mt">
          {session.history.map((d, i) => (
            <div key={i} className="history-row">
              <span className="winner">{d.winner?.name}</span>
              <span className="muted">venceu</span>
              <span className="loser">{d.loser?.name}</span>
              <span className="round-tag">{d.stage === 'grupos' ? 'fase de grupos' : `rodada ${d.round}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SessionPlay() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showBracket, setShowBracket] = useState(false);

  useEffect(() => {
    api
      .get(`/sessions/${id}`)
      .then((res) => setSession(res.data.session))
      .catch((err) => setError(errMsg(err)));
  }, [id]);

  async function pick(winnerId) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await api.post(`/sessions/${id}/pick`, { winnerId });
      const next = res.data.session;
      // avisa a virada de fase no modo torneio
      if (session?.phase === 'groups' && next.phase === 'knockout' && next.status === 'in_progress') {
        setShowGroups(true);
      }
      setSession(next);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  if (error && !session) return <div className="error-box mt">{error}</div>;
  if (!session) return <div className="spinner">Carregando…</div>;

  if (session.status === 'finished') return <FinalRanking session={session} />;

  const [a, b] = session.currentDuel || [];
  const { duelsDone, duelsTotal } = session.progress || {};
  const pct = duelsTotal ? Math.round((duelsDone / duelsTotal) * 100) : 0;
  const isGroups = session.mode === 'tournament' && session.phase === 'groups';

  const phaseLabel = session.mode === 'tournament'
    ? isGroups
      ? `Fase de grupos · Grupo ${session.currentGroupName || ''}`
      : `Mata-mata · Rodada ${session.currentRound}`
    : `Rodada ${session.currentRound}`;

  return (
    <div className="duel-arena">
      <p className="duel-round">
        {session.rank?.title} · {phaseLabel} · duelo {duelsDone + 1} de {duelsTotal}
      </p>
      <div className="duel-progress-bar">
        <div className="duel-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {error && <div className="error-box" style={{ maxWidth: 500, margin: '0 auto 20px' }}>{error}</div>}

      {a && b ? (
        <div className="duel-grid">
          <DuelCard item={a} onPick={pick} disabled={busy} />
          <div className="vs-badge">VS</div>
          <DuelCard item={b} onPick={pick} disabled={busy} />
        </div>
      ) : (
        <div className="spinner">Preparando próximo duelo…</div>
      )}

      <div className="row mt" style={{ justifyContent: 'center' }}>
        {!isGroups && (
          <button className="btn btn-sm" onClick={() => setShowBracket((v) => !v)}>
            {showBracket ? 'Ocultar chaveamento' : '🗂 Chaveamento'}
          </button>
        )}
        {session.mode === 'tournament' && session.groupTables?.length > 0 && (
          <button className="btn btn-sm" onClick={() => setShowGroups((v) => !v)}>
            {showGroups ? 'Ocultar grupos' : '📊 Classificação dos grupos'}
          </button>
        )}
      </div>
      {showBracket && !isGroups && <Bracket session={session} />}
      {showGroups && session.groupTables?.length > 0 && <GroupTables tables={session.groupTables} />}

      <p className="muted mt">Clique no seu favorito. Seu progresso é salvo automaticamente — pode fechar e voltar depois.</p>
    </div>
  );
}
