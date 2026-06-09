export async function generateManifest(intake) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(intake),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const manifest = await response.json();
  validateManifest(manifest);
  return manifest;
}

function validateManifest(m) {
  if (!m.events || m.events.length < 6 || m.events.length > 15) {
    throw new Error(`Invalid event count: ${m.events?.length}`);
  }
  if (!m.sectors || m.sectors.length < 3 || m.sectors.length > 5) {
    throw new Error(`Invalid sector count: ${m.sectors?.length}`);
  }
  if (!m.sectors[m.sectors.length - 1].boss) {
    throw new Error('Last sector must be a boss sector');
  }
  const crewIds = new Set(m.crew.map((c) => c.id));
  for (const event of m.events) {
    if (event.choices.length < 2 || event.choices.length > 4) {
      throw new Error(`Event ${event.id} has invalid choice count`);
    }
    for (const cid of event.crew_involved || []) {
      if (!crewIds.has(cid)) throw new Error(`Unknown crew id: ${cid}`);
    }
    for (const choice of event.choices) {
      for (const [, delta] of Object.entries(choice.effects)) {
        if (!Number.isInteger(delta) || delta < -30 || delta > 30) {
          throw new Error(`Effect value out of range in choice ${choice.id}`);
        }
      }
    }
  }
  const resourceKeys = new Set(Object.keys(m.resources));
  for (const key of Object.keys(m.win_condition.resource_thresholds)) {
    if (!resourceKeys.has(key)) {
      throw new Error(`Threshold key "${key}" not in resources`);
    }
  }
}
