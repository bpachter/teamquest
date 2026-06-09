import './ResourceBar.css';
import useGameStore from '../../store/gameStore';

export default function ResourceBar() {
  const { resources, manifest } = useGameStore();
  if (!manifest) return null;

  return (
    <div className="resource-bar">
      {Object.entries(manifest.resources).map(([key, def]) => {
        const val = resources[key] ?? def.start;
        const pct = (val / def.max) * 100;
        const barColor = pct > 50 ? def.color : pct > 25 ? '#f59e0b' : '#ef4444';

        return (
          <div key={key} className="resource-item">
            <span className="resource-label" style={{ color: def.color }}>
              {def.label}
            </span>
            <div className="resource-track">
              <div
                className="resource-fill"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
            <span className="resource-value">{val}</span>
          </div>
        );
      })}
    </div>
  );
}
