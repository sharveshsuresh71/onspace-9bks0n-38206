import { CLIP_ALIASES } from '@/constants/creatureClips';
import type { CreatureState } from '@/types/mythos';
import type { AnimationBindings } from '@/types/assets';
const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
function match(names: string[], state: CreatureState) {
 for (const alias of CLIP_ALIASES[state]) {
  const exact = names.find(name => normalize(name) === normalize(alias));
  if (exact) return exact;
  const partial = names.find(name => normalize(name).includes(normalize(alias)));
  if (partial) return partial;
 }
 return null;
}
export function findStateClipName(names: string[], state: CreatureState): string | null { return match(names, state); }
export function resolveClipName(names: string[], state: CreatureState, bindings: AnimationBindings): string | null {
 const chosen = bindings[state];
 if (chosen === '__none__') return null;
 if (chosen && names.includes(chosen)) return chosen;
 const matched = match(names, state);
 if (matched) return matched;
 if (state === 'takeoff') return match(names, 'fly') || match(names, 'idle');
 if (state === 'run' || state === 'follow') return match(names, 'walk') || match(names, 'idle');
 return match(names, 'idle');
}
