import { Check, Mountain } from 'lucide-react';
import { WORLDS } from '@/constants/mythos';
import WorldAssets from '@/components/features/WorldAssets';
import type { Companion } from '@/hooks/useCompanion';
interface Props { companion: Companion; }
export default function WorldPanel({ companion: c }: Props) {
 const custom = !!((c.assets.scene && c.assetPreferences.sceneEnabled) || (c.assets.background && c.assetPreferences.backgroundEnabled));
 return <><WorldAssets companion={c}/><section className="asset-section" aria-labelledby="realm-presets-title"><h3 id="realm-presets-title">Sanctuary presets</h3><p>Return to a built-in realm with its own terrain, lighting, fog, and ambient particles.</p>
  {WORLDS.map(w => <button className={`option ${!custom && c.progress.environment === w.id ? 'selected' : ''}`} key={w.id} onClick={() => { c.setProgress(p => ({ ...p, environment: w.id })); c.setAssetPreferences(p => ({ ...p, backgroundEnabled: false, sceneEnabled: false })); }}><Mountain size={20} className="text-primary"/><span><strong className="realm-name">{w.name}</strong><span className="asset-hint">{w.description}</span></span>{!custom && c.progress.environment === w.id && <Check size={15} className="ml-auto text-primary"/>}</button>)}
 </section></>;
}
