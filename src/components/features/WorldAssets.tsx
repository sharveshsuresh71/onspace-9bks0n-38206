import { Image, Layers3 } from 'lucide-react';
import AssetUpload from '@/components/features/AssetUpload';
import type { Companion } from '@/hooks/useCompanion';
interface Props { companion: Companion; }
export default function WorldAssets({ companion: c }: Props) {
 const p = c.assetPreferences;
 return <section className="asset-section" aria-labelledby="custom-world-title">
  <div className="asset-section-heading"><Layers3 size={18}/><h3 id="custom-world-title">Your world. Your sanctuary.</h3></div>
  <p>Upload a background image, a complete 3D scene, or both. Files stay on this device and return with you.</p>
  <AssetUpload companion={c} slot="background" label="Scene background" accept=".jpg,.jpeg,.png,.webp" hint="JPG, PNG, WebP · up to 20 MB. Use a 2:1 equirectangular image for a 360° sky."/>
  {c.assets.background && <><label className="asset-check"><input type="checkbox" checked={p.backgroundEnabled} onChange={e => c.setAssetPreferences(v => ({ ...v, backgroundEnabled: e.target.checked }))}/>Use uploaded background</label>
   <label htmlFor="background-mode">Background view</label><select id="background-mode" value={p.backgroundMode} onChange={e => c.setAssetPreferences(v => ({ ...v, backgroundMode: e.target.value as 'image' | 'panorama' }))}><option value="image">Image backdrop · fixed</option><option value="panorama">360° sky · orbit with camera</option></select></>}
  <AssetUpload companion={c} slot="scene" label="3D environment scene" accept=".glb" hint="Self-contained GLB · up to 150 MB · embedded textures. Replaces built-in terrain, not your dragon."/>
  {c.assets.scene && <><label className="asset-check"><input type="checkbox" checked={p.sceneEnabled} onChange={e => c.setAssetPreferences(v => ({ ...v, sceneEnabled: e.target.checked }))}/>Use uploaded 3D environment</label>
   <label htmlFor="scene-scale">Scene scale <span className="text-primary">{p.sceneScale.toFixed(2)}×</span></label><input id="scene-scale" type="range" min="0.5" max="2" step="0.05" value={p.sceneScale} onChange={e => c.setAssetPreferences(v => ({ ...v, sceneScale: Number(e.target.value) }))}/>
   <small className="asset-hint">Scene is centered and grounded automatically. Floor is y=0; movement stays within ±5 world units. Custom terrain collision is not enabled.</small></>}
  <div className="asset-notice"><Image size={16}/><span>Presets below restore the built-in world without deleting your uploaded files.</span></div>
 </section>;
}
