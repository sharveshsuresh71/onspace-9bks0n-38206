import { X } from 'lucide-react';
import CompanionChat from '@/components/features/CompanionChat';
import AppearancePanel from '@/components/features/AppearancePanel';
import WorldPanel from '@/components/features/WorldPanel';
import HelpPanel from '@/components/features/HelpPanel';
import BondJournal from '@/components/features/BondJournal';
import SoundPanel from '@/components/features/SoundPanel';
import type { Companion } from '@/hooks/useCompanion';
interface Props { companion:Companion; listening:boolean; onVoice:()=>void; }
export default function SanctuaryPanel({companion:c,listening,onVoice}:Props){if(!c.panel)return null;const titles={appearance:'Creature atelier',world:'Sanctuary builder',chat:'The bond speaks',help:'Explore & command',journal:'Your bond journal',sound:'Creature sound studio'};return <section className="panel" aria-label={titles[c.panel]}><div className="panel-head"><h2>{titles[c.panel]}</h2><button className="panel-close" aria-label="Close panel" onClick={()=>c.setPanel(null)}><X size={18}/></button></div>{c.panel==='appearance'&&<AppearancePanel companion={c}/>} {c.panel==='world'&&<WorldPanel companion={c}/>} {c.panel==='chat'&&<CompanionChat companion={c} listening={listening} onVoice={onVoice}/>} {c.panel==='help'&&<HelpPanel companion={c}/>} {c.panel==='journal'&&<BondJournal companion={c}/>} {c.panel==='sound'&&<SoundPanel companion={c}/>}</section>;}
