import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IntakeForm from '../components/IntakeForm/IntakeForm';
import { generateManifest } from '../lib/generateManifest';
import { connectToRoom, send } from '../lib/partykit';
import useGameStore from '../store/gameStore';

export default function Home() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const { setRoomId } = useGameStore();

  async function handleSubmit(intake) {
    setIsGenerating(true);
    setError(null);

    // save player name
    const playerName = intake.company ? `${intake.company} Host` : 'Host';
    localStorage.setItem('tq_player_name', playerName);

    try {
      const manifest = await generateManifest(intake);

      const roomId = crypto.randomUUID().slice(0, 8);
      setRoomId(roomId);

      connectToRoom(roomId, playerName);
      // SET_MANIFEST is queued and sent once the socket opens
      send({ type: 'SET_MANIFEST', manifest });

      navigate(`/play/${roomId}`);
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-mono text-blue-400 tracking-tight">
          TEAMQUEST
        </h1>
        <p className="text-gray-500 font-mono text-sm mt-2">
          AI-generated corporate team-building. Pixel game. Real awkward moments.
        </p>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-mono text-sm">
            Generating your game manifest… (8–15 seconds)
          </p>
        </div>
      ) : (
        <>
          <IntakeForm onSubmit={handleSubmit} isGenerating={isGenerating} />
          {error && (
            <p className="mt-4 text-red-400 font-mono text-sm max-w-md text-center">
              Error: {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
