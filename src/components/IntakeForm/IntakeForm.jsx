import { useState } from 'react';
import './IntakeForm.css';

const QUESTIONS = [
  { id: 'company', label: 'Company or team name', type: 'text', placeholder: 'Acme Corp', required: true },
  { id: 'team_name', label: "What's this team called?", type: 'text', placeholder: 'Platform Engineering, Sales West, etc.', required: true },
  {
    id: 'industry', label: 'Industry vertical', type: 'select', required: true,
    options: ['SaaS / Tech', 'Finance / Banking', 'Healthcare', 'Manufacturing', 'Consulting', 'Retail / E-commerce', 'Government', 'Other'],
  },
  {
    id: 'team_size', label: 'How many people will play?', type: 'select', required: true,
    options: ['2–5', '6–10', '11–20', '20+'],
  },
  {
    id: 'pain_point', label: "What's the team's biggest dysfunction right now?", type: 'select', required: true,
    options: ['Communication breakdowns', 'Accountability gaps', 'Siloed teams / no collaboration', 'Leadership is unclear', 'Burnout / morale problems', 'Constant scope creep', 'Everything is on fire all the time'],
  },
  {
    id: 'tone', label: 'What tone should the game have?', type: 'select', required: true,
    options: ['Light roast — gentle humor, mostly positive', 'Medium roast — honest and funny', 'Full roast — we can handle the truth', 'Serious — we want real reflection, not jokes'],
  },
  { id: 'real_event', label: 'Name one real thing that happened recently to this team (optional)', type: 'text', placeholder: "e.g. 'We missed the Q2 launch by 3 weeks'", required: false },
  {
    id: 'protagonist', label: 'The player(s) represent...', type: 'select', required: true,
    options: ['The team lead / manager', 'The whole team as a collective', 'A new hire figuring it out', 'A consultant brought in to fix things'],
  },
  {
    id: 'play_time', label: 'How long do you have to play?', type: 'select', required: true,
    options: ['15 minutes', '30 minutes', '45 minutes', '1 hour'],
  },
  {
    id: 'villain', label: "Every team has one. Pick your villain archetype:", type: 'select', required: true,
    options: ['The Credit Taker — does little, claims much', "The Scope Creeper — 'just one more thing'", 'The Ghost — MIA until there\'s a crisis', 'The Blocker — nothing moves without their approval', 'The Eternal Skeptic — shoots down every idea'],
  },
];

export default function IntakeForm({ onSubmit, isGenerating }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = QUESTIONS[step];
  const value = answers[q.id] || '';
  const canAdvance = !q.required || value.trim() !== '';
  const isLast = step === QUESTIONS.length - 1;

  function handleChange(e) {
    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
  }

  function handleNext() {
    if (isLast) {
      onSubmit(answers);
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && canAdvance) handleNext();
  }

  const pct = Math.round(((step + 1) / QUESTIONS.length) * 100);

  return (
    <div className="intake-form">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="step-label">{step + 1} / {QUESTIONS.length}</p>

      <label className="question-label">{q.label}</label>

      {q.type === 'text' ? (
        <input
          className="intake-input"
          type="text"
          value={value}
          placeholder={q.placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <select className="intake-select" value={value} onChange={handleChange} autoFocus>
          <option value="">— select —</option>
          {q.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      <div className="intake-actions">
        {step > 0 && (
          <button className="btn-back" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        <button
          className="btn-next"
          onClick={handleNext}
          disabled={!canAdvance || isGenerating}
        >
          {isLast ? (isGenerating ? 'Generating…' : 'Generate Game') : 'Next →'}
        </button>
      </div>
    </div>
  );
}
