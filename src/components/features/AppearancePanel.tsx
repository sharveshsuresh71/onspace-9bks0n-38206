import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';
import { APPEARANCES } from '@/constants/mythos';
import AssetUpload from '@/components/features/AssetUpload';
import AnimationPanel from '@/components/features/AnimationPanel';
import type { Companion } from '@/hooks/useCompanion';
interface Props { companion: Companion; }
export default function AppearancePanel({ companion: c }: Props) {
 return <><p>Bring your dragon into the sanctuary. Upload its rigged GLB, inspect the clips, and connect each command to its animation.</p>
  <AssetUpload companion={c} slot="model" label="Your dragon model" accept=".glb" hint="Self-contained GLB · up to 100 MB · embedded textures. Saved on this device. Original materials are preserved."/>
  <AnimationPanel companion={c}/>
  <details className="asset-section palette-details" open={!c.assets.model}><summary>Procedural preview palettes</summary><p>These palettes affect only the placeholder, not an uploaded model.</p>
   {APPEARANCES.map(p => <button key={p.name} className={`option ${c.progress.appearance === p.name ? 'selected' : ''}`} onClick={() => c.setProgress(v => ({ ...v, appearance: p.name }))}><span className="swatch" style={{ '--swatch': p.swatch } as CSSProperties}/>{p.name}{c.progress.appearance === p.name && <Check size={14} className="ml-auto text-primary"/>}</button>)}
  </details>
  {c.assets.model && <button className="panel-submit" onClick={() => c.removeAsset('model')}>Restore procedural preview</button>}
 </>;
}
