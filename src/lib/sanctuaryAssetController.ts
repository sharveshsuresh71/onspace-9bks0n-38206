import * as THREE from 'three';
import { toast } from 'sonner';
import { loadCreature, loadWorldAsset, playModelState, updateModel, getModelStateDuration, type LoadedCreature } from '@/lib/modelLoader';
import { disposeGroup } from '@/lib/environment';
import type { DragonRig } from '@/lib/dragon';
import type { DragonController } from '@/lib/animation';
import type { WorldControl } from '@/types/mythos';
import type { AnimationBindings, ModelReport } from '@/types/assets';
export class SanctuaryAssetController {
 private model: LoadedCreature | null = null; private action: THREE.AnimationAction | null = null;
 private customScene: THREE.Group | null = null; private texture: THREE.Texture | null = null;
 private modelUrl: string | null | undefined; private sceneUrl: string | null | undefined; private backgroundUrl: string | null | undefined;
 private modelTicket = 0; private sceneTicket = 0; private textureTicket = 0; private disposed = false;
 private state = ''; private revision = -1; private bindings: AnimationBindings | null = null;
 constructor(private scene: THREE.Scene, private rig: DragonRig, private report: (report: ModelReport) => void) {}
 get hasModel() { return this.model !== null; }
 get hasCustomScene() { return this.customScene !== null; }
 update(config: WorldControl, dragon: DragonController, dt: number) {
  if (this.modelUrl !== config.modelUrl) { this.modelUrl = config.modelUrl; this.replaceModel(config.modelUrl); }
  if (this.sceneUrl !== config.sceneUrl) { this.sceneUrl = config.sceneUrl; this.replaceScene(config.sceneUrl); }
  const skyUrl = config.backgroundMode === 'panorama' ? config.backgroundUrl : null;
  if (this.backgroundUrl !== skyUrl) { this.backgroundUrl = skyUrl; this.replaceBackground(skyUrl); }
  this.scene.background = config.backgroundMode === 'panorama' ? this.texture : null;
  this.scene.environment = config.backgroundMode === 'panorama' ? this.texture : null;
  if (this.customScene) this.customScene.scale.setScalar(config.sceneScale);
  if (!this.model) return;
  this.model.object.rotation.y = THREE.MathUtils.degToRad(config.modelYaw);
  if (this.state !== dragon.state || this.revision !== config.commandId || this.bindings !== config.bindings) {
   this.action = playModelState(this.model, dragon.state, this.action, config.bindings, this.revision !== config.commandId);
   dragon.actionDuration = getModelStateDuration(this.model, dragon.state, config.bindings);
   this.state = dragon.state; this.revision = config.commandId; this.bindings = config.bindings;
  }
  updateModel(this.model, dt, this.action);
  this.model.object.position.y = this.action ? 0 : Math.sin(dragon.time * (dragon.state === 'sleep' ? 0.7 : 1.5)) * 0.025;
 }
 private releaseModel() {
  if (this.model) { this.model.mixer.stopAllAction(); this.model.mixer.uncacheRoot(this.model.mixer.getRoot()); this.rig.root.remove(this.model.object); disposeGroup(this.model.object); }
  this.model = null; this.action = null; this.state = ''; this.rig.body.visible = true;
 }
 private replaceModel(url: string | null) {
  const ticket = ++this.modelTicket; this.releaseModel(); this.report({ status: url ? 'loading' : 'placeholder', clips: [] });
  if (!url) return;
  void loadCreature(url).then(model => {
   if (this.disposed || ticket !== this.modelTicket) { model.mixer.stopAllAction(); disposeGroup(model.object); return; }
   this.model = model; this.rig.body.visible = false; this.rig.root.add(model.object); this.state = ''; this.revision = -1;
   this.report({ status: 'ready', clips: model.clips.map(clip => clip.name) });
   toast.success(model.clips.length ? `Dragon ready · ${model.clips.length} clips. Map commands in Creature atelier.` : 'Dragon ready. No clips found; world movement remains available.');
  }).catch(error => { if (!this.disposed && ticket === this.modelTicket) { console.log('[MYTHOS] Model load failure', error); this.report({ status: 'error', clips: [] }); toast.error('Could not load this dragon. Re-export a self-contained GLB; the preview remains available.'); } });
 }
 private replaceScene(url: string | null) {
  const ticket = ++this.sceneTicket;
  if (this.customScene) { this.scene.remove(this.customScene); disposeGroup(this.customScene); this.customScene = null; }
  if (!url) return;
  toast.info('Loading your sanctuary scene…');
  void loadWorldAsset(url).then(group => {
   if (this.disposed || ticket !== this.sceneTicket) { disposeGroup(group); return; }
   this.customScene = group; this.scene.add(group); toast.success('Custom scene ready. Terrain replaced; sanctuary movement bounds remain active.');
  }).catch(error => { if (!this.disposed && ticket === this.sceneTicket) { console.log('[MYTHOS] Scene load failure', error); toast.error('Could not load this scene. Re-export it as a GLB with embedded textures.'); } });
 }
 private replaceBackground(url: string | null) {
  const ticket = ++this.textureTicket; this.texture?.dispose(); this.texture = null;
  if (!url) return;
  new THREE.TextureLoader().load(url, texture => {
   if (this.disposed || ticket !== this.textureTicket) { texture.dispose(); return; }
   texture.colorSpace = THREE.SRGBColorSpace; texture.mapping = THREE.EquirectangularReflectionMapping; this.texture = texture;
  }, undefined, error => { if (!this.disposed && ticket === this.textureTicket) { console.log('[MYTHOS] Panorama load failure', error); toast.error('Could not load the background into 3D. Use a JPG, PNG, or WebP image.'); } });
 }
 dispose() {
  this.disposed = true; this.modelTicket++; this.sceneTicket++; this.textureTicket++; this.releaseModel();
  if (this.customScene) { this.scene.remove(this.customScene); disposeGroup(this.customScene); }
  this.scene.background = null; this.scene.environment = null; this.texture?.dispose();
 }
}
