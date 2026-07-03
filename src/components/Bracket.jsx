import { useEffect, useRef } from 'react';
import ItemThumb from './ItemThumb.jsx';

/**
 * Chaveamento do mata-mata, montado a partir do history da sessão.
 * Mobile-first: colunas por rodada com scroll horizontal + snap;
 * ao abrir/atualizar, rola automaticamente para a rodada atual.
 */
export default function Bracket({ session }) {
  const scrollRef = useRef(null);

  const duels = (session.history || []).filter((d) => d.stage !== 'grupos');
  const rounds = new Map();
  for (const d of duels) {
    if (!rounds.has(d.round)) rounds.set(d.round, []);
    rounds.get(d.round).push(d);
  }

  const finished = session.status === 'finished';
  const inKnockout =
    !finished && (session.mode !== 'tournament' || session.phase === 'knockout');
  const current = inKnockout ? session.currentDuel : null;
  if (current && !rounds.has(session.currentRound)) rounds.set(session.currentRound, []);

  const roundNums = [...rounds.keys()].sort((a, b) => a - b);
  const champion = finished ? session.finalRanking?.[0] : null;

  // foca no fim do bracket (rodada atual / campeão)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [duels.length, finished]);

  if (!roundNums.length && !champion) {
    return <div className="empty mt">O chaveamento aparece quando o mata-mata começa.</div>;
  }

  const label = (r) => {
    const isLast = r === roundNums[roundNums.length - 1];
    if (finished && isLast && rounds.get(r)?.length === 1) return 'Final';
    return `Rodada ${r}`;
  };

  return (
    <div className="bracket mt" ref={scrollRef}>
      {roundNums.map((r) => (
        <div key={r} className="bracket-round">
          <div className="bracket-round-title">{label(r)}</div>

          {rounds.get(r).map((d, i) => (
            <div key={i} className="bracket-match">
              <div className="bracket-slot win">
                <ItemThumb item={d.winner} className="" size={26} />
                <span className="bracket-name">{d.winner?.name}</span>
                <span className="bracket-check">✓</span>
              </div>
              <div className="bracket-slot lose">
                <ItemThumb item={d.loser} className="" size={26} />
                <span className="bracket-name">{d.loser?.name}</span>
              </div>
            </div>
          ))}

          {current && r === session.currentRound && (
            <div className="bracket-match live">
              <div className="bracket-slot">
                <ItemThumb item={current[0]} className="" size={26} />
                <span className="bracket-name">{current[0]?.name}</span>
              </div>
              <div className="bracket-slot">
                <ItemThumb item={current[1]} className="" size={26} />
                <span className="bracket-name">{current[1]?.name}</span>
              </div>
              <div className="bracket-live-tag">⚔ em andamento</div>
            </div>
          )}
        </div>
      ))}

      {champion && (
        <div className="bracket-round">
          <div className="bracket-round-title">🏆 Campeão</div>
          <div className="bracket-match champ">
            <div className="bracket-slot win">
              <ItemThumb item={champion} className="" size={26} />
              <span className="bracket-name">{champion.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
