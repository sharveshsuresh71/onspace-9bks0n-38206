import type { CreatureState } from '@/types/mythos';
export const CLIP_ALIASES: Record<CreatureState, string[]> = {
 idle: ['idle', 'stand', 'breathing'], attention: ['attention', 'look', 'alert'],
 follow: ['walk', 'walking', 'locomotion'], walk: ['walk', 'walking', 'locomotion'], run: ['run', 'running', 'sprint'],
 takeoff: ['takeoff', 'launch', 'flystart', 'flightstart'], fly: ['fly', 'flying', 'flight', 'wingbeat'],
 glide: ['glide', 'gliding', 'hover', 'flight', 'fly'], land: ['landing', 'land', 'flyend', 'flightend'],
 sleep: ['sleep', 'sleeping', 'rest', 'liedown'], play: ['play', 'happy', 'dance'],
 roar: ['roar', 'howl', 'scream'], attack: ['attack', 'firebreath', 'breath', 'bite', 'fire']
};
export const CLIP_COMMANDS: { state: CreatureState; label: string; command: string }[] = [
 { state: 'idle', label: 'Idle', command: 'idle' }, { state: 'attention', label: 'Attention', command: 'attention' },
 { state: 'walk', label: 'Walk', command: 'walk' }, { state: 'run', label: 'Run', command: 'run' },
 { state: 'follow', label: 'Follow', command: 'follow' }, { state: 'takeoff', label: 'Takeoff', command: 'fly' },
 { state: 'fly', label: 'Flight', command: 'flight' }, { state: 'glide', label: 'Glide', command: 'glide' },
 { state: 'land', label: 'Landing', command: 'land' }, { state: 'sleep', label: 'Sleep', command: 'sleep' },
 { state: 'play', label: 'Play', command: 'play' }, { state: 'roar', label: 'Roar', command: 'roar' },
 { state: 'attack', label: 'Breath / attack', command: 'attack' }
];
export const ONE_SHOT_STATES: CreatureState[] = ['attention', 'takeoff', 'land', 'roar', 'play', 'attack'];
