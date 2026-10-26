import type { AssetSlot } from '@/types/assets';
const LIMITS: Record<AssetSlot, number> = { model: 100, scene: 150, background: 20, roar: 20, breath: 20, wings: 20, ambient: 30 };
export async function validateAsset(slot: AssetSlot, file: File): Promise<void> {
 const limit = LIMITS[slot];
 if (!file.size) throw new Error('This file is empty. Choose another file.');
 if (file.size > limit * 1024 * 1024) throw new Error(`Choose a file smaller than ${limit} MB.`);
 if (slot === 'model' || slot === 'scene') {
  if (!/\.glb$/i.test(file.name)) throw new Error('Choose a self-contained GLB with embedded textures.');
  const header = await file.slice(0, 12).arrayBuffer();
  if (header.byteLength < 12 || new DataView(header).getUint32(0, true) !== 0x46546c67) throw new Error('This is not a valid binary GLB file. Export your asset as GLB and try again.');
 } else if (slot === 'background') {
  if (!/\.(jpe?g|png|webp)$/i.test(file.name)) throw new Error('Choose a JPG, PNG, or WebP background image.');
  const bitmap = await createImageBitmap(file);
  const valid = bitmap.width <= 16384 && bitmap.height <= 16384;
  bitmap.close();
  if (!valid) throw new Error('Use a background no larger than 16,384 pixels per side.');
 } else {
  if (!/\.(mp3|wav|ogg|m4a|aac|webm)$/i.test(file.name)) throw new Error('Choose an MP3, WAV, OGG, M4A, AAC, or WebM sound file.');
  await new Promise<void>((resolve, reject) => {
   const url = URL.createObjectURL(file), audio = new Audio(); audio.preload = 'metadata';
   const clean = () => { clearTimeout(timeout); audio.removeAttribute('src'); audio.load(); URL.revokeObjectURL(url); };
   const timeout = window.setTimeout(() => { clean(); reject(new Error('This recording could not be read. Convert it to MP3 or WAV and try again.')); }, 10000);
   audio.onloadedmetadata = () => { audio.onloadedmetadata = null; audio.onerror = null; clean(); resolve(); };
   audio.onerror = () => { audio.onerror = null; clean(); reject(new Error('This recording is not supported by your browser. Upload an MP3 or WAV.')); };
   audio.src = url;
  });
 }
}
