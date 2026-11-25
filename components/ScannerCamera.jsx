'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from './UI';
export default function ScannerCamera({onDetected}) {
 const video=useRef(null);const [error,setError]=useState('');
 useEffect(()=>{
  let cancelled=false, stream=null, frame=0;
  const start=async()=>{
   if(typeof window.BarcodeDetector==='undefined') {setError('Camera QR detection is unavailable in this browser. Enter the token manually.');return;}
   if(!navigator.mediaDevices?.getUserMedia){setError('Camera access requires localhost or a secure browser origin. Enter the token manually.');return;}
   try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});
    if(cancelled){stream.getTracks().forEach(t=>t.stop());return;}
    if(!video.current)return;
    video.current.srcObject=stream;
    await video.current.play();
    const detector=new window.BarcodeDetector({formats:['qr_code']});
    const scan=async()=>{
     if(cancelled||!video.current)return;
     try{
      const results=await detector.detect(video.current);
      if(results[0]?.rawValue){onDetected(results[0].rawValue);return;}
     }catch{ /* Some cameras briefly report no frame during startup. */ }
     frame=requestAnimationFrame(scan);
    };
    frame=requestAnimationFrame(scan);
   }catch {setError('Camera could not be opened. Check browser permissions or enter the token manually.');}
  };
  start();
  return()=>{cancelled=true;cancelAnimationFrame(frame);if(stream)stream.getTracks().forEach(t=>t.stop());};
 },[onDetected]);
 return <div className="camera-scanner"><video ref={video} muted playsInline aria-label="Live camera QR scanner"/>{error&&<div role="alert" className="message error">{error}</div>}</div>
}
