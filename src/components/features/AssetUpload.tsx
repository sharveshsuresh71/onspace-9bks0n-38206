import { useId, useState } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import type { Companion } from '@/hooks/useCompanion';
import type { AssetSlot } from '@/types/assets';
interface Props { companion: Companion; slot: AssetSlot; label: string; accept: string; hint: string; }
export default function AssetUpload({ companion: c, slot, label, accept, hint }: Props) {
 const id = useId(), [uploading, setUploading] = useState(false); const asset = c.assets[slot];
 return <div className="asset-upload">
  <span className="asset-field-label">{label}</span>
  <div className="asset-file-row"><label htmlFor={id} className={`asset-drop ${uploading || !c.assetsReady ? 'is-disabled' : ''}`}>
   {uploading ? <Loader2 size={18}/> : <Upload size={18}/>}<span>{uploading ? 'Reading file…' : asset ? 'Replace file' : 'Choose file'}</span>
  </label>{asset && <button className="asset-remove" title={`Remove ${label}`} aria-label={`Remove ${label}`} onClick={() => c.removeAsset(slot)} disabled={uploading}><Trash2 size={16}/></button>}</div>
  <input className="asset-file-input" id={id} type="file" aria-label={label} accept={accept} disabled={uploading || !c.assetsReady} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) { setUploading(true); void c.uploadAsset(slot, file).finally(() => setUploading(false)); } }}/>
  {asset && <div className="asset-filename" title={asset.name}>{asset.name}<span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span></div>}
  <small className="asset-hint">{hint}</small>
 </div>;
}
