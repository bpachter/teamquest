const PLAYER_COLORS = ['#f87171', '#60a5fa', '#4ade80', '#facc15', '#c084fc', '#fb923c'];

export default class GameRoom {
  constructor(room) {
    this.room = room;
    this.state = {
      phase: 'lobby',
      manifest: null,
      currentSectorIndex: 0,
      currentEventIndex: 0,
      resources: {},
      eventHistory: [],
      players: {},
      votes: {},
    };
  }

  onConnect(conn, ctx) {
    const isFirstPlayer = Object.keys(this.state.players).length === 0;
    this.state.players[conn.id] = {
      name: `Player ${Object.keys(this.state.players).length + 1}`,
      isHost: isFirstPlayer,
      color: PLAYER_COLORS[Object.keys(this.state.players).length % PLAYER_COLORS.length],
      joinedAt: Date.now(),
    };

    conn.send(JSON.stringify({ type: 'STATE_SYNC', state: this.state }));
    this.broadcast({ type: 'PLAYER_JOINED', players: this.state.players });
  }

  onClose(conn) {
    const wasHost = this.state.players[conn.id]?.isHost;
    delete this.state.players[conn.id];
    delete this.state.votes[conn.id];

    if (wasHost && Object.keys(this.state.players).length > 0) {
      const nextId = Object.keys(this.state.players)[0];
      this.state.players[nextId].isHost = true;
    }

    this.broadcast({ type: 'PLAYER_LEFT', players: this.state.players });
  }

  onMessage(message, sender) {
    const msg = JSON.parse(message);

    switch (msg.type) {
      case 'SET_MANIFEST': {
        if (!this.state.players[sender.id]?.isHost) return;
        this.state.manifest = msg.manifest;
        this.state.resources = Object.fromEntries(
          Object.entries(msg.manifest.resources).map(([k, v]) => [k, v.start])
        );
        this.state.phase = 'playing';
        this.broadcast({ type: 'STATE_SYNC', state: this.state });
        break;
      }

      case 'SUBMIT_VOTE': {
        this.state.votes[sender.id] = msg.choiceId;
        this.broadcast({ type: 'VOTES_UPDATE', votes: this.state.votes });
        break;
      }

      case 'APPLY_CHOICE': {
        if (!this.state.players[sender.id]?.isHost) return;
        const choice = this.resolveChoice(msg.choiceId);
        if (!choice) return;

        Object.entries(choice.effects).forEach(([resource, delta]) => {
          this.state.resources[resource] = Math.max(
            0,
            Math.min(100, (this.state.resources[resource] || 0) + delta)
          );
        });

        this.state.eventHistory.push({
          eventId: msg.eventId,
          choiceId: msg.choiceId,
          effects: choice.effects,
        });

        this.advanceGameState();
        this.state.votes = {};
        this.broadcast({ type: 'STATE_SYNC', state: this.state });
        break;
      }

      case 'SET_PLAYER_NAME': {
        if (this.state.players[sender.id]) {
          this.state.players[sender.id].name = msg.name.slice(0, 24);
          this.broadcast({ type: 'PLAYERS_UPDATE', players: this.state.players });
        }
        break;
      }
    }
  }

  advanceGameState() {
    const { manifest, currentSectorIndex, currentEventIndex } = this.state;
    const currentSector = manifest.sectors[currentSectorIndex];
    const sectorEvents = currentSector.events;

    if (currentEventIndex + 1 < sectorEvents.length) {
      this.state.currentEventIndex++;
    } else if (currentSectorIndex + 1 < manifest.sectors.length) {
      this.state.currentSectorIndex++;
      this.state.currentEventIndex = 0;
    } else {
      this.state.phase = 'finished';
    }

    if (manifest && this.state.phase !== 'finished') {
      const thresholds = manifest.win_condition.resource_thresholds;
      const anyDepleted = Object.entries(thresholds).some(
        ([k, min]) => (this.state.resources[k] || 0) < min
      );
      if (anyDepleted) {
        this.state.phase = 'finished';
      }
    }
  }

  resolveChoice(choiceId) {
    if (!this.state.manifest) return null;
    for (const event of this.state.manifest.events) {
      const choice = event.choices.find((c) => c.id === choiceId);
      if (choice) return choice;
    }
    return null;
  }

  broadcast(data) {
    this.room.broadcast(JSON.stringify(data));
  }
}
