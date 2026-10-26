import { useEffect, useState } from 'react';
import { z } from 'zod';
import type { AssetPreferences } from '@/types/assets';
const defaults: AssetPreferences = { bindings: {}, modelYaw: 0, backgroundMode: 'image', backgroundEnabled: true, sceneEnabled: true, sceneScale: 1, volume: 0.65 };
const schema = z.object({ bindings: z.record(z.string()).default({}), modelYaw: z.number().min(0).max(360).default(0), backgroundMode: z.enum(['image', 'panorama']).default('image'), backgroundEnabled: z.boolean().default(true), sceneEnabled: z.boolean().default(true), sceneScale: z.number().min(0.5).max(2).default(1), volume: z.number().min(0).max(1).default(0.65) });
export function useAssetPreferences() {
 const [assetPreferences, setAssetPreferences] = useState<AssetPreferences>(defaults), [ready, setReady] = useState(false);
 useEffect(() => {
  let active = true;
  Promise.resolve().then(() => {
   const raw = localStorage.getItem('mythos-asset-preferences');
   if (raw) { const result = schema.safeParse(JSON.parse(raw)); if (active && result.success) setAssetPreferences(result.data); }
  }).catch(error => console.log('[MYTHOS] Using default asset preferences', error)).finally(() => { if (active) setReady(true); });
  return () => { active = false; };
 }, []);
 useEffect(() => { if (ready) Promise.resolve().then(() => localStorage.setItem('mythos-asset-preferences', JSON.stringify(assetPreferences))).catch(error => console.log('[MYTHOS] Preference save unavailable', error)); }, [assetPreferences, ready]);
 return { assetPreferences, setAssetPreferences };
}
