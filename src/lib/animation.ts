import * as THREE from 'three';
import type { DragonRig } from '@/lib/dragon';
import type { CreatureState } from '@/types/mythos';
export class DragonController {
 state: CreatureState = 'idle'; elapsed = 0; time = 0; altitude = 0; phase = 0; turn = 0;
 root: THREE.Group; rig: DragonRig; keys = new Set<string>(); actionDuration: number | null = null; manualMovement = false;
 constructor(rig: DragonRig) { this.rig = rig; this.root = rig.root; }
 setState(state: CreatureState, replay = false) { if (state === this.state && !replay) return; this.state = state; this.elapsed = 0; this.actionDuration = null; console.log('[MYTHOS] Creature transition', state); }
 private orient(direction: THREE.Vector3, dt: number) {
  if (direction.lengthSq() < 0.0001) return;
  const target = Math.atan2(direction.z, -direction.x), delta = Math.atan2(Math.sin(target - this.turn), Math.cos(target - this.turn));
  this.turn += delta * (1 - Math.exp(-dt * 3));
 }
 update(dt: number) {
  this.elapsed += dt; this.time += dt;
  const t = this.time, r = this.rig, s = this.state, blend = 1 - Math.exp(-dt * 5), flight = ['takeoff', 'fly', 'glide'].includes(s);
  const duration = this.actionDuration;
  if (s === 'takeoff' && this.elapsed > (duration ?? 1.5)) this.setState('fly');
  if (s === 'land' && this.altitude < 0.1 && this.elapsed > (duration ?? 1.2)) this.setState('idle');
  if (['roar', 'play', 'attack', 'attention'].includes(s) && this.elapsed > (duration ?? 4)) this.setState('idle');
  this.altitude = THREE.MathUtils.lerp(this.altitude, flight ? 4.8 : 0, 1 - Math.exp(-dt * 1.5));
  const before = this.root.position.clone(), manual = ['w', 'a', 's', 'd'].some(key => this.keys.has(key));
  if (manual) {
   const direction = new THREE.Vector3(Number(this.keys.has('d')) - Number(this.keys.has('a')), 0, Number(this.keys.has('s')) - Number(this.keys.has('w'))).normalize();
   this.root.position.addScaledVector(direction, dt * (this.keys.has('shift') ? 5 : 2.8)); this.orient(direction, dt);
  } else if (flight) {
   this.phase += dt * (s === 'glide' ? 0.16 : 0.23);
   const radius = s === 'takeoff' ? Math.min(this.elapsed * 2, 4) : 4;
   const target = new THREE.Vector3(Math.sin(this.phase) * radius, this.root.position.y, Math.cos(this.phase) * radius);
   this.root.position.lerp(target, 1 - Math.exp(-dt * 0.9)); this.orient(this.root.position.clone().sub(before), dt);
  } else if (['walk', 'run', 'follow'].includes(s)) {
   this.phase += dt * (s === 'run' ? 0.7 : 0.3);
   this.root.position.lerp(new THREE.Vector3(Math.sin(this.phase) * 3, this.root.position.y, Math.cos(this.phase) * 2 - 1), 1 - Math.exp(-dt));
   this.orient(this.root.position.clone().sub(before), dt);
  } else if (!this.manualMovement || s === 'land') {
   this.root.position.x = THREE.MathUtils.lerp(this.root.position.x, 0, 1 - Math.exp(-dt * 0.7));
   this.root.position.z = THREE.MathUtils.lerp(this.root.position.z, 0, 1 - Math.exp(-dt * 0.7));
   this.turn = THREE.MathUtils.lerp(this.turn, 0, 1 - Math.exp(-dt * 0.8));
  }
  this.root.position.x = THREE.MathUtils.clamp(this.root.position.x, -5, 5); this.root.position.z = THREE.MathUtils.clamp(this.root.position.z, -5, 5);
  this.root.position.y = this.altitude; this.root.rotation.y = this.turn; this.root.rotation.z = THREE.MathUtils.lerp(this.root.rotation.z, flight ? Math.sin(this.phase) * 0.12 : 0, blend);
  const sleep = s === 'sleep'; r.body.position.y = THREE.MathUtils.lerp(r.body.position.y, (sleep ? 1.4 : 1.8) + Math.sin(t * (sleep ? 0.8 : 1.6)) * 0.045, blend); r.body.scale.y = 1 + Math.sin(t * 1.6) * 0.014;
  r.head.rotation.z = THREE.MathUtils.lerp(r.head.rotation.z, sleep ? 0.4 : s === 'roar' || s === 'attack' ? 0.32 : s === 'attention' ? -0.12 : Math.sin(t * 0.6) * 0.025, blend);
  r.head.rotation.y = THREE.MathUtils.lerp(r.head.rotation.y, s === 'play' ? Math.sin(t * 3) * 0.2 : Math.sin(t * 0.7) * 0.04, blend);
  r.jaw.rotation.z = THREE.MathUtils.lerp(r.jaw.rotation.z, s === 'roar' || s === 'attack' ? -0.4 : 0, blend); r.tail.rotation.y = Math.sin(t * (s === 'play' ? 2 : 0.8)) * (flight ? 0.18 : 0.12);
  r.wings.forEach((wing, i) => { const side = i === 0 ? -1 : 1, target = flight ? (s === 'glide' ? 0.03 : Math.sin(t * 4) * 0.42) * side : (sleep ? 0.55 : 0.15 + Math.sin(t * 0.9) * 0.025) * side; wing.rotation.x = THREE.MathUtils.lerp(wing.rotation.x, target, blend); });
  r.legs.forEach((leg, i) => { leg.rotation.z = THREE.MathUtils.lerp(leg.rotation.z, flight ? 0.4 : ['walk', 'run', 'follow'].includes(s) ? Math.sin(t * (s === 'run' ? 9 : 5) + i * Math.PI) * 0.3 : 0, blend); });
  const blink = sleep ? 0.05 : t % 5 < 0.12 ? 0.08 : 1; r.eyes.forEach(eye => { eye.scale.y = THREE.MathUtils.lerp(eye.scale.y, 0.1 * blink, blend); });
 }
}
