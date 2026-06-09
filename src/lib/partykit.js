import PartySocket from 'partysocket';
import useGameStore from '../store/gameStore';

let socket = null;

export function connectToRoom(roomId, playerName) {
  socket = new PartySocket({
    host: import.meta.env.VITE_PARTYKIT_HOST,
    room: roomId,
  });

  const store = useGameStore.getState();

  socket.addEventListener('open', () => {
    // PartySocket assigns an id after open
    const id = socket.id;
    if (id) useGameStore.getState().setMyConnectionId(id);
    send({ type: 'SET_PLAYER_NAME', name: playerName });
  });

  socket.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);
    const s = useGameStore.getState();

    switch (msg.type) {
      case 'STATE_SYNC':
        s.syncState(msg.state);
        break;
      case 'PLAYER_JOINED':
      case 'PLAYER_LEFT':
      case 'PLAYERS_UPDATE':
        s.setPlayers(msg.players);
        break;
      case 'VOTES_UPDATE':
        s.setVotes(msg.votes);
        break;
    }
  });

  return socket;
}

export function send(data) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function disconnect() {
  socket?.close();
  socket = null;
}
