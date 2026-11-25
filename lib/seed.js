export const today = '2026-10-26';
export const departments = ['Brand & Communications', 'Operations', 'Creative Studio', 'Accounts', 'Human Resources', 'Technology'];
export const seed = {
  users: [
    { id:'u1', username:'admin', password:'demo123', fullName:'AQUA Administrator', email:'admin@aqua.demo', employeeId:null, role:'admin', active:true, photo:'' },
    { id:'u2', username:'hr', password:'demo123', fullName:'Nusrat Jahan', email:'nusrat@aqua.demo', employeeId:'e2', role:'hr', active:true, photo:'' },
    { id:'u3', username:'employee', password:'demo123', fullName:'Sadman Bin Rashid', email:'sadman@aqua.demo', employeeId:'e1', role:'employee', active:true, photo:'' },
    { id:'u4', username:'accountant', password:'demo123', fullName:'Tamanna Islam', email:'tamanna@aqua.demo', employeeId:'e4', role:'accountant', active:true, photo:'' }
  ],
  employees: [
    { id:'e1', name:'Sadman Bin Rashid', email:'sadman@aqua.demo', phone:'01700000001', department:'Brand & Communications', designation:'Assistant Manager', joinDate:'2025-01-15', employmentType:'Full Time', salary:55000, address:'Dhaka, Bangladesh', bloodGroup:'B+', emergencyContact:'01700000011', active:true, photo:'' },
    { id:'e2', name:'Nusrat Jahan', email:'nusrat@aqua.demo', phone:'01700000002', department:'Human Resources', designation:'HR Manager', joinDate:'2024-03-03', employmentType:'Full Time', salary:80000, address:'Dhaka, Bangladesh', bloodGroup:'O+', emergencyContact:'01700000012', active:true, photo:'' },
    { id:'e3', name:'Fahim Rahman', email:'fahim@aqua.demo', phone:'01700000003', department:'Creative Studio', designation:'Motion Designer', joinDate:'2025-07-01', employmentType:'Full Time', salary:45000, address:'Dhaka, Bangladesh', bloodGroup:'A+', emergencyContact:'01700000013', active:true, photo:'' },
    { id:'e4', name:'Tamanna Islam', email:'tamanna@aqua.demo', phone:'01700000004', department:'Accounts', designation:'Accounts Executive', joinDate:'2023-11-20', employmentType:'Full Time', salary:62000, address:'Dhaka, Bangladesh', bloodGroup:'AB+', emergencyContact:'01700000014', active:true, photo:'' },
    { id:'e5', name:'Arif Hossain', email:'arif@aqua.demo', phone:'01700000005', department:'Operations', designation:'Project Coordinator', joinDate:'2025-04-09', employmentType:'Contract', salary:42000, address:'Dhaka, Bangladesh', bloodGroup:'B-', emergencyContact:'01700000015', active:true, photo:'' },
    { id:'e6', name:'Tanjin Ahmed', email:'tanjin@aqua.demo', phone:'01700000006', department:'Technology', designation:'Frontend Developer', joinDate:'2024-09-18', employmentType:'Full Time', salary:73000, address:'Dhaka, Bangladesh', bloodGroup:'O-', emergencyContact:'01700000016', active:true, photo:'' }
  ],
  leaveTypes: [
    { id:'lt1', code:'CL', name:'Casual Leave', days:10, paid:true, halfDay:true, carry:false, maxCarry:0, maxConsecutive:5, accrual:0, active:true, requiresDocument:false, retrospective:false, notice:false },
    { id:'lt2', code:'SL', name:'Sick Leave', days:14, paid:true, halfDay:true, carry:false, maxCarry:0, maxConsecutive:14, accrual:0, active:true, requiresDocument:true, retrospective:true, notice:false },
    { id:'lt3', code:'AL', name:'Annual Leave', days:20, paid:true, halfDay:true, carry:true, maxCarry:5, maxConsecutive:15, accrual:0, active:true, requiresDocument:false, retrospective:false, notice:true },
    { id:'lt4', code:'LWP', name:'Leave Without Pay', days:0, paid:false, halfDay:false, carry:false, maxCarry:0, maxConsecutive:30, accrual:0, active:true, requiresDocument:false, retrospective:false, notice:false }
  ],
  balances: [
    ...['e1','e2','e3','e4','e5','e6'].flatMap(employeeId => [
      { id:`b-${employeeId}-lt1`, employeeId, leaveTypeId:'lt1', available:8 },
      { id:`b-${employeeId}-lt2`, employeeId, leaveTypeId:'lt2', available:12 },
      { id:`b-${employeeId}-lt3`, employeeId, leaveTypeId:'lt3', available:17 }
    ])
  ],
  leaves: [
    { id:'l1', employeeId:'e1', leaveTypeId:'lt1', start:'2026-10-28', end:'2026-10-29', days:2, reason:'Family commitment', status:'Pending', source:'HRMS', created:'2026-10-24', notes:'' },
    { id:'l2', employeeId:'e3', leaveTypeId:'lt2', start:'2026-10-15', end:'2026-10-15', days:1, reason:'Medical appointment', status:'Approved', source:'Legacy', created:'2026-10-11', notes:'Approved by HR' },
    { id:'l3', employeeId:'e5', leaveTypeId:'lt3', start:'2026-11-02', end:'2026-11-04', days:3, reason:'Travel', status:'Pending', source:'HRMS', created:'2026-10-22', notes:'' }
  ],
  attendance: [
    { id:'a1', employeeId:'e1', date:'2026-10-22', firstIn:'09:05', lastOut:'18:03', status:'Present', late:5, source:'QR' },
    { id:'a2', employeeId:'e2', date:'2026-10-22', firstIn:'09:00', lastOut:'18:00', status:'Present', late:0, source:'Manual' },
    { id:'a3', employeeId:'e3', date:'2026-10-22', firstIn:'09:23', lastOut:'18:07', status:'Late', late:23, source:'QR' },
    { id:'a4', employeeId:'e4', date:'2026-10-22', firstIn:'09:02', lastOut:'18:01', status:'Present', late:2, source:'QR' },
    { id:'a5', employeeId:'e1', date:'2026-10-25', firstIn:'09:07', lastOut:'18:10', status:'Present', late:7, source:'QR' },
    { id:'a6', employeeId:'e2', date:'2026-10-25', firstIn:'08:57', lastOut:'18:00', status:'Present', late:0, source:'Manual' },
    { id:'a7', employeeId:'e3', date:'2026-10-25', firstIn:'09:38', lastOut:'18:02', status:'Late', late:38, source:'QR' },
    { id:'a8', employeeId:'e1', date:'2026-10-26', firstIn:'09:01', lastOut:'', status:'Present', late:1, source:'QR' },
    { id:'a9', employeeId:'e2', date:'2026-10-26', firstIn:'09:00', lastOut:'', status:'Present', late:0, source:'QR' },
    { id:'a10', employeeId:'e4', date:'2026-10-26', firstIn:'09:08', lastOut:'', status:'Present', late:8, source:'QR' }
  ],
  qrTokens:[{ id:'q1', token:'AQUA-DEMO-WEEK-43', type:'weekly', start:'2026-10-25', end:'2026-10-31', active:true }],
  corrections:[{ id:'c1', employeeId:'e3', date:'2026-10-22', firstIn:'09:10', lastOut:'18:07', reason:'Traffic delay', status:'Pending', created:'2026-10-23' }],
  overtime:[{ id:'ot1', employeeId:'e5', date:'2026-10-22', minutes:120, approvedMinutes:0, reason:'Event setup', status:'Pending', created:'2026-10-23' }],
  notices:[
    { id:'n1', title:'Team Coordination Meeting', category:'General', body:'The weekly coordination meeting will be held on Tuesday at 10:00 AM.', audience:'All', created:'2026-10-22', active:true, priority:'Normal' },
    { id:'n2', title:'Payroll Submission Deadline', category:'HR', body:'Please submit any corrections before the end of the month.', audience:'All', created:'2026-10-23', active:true, priority:'High' },
    { id:'n3', title:'October Holiday Notice', category:'Holiday', body:'Please check the official holiday and work schedule in the HR portal.', audience:'All', created:'2026-10-19', active:true, priority:'Normal' }
  ],
  notifications:[{ id:'nf1', title:'Welcome to AQUA', message:'Your demo HRMS is ready.', userId:'u3', read:false, created:'2026-10-25' }],
  salaries:[{ id:'s1', employeeId:'e1', month:'2026-09', basic:45000, allowance:10000, deduction:1500, net:53500, paid:true },{ id:'s2', employeeId:'e2', month:'2026-09', basic:65000, allowance:15000, deduction:2000, net:78000, paid:true },{ id:'s3', employeeId:'e3', month:'2026-09', basic:37000, allowance:8000, deduction:500, net:44500, paid:true },{ id:'s4', employeeId:'e4', month:'2026-09', basic:52000, allowance:10000, deduction:1000, net:61000, paid:true }],
  accounts:[{ id:'ac1', date:'2026-10-05', type:'Income', category:'Client Payment', description:'September project settlement', amount:425000 },{ id:'ac2', date:'2026-10-09', type:'Expense', category:'Rent', description:'Office rent', amount:95000 },{ id:'ac3', date:'2026-10-18', type:'Expense', category:'Operations', description:'Production advance', amount:72000 },{ id:'ac4', date:'2026-10-21', type:'Income', category:'Client Payment', description:'Activation project advance', amount:180000 }],
  periods:[{ id:'p1', name:'September 2026', start:'2026-09-01', end:'2026-09-30', status:'Locked' },{ id:'p2', name:'October 2026', start:'2026-10-01', end:'2026-10-31', status:'Open' }],
  holidays:[{ id:'h1', name:'Durga Puja', date:'2026-10-20', type:'Public', recurring:false },{ id:'h2', name:'Victory Day', date:'2026-12-16', type:'Public', recurring:true }],
  schedules:[{ id:'ws1', name:'Standard Office', timezone:'Asia/Dhaka', workDays:[0,1,2,3,4], start:'09:00', end:'18:00', breakMinutes:60, graceMinutes:15, default:true }],
  audit:[{ id:'log1', actor:'system@aqua.demo', action:'SEED_DEMO', entity:'SYSTEM', entityId:'demo', detail:'Initialized local demo records', date:'2026-10-26' }]
};
