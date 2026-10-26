import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocalAssets } from '@/hooks/useLocalAssets';
import { useAssetPreferences } from '@/hooks/useAssetPreferences';
import { useCompanionProgress } from '@/hooks/useCompanionProgress';
import { useCreatureAudio } from '@/hooks/useCreatureAudio';
import type { CameraMode, CreatureState, Message, Panel } from '@/types/mythos';
import type { AssetSlot, ModelReport } from '@/types/assets';
export function useCompanion() {
 const { progress, setProgress } = useCompanionProgress(), localAssets = useLocalAssets(), preferences = useAssetPreferences();
 const [state, setState] = useState<CreatureState>('idle'), [camera, setCamera] = useState<CameraMode>('orbit'), [panel, setPanel] = useState<Panel>(null), [muted, setMuted] = useState(true), [commandId, setCommandId] = useState(0);
 const [modelReport, setModelReport] = useState<ModelReport>({ status: 'placeholder', clips: [] });
 const audio = useCreatureAudio(localAssets.assets, muted, preferences.assetPreferences.volume);
 const [messages, setMessages] = useState<Message[]>([{ speaker: 'Caraxes', text: 'You have returned, bondkeeper. The sky is quiet tonight. Shall we explore it together?' }]);
 const uploadAsset = useCallback(async (slot: AssetSlot, file: File) => {
  const success = await localAssets.uploadAsset(slot, file);
  if (success) {
   if (slot === 'model') { preferences.setAssetPreferences(p => ({ ...p, bindings: {} })); setModelReport({ status: 'loading', clips: [] }); }
   if (slot === 'scene' || slot === 'background') preferences.setAssetPreferences(p => ({ ...p, [slot === 'scene' ? 'sceneEnabled' : 'backgroundEnabled']: true }));
   if (['roar', 'breath', 'wings', 'ambient'].includes(slot)) setMuted(false);
  }
  return success;
 }, [localAssets.uploadAsset, preferences.setAssetPreferences]);
 const command = useCallback((action: string): boolean => {
  console.log('[MYTHOS] Command', action);
  const map: Record<string, CreatureState> = { idle: 'idle', fly: 'takeoff', flight: 'fly', land: 'land', return: 'land', follow: 'follow', sleep: 'sleep', wake: 'attention', roar: 'roar', play: 'play', attack: 'attack', glide: 'glide', walk: 'walk', run: 'run', attention: 'attention', feed: 'attention' };
  if (!map[action]) { toast.info('Try fly, land, follow, feed, play, sleep, wake, roar, or attack.'); return false; }
  if (['fly', 'flight', 'run', 'attack', 'glide'].includes(action) && progress.energy < 10) { toast.error('Caraxes needs energy. Offer food or let him rest.'); return false; }
  const responses: Record<string, string> = { idle: 'Caraxes settles into an idle stance.', fly: 'Caraxes unfolds his wings and takes to the sanctuary skies.', flight: 'Caraxes circles the sanctuary.', land: 'Caraxes descends to his resting place.', return: 'Caraxes returns to the sanctuary.', follow: 'Caraxes follows a gentle path around you.', sleep: 'Caraxes settles into a peaceful sleep.', wake: 'Caraxes awakens at the sound of your voice.', roar: 'A resonant call echoes through the sanctuary.', play: 'Caraxes sways his tail, delighted by your attention.', attack: 'Caraxes performs the safe attack demonstration.', glide: 'Caraxes spreads his wings and glides overhead.', walk: 'Caraxes begins a slow sanctuary patrol.', run: 'Caraxes breaks into a swift patrol.', attention: 'Caraxes turns his attention toward you.', feed: 'Caraxes accepts your offering. Energy +15 · Bond +3' };
  setState(map[action]); setCommandId(id => id + 1);
  setProgress(p => ({ ...p, interactions: p.interactions + 1, bond: Math.min(100, p.bond + (action === 'feed' ? 3 : 1)), energy: action === 'feed' ? Math.min(100, p.energy + 15) : Math.max(0, p.energy - (['fly', 'flight', 'run', 'attack', 'glide'].includes(action) ? 8 : 0)) }));
  toast.success(responses[action]); audio.playCue(action); return true;
 }, [progress.energy, setProgress, audio.playCue]);
 useEffect(() => { if (state !== 'sleep') return; const id = setInterval(() => setProgress(p => ({ ...p, energy: Math.min(100, p.energy + 2) })), 5000); return () => clearInterval(id); }, [state, setProgress]);
 const talk = useCallback((text: string) => {
  const input = text.trim(); if (!input) return; const lower = input.toLowerCase();
  const rules: [RegExp, string][] = [[/\b(land|come back|return)\b/, 'land'], [/\bglide\b/, 'glide'], [/\b(fly|take off|circle|hover)\b/, 'fly'], [/\bfollow\b/, 'follow'], [/\b(sleep|rest)\b/, 'sleep'], [/\bwake\b/, 'wake'], [/\b(feed|eat|food)\b/, 'feed'], [/\broar\b/, 'roar'], [/\bplay\b/, 'play'], [/\b(attack|fire|breath)\b/, 'attack'], [/\brun\b/, 'run'], [/\bwalk\b/, 'walk'], [/\b(stop|idle)\b/, 'idle']];
  const action = rules.find(([re]) => re.test(lower))?.[1], accepted = action ? command(action) : false;
  const answer = action ? !accepted ? 'I need to restore my energy. Offer me food or let me rest, bondkeeper.' : action === 'feed' ? 'Your offering restores my strength.' : action === 'sleep' ? 'I will rest beneath these ancient stars.' : 'I hear you, bondkeeper. Watch closely. We move as one.' : lower.includes('name') ? 'I am Caraxes, the Obsidian Flame. A name carried through ages, now bound to you.' : lower.includes('love') || lower.includes('friend') ? 'A dragon does not give its trust lightly. Yet with you, I have found a sanctuary.' : 'The winds carry your words to me. Ask me to fly, follow, play, roar, or rest. Our bond grows with every moment together.';
  setMessages(m => [...m, { speaker: 'You' as const, text: input }, { speaker: 'Caraxes' as const, text: answer }].slice(-30));
  if (!muted && 'speechSynthesis' in window) { speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(answer); utterance.rate = 0.83; utterance.pitch = 0.65; utterance.volume = preferences.assetPreferences.volume; speechSynthesis.speak(utterance); }
 }, [command, muted, preferences.assetPreferences.volume]);
 const cycleCamera = useCallback(() => setCamera(c => c === 'orbit' ? 'follow' : c === 'follow' ? 'cinematic' : 'orbit'), []);
 useEffect(() => {
  const handler = (e: KeyboardEvent) => {
   if (e.key === 'Escape') { setPanel(null); return; }
   if ((e.target instanceof HTMLElement && e.target.closest('input,textarea,select,button,a,[contenteditable="true"]')) || e.repeat || e.ctrlKey || e.metaKey) return;
   const k = e.key.toLowerCase(); if (e.code === 'Space') { e.preventDefault(); command(['fly', 'glide', 'takeoff'].includes(state) ? 'land' : 'fly'); }
   if (k === 'c') cycleCamera(); if (k === 'f') command('follow'); if (k === 'r') command('return'); if (k === 'escape') setPanel(null);
  };
  window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
 }, [command, cycleCamera, state]);
 return { progress, setProgress, state, setState, camera, setCamera, panel, setPanel, muted, setMuted, messages, talk, command, cycleCamera, commandId, modelReport, setModelReport, modelUrl: localAssets.assets.model?.url || null, ...localAssets, ...preferences, ...audio, uploadAsset };
}
export type Companion = ReturnType<typeof useCompanion>;
