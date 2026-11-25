import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../lib/seed.js';
import { clone,daysBetween,updateState,report,csv,nameOf } from '../lib/logic.js';
const fresh=()=>clone(seed);
test('Seed links users, employees, attendance, leave and payroll',()=>{
 const data=fresh();
 for(const u of data.users.filter(u=>u.employeeId))assert.ok(data.employees.some(e=>e.id===u.employeeId));
 for(const section of ['attendance','leaves','salaries','balances'])for(const item of data[section])assert.ok(data.employees.some(e=>e.id===item.employeeId));
 assert.equal(nameOf(data,'e1'),'Sadman Bin Rashid');
});
test('Employee create, edit and delete flows update the directory',()=>{
 let data=fresh();const before=data.employees.length;
 data=updateState(data,{type:'EMPLOYEE_ADD',payload:{name:'Demo Staff',email:'demo.staff@aqua.test',designation:'Designer',department:'Creative Studio',joinDate:'2026-10-26',employmentType:'Full Time',salary:40000}});
 assert.equal(data.employees.length,before+1);
 const e=data.employees.find(e=>e.email==='demo.staff@aqua.test');assert.ok(e);
 data=updateState(data,{type:'EMPLOYEE_EDIT',payload:{id:e.id,designation:'Lead Designer',salary:52000}});
 assert.equal(data.employees.find(x=>x.id===e.id).salary,52000);
 data=updateState(data,{type:'EMPLOYEE_DELETE',payload:{id:e.id}});
 assert.equal(data.employees.length,before);
});
test('Form validation rejects duplicates and invalid numbers',()=>{
 const data=fresh();
 assert.throws(()=>updateState(data,{type:'EMPLOYEE_ADD',payload:{name:'A',email:'invalid',designation:'X',department:'Ops',joinDate:'2026-10-26'}}),/valid employee email/);
 assert.throws(()=>updateState(data,{type:'ACCOUNT_ADD',payload:{date:'2026-10-26',category:'Rent',type:'Expense',amount:0}}),/greater than zero/);
 assert.throws(()=>daysBetween('2026-11-01','2026-10-30'),/End date/);
});
test('Registration is restricted to employee role and rejects duplicate accounts',()=>{
 const data=fresh();const next=updateState(data,{type:'USER_ADD',payload:{username:'new_user',password:'pass1234',fullName:'Demo User',email:'new.user@aqua.test',role:'admin'}});
 const added=next.users.find(u=>u.username==='new_user');assert.equal(added.role,'employee');
 assert.throws(()=>updateState(next,{type:'USER_ADD',payload:{username:'new_user',password:'pass1234',fullName:'Demo User',email:'unique@aqua.test'}}),/exists/);
});
test('Leave approval reduces balance and rejected leave does not',()=>{
 let data=fresh();const opening=data.balances.find(b=>b.employeeId==='e1'&&b.leaveTypeId==='lt1').available;
 data=updateState(data,{type:'LEAVE_REVIEW',payload:{id:'l1',status:'Approved'}});
 assert.equal(data.balances.find(b=>b.employeeId==='e1'&&b.leaveTypeId==='lt1').available,opening-2);
 assert.throws(()=>updateState(data,{type:'LEAVE_REVIEW',payload:{id:'l1',status:'Approved'}}),/Only pending/);
 data=updateState(data,{type:'LEAVE_REVIEW',payload:{id:'l3',status:'Rejected'}});
 assert.equal(data.leaves.find(l=>l.id==='l3').status,'Rejected');
});
test('New leave request is shown in pending approvals and overlaps are rejected',()=>{
 let data=fresh();data=updateState(data,{type:'LEAVE_ADD',payload:{employeeId:'e4',leaveTypeId:'lt1',start:'2026-11-06',end:'2026-11-07',reason:'Personal work'}});
 assert.ok(data.leaves.some(l=>l.employeeId==='e4'&&l.status==='Pending'&&l.days===2));
 assert.throws(()=>updateState(data,{type:'LEAVE_ADD',payload:{employeeId:'e4',leaveTypeId:'lt1',start:'2026-11-07',end:'2026-11-08',reason:'Duplicate'}}),/overlap/);
});
test('QR check-in and check-out update same attendance row',()=>{
 let data=fresh();data=updateState(data,{type:'ATTENDANCE_MARK',payload:{employeeId:'e5',token:'AQUA-DEMO-WEEK-43',time:'09:06'}});
 assert.equal(data.attendance.find(a=>a.employeeId==='e5'&&a.date==='2026-10-26').firstIn,'09:06');
 data=updateState(data,{type:'ATTENDANCE_MARK',payload:{employeeId:'e5',token:'AQUA-DEMO-WEEK-43',time:'18:08'}});
 assert.equal(data.attendance.find(a=>a.employeeId==='e5'&&a.date==='2026-10-26').lastOut,'18:08');
 assert.throws(()=>updateState(data,{type:'ATTENDANCE_MARK',payload:{employeeId:'e5',token:'INCORRECT'}}),/invalid or expired/);
});
test('Correction approval updates existing attendance and overtime review is recorded',()=>{
 let data=fresh();data=updateState(data,{type:'CORRECTION_REVIEW',payload:{id:'c1',status:'Approved'}});
 assert.equal(data.attendance.find(a=>a.id==='a3').firstIn,'09:10');
 data=updateState(data,{type:'OVERTIME_REVIEW',payload:{id:'ot1',status:'Approved',approvedMinutes:90}});
 assert.equal(data.overtime.find(o=>o.id==='ot1').approvedMinutes,90);
});
test('Account, salary, notice, policy and audit mutations are consistent',()=>{
 let data=fresh();const n=data.audit.length;
 data=updateState(data,{type:'ACCOUNT_ADD',payload:{date:'2026-10-26',type:'Income',category:'Projects',amount:12000,description:'Demo payment'}});
 data=updateState(data,{type:'SALARY_ADD',payload:{employeeId:'e5',month:'2026-10',basic:50000,allowance:7000,deduction:1200}});
 assert.equal(data.salaries.find(s=>s.employeeId==='e5').net,55800);
 data=updateState(data,{type:'NOTICE_ADD',payload:{title:'Staff notice',body:'Please update details.'}});
 data=updateState(data,{type:'LEAVE_TYPE_EDIT',payload:{id:'lt1',days:11}});
 assert.equal(data.leaveTypes.find(l=>l.id==='lt1').days,11);
 assert.equal(data.audit.length,n+4);
});
test('Reports and CSV generation honor selected data',()=>{
 const data=fresh();const rows=report(data,'ATTENDANCE_SUMMARY','2026-10-01','2026-10-31');
 assert.ok(rows.find(r=>r.Employee==='Sadman Bin Rashid').Present>0);
 const exports=csv(rows);assert.ok(exports.includes('Employee,Department,Present,Late'));assert.ok(exports.includes('Sadman Bin Rashid'));
 assert.deepEqual(report(data,'OVERTIME','2030-01-01','2030-12-31'),[]);
});
