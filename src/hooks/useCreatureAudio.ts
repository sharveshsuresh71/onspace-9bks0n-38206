import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { playMagic } from '@/lib/audio';
import type { LocalAssets, SoundSlot } from '@/types/assets';
export function useCreatureAudio(assets: LocalAssets, muted: boolean, volume: number) {
 const settings = useRef({ assets, muted, volume }); settings.current = { assets, muted, volume };
 const cue = useRef<HTMLAudioElement | null>(null), ambient = useRef<HTMLAudioElement | null>(null);
 const [ambientPlaying, setAmbientPlaying] = useState(false);
 const playSound = useCallback((slot: SoundSlot, preview = false) => {
  const config = settings.current; if (config.muted && !preview) return;
  const asset = config.assets[slot]; if (!asset) return;
  cue.current?.pause(); const audio = new Audio(asset.url); cue.current = audio; audio.volume = config.volume;
  audio.onerror = () => { if (cue.current === audio) toast.error('This sound could not be decoded. Upload an MP3 or WAV supported by your browser.'); };
  void audio.play().catch(error => { if (cue.current === audio) { console.log('[MYTHOS] Sound playback unavailable', error); toast.error('Sound could not play. Use a supported recording and click Preview to enable browser audio.'); } });
 }, []);
 const playCue = useCallback((action: string) => {
  const slot: SoundSlot | null = action === 'roar' ? 'roar' : action === 'attack' ? 'breath' : ['fly', 'flight', 'glide', 'land', 'return'].includes(action) ? 'wings' : null;
  if (slot && settings.current.assets[slot]) playSound(slot);
  else { cue.current?.pause(); playMagic(settings.current.muted, action === 'roar', settings.current.volume); }
 }, [playSound]);
 const toggleAmbient = useCallback(() => {
  if (ambient.current && !ambient.current.paused) { ambient.current.pause(); setAmbientPlaying(false); return; }
  const asset = settings.current.assets.ambient; if (!asset) return;
  const audio = ambient.current || new Audio(asset.url); ambient.current = audio;
  audio.loop = true; audio.volume = settings.current.volume; audio.muted = settings.current.muted;
  void audio.play().then(() => { if (ambient.current === audio) setAmbientPlaying(true); }).catch(error => { console.log('[MYTHOS] Ambient playback unavailable', error); toast.error('Ambient audio could not start. Upload a supported MP3 or WAV and try again.'); });
 }, []);
 useEffect(() => { ambient.current?.pause(); ambient.current = null; setAmbientPlaying(false); }, [assets.ambient?.url]);
 useEffect(() => { [cue.current, ambient.current].forEach(audio => { if (audio) { audio.muted = muted; audio.volume = volume; } }); if (muted && 'speechSynthesis' in window) speechSynthesis.cancel(); }, [muted, volume]);
 useEffect(() => { cue.current?.pause(); }, [assets.roar?.url, assets.breath?.url, assets.wings?.url]);
 useEffect(() => () => { cue.current?.pause(); ambient.current?.pause(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }, []);
 return { playCue, previewSound: (slot: SoundSlot) => playSound(slot, true), toggleAmbient, ambientPlaying };
}
