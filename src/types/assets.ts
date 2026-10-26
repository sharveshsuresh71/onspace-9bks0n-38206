import type { CreatureState } from '@/types/mythos';
export type AssetSlot = 'model' | 'background' | 'scene' | 'roar' | 'breath' | 'wings' | 'ambient';
export type SoundSlot = 'roar' | 'breath' | 'wings' | 'ambient';
export interface LocalAsset { url: string; name: string; size: number; }
export type LocalAssets = Partial<Record<AssetSlot, LocalAsset>>;
export type AnimationBindings = Partial<Record<CreatureState, string>>;
export interface ModelReport { status: 'placeholder' | 'loading' | 'ready' | 'error'; clips: string[]; }
export interface AssetPreferences {
 bindings: AnimationBindings; modelYaw: number; backgroundMode: 'image' | 'panorama';
 backgroundEnabled: boolean; sceneEnabled: boolean; sceneScale: number; volume: number;
}
export interface AssetSceneControl {
 backgroundUrl: string | null; sceneUrl: string | null; sceneScale: number;
 backgroundMode: 'image' | 'panorama'; modelYaw: number; bindings: AnimationBindings; commandId: number;
}
