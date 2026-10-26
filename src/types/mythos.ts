import type { AssetSceneControl } from '@/types/assets';
export type Environment = 'astral' | 'ember' | 'forest';
export type CreatureState = 'idle' | 'attention' | 'follow' | 'walk' | 'run' | 'takeoff' | 'fly' | 'glide' | 'land' | 'sleep' | 'play' | 'roar' | 'attack';
export type CameraMode = 'orbit' | 'follow' | 'cinematic';
export type Panel = 'appearance' | 'world' | 'chat' | 'help' | 'journal' | 'sound' | null;
export interface Progress { bond: number; energy: number; interactions: number; appearance: string; environment: Environment; }
export interface Message { speaker: 'You' | 'Caraxes'; text: string; }
export interface WorldControl extends AssetSceneControl { state: CreatureState; camera: CameraMode; environment: Environment; appearance: string; modelUrl: string | null; muted: boolean; }
