import { useState } from 'react';
import { X } from 'lucide-react';
import { PIPELINE_STAGES, type Stage } from '../config/stages';

interface Props {
  onSubmit: (data: { name: string; company: string; stage: Stage; score: number; contact_email: string; notes: string }) => void;
  onClose: () => void;
}

export function NewDealModal({ onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState<Stage>('suspect');
  const [score, setScore] = useState(0);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, company, stage, score, contact_email: email, notes });
  };

  const inputCls = 'w-full px-3 py-2 text-sm bg-brand-elevated border border-brand-border rounded text-brand-text-bright placeholder:text-brand-text-dim focus:outline-none focus:ring-1 focus:ring-brand-accent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-brand-card border border-brand-border rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-brand-text-bright">Nieuwe Deal</h2>
          <button onClick={onClose} className="text-brand-text-dim hover:text-brand-text-bright"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">Deal naam *</label>
            <input value={name} onChange={e => setName(e.target.value)} required className={inputCls} placeholder="NIS2 Assessment Gemeente X" />
          </div>
          <div>
            <label className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">Bedrijf *</label>
            <input value={company} onChange={e => setCompany(e.target.value)} required className={inputCls} placeholder="Gemeente Rotterdam" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">Fase</label>
              <select value={stage} onChange={e => setStage(e.target.value as Stage)} className={inputCls}>
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">Score (0-100)</label>
              <input type="number" min={0} max={100} value={score} onChange={e => setScore(+e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">Contact email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="contact@bedrijf.nl" />
          </div>
          <div>
            <label className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">Notities</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputCls} placeholder="Beschrijving, context..." />
          </div>
          <button
            type="submit"
            disabled={!name || !company}
            className="w-full py-2.5 text-sm font-medium bg-brand-accent text-white rounded hover:bg-brand-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Deal aanmaken
          </button>
        </form>
      </div>
    </div>
  );
}
