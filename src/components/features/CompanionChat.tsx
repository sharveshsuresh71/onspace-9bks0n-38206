import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mic, Send } from 'lucide-react';
import type { Companion } from '@/hooks/useCompanion';
const schema=z.object({message:z.string().trim().min(1,'Enter a message.').max(500,'Keep messages under 500 characters.')});
interface Props { companion:Companion; listening:boolean; onVoice:()=>void; }
export default function CompanionChat({companion:c,listening,onVoice}:Props){const {register,handleSubmit,reset,formState:{errors}}=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema)});const scroll=useRef<HTMLDivElement>(null);useEffect(()=>{if(scroll.current)scroll.current.scrollTop=scroll.current.scrollHeight;},[c.messages]);return <><p>Local companion dialogue preview. Commands control Caraxes in real time; conversation uses scripted responses.</p><div className="dialogue" ref={scroll} role="log" aria-live="polite">{c.messages.map((m,i)=><div className="message" key={i}><strong>{m.speaker.toUpperCase()}</strong>{m.text}</div>)}</div><form onSubmit={handleSubmit(data=>{c.talk(data.message);reset();})}><label htmlFor="message">Your message</label><input id="message" placeholder="Caraxes, take to the skies…" {...register('message')} aria-invalid={!!errors.message}/>{errors.message&&<div className="error" role="alert">! {errors.message.message}</div>}<button className="panel-submit" type="submit"><Send size={13} style={{display:'inline',marginRight:8}}/>Send message</button></form><button className="panel-submit" onClick={onVoice}><Mic size={13} style={{display:'inline',marginRight:8}}/>{listening?'Stop listening':'Use your voice'}</button></>;}
