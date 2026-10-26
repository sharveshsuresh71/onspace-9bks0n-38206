import { AudioLines, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import AssetUpload from '@/components/features/AssetUpload';
import type { Companion } from '@/hooks/useCompanion';
import type { SoundSlot } from '@/types/assets';
interface Props { companion: Companion; }
const sounds: { slot: SoundSlot; label: string; hint: string }[] = [
 { slot: 'roar', label: 'Dragon roar', hint: 'Plays when you command “roar”.' },
 { slot: 'breath', label: 'Breath / attack', hint: 'Plays for the safe attack demonstration.' },
 { slot: 'wings', label: 'Wings / flight', hint: 'Plays on takeoff, glide, and landing commands.' },
 { slot: 'ambient', label: 'Sanctuary ambience', hint: 'Loop your own environment sound below.' }
];
export default function SoundPanel({ companion: c }: Props) {
 return <section className="asset-section" aria-labelledby="sound-title">
  <div className="asset-section-heading"><AudioLines size={18}/><h3 id="sound-title">Give your legend a voice.</h3></div>
  <p>GLB files generally do not contain playable sound. Upload your creature recordings and pair them with commands.</p>
  <button className="panel-submit sound-toggle" onClick={() => c.setMuted(v => !v)}>{c.muted ? <VolumeX size={18}/> : <Volume2 size={18}/>} {c.muted ? 'Sound muted · enable' : 'Sound enabled · mute'}</button>
  <label htmlFor="creature-volume">Creature & ambience volume <span className="text-primary">{Math.round(c.assetPreferences.volume * 100)}%</span></label><input id="creature-volume" type="range" min="0" max="1" step="0.05" value={c.assetPreferences.volume} onChange={e => c.setAssetPreferences(v => ({ ...v, volume: Number(e.target.value) }))}/>
  {sounds.map(({ slot, label, hint }) => <div key={slot} className="sound-slot">
   <AssetUpload companion={c} slot={slot} label={label} accept=".mp3,.wav,.ogg,.m4a,.aac,.webm" hint={`${hint} MP3, WAV, OGG, M4A, AAC, WebM · ${slot === 'ambient' ? '30' : '20'} MB max.`}/>
   <button className="panel-submit sound-toggle" disabled={!c.assets[slot]} onClick={() => { c.setMuted(false); if (slot === 'ambient') c.toggleAmbient(); else c.previewSound(slot); }}>{slot === 'ambient' && c.ambientPlaying ? <Pause size={16}/> : <Play size={16}/>} {slot === 'ambient' ? c.ambientPlaying ? 'Pause ambience' : 'Play looping ambience' : 'Preview recording'}</button>
  </div>)}
  <small className="asset-hint">Recordings are saved locally and are never uploaded to a server. Until you add recordings, commands use synthesized cues. Ambient audio starts only after you press Play.</small>
 </section>;
}
