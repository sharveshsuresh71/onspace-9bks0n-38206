import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { toast } from 'sonner';
import { createDragon, recolorDragon } from '@/lib/dragon';
import { createEnvironment, disposeGroup } from '@/lib/environment';
import { DragonController } from '@/lib/animation';
import { SanctuaryAssetController } from '@/lib/sanctuaryAssetController';
import { WORLD_COLORS } from '@/constants/mythos';
import type { CreatureState, WorldControl } from '@/types/mythos';
import type { ModelReport } from '@/types/assets';
export function useSanctuaryScene(control: WorldControl, onState: (state: CreatureState) => void, onModelReport: (report: ModelReport) => void) {
 const host = useRef<HTMLDivElement>(null), latest = useRef(control), notify = useRef(onState), report = useRef(onModelReport);
 latest.current = control; notify.current = onState; report.current = onModelReport;
 useEffect(() => {
  if (!host.current) return;
  const container = host.current, scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.4; container.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160), mobile = container.clientWidth < 640;
  camera.position.set(mobile ? 14 : 12, mobile ? 10 : 7.5, mobile ? 24 : 18);
  const orbit = new OrbitControls(camera, renderer.domElement); orbit.enableDamping = true; orbit.dampingFactor = 0.06; orbit.minDistance = 8; orbit.maxDistance = 36; orbit.minPolarAngle = 0.2; orbit.maxPolarAngle = Math.PI * 0.49; orbit.target.set(mobile ? 0 : -2.8, mobile ? 2.8 : 2.4, 0); orbit.enablePan = false;
  scene.add(new THREE.HemisphereLight('#a4c2ce', '#17261f', 2.5));
  const sun = new THREE.DirectionalLight('#d2e8ec', 4.5); sun.position.set(-8, 15, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, far: 50 }); sun.shadow.bias = -0.001; scene.add(sun);
  const rim = new THREE.DirectionalLight('#79f5c4', 4); rim.position.set(6, 6, -7); scene.add(rim);
  const fill = new THREE.PointLight('#d3482e', 18, 20); fill.position.set(-4, 3, 5); scene.add(fill);
  const rig = createDragon(); scene.add(rig.root); const dragon = new DragonController(rig);
  const assets = new SanctuaryAssetController(scene, rig, value => report.current(value));
  let world = createEnvironment(latest.current.environment); scene.add(world.group);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.75, 4, 12), new THREE.MeshBasicMaterial({ color: '#ff9b42', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  flame.position.set(-3.3, -0.1, 0); flame.rotation.z = Math.PI / 2; rig.head.add(flame); flame.visible = false;
  let environment = '', appearance = '', requestedState: CreatureState | '' = '', revision = -1, mode = '', frame = 0, disposed = false;
  const clock = new THREE.Clock();
  const resize = () => { const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); };
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  const typing = (event: KeyboardEvent) => event.target instanceof HTMLElement && !!event.target.closest('input,textarea,select,button,a,[contenteditable="true"]');
  const keydown = (event: KeyboardEvent) => {
   if (typing(event) || event.ctrlKey || event.metaKey) return;
   const key = event.key.toLowerCase();
   if (['w', 'a', 's', 'd', 'shift'].includes(key)) {
    dragon.keys.add(key); if (['w', 'a', 's', 'd'].some(k => dragon.keys.has(k))) { dragon.manualMovement = true; if (!['takeoff', 'fly', 'glide'].includes(dragon.state)) notify.current(dragon.keys.has('shift') ? 'run' : 'walk'); }
   }
   if (event.code === 'Space') event.preventDefault();
  };
  const keyup = (event: KeyboardEvent) => {
   dragon.keys.delete(event.key.toLowerCase());
   if (dragon.manualMovement && ['walk', 'run'].includes(dragon.state)) notify.current(['w', 'a', 's', 'd'].some(k => dragon.keys.has(k)) ? dragon.keys.has('shift') ? 'run' : 'walk' : 'idle');
  };
  const blur = () => { dragon.keys.clear(); if (dragon.manualMovement && ['walk', 'run'].includes(dragon.state)) notify.current('idle'); };
  window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', blur);
  function animate() {
   if (disposed) return; frame = requestAnimationFrame(animate); const dt = Math.min(clock.getDelta(), 0.05), config = latest.current;
   if (environment !== config.environment) {
    scene.remove(world.group); disposeGroup(world.group); world = createEnvironment(config.environment); scene.add(world.group); environment = config.environment;
    scene.fog = new THREE.FogExp2(WORLD_COLORS[config.environment].fog, 0.021); rim.color.set(WORLD_COLORS[config.environment].glow);
   }
   if (appearance !== config.appearance) { recolorDragon(rig, config.appearance); appearance = config.appearance; }
   if (requestedState !== config.state || revision !== config.commandId) { if (revision !== config.commandId) dragon.manualMovement = false; dragon.setState(config.state, revision !== config.commandId); requestedState = config.state; revision = config.commandId; }
   const prior = dragon.state; dragon.update(dt); if (prior !== dragon.state) notify.current(dragon.state);
   assets.update(config, dragon, dt);
   world.group.children.forEach(object => { object.visible = !assets.hasCustomScene || object === world.particles || object === world.glow; });
   if (scene.fog instanceof THREE.FogExp2) scene.fog.density = assets.hasCustomScene ? 0.01 : 0.021;
   flame.visible = dragon.state === 'attack' && !assets.hasModel; flame.scale.setScalar(0.8 + Math.sin(dragon.time * 30) * 0.12);
   world.particles.rotation.y += dt * 0.015; world.particles.position.y = Math.sin(dragon.time * 0.15) * 0.3;
   if (mode !== config.camera) { const announce = mode !== ''; mode = config.camera; orbit.enabled = mode !== 'follow'; if (announce) toast.info(`${mode.charAt(0).toUpperCase() + mode.slice(1)} camera`); }
   orbit.autoRotate = mode === 'cinematic'; orbit.autoRotateSpeed = 0.45;
   if (mode === 'follow') { const target = rig.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)); orbit.target.lerp(target, 1 - Math.exp(-dt * 3)); camera.position.lerp(target.clone().add(new THREE.Vector3(10, 5, 13)), 1 - Math.exp(-dt * 2)); camera.lookAt(orbit.target); } else orbit.update();
   renderer.render(scene, camera);
  }
  animate();
  return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur); assets.dispose(); orbit.dispose(); disposeGroup(scene); renderer.dispose(); renderer.domElement.remove(); };
 }, []);
 return host;
}
