import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { connectToRoom, send, disconnect } from '../lib/partykit';
import useGameStore from '../store/gameStore';
import GameCanvas from '../components/GameCanvas/GameCanvas';
import EventPanel from '../components/EventPanel/EventPanel';
import PlayerList from '../components/PlayerList/PlayerList';

export default function GameRoom() {
  const { roomId } = useParams();
  const { phase, isHost, getCurrentEvent, players, votes, manifest, setRoomId } = useGameStore();

  // If no name is stored (i.e. this is a joining player, not the host who just generated),
  // show a name entry gate before connecting.
  const storedName = localStorage.getItem('tq_player_name');
  const [playerName, setPlayerName] = useState(storedName || '');
  const [joined, setJoined] = useState(!!storedName);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (!joined) return;
    setRoomId(roomId);
    connectToRoom(roomId, playerName);
    return () => disconnect();
  }, [joined, roomId]);

  function handleJoin(e) {
    e.preventDefault();
    const name = nameInput.trim() || 'Anonymous';
    localStorage.setItem('tq_player_name', name);
    setPlayerName(name);
    setJoined(true);
  }

  if (!joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
        <h1 className="text-3xl font-bold font-mono text-blue-400 mb-2">TEAMQUEST</h1>
        <p className="text-gray-500 font-mono text-sm mb-8">You've been invited to a game.</p>
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <label className="text-gray-300 font-mono text-sm">What should we call you?</label>
          <input
            className="bg-gray-900 border border-gray-700 rounded-md text-white font-mono px-4 py-2 focus:outline-none focus:border-blue-400"
            type="text"
            placeholder="Your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={24}
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-400 text-gray-950 font-bold font-mono py-2 rounded-md transition-colors"
          >
            Join Game
          </button>
        </form>
      </div>
    );
  }

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
        <div className="flex-1 overflow-hidden">
          <GameCanvas />
        </div>

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
