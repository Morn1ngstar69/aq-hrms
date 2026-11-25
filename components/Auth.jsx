'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '../lib/store';
import { Field,Button,Feedback,Avatar } from './UI';
import AquaLogo from './AquaLogo';
const demo=[['admin','Administrator'],['hr','HR Manager'],['employee','Employee'],['accountant','Accountant']];
export default function Auth({mode='login'}){
 const {login,register}=useApp();const router=useRouter();
 const [username,setUsername]=useState(mode==='login'?'admin':''),[password,setPassword]=useState(mode==='login'?'demo123':''),[fullName,setFullName]=useState(''),[email,setEmail]=useState(''),[confirm,setConfirm]=useState(''),[photo,setPhoto]=useState(''),[show,setShow]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const signIn=mode==='login';
 const handlePhoto=async e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>5*1024*1024){setError('Choose a JPG, PNG or other image under 5 MB.');return}try{const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;const ctx=canvas.getContext('2d');const side=Math.min(bitmap.width,bitmap.height),x=(bitmap.width-side)/2,y=(bitmap.height-side)/2;ctx.drawImage(bitmap,x,y,side,side,0,0,320,320);setPhoto(canvas.toDataURL('image/jpeg',0.8));bitmap.close();setError('')}catch{setError('Could not read that photo. Please choose another JPG or PNG image.')}};
 const submit=e=>{e.preventDefault();setError('');setSuccess('');try{
  if(signIn){const user=login(username,password);router.replace(user.role==='employee'?'/employee':user.role==='accountant'?'/accountant':'/admin');}
  else{if(!fullName.trim())throw Error('Full name is required.');if(!photo)throw Error('Profile picture is required.');if(password!==confirm)throw Error('Passwords do not match.');register({username:username.trim().toLowerCase(),password,fullName:fullName.trim(),email,employeeId:null,photo});setSuccess('Account created. You can sign in now.');}
 }catch(err){setError(err.message)}};
 return <div className="auth-screen"><div className="auth-side"><AquaLogo size={78}/><div className="eyebrow">AQUA INNOVATIONS</div><h1>People first.<br/><em>Everything connected.</em></h1><p>Employee operations, attendance, leave, payroll and reporting, in one organized workspace.</p><span className="demo-tag">LOCAL DEMONSTRATION · NO SERVER REQUIRED</span></div><div className="auth-card"><div className="mobile-logo"><AquaLogo size={38}/>AQUA HRMS</div><div className="eyebrow">{signIn?'WELCOME BACK':'CREATE AN ACCOUNT'}</div><h2>{signIn?'Sign in to HRMS':'Register as employee'}</h2><p className="muted">{signIn?'Choose a demo account or enter your credentials.':'Create a new employee login for this browser session.'}</p><form onSubmit={submit} className="form-stack">
 {!signIn&&<><div className="photo-upload"><Avatar name={fullName||'New User'} photo={photo} size="lg"/><label className="btn outline">Choose Profile Photo<input type="file" accept="image/*" onChange={handlePhoto} hidden/></label></div><Field label="Full Name" value={fullName} onChange={setFullName} required/><Field label="Email Address" type="email" value={email} onChange={setEmail} required/></>}
 <Field label="Username" value={username} onChange={setUsername} required/><div className="password-wrap"><Field label="Password" type={show?'text':'password'} value={password} onChange={setPassword} required/><button type="button" className="show-password" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div>
 {!signIn&&<Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} required/>}
 <Feedback error={error} success={success}/><Button type="submit" variant="primary wide">{signIn?'Sign In':'Create Account'}</Button></form>
 {signIn?<><div className="demo-credentials"><p>Demo accounts (password: <strong>demo123</strong>)</p><div className="demo-grid">{demo.map(([user,role])=><button key={user} type="button" onClick={()=>{setUsername(user);setPassword('demo123');setError('')}}><strong>{role}</strong><span>{user}</span></button>)}</div></div><p className="auth-switch">New employee? <Link href="/register">Register here</Link></p></>:<p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>}
 <p className="security-note">This is a local demo. Passwords are sample credentials and must not be used for real employee information.</p></div></div>
}
