import { useEffect, useState } from 'react';
import { z } from 'zod';
import { APPEARANCES } from '@/constants/mythos';
import type { Progress } from '@/types/mythos';
const DEFAULT: Progress = { bond: 68, energy: 82, interactions: 12, appearance: 'Obsidian Flame', environment: 'astral' };
const schema = z.object({ bond: z.number().finite().transform(n => Math.min(100, Math.max(0, n))), energy: z.number().finite().transform(n => Math.min(100, Math.max(0, n))), interactions: z.number().int().nonnegative(), appearance: z.string().refine(n => APPEARANCES.some(p => p.name === n)), environment: z.enum(['astral', 'ember', 'forest']) });
export function useCompanionProgress() {
 const [progress, setProgress] = useState<Progress>(DEFAULT), [ready, setReady] = useState(false);
 useEffect(() => {
  let active = true;
  Promise.resolve().then(() => { const raw = localStorage.getItem('mythos-companion'); if (!raw) return; const parsed = schema.safeParse(JSON.parse(raw)); if (active && parsed.success) setProgress(parsed.data); }).catch(error => console.log('[MYTHOS] Using default companion progress', error)).finally(() => { if (active) setReady(true); });
  return () => { active = false; };
 }, []);
 useEffect(() => { if (ready) Promise.resolve().then(() => localStorage.setItem('mythos-companion', JSON.stringify(progress))).catch(error => console.log('[MYTHOS] Progress save unavailable', error)); }, [progress, ready]);
 return { progress, setProgress };
}
