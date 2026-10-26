import { useEffect, useState } from 'react';
import { Box } from 'lucide-react';
import { useCompanion } from '@/hooks/useCompanion';
import { useVoice } from '@/hooks/useVoice';
import { useSanctuaryScene } from '@/hooks/useSanctuaryScene';
import Header from '@/components/layout/Header';
import CompanionOverview from '@/components/features/CompanionOverview';
import SceneToolbar from '@/components/features/SceneToolbar';
import CommandBar from '@/components/features/CommandBar';
import SanctuaryPanel from '@/components/features/SanctuaryPanel';
import Awakening from '@/components/features/Awakening';
import astralSky from '@/assets/astral-sky.jpg';
export default function Sanctuary() {
 const c = useCompanion(), voice = useVoice(text => { c.talk(text); c.setPanel('chat'); }), p = c.assetPreferences;
 const [awakening, setAwakening] = useState(true);
 const background = p.backgroundEnabled ? c.assets.background?.url : undefined;
 const scene = useSanctuaryScene({ state: c.state, camera: c.camera, environment: c.progress.environment, appearance: c.progress.appearance, modelUrl: c.modelUrl, muted: c.muted, backgroundUrl: background || null, backgroundMode: p.backgroundMode, sceneUrl: p.sceneEnabled ? c.assets.scene?.url || null : null, sceneScale: p.sceneScale, modelYaw: p.modelYaw, bindings: p.bindings, commandId: c.commandId }, c.setState, c.setModelReport);
 useEffect(() => { const timer = setTimeout(() => setAwakening(false), 1800); return () => clearTimeout(timer); }, []);
 const backdrop = background || (c.progress.environment === 'astral' ? astralSky : undefined);
 const modelCaption = c.modelReport.status === 'ready' ? `CUSTOM DRAGON · ${c.modelReport.clips.length} CLIPS` : c.modelReport.status === 'loading' ? 'LOADING YOUR DRAGON' : 'PROCEDURAL PREVIEW · UPLOAD YOUR GLB';
 return <main className={`world world-${c.progress.environment}`} style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}>
  <div className="scene" ref={scene} aria-label="Interactive real-time 3D dragon sanctuary"/>
  <div className="hud"><Header companion={c}/><CompanionOverview companion={c}/><SceneToolbar companion={c}/>
   <div className="creature-caption"><strong>CARAXES</strong><span>THE OBSIDIAN FLAME</span><div style={{ marginTop: 14 }}><span className="asset-note"><Box size={10}/>{modelCaption}</span></div></div>
   <SanctuaryPanel companion={c} listening={voice.listening} onVoice={voice.start}/><CommandBar companion={c} listening={voice.listening} onVoice={voice.start}/>
  </div>{awakening && <Awakening/>}
 </main>;
}
