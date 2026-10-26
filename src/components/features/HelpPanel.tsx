import type { Companion } from '@/hooks/useCompanion';
interface Props { companion: Companion; }
const controls = [['Drag / scroll', 'Orbit / zoom'], ['W A S D', 'Move dragon on world axes'], ['Shift + W A S D', 'Move faster'], ['Space', 'Take off / land'], ['C', 'Cycle camera mode'], ['F', 'Follow sanctuary path'], ['R', 'Return and land'], ['Escape', 'Close panels']];
export default function HelpPanel({ companion: c }: Props) {
 return <><p>Caraxes responds to buttons, text commands, and browser-supported voice recognition. Repeating a command replays its animation.</p>
  {controls.map(([key, label]) => <div className="help-row" key={key}><kbd>{key}</kbd><span>{label}</span></div>)}
  <div className="asset-section"><h3>Bring your own world</h3><p>Open the globe icon or the sanctuary name. Upload a JPG, PNG, or WebP background; choose 360° for an equirectangular sky. Upload a separate GLB environment to replace built-in terrain.</p><button className="panel-submit" onClick={() => c.setPanel('world')}>Open sanctuary builder</button></div>
  <div className="asset-section"><h3>Connect your dragon’s animations</h3><p>Open Creature atelier, upload your dragon GLB, and inspect the available clips. Names are matched automatically; choose clips manually for unnamed actions. Adjust model facing if it travels sideways.</p><button className="panel-submit" onClick={() => c.setPanel('appearance')}>Open creature atelier</button></div>
  <div className="asset-section"><h3>Add creature sounds</h3><p>Open the speaker icon to upload roar, breath, wings, and ambient recordings. Use Preview to hear them and Play to start looping ambience. Without recordings, sound-enabled commands use synthesized cues.</p><button className="panel-submit" onClick={() => c.setPanel('sound')}>Open sound studio</button></div>
  <p>Try “fly”, “glide”, “sleep”, “wake”, “feed”, “roar”, or “show your fire”. Flight is a bounded circular path; follow is a patrol, not live player tracking.</p>
  <button className="panel-submit" onClick={() => c.command('attack')}>Test safe attack command</button><button className="panel-submit" onClick={() => c.command('glide')}>Glide around the sanctuary</button>
  <p>Uploads, mappings, and progress save on this device when browser storage is available. No server receives your files. Missing clips use idle or root movement, not fabricated skeletal motion. Custom terrain collision and AI dialogue are not connected.</p>
 </>;
}
