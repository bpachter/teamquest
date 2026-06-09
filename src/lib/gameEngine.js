export function applyChoice(resources, choice) {
  const next = { ...resources };
  for (const [key, delta] of Object.entries(choice.effects)) {
    if (key in next) {
      next[key] = Math.max(0, Math.min(100, next[key] + delta));
    }
  }
  return next;
}

export function checkWinLoss(resources, winCondition) {
  const { resource_thresholds } = winCondition;
  const lost = Object.entries(resource_thresholds).some(
    ([k, min]) => (resources[k] ?? 0) < min
  );
  return lost ? 'loss' : null;
}

export function advanceEvent(manifest, sectorIndex, eventIndex) {
  const sector = manifest.sectors[sectorIndex];
  if (eventIndex + 1 < sector.events.length) {
    return { sectorIndex, eventIndex: eventIndex + 1, finished: false };
  }
  if (sectorIndex + 1 < manifest.sectors.length) {
    return { sectorIndex: sectorIndex + 1, eventIndex: 0, finished: false };
  }
  return { sectorIndex, eventIndex, finished: true };
}
