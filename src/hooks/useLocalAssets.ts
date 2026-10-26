import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { readAssets, storeAsset } from '@/lib/assetStorage';
import { validateAsset } from '@/lib/assetValidation';
import type { AssetSlot, LocalAssets } from '@/types/assets';
export function useLocalAssets() {
 const [assets, setAssets] = useState<LocalAssets>({}), [assetsReady, setReady] = useState(false);
 const current = useRef<LocalAssets>({});
 useEffect(() => {
  let active = true;
  readAssets().then(records => {
   if (!active) return;
   const restored: LocalAssets = {};
   records.forEach(({ slot, file }) => { if (file instanceof Blob) restored[slot] = { url: URL.createObjectURL(file), name: file.name || 'Saved asset', size: file.size }; });
   current.current = restored; setAssets(restored);
  }).catch(error => { console.log('[MYTHOS] Asset restore unavailable', error); if (active) toast.info('Local asset storage is unavailable. Uploads will work for this session.'); }).finally(() => { if (active) setReady(true); });
  return () => { active = false; Object.values(current.current).forEach(asset => URL.revokeObjectURL(asset.url)); current.current = {}; };
 }, []);
 const uploadAsset = useCallback(async (slot: AssetSlot, file: File): Promise<boolean> => {
  return validateAsset(slot, file).then(() => {
   const previous = current.current[slot];
   const next = { ...current.current, [slot]: { url: URL.createObjectURL(file), name: file.name, size: file.size } };
   current.current = next; setAssets(next); if (previous) URL.revokeObjectURL(previous.url);
   console.log('[MYTHOS] Local asset selected', slot, file.name);
   void storeAsset(slot, file).then(() => toast.success(`${file.name} saved on this device.`)).catch(error => { console.log('[MYTHOS] Asset save failure', error); toast.warning('Upload is available for this session, but could not be saved. Free browser storage and upload again.'); });
   return true;
  }).catch(error => { toast.error(error instanceof Error ? error.message : 'Could not read this file. Choose another file.'); return false; });
 }, []);
 const removeAsset = useCallback((slot: AssetSlot) => {
  const previous = current.current[slot]; const next = { ...current.current }; delete next[slot];
  current.current = next; setAssets(next); if (previous) { URL.revokeObjectURL(previous.url); toast.success(`${previous.name} removed from the sanctuary.`); }
  void storeAsset(slot, null).catch(() => toast.error('Could not remove the saved file. Browser storage may be unavailable.'));
 }, []);
 return { assets, assetsReady, uploadAsset, removeAsset };
}
