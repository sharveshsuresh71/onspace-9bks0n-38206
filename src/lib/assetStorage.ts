import type { AssetSlot } from '@/types/assets';
interface StoredAsset { slot: AssetSlot; file: File; }
let database: Promise<IDBDatabase> | null = null;
function openDatabase() {
 if (!database) database = new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open('mythos-sanctuary-assets', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('assets', { keyPath: 'slot' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error('Close other MYTHOS tabs to unlock local asset storage.'));
 });
 return database;
}
export async function readAssets(): Promise<StoredAsset[]> {
 const db = await openDatabase();
 return new Promise((resolve, reject) => {
  const request = db.transaction('assets').objectStore('assets').getAll();
  request.onsuccess = () => resolve(request.result as StoredAsset[]);
  request.onerror = () => reject(request.error);
 });
}
export async function storeAsset(slot: AssetSlot, file: File | null): Promise<void> {
 const db = await openDatabase();
 return new Promise((resolve, reject) => {
  const transaction = db.transaction('assets', 'readwrite');
  if (file) transaction.objectStore('assets').put({ slot, file });
  else transaction.objectStore('assets').delete(slot);
  transaction.oncomplete = () => resolve();
  transaction.onerror = () => reject(transaction.error);
  transaction.onabort = () => reject(transaction.error || new Error('Local asset storage is full.'));
 });
}
