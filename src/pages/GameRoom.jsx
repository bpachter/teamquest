import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { connectToRoom, send, disconnect } from '../lib/partykit';
import useGameStore from '../store/gameStore';
import GameCanvas from '../components/GameCanvas/GameCanvas';
import EventPanel from '../components/EventPanel/EventPanel';
import PlayerList from '../components/PlayerList/PlayerList';

export default function GameRoom() {
  const { roomId } = useParams();
  const { phase, isHost, getCurrentEvent, players, votes, manifest, setRoomId } = useGameStore();

  useEffect(() => {
    setRoomId(roomId);
    const playerName = localStorage.getItem('tq_player_name') || 'Anonymous';
    connectToRoom(roomId, playerName);
    return () => disconnect();
  }, [roomId]);

  function handleChoiceSelect(choiceId, eventId) {
    if (isHost) {
      send({ type: 'APPLY_CHOICE', choiceId, eventId });
    } else {
      send({ type: 'SUBMIT_VOTE', choiceId });
    }
  }

  const currentEvent = getCurrentEvent();
  const shareUrl = `${window.location.origin}/play/${roomId}`;

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* left sidebar */}
      <div className="flex flex-col w-56 border-r border-gray-800 p-4 gap-4 flex-shrink-0">
        <PlayerList players={players} votes={votes} />

        <div className="mt-auto">
          <p className="text-xs font-mono text-gray-600 mb-1">Share link:</p>
          <button
            className="text-xs font-mono text-blue-400 break-all text-left hover:text-blue-300 transition-colors"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            title="Click to copy"
          >
            /play/{roomId}
          </button>
        </div>

        {manifest && (
          <div>
            <p className="text-xs font-mono text-gray-600 mb-1">Game</p>
            <p className="text-xs font-mono text-gray-400">{manifest.meta.company}</p>
            <p className="text-xs font-mono text-gray-600">{manifest.meta.team}</p>
          </div>
        )}
      </div>

      {/* main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* canvas fills available space */}
        <div className="flex-1 overflow-hidden">
          <GameCanvas />
        </div>

        {/* event panel */}
        {phase === 'playing' && currentEvent && (
          <EventPanel
            event={currentEvent}
            onChoice={handleChoiceSelect}
            isHost={isHost}
            votes={votes}
            players={players}
          />
        )}

        {phase === 'lobby' && (
          <div className="p-4 border-t border-gray-800 text-center">
            <p className="text-gray-500 font-mono text-sm">
              {isHost
                ? 'You are the host. Share the link above so others can join.'
                : 'Waiting for the host to start the game…'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
