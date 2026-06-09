import PartySocket from 'partysocket';
import useGameStore from '../store/gameStore';

let socket = null;
const openQueue = [];   // messages queued before socket is open

export function connectToRoom(roomId, playerName) {
  socket = new PartySocket({
    host: import.meta.env.VITE_PARTYKIT_HOST,
    room: roomId,
  });

  socket.addEventListener('open', () => {
    const id = socket.id;
    if (id) useGameStore.getState().setMyConnectionId(id);
    send({ type: 'SET_PLAYER_NAME', name: playerName });

    // flush anything that was queued before open
    while (openQueue.length > 0) {
      socket.send(JSON.stringify(openQueue.shift()));
    }
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

// Send immediately if open, otherwise queue until open fires
export function send(data) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else if (socket) {
    openQueue.push(data);
  }
}

export function disconnect() {
  socket?.close();
  socket = null;
  openQueue.length = 0;
}
