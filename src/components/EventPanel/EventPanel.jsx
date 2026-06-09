import './EventPanel.css';

export default function EventPanel({ event, onChoice, isHost, votes, players }) {
  if (!event) return null;

  const totalPlayers = Object.keys(players || {}).length;

  function voteCount(choiceId) {
    return Object.values(votes || {}).filter((v) => v === choiceId).length;
  }

  return (
    <div className="event-panel">
      <div className="event-header">
        <h2 className="event-title">{event.title}</h2>
        {!isHost && <span className="observer-badge">OBSERVER</span>}
      </div>
      <p className="event-flavor">{event.flavor}</p>

      <div className="choices">
        {event.choices.map((choice) => {
          const votes_ = voteCount(choice.id);
          return (
            <button
              key={choice.id}
              className={`choice-btn ${isHost ? 'host-choice' : 'vote-choice'}`}
              onClick={() => onChoice(choice.id, event.id)}
            >
              <span className="choice-label">{choice.label}</span>
              {votes_ > 0 && (
                <span className="vote-badge">
                  {votes_}/{totalPlayers}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!isHost && (
        <p className="host-note">Votes are advisory — the host decides when to advance.</p>
      )}
    </div>
  );
}
