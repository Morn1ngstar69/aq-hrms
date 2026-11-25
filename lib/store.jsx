'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { seed } from './seed';
import { clone, updateState } from './logic';
const Context=createContext(null);
const DATA_KEY='aqua_hrms_demo_data_v1';
const AUTH_KEY='aqua_hrms_demo_session_v1';
export function AppProvider({children}) {
  const [data,setData]=useState(()=>clone(seed));
  const [session,setSession]=useState(null);
  const [ready,setReady]=useState(false);
  const [notice,setNotice]=useState(null);
  useEffect(()=>{
    try {
      const stored=sessionStorage.getItem(DATA_KEY);
      if(stored){ const parsed=JSON.parse(stored); if(parsed?.users&&parsed?.employees&&parsed?.audit)setData(parsed); }
      const storedSession=JSON.parse(sessionStorage.getItem(AUTH_KEY)||'null');
      if(storedSession?.id)setSession(storedSession);
    } catch { setNotice({kind:'error',message:'Saved demo information could not be loaded. Starting with sample records.'}); }
    setReady(true);
  },[]);
  useEffect(()=>{if(ready){try{sessionStorage.setItem(DATA_KEY,JSON.stringify(data));}catch{setNotice({kind:'error',message:'Session storage is full. Recent changes cannot be saved across refreshes.'});}}},[data,ready]);
  useEffect(()=>{if(ready){try{sessionStorage.setItem(AUTH_KEY,JSON.stringify(session));}catch{}}},[session,ready]);
  const action=useCallback((type,payload={})=>{
    let result;
    setData(previous=>{result=updateState(previous,{type,payload},session?.email||'demo@aqua.demo');return result;});
    return result;
  },[session]);
  // Synchronous validation occurs before changing state, allowing forms to display helpful errors.
  const submit=(type,payload={})=>{
    if(type==='LEAVE_REVIEW' && session?.employeeId && data.leaves.find(l=>l.id===payload.id)?.employeeId===session.employeeId)throw Error('You cannot approve your own leave request.');
    const next=updateState(data,{type,payload},session?.email||'demo@aqua.demo');
    setData(next);
    setNotice({kind:'success',message:'Changes saved in this demo session.'});
    return next;
  };
  const login=(username,password)=>{
    const user=data.users.find(u=>u.username.toLowerCase()===String(username).trim().toLowerCase()&&u.password===password);
    if(!user)throw Error('Incorrect username or password. Use one of the demo accounts shown below.');
    if(!user.active)throw Error('This user account has been disabled.');
    const safe={id:user.id,role:user.role,fullName:user.fullName,email:user.email,employeeId:user.employeeId,photo:user.photo};
    setSession(safe);return safe;
  };
  const logout=()=>{setSession(null);setNotice(null);};
  const register=(values)=>{ const next=submit('USER_ADD',values);setNotice({kind:'success',message:'Account created. Sign in using your new credentials.'});return next; };
  const reset=()=>{setData(clone(seed));setSession(null);setNotice({kind:'success',message:'Demo restored to its original state.'});};
  return <Context.Provider value={{data,session,ready,login,logout,register,submit,reset,notice,setNotice}}>{children}</Context.Provider>;
}
export function useApp(){const value=useContext(Context);if(!value)throw Error('AppProvider missing.');return value;}
