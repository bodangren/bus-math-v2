import type { ReactNode } from 'react';

export interface ScenarioPanelRow {
  label: string;
  value: ReactNode;
}

export interface ScenarioPanelProps {
  rows: ScenarioPanelRow[];
  guidance?: ReactNode;
  labelWidth?: number;
  className?: string;
}

export function ScenarioPanel({ rows, guidance, labelWidth = 132, className }: ScenarioPanelProps) {
  return (
    <div className={className ?? 'rounded-2xl border bg-muted/15 px-4 py-4'}>
      <div className="grid gap-2" style={{ gridTemplateColumns: `${labelWidth}px minmax(0, 1fr)` }}>
        {rows.map((row) => (
          <ScenarioPanelEntry key={row.label} {...row} />
        ))}
      </div>
      {guidance && <p className="mt-3 text-xs text-slate-500">{guidance}</p>}
    </div>
  );
}

function ScenarioPanelEntry({ label, value }: ScenarioPanelRow) {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="text-sm text-slate-700">{value}</div>
    </>
  );
}
