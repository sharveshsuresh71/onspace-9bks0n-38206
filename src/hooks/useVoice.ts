import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
interface RecognitionEvent { results: { [key:number]: { [key:number]: { transcript:string } } }; }
interface Recognition { lang:string; continuous:boolean; interimResults:boolean; onresult:((event:RecognitionEvent)=>void)|null; onerror:((event:{error:string})=>void)|null; onend:(()=>void)|null; start:()=>void; stop:()=>void; }
type VoiceWindow=Window & { SpeechRecognition?:new()=>Recognition; webkitSpeechRecognition?:new()=>Recognition; };
export function useVoice(onText:(text:string)=>void){const [listening,setListening]=useState(false),recognition=useRef<Recognition|null>(null);useEffect(()=>()=>recognition.current?.stop(),[]);
 const start=()=>{if(listening){recognition.current?.stop();return;}const w=window as VoiceWindow,Constructor=w.SpeechRecognition||w.webkitSpeechRecognition;if(!Constructor){toast.info('Voice recognition is unavailable in this browser. Type your message in the companion panel.');return;}const r=new Constructor();r.lang='en-US';r.continuous=false;r.interimResults=false;r.onresult=e=>onText(e.results[0][0].transcript);r.onerror=e=>{setListening(false);toast.error(e.error==='not-allowed'?'Allow microphone access to speak to Caraxes.':`Voice recognition: ${e.error}. You can type instead.`);};r.onend=()=>setListening(false);recognition.current=r;r.start();setListening(true);toast.info('Listening. Speak a command or message.');};return {listening,start};
}
