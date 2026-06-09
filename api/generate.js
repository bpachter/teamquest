export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are a game designer generating structured JSON for a corporate team-building game.

CRITICAL RULES:
- Respond with ONLY valid JSON. No preamble, no explanation, no markdown code fences.
- The JSON must exactly match the schema provided.
- Event flavor text must be specific to the company/team inputs given.
- If a real_event was provided, it MUST appear as a scenario in one of the events.
- Tone must be calibrated precisely: "light roast" = gentle; "full roast" = sharp and honest but never cruel.
- The villain archetype selected must appear as a named crew member and feature in at least 2 events.
- The final sector must always be a board/leadership review that tests accumulated resource levels.
- All numbers in effects must be integers. No floats.
- Event choices must feel meaningfully different — not just "good choice" vs "bad choice". Real decisions have real tradeoffs.
- Generate exactly 8–12 events total spread across 3–4 sectors.
- The win_message and loss_message must be specific to the company and feel earned.

SCHEMA:
{
  "meta": { "company": string, "team": string, "industry": string, "tone": string, "generated_at": ISO8601 },
  "resources": {
    "[key]": { "label": string, "start": integer 0-100, "min": 0, "max": 100, "color": hex color }
  },
  "crew": [{ "id": string, "name": string, "role": string, "trait": string, "sprite": string }],
  "sectors": [
    { "id": string, "label": string, "description": string, "icon": string, "events": [event_id_strings], "boss": boolean }
  ],
  "events": [
    {
      "id": string,
      "title": string,
      "flavor": string,
      "crew_involved": [crew_id_strings],
      "choices": [
        { "id": string, "label": string, "outcome": string, "effects": { "[resource_key]": integer }, "next_event": null }
      ]
    }
  ],
  "win_condition": {
    "description": string,
    "resource_thresholds": { "[resource_key]": integer },
    "win_message": string,
    "loss_message": string
  }
}

VALIDATION RULES:
- events array: minimum 6, maximum 15 events
- sectors: 3–5 entries, last one must have boss: true
- Each event: exactly 2–4 choices
- All effects values: integers between -30 and +30
- All crew IDs referenced in events must exist in the crew array
- win_condition.resource_thresholds keys must match resource keys in resources`;

function buildUserPrompt(intake) {
  return `Generate a GameManifest for the following team:

Company/Team: ${intake.company} — ${intake.team_name}
Industry: ${intake.industry}
Team size: ${intake.team_size}
Primary dysfunction: ${intake.pain_point}
Tone: ${intake.tone}
Real recent event: ${intake.real_event || 'none provided'}
Player represents: ${intake.protagonist}
Available play time: ${intake.play_time}
Villain archetype: ${intake.villain}

Generate the complete GameManifest JSON now.`;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const intake = await req.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(intake) }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: 'Claude API error', detail: err }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await response.json();
  let manifestText = data.content[0].text;
  manifestText = manifestText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let manifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Manifest parse failed', raw: manifestText }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
