const CREW_COLORS = ['#f87171', '#60a5fa', '#4ade80', '#facc15', '#c084fc'];

const STARS = Array.from({ length: 120 }, () => ({
  x: Math.random(),
  y: Math.random(),
  size: Math.random() * 1.5 + 0.5,
  brightness: Math.random(),
}));

export function renderFrame(ctx, canvas, gameState) {
  const { manifest, currentSectorIndex, resources, phase } = gameState;

  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!manifest || phase === 'lobby') {
    renderLobbyScreen(ctx, canvas, gameState);
    return;
  }

  if (phase === 'finished') {
    renderEndScreen(ctx, canvas, gameState);
    return;
  }

  renderStarfield(ctx, canvas);
  renderSectorMap(ctx, canvas, manifest.sectors, currentSectorIndex);
  renderShip(ctx, canvas);
  renderCrew(ctx, canvas, manifest.crew);
  renderResourceBars(ctx, canvas, resources, manifest.resources);
  renderScanlines(ctx, canvas);
}

function renderSectorMap(ctx, canvas, sectors, currentIdx) {
  const mapX = canvas.width * 0.55;
  const mapY = 20;
  const mapW = canvas.width * 0.42;
  const mapH = canvas.height * 0.45;

  ctx.fillStyle = 'rgba(0,20,40,0.8)';
  ctx.fillRect(mapX, mapY, mapW, mapH);

  sectors.forEach((sector, i) => {
    const nodeX = mapX + 30 + (i / (sectors.length - 1)) * (mapW - 60);
    const nodeY = mapY + mapH / 2;
    const radius = 12;

    if (i < sectors.length - 1) {
      const nextX = mapX + 30 + ((i + 1) / (sectors.length - 1)) * (mapW - 60);
      ctx.strokeStyle = i < currentIdx ? '#4ade80' : '#1e3a5f';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(nodeX + radius, nodeY);
      ctx.lineTo(nextX - radius, nodeY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (i < currentIdx) {
      ctx.fillStyle = '#4ade80';
    } else if (i === currentIdx) {
      ctx.fillStyle = sector.boss ? '#ef4444' : '#f59e0b';
    } else {
      ctx.fillStyle = '#1e3a5f';
    }
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = i === currentIdx ? '#ffffff' : '#6b7280';
    ctx.font = `${canvas.width * 0.012}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(sector.label.slice(0, 16), nodeX, nodeY + radius + 16);
  });
}

function renderShip(ctx, canvas) {
  const cx = canvas.width * 0.22;
  const cy = canvas.height * 0.38;
  const scale = canvas.width / 1024;

  ctx.fillStyle = '#94a3b8';
  const hull = [
    [0, -20], [8, -12], [12, 0], [8, 12], [0, 20],
    [-4, 16], [-6, 0], [-4, -16],
  ];
  drawPixelPoly(ctx, cx, cy, hull, scale);

  ctx.fillStyle = `rgba(96, 165, 250, ${0.6 + 0.3 * Math.sin(Date.now() / 300)})`;
  ctx.beginPath();
  ctx.arc(cx - 8 * scale, cy, 6 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(cx + 4 * scale, cy - 4 * scale, 6 * scale, 8 * scale);
}

function drawPixelPoly(ctx, cx, cy, points, scale) {
  ctx.beginPath();
  ctx.moveTo(cx + points[0][0] * scale, cy + points[0][1] * scale);
  points.slice(1).forEach(([x, y]) => ctx.lineTo(cx + x * scale, cy + y * scale));
  ctx.closePath();
  ctx.fill();
}

function renderCrew(ctx, canvas, crew) {
  const startX = canvas.width * 0.04;
  const y = canvas.height * 0.72;
  const scale = canvas.width / 1024;

  crew.forEach((member, i) => {
    const x = startX + i * 70 * scale;
    drawCrewMember(ctx, x, y, scale, CREW_COLORS[i % CREW_COLORS.length]);

    ctx.fillStyle = '#9ca3af';
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(member.name.slice(0, 10), x + 12 * scale, y + 36 * scale);
  });
}

function drawCrewMember(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 24 * scale, 20 * scale);
  ctx.fillStyle = '#475569';
  ctx.fillRect(x - 4 * scale, y + 20 * scale, 32 * scale, 16 * scale);
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(x + 6 * scale, y + 6 * scale, 4 * scale, 4 * scale);
  ctx.fillRect(x + 14 * scale, y + 6 * scale, 4 * scale, 4 * scale);
}

function renderResourceBars(ctx, canvas, resources, resourceDefs) {
  const barY = canvas.height * 0.88;
  const barW = canvas.width * 0.5;
  const barX = canvas.width * 0.04;
  const barH = 10;
  const spacing = 28;
  const scale = canvas.width / 1024;

  Object.entries(resourceDefs).forEach(([key, def], i) => {
    const val = resources[key] ?? def.start;
    const pct = val / def.max;
    const y = barY + i * spacing * scale;

    ctx.fillStyle = '#6b7280';
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`${def.label}: ${val}`, barX, y - 3);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, y, barW, barH * scale);

    ctx.fillStyle = pct > 0.5 ? def.color : pct > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX, y, barW * pct, barH * scale);
  });
}

function renderScanlines(ctx, canvas) {
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 2);
  }
}

function renderStarfield(ctx, canvas) {
  STARS.forEach((star) => {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + star.brightness * 0.5})`;
    ctx.fillRect(star.x * canvas.width, star.y * canvas.height, star.size, star.size);
  });
}

function renderLobbyScreen(ctx, canvas, { players }) {
  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${canvas.width * 0.04}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('WAITING FOR HOST', canvas.width / 2, canvas.height * 0.35);

  ctx.fillStyle = '#64748b';
  ctx.font = `${canvas.width * 0.02}px monospace`;
  ctx.fillText(
    `${Object.keys(players || {}).length} player(s) connected`,
    canvas.width / 2,
    canvas.height * 0.45
  );
}

function renderEndScreen(ctx, canvas, gameState) {
  const status = gameState.getWinStatus?.() || 'loss';
  const manifest = gameState.manifest;

  ctx.fillStyle = status === 'win' ? '#4ade80' : '#ef4444';
  ctx.font = `bold ${canvas.width * 0.05}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(
    status === 'win' ? 'MISSION COMPLETE' : 'MISSION FAILED',
    canvas.width / 2,
    canvas.height * 0.3
  );

  const msg =
    status === 'win'
      ? manifest?.win_condition.win_message
      : manifest?.win_condition.loss_message;

  if (msg) {
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `${canvas.width * 0.018}px monospace`;
    wrapText(ctx, msg, canvas.width / 2, canvas.height * 0.45, canvas.width * 0.7, 28);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  words.forEach((word) => {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line.trim(), x, currentY);
}
