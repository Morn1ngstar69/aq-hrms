'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../lib/store';
import { nameOf } from '../lib/logic';
import { Avatar,Button } from './UI';
import AquaLogo from './AquaLogo';
import { Employees,Designations,Attendance,QRGenerator,LeaveManagement,Notices,Users } from './WorkPanels';
import { HRControl,Approvals,Policies,Reports } from './HRPanels';
import { Profile,ScanAttendance,History,LeaveRequest,LeavePortal,AttendancePortal } from './EmployeePanels';
import { Salaries,Accounts } from './FinancePanels';
const items={
 admin:[['employees','◧','Employees'],['designations','◇','Designations'],['attendance','▦','Attendance'],['qr','▣','QR Attendance'],['leaves','▤','Leave Requests'],['notices','▧','Notice Board'],['hr-dashboard','▥','HR Dashboard'],['mgr-inbox','☷','Approvals'],['hrms-qr','▣','HRMS QR Code'],['policy-admin','⚙','Policy Admin'],['hr-reports','▥','Reports & Audit'],['users','♙','User Management']],
 employee:[['profile','◉','My Profile'],['scan','▣','Scan Attendance'],['attendance','▦','History'],['leave','▤','Leave Request'],['hrms-leave','◇','HRMS Leaves'],['hrms-att','◷','HRMS Attendance'],['notices','▧','Notice Board']],
 accountant:[['salary','৳','Salary Statements'],['accounts','▣','Company Accounts'],['notices','▧','Notice Board'],['hr-reports','▥','Leave & Attendance Reports']]
};
export const areaOf=r=>r==='accountant'?'accountant':r==='employee'?'employee':'admin';
function MainSection({tab,role}){
 switch(tab){
 case 'employees':return <Employees/>;case 'designations':return <Designations/>;case 'attendance':return role==='employee'?<History/>:<Attendance/>;
 case 'qr':case 'hrms-qr':return <QRGenerator modern={tab==='hrms-qr'}/>;
 case 'leaves':return <LeaveManagement/>;case 'notices':return <Notices admin={role!=='employee'&&role!=='accountant'}/>;
 case 'hr-dashboard':return <HRControl/>;case 'mgr-inbox':return <Approvals/>;case 'policy-admin':return <Policies/>;
 case 'hr-reports':return <Reports accountant={role==='accountant'}/>;case 'users':return <Users/>;
 case 'profile':return <Profile/>;case 'scan':return <ScanAttendance/>;case 'leave':return <LeaveRequest legacy/>;
 case 'hrms-leave':return <LeavePortal/>;case 'hrms-att':return <AttendancePortal/>;
 case 'salary':return <Salaries/>;case 'accounts':return <Accounts/>;default:return null;
 }
}
export default function Workspace({area}){
 const {session,ready,logout,data,reset}=useApp();const router=useRouter();const [tab,setTab]=useState(area==='admin'?'employees':area==='accountant'?'salary':'profile');const [mobile,setMobile]=useState(false);const [resetConfirm,setResetConfirm]=useState(false);
 useEffect(()=>{if(ready){if(!session)router.replace('/login');else if(areaOf(session.role)!==area)router.replace(`/${areaOf(session.role)}`)}},[ready,session,area,router]);
 if(!ready||!session||areaOf(session.role)!==area)return <div className="startup">Loading workspace...</div>;
 const allowed=items[area].filter(x=>x[0]!=='users'||session.role==='admin');
 const active=allowed.find(x=>x[0]===tab)||allowed[0];const emp=data.employees.find(e=>e.id===session.employeeId);
 const count=(id)=>id==='employees'?data.employees.length:id==='leaves'||id==='mgr-inbox'?data.leaves.filter(x=>x.status==='Pending').length:id==='notices'?data.notices.filter(n=>n.active).length:null;
 return <div className="dashboard"><aside className={`sidebar ${mobile?'open':''}`}><div className="sidebar-head"><Link href="/" className="brand"><AquaLogo size={38}/><span><strong>AQUA HRMS</strong><small>{area==='admin'?'HR Administration':area==='accountant'?'Accounts Workspace':'Employee Portal'}</small></span></Link><button className="mobile-close" aria-label="Close menu" onClick={()=>setMobile(false)}>✕</button></div>
 <div className="user-side"><Avatar name={session.fullName} photo={session.photo||emp?.photo}/><div><strong>{session.fullName}</strong><span className="role-pill">{session.role.toUpperCase()}</span></div></div>
 <div className="nav-caption">WORKSPACE</div><nav aria-label="Main navigation" className="side-nav">{allowed.map(([id,icon,label])=><button aria-current={tab===id?'page':undefined} key={id} className={tab===id?'selected':''} onClick={()=>{setTab(id);setMobile(false)}}><span className="nav-icon">{icon}</span><span>{label}</span>{count(id)>0&&<small className="nav-count">{count(id)}</small>}</button>)}</nav>
 <div className="sidebar-bottom"><button className="signout" onClick={()=>{logout();router.push('/login')}}>↪ &nbsp; Sign Out</button><span className="demo-sidebar">Demo data stored in this browser session</span></div></aside>
 {mobile&&<div className="sidebar-scrim" onClick={()=>setMobile(false)}/>}
 <div className="main-column"><header className="topbar"><button className="menu-btn" aria-label="Open navigation" onClick={()=>setMobile(true)}>☰</button><div className="topbar-title"><small>{area==='admin'?'HR Management':area==='accountant'?'Financial Management':'My Workspace'}</small><strong>{active[2]}</strong></div><div className="topbar-right"><span className="online-dot"/>LOCAL DEMO <span className="topbar-avatar"><Avatar name={session.fullName} photo={session.photo}/></span></div></header><main className="page-content"><div className="welcome"><div><div className="eyebrow">AQUA INNOVATIONS / HRMS</div><h1>{active[2]}</h1><p>{area==='admin'?'Manage employees, attendance and HR operations.':area==='accountant'?'Maintain salary statements and company transactions.':'View your profile, attendance, leaves and announcements.'}</p></div><span className="date-pill">October 2026</span></div>
 <MainSection tab={tab} role={area}/>
 {area==='admin'&&<div className="reset-zone"><button className="text-btn" onClick={()=>setResetConfirm(!resetConfirm)}>Reset this demonstration</button>{resetConfirm&&<div className="confirm-reset"><span>This restores the original demo records and signs you out.</span><Button variant="danger" onClick={()=>{reset();router.replace('/login')}}>Confirm Reset</Button><Button variant="outline" onClick={()=>setResetConfirm(false)}>Cancel</Button></div>}</div>}</main></div></div>;
}
