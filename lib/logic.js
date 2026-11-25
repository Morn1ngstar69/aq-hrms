import { today } from './seed.js';
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const nameOf = (state, employeeId) => state.employees.find(e => e.id === employeeId)?.name || 'Former employee';
export const leaveName = (state, typeId) => state.leaveTypes.find(t => t.id === typeId)?.name || 'Leave';
export const money = (number) => new Intl.NumberFormat('en-BD', { style:'currency', currency:'BDT', maximumFractionDigits:0 }).format(Number(number || 0));
export function daysBetween(start,end) { const a=Date.parse(`${start}T00:00:00Z`), b=Date.parse(`${end}T00:00:00Z`); if (!Number.isFinite(a)||!Number.isFinite(b)||b<a) throw Error('End date must be on or after start date.'); return Math.round((b-a)/86400000)+1; }
export const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||'');
export function requireFields(data,fields) { for (const key of fields) if (data[key] === undefined || data[key] === null || String(data[key]).trim() === '') throw Error(`${key.replace(/([A-Z])/g,' $1')} is required.`); }
export function monthOf(date) { return String(date || '').slice(0,7); }
export function monthDates(value) { const [year,month] = value.split('-').map(Number); if (!year || !month || month<1 || month>12) throw Error('Choose a valid month.'); return new Date(Date.UTC(year,month,0)).getUTCDate(); }
export function csv(rows) { if (!rows.length) return ''; const keys=Object.keys(rows[0]); const escape=(v) => `"${String(v??'').replaceAll('"','""')}"`; return [keys.join(','),...rows.map(row=>keys.map(k=>escape(row[k])).join(','))].join('\r\n'); }
export function report(state,type,start,end) {
 const between = d => (!start || d>=start)&&(!end || d<=end);
 switch(type) {
  case 'ATTENDANCE_SUMMARY':return state.employees.map(e=>({ Employee:e.name, Department:e.department, Present:state.attendance.filter(a=>a.employeeId===e.id&&between(a.date)).length, Late:state.attendance.filter(a=>a.employeeId===e.id&&between(a.date)&&a.late>15).length }));
  case 'LEAVE_SUMMARY':return state.employees.map(e=>({ Employee:e.name, Approved:state.leaves.filter(l=>l.employeeId===e.id&&l.status==='Approved'&&between(l.start)).reduce((a,l)=>a+l.days,0), Pending:state.leaves.filter(l=>l.employeeId===e.id&&l.status==='Pending'&&between(l.start)).length }));
  case 'LEAVE_LEDGER':return state.balances.map(b=>({ Employee:nameOf(state,b.employeeId), Leave:leaveName(state,b.leaveTypeId), Available:b.available }));
  case 'OVERTIME':return state.overtime.filter(o=>between(o.date)).map(o=>({ Employee:nameOf(state,o.employeeId), Date:o.date, Minutes:o.minutes, Approved:o.approvedMinutes, Status:o.status }));
  case 'UNPAID_LEAVE':return state.leaves.filter(l=>l.status==='Approved'&&between(l.start)&&!state.leaveTypes.find(t=>t.id===l.leaveTypeId)?.paid).map(l=>({ Employee:nameOf(state,l.employeeId), Days:l.days, From:l.start, To:l.end }));
  case 'MISSING_PUNCH':return state.attendance.filter(a=>between(a.date)&&(!a.firstIn||!a.lastOut)).map(a=>({ Employee:nameOf(state,a.employeeId), Date:a.date, CheckIn:a.firstIn||'', CheckOut:a.lastOut||'' }));
  case 'LATE_REPORT':return state.attendance.filter(a=>between(a.date)&&a.late>15).map(a=>({ Employee:nameOf(state,a.employeeId), Date:a.date, MinutesLate:a.late }));
  default:throw Error('Unknown report type.');
 }
}
export function updateState(state, action, actor='demo@aqua.demo') {
 const next=clone(state), { type, payload:p={} }=action;
 const add=(key,item)=>{ const record={...item,id:`${key}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`};next[key].unshift(record);return record;};
 const find=(key,id)=>{ const row=next[key].find(x=>x.id===id);if(!row) throw Error('This record could not be found.');return row;};
 const remove=(key,id)=>{const i=next[key].findIndex(x=>x.id===id);if(i<0)throw Error('This record could not be found.');next[key].splice(i,1);};
 let detail='';let entity=type;
 switch(type){
 case 'EMPLOYEE_ADD': {requireFields(p,['name','email','department','designation','joinDate']);if(!validEmail(p.email))throw Error('Enter a valid employee email.');if(next.employees.some(e=>e.email.toLowerCase()===p.email.toLowerCase()))throw Error('Employee email already exists.');if(Number(p.salary)<0)throw Error('Salary cannot be negative.');add('employees',{ ...p, salary:Number(p.salary||0),active:true });detail=`Created ${p.name}`;break;}
 case 'EMPLOYEE_EDIT': {const e=find('employees',p.id);if(p.email&&!validEmail(p.email))throw Error('Enter a valid email.');if(p.salary!==undefined&&Number(p.salary)<0)throw Error('Salary cannot be negative.');if(p.email&&next.employees.some(x=>x.id!==p.id&&x.email.toLowerCase()===p.email.toLowerCase()))throw Error('Employee email already exists.');Object.assign(e,p, p.salary!==undefined?{salary:Number(p.salary)}:{});detail=`Updated ${e.name}`;break;}
 case 'EMPLOYEE_DELETE': {remove('employees',p.id);detail=`Deleted employee ${p.id}`;break;}
 case 'USER_ADD': {requireFields(p,['username','fullName','email','password']);if(!validEmail(p.email))throw Error('Enter a valid email.');if(!/^[a-z0-9_]+$/i.test(p.username))throw Error('Username can only contain letters, numbers or underscores.');if(p.password.length<4)throw Error('Password must contain at least 4 characters.');if(next.users.some(u=>u.username===p.username||u.email===p.email))throw Error('Username or email already exists.');add('users',{ ...p, role:'employee',active:true });detail=`Registered ${p.username}`;break;}
 case 'USER_EDIT': {const u=find('users',p.id);if(p.role&&!['admin','hr','employee','accountant'].includes(p.role))throw Error('Invalid role.');Object.assign(u,p);detail=`User ${u.username} updated`;break;}
 case 'ATTENDANCE_ADD': {requireFields(p,['employeeId','date','firstIn']);if(!next.employees.some(e=>e.id===p.employeeId))throw Error('Select an employee.');if(next.attendance.some(a=>a.employeeId===p.employeeId&&a.date===p.date))throw Error('Attendance already exists for this employee and date.');add('attendance',{...p, status:p.status||'Present',late:Number(p.late||0),lastOut:p.lastOut||'',source:p.source||'Manual'});detail=`Attendance on ${p.date}`;break;}
 case 'ATTENDANCE_MARK': {requireFields(p,['employeeId','token']);const q=next.qrTokens.find(t=>t.active&&t.token===p.token&&today>=t.start&&today<=t.end);if(!q)throw Error('QR code is invalid or expired.');let a=next.attendance.find(x=>x.employeeId===p.employeeId&&x.date===today);if(!a){add('attendance',{employeeId:p.employeeId,date:today,firstIn:p.time||'09:00',lastOut:'',late:0,status:'Present',source:'QR'});detail='Checked in';} else if(!a.lastOut){a.lastOut=p.time||'18:00';detail='Checked out';}else throw Error('Check-in and check-out are already recorded today.');break;}
 case 'QR_TOKEN_ADD': {requireFields(p,['token','start','end']);daysBetween(p.start,p.end);next.qrTokens.forEach(t=>{t.active=false});add('qrTokens',{...p,active:true});detail='QR token created';break;}
 case 'LEAVE_ADD': {requireFields(p,['employeeId','leaveTypeId','start','end','reason']);const selectedType=next.leaveTypes.find(x=>x.id===p.leaveTypeId);if(!selectedType||!selectedType.active)throw Error('Choose an active leave policy.');const total=daysBetween(p.start,p.end);if(total>180)throw Error('A single request cannot exceed 180 calendar days.');if(p.halfDay&&(total!==1||!selectedType.halfDay))throw Error('Half-day leave is not supported for these dates or leave type.');const days=p.halfDay?0.5:total;if(next.leaves.some(l=>l.employeeId===p.employeeId&&l.status!=='Rejected'&&l.start<=p.end&&l.end>=p.start))throw Error('Dates overlap an existing leave request.');const bal=next.balances.find(b=>b.employeeId===p.employeeId&&b.leaveTypeId===p.leaveTypeId);if(bal&&bal.available<days)throw Error('Insufficient leave balance.');add('leaves',{...p,days,status:'Pending',source:p.source||'HRMS',notes:'',created:today});detail=`Leave requested: ${days} days`;break;}
 case 'LEAVE_REVIEW': {const l=find('leaves',p.id);if(l.status!=='Pending')throw Error('Only pending requests can be reviewed.');if(!['Approved','Rejected'].includes(p.status))throw Error('Select an approval action.');if(p.status==='Approved'){const b=next.balances.find(x=>x.employeeId===l.employeeId&&x.leaveTypeId===l.leaveTypeId);if(b){if(b.available<l.days)throw Error('Insufficient leave balance.');b.available-=l.days;}}l.status=p.status;l.notes=p.notes||'';detail=`Leave ${p.status}`;break;}
 case 'BALANCE_ADJUST': {requireFields(p,['employeeId','leaveTypeId','amount']);const amount=Number(p.amount);if(!Number.isFinite(amount)||amount===0)throw Error('Adjustment must be a nonzero number.');let b=next.balances.find(x=>x.employeeId===p.employeeId&&x.leaveTypeId===p.leaveTypeId);if(!b){b=add('balances',{employeeId:p.employeeId,leaveTypeId:p.leaveTypeId,available:0});}if(b.available+amount<0)throw Error('Leave balance cannot become negative.');b.available+=amount;detail=`Balance adjusted by ${amount}`;break;}
 case 'CORRECTION_ADD': {requireFields(p,['employeeId','date','reason']);add('corrections',{...p,status:'Pending',created:today});detail='Correction requested';break;}
 case 'CORRECTION_REVIEW': {const c=find('corrections',p.id);if(c.status!=='Pending')throw Error('This correction has already been reviewed.');c.status=p.status;if(p.status==='Approved'){let a=next.attendance.find(x=>x.employeeId===c.employeeId&&x.date===c.date);if(a){if(c.firstIn)a.firstIn=c.firstIn;if(c.lastOut)a.lastOut=c.lastOut;}else add('attendance',{employeeId:c.employeeId,date:c.date,firstIn:c.firstIn,lastOut:c.lastOut,late:0,status:'Present',source:'Correction'});}detail='Correction reviewed';break;}
 case 'OVERTIME_ADD': {requireFields(p,['employeeId','date','reason']);const min=Number(p.minutes);if(!Number.isFinite(min)||min<1||min>1440)throw Error('Minutes must be between 1 and 1440.');add('overtime',{...p,minutes:min,approvedMinutes:0,status:'Pending',created:today});detail='Overtime requested';break;}
 case 'OVERTIME_REVIEW': {const o=find('overtime',p.id);if(o.status!=='Pending')throw Error('Already reviewed.');o.status=p.status;o.approvedMinutes=p.status==='Approved'?Math.min(Number(p.approvedMinutes||o.minutes),o.minutes):0;detail='Overtime reviewed';break;}
 case 'NOTICE_ADD': {requireFields(p,['title','body']);add('notices',{...p,created:today,active:true});detail=`Notice: ${p.title}`;break;}
 case 'NOTICE_EDIT':Object.assign(find('notices',p.id),p);detail='Notice edited';break;
 case 'NOTICE_DELETE':find('notices',p.id).active=false;detail='Notice archived';break;
 case 'SALARY_ADD': {requireFields(p,['employeeId','month','basic']);if(!next.employees.some(e=>e.id===p.employeeId))throw Error('Select an employee.');if(next.salaries.some(s=>s.employeeId===p.employeeId&&s.month===p.month))throw Error('Salary statement already exists for that employee and month.');for(const key of ['basic','allowance','deduction'])if(Number(p[key]||0)<0)throw Error('Salary amounts cannot be negative.');add('salaries',{...p,basic:Number(p.basic),allowance:Number(p.allowance||0),deduction:Number(p.deduction||0),net:Number(p.basic)+Number(p.allowance||0)-Number(p.deduction||0),paid:!!p.paid});detail='Salary statement created';break;}
 case 'SALARY_EDIT': {const s=find('salaries',p.id);Object.assign(s,p);s.net=Number(s.basic)+Number(s.allowance)-Number(s.deduction);detail='Salary updated';break;}
 case 'SALARY_DELETE':remove('salaries',p.id);detail='Salary deleted';break;
 case 'ACCOUNT_ADD': {requireFields(p,['date','type','category','amount']);if(!['Income','Expense'].includes(p.type))throw Error('Select Income or Expense.');if(!Number.isFinite(Number(p.amount))||Number(p.amount)<=0)throw Error('Amount must be greater than zero.');add('accounts',{...p,amount:Number(p.amount)});detail='Account entry added';break;}
 case 'ACCOUNT_EDIT': {const a=find('accounts',p.id);Object.assign(a,p,{amount:Number(p.amount)});detail='Account entry updated';break;}
 case 'ACCOUNT_DELETE':remove('accounts',p.id);detail='Account entry deleted';break;
 case 'PERIOD_ADD': {requireFields(p,['name','start','end']);daysBetween(p.start,p.end);if(next.periods.some(x=>x.start<=p.end&&x.end>=p.start))throw Error('Payroll period overlaps another period.');add('periods',{...p,status:'Open'});detail='Payroll period created';break;}
 case 'PERIOD_TOGGLE': {const row=find('periods',p.id);row.status=row.status==='Locked'?'Open':'Locked';detail='Payroll period changed';break;}
 case 'LEAVE_TYPE_EDIT': {const t=find('leaveTypes',p.id);if(Number(p.days)<0)throw Error('Annual allowance cannot be negative.');Object.assign(t,p);detail='Leave policy updated';break;}
 case 'HOLIDAY_ADD': {requireFields(p,['name','date']);if(next.holidays.some(h=>h.date===p.date&&h.name===p.name))throw Error('Holiday already exists.');add('holidays',p);detail='Holiday added';break;}
 case 'HOLIDAY_DELETE':remove('holidays',p.id);detail='Holiday deleted';break;
 case 'SCHEDULE_EDIT': {const s=find('schedules',p.id);Object.assign(s,p);if(p.default)next.schedules.forEach(x=>{if(x.id!==s.id)x.default=false;});detail='Work schedule updated';break;}
 case 'SCHEDULE_ADD': {requireFields(p,['name','start','end']);add('schedules',{...p,workDays:p.workDays||[0,1,2,3,4],default:false});detail='Work schedule created';break;}
 case 'NOTIFICATION_ADD':add('notifications',{...p,read:false,created:today});detail='Notification created';break;
 case 'NOTIFICATION_DELETE':remove('notifications',p.id);detail='Notification deleted';break;
 default:throw Error(`Unsupported action: ${type}`);
 }
 add('audit',{ actor,action:type,entity,entityId:p.id||'',detail,date:today });
 return next;
}
