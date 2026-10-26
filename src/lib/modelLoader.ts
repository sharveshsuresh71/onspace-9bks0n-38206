import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ONE_SHOT_STATES } from '@/constants/creatureClips';
import { findStateClipName, resolveClipName } from '@/lib/creatureClips';
import type { CreatureState } from '@/types/mythos';
import type { AnimationBindings } from '@/types/assets';
export interface LoadedCreature { object: THREE.Group; mixer: THREE.AnimationMixer; clips: THREE.AnimationClip[]; }
function fitAsset(object: THREE.Group, extent: number): THREE.Group {
 object.updateMatrixWorld(true);
 const box = new THREE.Box3().setFromObject(object), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
 if (box.isEmpty()) throw new Error('This GLB does not contain visible geometry.');
 const scale = extent / Math.max(size.x, size.y, size.z, 0.001);
 const positioned = new THREE.Group(); positioned.add(object); positioned.position.set(-center.x, -box.min.y, -center.z);
 const normalized = new THREE.Group(); normalized.add(positioned); normalized.scale.setScalar(scale);
 object.traverse(node => { if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = true; } });
 return normalized;
}
export async function loadCreature(url: string): Promise<LoadedCreature> {
 const gltf = await new GLTFLoader().loadAsync(url);
 const names = new Set<string>();
 const clips = gltf.animations.map((clip, index) => { const base = clip.name || `Animation ${index + 1}`; let name = base, suffix = 2; while (names.has(name)) name = `${base} (${suffix++})`; names.add(name); clip.name = name; return clip; });
 console.log('[MYTHOS] Model clips', clips.map(clip => ({ name: clip.name, duration: clip.duration, tracks: clip.tracks.length })));
 return { object: fitAsset(gltf.scene, 7), mixer: new THREE.AnimationMixer(gltf.scene), clips };
}
export async function loadWorldAsset(url: string): Promise<THREE.Group> {
 const gltf = await new GLTFLoader().loadAsync(url); const group = new THREE.Group(); group.add(fitAsset(gltf.scene, 30)); return group;
}
function isOneShot(model: LoadedCreature, state: CreatureState, bindings: AnimationBindings, name: string) {
 return ONE_SHOT_STATES.includes(state) && (bindings[state] === name || findStateClipName(model.clips.map(clip => clip.name), state) === name);
}
export function getModelStateDuration(model: LoadedCreature, state: CreatureState, bindings: AnimationBindings): number | null {
 const name = resolveClipName(model.clips.map(clip => clip.name), state, bindings);
 const clip = model.clips.find(candidate => candidate.name === name);
 return clip && isOneShot(model, state, bindings, clip.name) ? Math.max(0.2, clip.duration) : null;
}
export function playModelState(model: LoadedCreature, state: CreatureState, previous: THREE.AnimationAction | null, bindings: AnimationBindings = {}, replay = false) {
 const name = resolveClipName(model.clips.map(clip => clip.name), state, bindings), clip = model.clips.find(candidate => candidate.name === name);
 if (!clip) { previous?.fadeOut(0.3); return null; }
 const next = model.mixer.clipAction(clip), oneShot = isOneShot(model, state, bindings, clip.name), loop = oneShot ? THREE.LoopOnce : THREE.LoopRepeat;
 if (next === previous && !replay && next.loop === loop && next.isRunning()) return previous;
 if (previous && previous !== next) previous.fadeOut(0.3);
 next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1); next.setLoop(loop, oneShot ? 1 : Infinity); next.clampWhenFinished = oneShot;
 next.fadeIn(0.3).play(); return next;
}
export function updateModel(model: LoadedCreature, dt: number, current: THREE.AnimationAction | null) {
 model.mixer.update(dt);
 model.clips.forEach(clip => { const action = model.mixer.existingAction(clip); if (action && action !== current && action.isRunning() && action.getEffectiveWeight() < 0.001) action.stop(); });
}
