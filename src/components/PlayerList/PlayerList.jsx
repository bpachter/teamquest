export default function PlayerList({ players, votes }) {
  const entries = Object.entries(players || {});

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
        Players ({entries.length})
      </h3>
      {entries.length === 0 && (
        <p className="text-gray-600 text-xs font-mono">Waiting for players…</p>
      )}
      {entries.map(([id, player]) => {
        const hasVoted = votes && id in votes;
        return (
          <div key={id} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: player.color }}
            />
            <span className="text-sm text-gray-300 font-mono truncate flex-1">
              {player.name}
            </span>
            {player.isHost && (
              <span className="text-xs text-yellow-400 font-mono">HOST</span>
            )}
            {hasVoted && (
              <span className="text-xs text-green-400 font-mono">✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
