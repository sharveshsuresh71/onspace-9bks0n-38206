import { Activity, Play } from 'lucide-react';
import { CLIP_COMMANDS } from '@/constants/creatureClips';
import { resolveClipName } from '@/lib/creatureClips';
import type { Companion } from '@/hooks/useCompanion';
interface Props { companion: Companion; }
export default function AnimationPanel({ companion: c }: Props) {
 const report = c.modelReport, p = c.assetPreferences;
 if (!c.assets.model) return null;
 return <section className="asset-section" aria-labelledby="animation-title">
  <div className="asset-section-heading"><Activity size={18}/><h3 id="animation-title">Command → animation</h3></div>
  <div className={`model-status ${report.status === 'error' ? 'error' : ''}`} role="status">{report.status === 'loading' ? 'Inspecting GLB animations…' : report.status === 'ready' ? `${report.clips.length} animation clips detected` : report.status === 'error' ? 'Model load failed. The preview is active.' : 'Preparing model…'}</div>
  <p>Automatic mapping reads clip names. For names such as “Action.001”, choose the correct clip below. Test any command with the play button.</p>
  <label htmlFor="model-facing">Model facing direction</label><select id="model-facing" value={p.modelYaw} onChange={e => c.setAssetPreferences(v => ({ ...v, modelYaw: Number(e.target.value) }))}>{[0, 90, 180, 270].map(angle => <option key={angle} value={angle}>{angle}° rotation</option>)}</select>
  {CLIP_COMMANDS.map(({ state, label, command }) => {
   const matched = resolveClipName(report.clips, state, p.bindings);
   return <div className="animation-row" key={state}>
    <label htmlFor={`clip-${state}`}>{label}</label><div className="animation-controls"><select id={`clip-${state}`} value={p.bindings[state] || ''} disabled={report.status !== 'ready' || !report.clips.length} onChange={e => c.setAssetPreferences(v => ({ ...v, bindings: { ...v.bindings, [state]: e.target.value } }))}>
     <option value="">Automatic · {matched || 'transform only'}</option><option value="__none__">No clip · transform only</option>{report.clips.map(name => <option key={name} value={name}>{name}</option>)}
    </select><button className="asset-remove" aria-label={`Test ${label} command`} title={`Test ${label}`} disabled={report.status !== 'ready'} onClick={() => c.command(command)}><Play size={16}/></button></div>
   </div>;
  })}
  <button className="panel-submit" disabled={!Object.keys(p.bindings).length} onClick={() => c.setAssetPreferences(v => ({ ...v, bindings: {} }))}>Reset automatic mapping</button>
  <small className="asset-hint">Commands crossfade available clips and move your GLB through the world. Missing clips fall back to idle or root movement; they do not create skeletal animations. Appearance presets only recolor the procedural preview.</small>
 </section>;
}
