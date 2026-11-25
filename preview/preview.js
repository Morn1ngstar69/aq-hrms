/*
 * AQUA HRMS standalone UI preview.
 * Runs from file:// or VS Code Live Server with no packages or network.
 * It is a visual walkthrough with local demo interactions, not the Next.js app.
 */
(function () {
  'use strict';
  const root = document.getElementById('app');
  const seed = window.AQUA_PREVIEW_SEED;
  if (!seed) { root.textContent = 'Preview data could not load. Keep demo-data.js next to preview.js.'; return; }

  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, s => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[s]));
  const uid = prefix => prefix + '_' + Math.random().toString(36).slice(2, 10);
  const money = value => '৳' + new Intl.NumberFormat('en-BD', { maximumFractionDigits:0 }).format(Number(value) || 0);
  const departments = ['Brand & Communications','Operations','Creative Studio','Accounts','Human Resources','Technology'];
  const nav = {
    admin: [
      ['employees','▦','Employees'],['designations','◇','Designations'],['attendance','▤','Attendance'],
      ['qr','▣','QR Attendance'],['leaves','▧','Leave Requests'],['notices','◫','Notice Board'],
      ['hr-dashboard','▥','HR Dashboard'],['mgr-inbox','☷','Approvals'],['hrms-qr','▣','HRMS QR Code'],
      ['policy-admin','⚙','Policy Admin'],['hr-reports','▤','Reports & Audit'],['users','♙','User Management']
    ],
    employee: [
      ['profile','◉','My Profile'],['scan','▣','Scan Attendance'],['attendance','▦','History'],
      ['leave','▤','Leave Request'],['hrms-leave','◇','HRMS Leaves'],['hrms-att','◷','HRMS Attendance'],['notices','◫','Notice Board']
    ],
    accountant: [
      ['salary','৳','Salary Statements'],['accounts','▣','Company Accounts'],
      ['notices','◫','Notice Board'],['hr-reports','▤','Leave & Attendance Reports']
    ]
  };
  const tabs = { admin:'employees', employee:'profile', accountant:'salary' };
  const roleNames = { admin:'AQUA Administrator', employee:'Sadman Bin Rashid', accountant:'Tamanna Islam' };
  const currentUserIds = { admin:'u1', employee:'u3', accountant:'u4' };
  let data = clone(seed);
  let role = null;
  let tab = 'employees';
  let filters = { search:'', department:'All', type:'All', leave:'All', notice:'All', month:'2026-10', attendance:'All', salaryMonth:'2026-09' };
  let modal = null;
  let mobile = false;
  let alertTimer = null;

  try {
    const s = sessionStorage.getItem('aqua-preview-data-v2');
    if (s) data = Object.assign(clone(seed), JSON.parse(s));
  } catch (_) { /* File permissions can disallow storage. In-memory state still works. */ }

  function persist() {
    try { sessionStorage.setItem('aqua-preview-data-v2', JSON.stringify(data)); } catch (_) { }
  }
  function reset() {
    data = clone(seed);
    persist();
    flash('Demo records reset to their original values.');
    render();
  }
  function currentUser() { return data.users.find(u => u.id === currentUserIds[role]); }
  function selfEmployee() { return data.employees.find(e => e.id === currentUser()?.employeeId); }
  function employeeName(id) { return data.employees.find(e => e.id === id)?.name || 'Former employee'; }
  function leaveTypeName(id) { return data.leaveTypes.find(t => t.id === id)?.name || id; }
  function initials(name) { return String(name || 'AQ').split(/\s+/).slice(0,2).map(t=>t[0]?.toUpperCase()).join(''); }
  function avatar(name, extra='') { return `<span class="preview-user-avatar ${extra}">${escape(initials(name))}</span>`; }
  function logo() { return '<span class="preview-logo" aria-hidden="true">A</span>'; }
  function badge(label) {
    const kind = /^(Active|Approved|Present|Paid|Open|Income|Completed)$/i.test(label) ? 'ok' :
      /^(Pending|Late|High)$/i.test(label) ? 'pending' : /^(Rejected|Inactive|Disabled|Absent|Expense)$/i.test(label) ? 'danger' : '';
    return `<span class="preview-pill ${kind}">${escape(label)}</span>`;
  }
  function btn(label, act, id='', cls='outline') {
    return `<button type="button" class="btn ${cls}" data-action="${escape(act)}" data-id="${escape(id)}">${escape(label)}</button>`;
  }
  function tinyBtn(label, act, id='', cls='') {
    return `<button type="button" class="small-btn ${cls}" data-action="${escape(act)}" data-id="${escape(id)}">${escape(label)}</button>`;
  }
  function stat(label, value, sub='') {
    return `<div class="stat"><span class="stat-label">${escape(label)}</span><strong>${escape(value)}</strong><small>${escape(sub)}</small></div>`;
  }
  function stats(...items) { return `<div class="stats-grid">${items.join('')}</div>`; }
  function card(title, description, body, action='') {
    return `<section class="preview-card"><header class="preview-card-head"><div><h2>${escape(title)}</h2>${description ? `<p>${escape(description)}</p>`:''}</div>${action}</header><div class="preview-card-body">${body}</div></section>`;
  }
  function table(cols, rows, empty='No records available.') {
    if (!rows.length) return `<div class="preview-empty">${escape(empty)}</div>`;
    return `<div class="table-container"><table class="preview-table"><thead><tr>${cols.map(c=>`<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  }
  function infoRow(key, val) { return `<div><small>${escape(key)}</small><strong>${escape(val || 'Not provided')}</strong></div>`; }
  function dateFmt(d) { return escape(d || ''); }
  function lastDate() { return '2026-10-26'; }

  function flash(message) {
    const old = document.querySelector('.preview-alert');
    if (old) old.remove();
    if (alertTimer) clearTimeout(alertTimer);
    const el = document.createElement('div');
    el.className='preview-alert';el.setAttribute('role','status'); el.textContent = message; document.body.appendChild(el);
    alertTimer=setTimeout(()=>el.remove(),3400);
  }

  function renderLogin() {
    root.className = 'preview-auth';
    root.innerHTML = `<div class="preview-banner"><strong>INTERACTIVE HTML PREVIEW</strong> · No Node.js, npm or internet needed · Open the Next.js app separately for the complete HRMS</div>
      <main class="auth-screen">
        <section class="auth-side">
          ${logo()}
          <div class="eyebrow" style="margin-top:55px">AQUA INNOVATIONS / PEOPLE PLATFORM</div>
          <h1>People first.<br><em>Everything connected.</em></h1>
          <p>Your team, attendance, approvals and company operations. One seamless place to manage the work that matters.</p>
          <div class="left-caption"><span>01 &nbsp; Employee management</span><span>02 &nbsp; Attendance and leaves</span><span>03 &nbsp; HR and financial reporting</span></div>
          <span class="demo-tag">LOCAL OFFLINE INTERFACE DEMONSTRATION</span>
        </section>
        <section class="auth-card">
          <div class="login-top"><div class="row">${logo()}<strong>AQUA HRMS</strong></div><span>DEMO 1.0</span></div>
          <div class="eyebrow">WELCOME BACK</div>
          <h2>Sign in to your workspace</h2>
          <p class="muted">Explore every role with bundled, consistent demo data.</p>
          <form id="login-form" class="form-stack">
            <label class="field"><span>Username</span><input name="username" autocomplete="username" value="admin" required aria-label="Username"></label>
            <label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" value="demo123" required aria-label="Password"></label>
            <div id="login-error" role="alert" class="error-text"></div>
            <button class="btn wide" type="submit">Sign in to AQUA HRMS &nbsp; →</button>
          </form>
          <div class="demo-credentials"><p>Choose a demo workspace. All passwords are <strong>demo123</strong></p><div class="demo-grid">
            <button type="button" data-action="demo-login" data-id="admin"><strong>Administrator</strong><span>admin</span></button>
            <button type="button" data-action="demo-login" data-id="hr"><strong>Human Resources</strong><span>hr</span></button>
            <button type="button" data-action="demo-login" data-id="employee"><strong>Employee</strong><span>employee</span></button>
            <button type="button" data-action="demo-login" data-id="accountant"><strong>Accountant</strong><span>accountant</span></button>
          </div></div>
          <p class="security-note">Offline prototype. Contains fictional data and sample passwords. Do not enter real employee information.</p>
        </section>
      </main>`;
    document.title='AQUA HRMS | Sign In';
  }
  function signIn(username, password) {
    const account = data.users.find(u => u.username.toLowerCase()===String(username).trim().toLowerCase() && u.password===password && u.active);
    if (!account) {
      const error=document.getElementById('login-error'); if (error) error.textContent='Incorrect username or password. Try a demo account.';
      return;
    }
    role = account.role === 'accountant' ? 'accountant' : account.role === 'employee' ? 'employee' : 'admin';
    if (account.role==='hr') currentUserIds.admin=account.id;
    else currentUserIds[role]=account.id;
    tab=tabs[role];
    render();
    flash(`Welcome to the ${role==='admin'?'Admin / HR':role[0].toUpperCase()+role.slice(1)} workspace.`);
  }
  function demoSignIn(target) {
    const username = target==='hr'?'hr':target;
    const account = data.users.find(u => u.username===username);
    if (account) signIn(username, 'demo123');
  }

  function renderDashboard() {
    root.className='preview-app';
    const options=nav[role];
    if (!options.some(o=>o[0]===tab)) tab=tabs[role];
    const active=options.find(o=>o[0]===tab);
    const displayName=currentUser()?.fullName || roleNames[role];
    const subtitle=role==='admin'?'HR Administration':role==='accountant'?'Accounts Workspace':'Employee Portal';
    const heading=role==='admin'?'HR Management':role==='accountant'?'Financial Management':'My Workspace';
    const message=role==='admin'?'Manage employees, attendance and HR operations.':role==='accountant'?'Maintain salary statements and company transactions.':'View your profile, attendance, leaves and announcements.';
    root.innerHTML=`<div class="preview-banner"><strong>HTML + CSS VISUAL PREVIEW</strong> · ${role.toUpperCase()} · Local demo data · Changes stay within this browser session</div>
      <div class="dashboard">
        <aside class="sidebar ${mobile?'open':''}" aria-label="Workspace navigation">
          <div class="sidebar-head"><div class="brand">${logo()}<span><strong>AQUA HRMS</strong><small>${escape(subtitle)}</small></span></div><button class="mobile-close" type="button" data-action="mobile-close" aria-label="Close menu">✕</button></div>
          <div class="user-side">${avatar(displayName)}<div><strong>${escape(displayName)}</strong><span class="role-pill">${escape(role==='admin'&&currentUser()?.role==='hr'?'HR':role.toUpperCase())}</span></div></div>
          <div class="nav-caption">WORKSPACE</div><nav class="side-nav">${options.map(([key,icon,label])=>{
            let count = key==='employees'?data.employees.length: key==='leaves'||key==='mgr-inbox'?data.leaves.filter(l=>l.status==='Pending').length: key==='notices'?data.notices.filter(n=>n.active).length:0;
            return `<button type="button" data-action="navigate" data-id="${escape(key)}" ${key===tab?'aria-current="page"':''} class="${key===tab?'selected':''}"><span class="nav-icon">${icon}</span><span>${escape(label)}</span>${count?`<small class="nav-count">${count}</small>`:''}</button>`;
          }).join('')}</nav>
          <div class="sidebar-bottom">${role==='admin'?'<button class="signout" style="margin-bottom:8px" type="button" data-action="reset-demo">↻ &nbsp; Reset Demo Data</button>':''}<button class="signout" type="button" data-action="logout">↪ &nbsp; Sign Out</button><span class="demo-sidebar">Standalone HTML preview · No internet required</span></div>
        </aside>
        ${mobile?'<div class="sidebar-scrim" data-action="mobile-close"></div>':''}
        <div class="main-column"><header class="topbar">
          <button class="menu-btn" type="button" data-action="mobile-open" aria-label="Open menu">☰</button>
          <div class="topbar-title"><small>${escape(heading)}</small><strong>${escape(active[2])}</strong></div>
          <div class="topbar-right"><span class="preview-topbar-indicator"><i class="online-dot"></i> OFFLINE DEMO</span><label class="sr-only" for="quick-role">Quick role preview</label>
            <select id="quick-role" aria-label="Switch preview workspace" class="role-selector" data-change="role"><option value="admin" ${role==='admin'?'selected':''}>Admin / HR</option><option value="employee" ${role==='employee'?'selected':''}>Employee</option><option value="accountant" ${role==='accountant'?'selected':''}>Accountant</option></select>
            <span class="topbar-avatar">${avatar(displayName,'small')}</span>
          </div>
        </header>
        <main class="page-content"><div class="welcome"><div><div class="eyebrow">AQUA INNOVATIONS / HUMAN RESOURCES</div><h1>${escape(active[2])}</h1><p>${escape(message)}</p></div><span class="date-pill">October 2026</span></div>
        <div id="module-content">${renderSection()}</div>
        <footer class="preview-footer"><span>© 2026 AQUA Innovations · HRMS Interface Preview</span><span>Demo data only · No server or database</span></footer>
        </main></div></div><div id="modal-root"></div>`;
    document.title=`${active[2]} | AQUA HRMS Preview`;
    if (modal) renderModal();
  }
  function render() { role?renderDashboard():renderLogin(); }
  function renderSection() {
    if (role==='admin') {
      switch (tab) {
        case 'employees':return employees(); case 'designations':return designations(); case 'attendance':return attendance();
        case 'qr':case 'hrms-qr':return qr(); case 'leaves':return leaveAdmin();case 'notices':return notices();
        case 'hr-dashboard':return hrDashboard();case 'mgr-inbox':return approvals();case 'policy-admin':return policies();
        case 'hr-reports':return reports();case 'users':return users();
      }
    } else if (role==='employee') {
      switch (tab) {
        case 'profile':return profile();case 'scan':return scan();case 'attendance':return attendance(true);
        case 'leave':return leaveEmployee(true);case 'hrms-leave':return leaveEmployee(false);
        case 'hrms-att':return attendancePortal();case 'notices':return notices();
      }
    } else {
      switch (tab) {
        case 'salary':return salaries();case 'accounts':return accounts();case 'notices':return notices();case 'hr-reports':return reports();
      }
    }
    return card('Module','', '<div class="preview-empty">Module is not available in this workspace.</div>');
  }

  function employees() {
    const rows=data.employees.filter(e =>
      (e.name+' '+e.designation+' '+e.email).toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.department==='All'||e.department===filters.department) &&
      (filters.type==='All'||e.employmentType===filters.type));
    const top=stats(
      stat('Active Employees',data.employees.filter(e=>e.active).length,'Across AQUA'),
      stat('Departments',new Set(data.employees.map(e=>e.department)).size,'Operational teams'),
      stat('Contract Staff',data.employees.filter(e=>e.employmentType==='Contract').length,'Employment type'),
      stat('Monthly Gross Payroll',money(data.employees.reduce((s,e)=>s+(Number(e.salary)||0),0)),'Combined salary')
    );
    const toolbar=`<div class="preview-toolbar"><input id="employee-search" placeholder="Search people or job titles..." aria-label="Search employees" value="${escape(filters.search)}" data-filter="search"><select data-filter="department" aria-label="Department">${['All',...departments].map(d=>`<option ${d===filters.department?'selected':''}>${escape(d)}</option>`).join('')}</select><select data-filter="type" aria-label="Employment type">${['All','Full Time','Part Time','Contract','Internship'].map(d=>`<option ${d===filters.type?'selected':''}>${escape(d)}</option>`).join('')}</select><span class="filter-count">${rows.length} people</span></div>`;
    const tiles=rows.length?`<div class="employee-grid">${rows.map(e=>`<article class="employee-tile"><div class="row split">${avatar(e.name,'preview-avatar-card')}${badge(e.active?'Active':'Inactive')}</div><h3>${escape(e.name)}</h3><p>${escape(e.designation)}</p><small>${escape(e.department)}</small><div class="tile-meta"><span>${escape(e.email)}</span><span>${escape(e.phone)}</span></div><div class="tile-actions">${tinyBtn('View','view-employee',e.id)}${tinyBtn('Edit','edit-employee',e.id)}${tinyBtn('Delete','delete-employee',e.id,'danger')}</div></article>`).join('')}</div>`:'<div class="preview-card-body"><div class="preview-empty">No employees match those filters.</div></div>';
    return `${top}<section class="preview-card"><div class="preview-card-head"><div><h2>Employee Directory</h2><p>Search profiles, departments and employment details</p></div>${btn('+ Add Employee','add-employee','','')}</div><div style="padding:0 18px">${toolbar}</div>${tiles}</section>`;
  }
  function designations() {
    return card('Department & Designation Management','Changes update the same employee records displayed in the directory.',
      table(['Employee','Department','Designation','Current Status','Action'],data.employees.map(e=>`<tr><td><strong>${escape(e.name)}</strong><small>${escape(e.email)}</small></td><td>${escape(e.department)}</td><td>${escape(e.designation)}</td><td>${badge(e.active?'Active':'Inactive')}</td><td>${tinyBtn('Assign','designation',e.id)}</td></tr>`)));
  }
  function attendance(employeeOnly=false) {
    const rows=data.attendance.filter(a =>a.date.startsWith(filters.month) && (!employeeOnly || a.employeeId===selfEmployee()?.id) && (employeeOnly || filters.attendance==='All'||filters.attendance===a.employeeId)).sort((a,b)=>b.date.localeCompare(a.date));
    const top=stats(stat('Attendance Records',rows.length,'Selected month'),stat('Present',rows.filter(r=>r.status==='Present').length,'Recorded on time'),stat('Late Records',rows.filter(r=>r.status==='Late'||r.late>15).length,'Late arrivals'),stat('Missing Check-Out',rows.filter(r=>!r.lastOut).length,'Open attendance'));
    const tool=`<div class="preview-toolbar"><input type="month" aria-label="Month" data-filter="month" value="${escape(filters.month)}">${employeeOnly?'':`<select data-filter="attendance" aria-label="Employee"><option value="All">All employees</option>${data.employees.map(e=>`<option value="${escape(e.id)}" ${e.id===filters.attendance?'selected':''}>${escape(e.name)}</option>`).join('')}</select>`}</div>`;
    return `${top}${card(employeeOnly?'My Attendance History':'Attendance Tracker','Monthly check-in, check-out and late arrival summary',tool+table(['Employee','Date','Check In','Check Out','Status','Late','Source'],rows.map(a=>`<tr><td><strong>${escape(employeeName(a.employeeId))}</strong></td><td>${dateFmt(a.date)}</td><td>${escape(a.firstIn||'-')}</td><td>${escape(a.lastOut||'Not yet')}</td><td>${badge(a.status)}</td><td>${escape(a.late||0)} min</td><td>${escape(a.source)}</td></tr>`),'No attendance records for these filters.'),employeeOnly?'':btn('+ Add Record','add-attendance','',''))}`;
  }
  function qr() {
    const active=data.qrTokens.filter(t=>t.active);
    const token=active.at(-1)?.token || 'AQUA-DEMO-WEEK-43';
    const box=`<div class="preview-main-grid"><div class="preview-qr-block">${qrSVG(token)}<strong>${escape(token)}</strong><small>ILLUSTRATIVE QR GRID. USE THE NEXT.JS APP FOR SCANNABLE QR CODES.</small></div><div><h3 style="margin:0 0 15px">Active QR Tokens</h3>${table(['Token','From','To'],active.map(t=>`<tr><td>${escape(t.token)}</td><td>${escape(t.start)}</td><td>${escape(t.end)}</td></tr>`))}<div class="preview-actions" style="margin-top:20px">${btn('Generate Attendance Token','add-qr','','')}</div><p class="preview-help">The same token can be entered in the employee Scan Attendance preview.</p></div></div>`;
    return card(tab==='hrms-qr'?'HRMS QR Attendance Token':'Weekly QR Attendance','Generate a local attendance token',box);
  }
  function qrSVG(token) {
    let h=0;for(const c of token) h=(Math.imul(h,31)+c.charCodeAt(0))|0;
    const finder=(x,y)=>[[0,0],[14,0],[0,14]].some(([a,b])=>x>=a&&x<a+7&&y>=b&&y<b+7);
    function finderBit(x,y) {let a=x>=14?14:0,b=y>=14?14:0;const dx=x-a,dy=y-b;return dx===0||dy===0||dx===6||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4);}
    let boxes='';for(let y=0;y<21;y++)for(let x=0;x<21;x++){
      const on=finder(x,y)?finderBit(x,y): (((x*193+y*223+h)^((x+y+23)*31))&7)<4;
      boxes+=`<span class="${on?'dark':''}"></span>`;
    }
    return `<div class="preview-qr-matrix" role="img" aria-label="Decorative QR token preview">${boxes}</div>`;
  }
  function leaveAdmin() {
    const arr=data.leaves.filter(l=>filters.leave==='All'||l.status===filters.leave);
    const counts=stats(stat('Pending',data.leaves.filter(l=>l.status==='Pending').length,'Awaiting review'),stat('Approved',data.leaves.filter(l=>l.status==='Approved').length,'Confirmed'),stat('Rejected',data.leaves.filter(l=>l.status==='Rejected').length,'Declined'));
    const filt=`<div class="preview-toolbar"><select data-filter="leave" aria-label="Leave status">${['All','Pending','Approved','Rejected'].map(d=>`<option ${filters.leave===d?'selected':''}>${d}</option>`).join('')}</select></div>`;
    return `${counts}${card('Leave Requests','Review team leave applications',filt+table(['Employee','Leave Type','From','To','Days','Status','Action'],arr.map(l=>`<tr><td><strong>${escape(employeeName(l.employeeId))}</strong></td><td>${escape(leaveTypeName(l.leaveTypeId))}</td><td>${escape(l.start)}</td><td>${escape(l.end)}</td><td>${escape(l.days)}</td><td>${badge(l.status)}</td><td>${l.status==='Pending'?tinyBtn('Review','review-leave',l.id):escape(l.notes||'Reviewed')}</td></tr>`)))}`;
  }
  function notices() {
    const writable=role==='admin';const rows=data.notices.filter(n=>n.active&&(filters.notice==='All'||n.category===filters.notice));
    const boxes=rows.length?`<div class="notice-list">${rows.map(n=>`<article class="notice"><div class="row wrap">${badge(n.category)}${badge(n.priority)}<small>${escape(n.created)}</small></div><h3>${escape(n.title)}</h3><p>${escape(n.body)}</p>${writable?`<div class="row">${tinyBtn('Edit','edit-notice',n.id)}${tinyBtn('Remove','delete-notice',n.id,'danger')}</div>`:''}</article>`).join('')}</div>`:'<div class="preview-empty">No notices in this category.</div>';
    const body=`<div class="preview-toolbar"><select data-filter="notice" aria-label="Notice category">${['All','General','HR','Holiday','Policy','Event','Urgent'].map(d=>`<option ${filters.notice===d?'selected':''}>${d}</option>`).join('')}</select></div>${boxes}`;
    return card('Notice Board','Company-wide announcements and important updates',body,writable?btn('+ Post Notice','add-notice','',''):'');
  }
  function hrDashboard() {
    const pending=data.leaves.filter(l=>l.status==='Pending');const t=stats(stat('Total Employees',data.employees.length,'Active directory'),stat('Leave Pending',pending.length,'Requires review'),stat('Open Attendance',data.attendance.filter(a=>!a.lastOut).length,'No check-out time'),stat('Payroll Period','October 2026','Open period'));
    const deptCounts=departments.map(d=>({name:d,count:data.employees.filter(e=>e.department===d).length}));const max=Math.max(1,...deptCounts.map(x=>x.count));
    const bars=`<div class="preview-bars">${deptCounts.map(d=>`<div><div class="row"><strong>${escape(d.name)}</strong><span>${d.count} people</span></div><div class="preview-bar"><span style="width:${Math.round(d.count/max*100)}%"></span></div></div>`).join('')}</div>`;
    const approval=table(['Employee','Leave','Status','Action'],pending.map(l=>`<tr><td>${escape(employeeName(l.employeeId))}</td><td>${escape(leaveTypeName(l.leaveTypeId))}</td><td>${badge(l.status)}</td><td>${tinyBtn('Review','review-leave',l.id)}</td></tr>`));
    return `${t}<div class="preview-main-grid">${card('Department Overview','Employees by functional team',bars)}${card('HR Summary','Payroll and leave overview',`<div class="preview-steps"><div class="preview-steps-item"><b>01</b><div><strong>Leave policy</strong><span>${data.leaveTypes.filter(x=>x.active).length} active leave types</span></div></div><div class="preview-steps-item"><b>02</b><div><strong>Company notices</strong><span>${data.notices.filter(x=>x.active).length} published announcements</span></div></div><div class="preview-steps-item"><b>03</b><div><strong>Attendance & approvals</strong><span>${data.corrections.filter(x=>x.status==='Pending').length+data.overtime.filter(x=>x.status==='Pending').length} other pending requests</span></div></div></div>`)}</div>${card('Pending Leave Approvals','Review requests from the team',approval)}`;
  }
  function approvals() {
    const leave=data.leaves.filter(l=>l.status==='Pending');const cor=data.corrections.filter(c=>c.status==='Pending');const ot=data.overtime.filter(o=>o.status==='Pending');
    return `${stats(stat('Leave Requests',leave.length),stat('Corrections',cor.length),stat('Overtime Requests',ot.length))}
      ${card('Leave Approvals','Pending HRMS leave requests',table(['Employee','Type','Dates','Status','Action'],leave.map(l=>`<tr><td>${escape(employeeName(l.employeeId))}</td><td>${escape(leaveTypeName(l.leaveTypeId))}</td><td>${escape(l.start)} → ${escape(l.end)}</td><td>${badge(l.status)}</td><td>${tinyBtn('Review','review-leave',l.id)}</td></tr>`)))}
      ${card('Attendance Corrections','Requests to amend recorded times',table(['Employee','Date','Requested In','Requested Out','Action'],cor.map(c=>`<tr><td>${escape(employeeName(c.employeeId))}</td><td>${escape(c.date)}</td><td>${escape(c.firstIn)}</td><td>${escape(c.lastOut)}</td><td>${tinyBtn('Approve','approve-correction',c.id,'success')} ${tinyBtn('Reject','reject-correction',c.id,'danger')}</td></tr>`)))}
      ${card('Overtime Approvals','Overtime requests from employees',table(['Employee','Date','Minutes','Reason','Action'],ot.map(o=>`<tr><td>${escape(employeeName(o.employeeId))}</td><td>${escape(o.date)}</td><td>${escape(o.minutes)}</td><td>${escape(o.reason)}</td><td>${tinyBtn('Approve','approve-overtime',o.id,'success')} ${tinyBtn('Reject','reject-overtime',o.id,'danger')}</td></tr>`)))}`;
  }
  function policies() {
    return `<div class="preview-main-grid">${card('Leave Policy','Accrual, carry-forward and entitlement settings',table(['Code','Type','Days / year','Paid','Action'],data.leaveTypes.map(t=>`<tr><td><strong>${escape(t.code)}</strong></td><td>${escape(t.name)}</td><td>${escape(t.days)}</td><td>${t.paid?'Yes':'No'}</td><td>${tinyBtn('Edit','edit-leavetype',t.id)}</td></tr>`)),btn('+ New Type','add-leavetype','',''))}${card('Holidays','Published company calendar',table(['Holiday','Date','Type'],data.holidays.map(h=>`<tr><td>${escape(h.name)}</td><td>${escape(h.date)}</td><td>${escape(h.type)}</td></tr>`)),btn('+ Add Holiday','add-holiday','',''))}</div>${card('Work Schedule','Office hours, shift and grace period',table(['Schedule','Start','End','Break','Grace'],data.schedules.map(s=>`<tr><td>${escape(s.name)}</td><td>${escape(s.start)}</td><td>${escape(s.end)}</td><td>${s.breakMinutes} min</td><td>${s.graceMinutes} min</td></tr>`)))}`;
  }
  function reports() {
    const byEmp=data.employees.map(e=>({name:e.name,att:data.attendance.filter(a=>a.employeeId===e.id).length,leave:data.leaves.filter(l=>l.employeeId===e.id&&l.status==='Approved').reduce((n,l)=>n+Number(l.days||0),0),late:data.attendance.filter(a=>a.employeeId===e.id).reduce((n,a)=>n+Number(a.late||0),0)}));
    return `${stats(stat('Attendance Entries',data.attendance.length,'All recorded data'),stat('Approved Leave Days',data.leaves.filter(l=>l.status==='Approved').reduce((n,l)=>n+Number(l.days||0),0),'Across staff'),stat('Pending Requests',data.leaves.filter(l=>l.status==='Pending').length,'Leave applications'),stat('Audit Activities',data.audit.length,'Local demo log'))}${card('Attendance & Leave Report','Summary across employees',table(['Employee','Attendance','Leave Days','Late Minutes'],byEmp.map(r=>`<tr><td>${escape(r.name)}</td><td>${r.att}</td><td>${r.leave}</td><td>${r.late}</td></tr>`)),btn('Export CSV','export-report','',''))}${card('Audit Trail','Recent local demonstration activity',table(['Date','Actor','Action','Entity'],data.audit.slice(-12).reverse().map(a=>`<tr><td>${escape(a.date)}</td><td>${escape(a.actor)}</td><td>${escape(a.action)}</td><td>${escape(a.entity)}</td></tr>`)))}`;
  }
  function users() {
    return card('User Management','Local demonstration identities and role assignments',table(['Name','Username','Role','Account','Action'],data.users.map(u=>`<tr><td><strong>${escape(u.fullName)}</strong><small>${escape(u.email)}</small></td><td>${escape(u.username)}</td><td>${badge(u.role.toUpperCase())}</td><td>${badge(u.active?'Active':'Disabled')}</td><td>${u.id===currentUser()?.id?'Current user':tinyBtn('Edit','edit-user',u.id)}</td></tr>`)));
  }
  function profile() {
    const e=selfEmployee();if (!e) return card('Profile','', '<div class="preview-empty">No linked employee profile.</div>');
    const cover=`<div class="preview-profile-cover">${avatar(e.name)}<h2>${escape(e.name)}</h2><p>${escape(e.designation)}</p><span class="preview-pill">${escape(e.department)}</span></div>`;
    const body=`<div class="preview-info-grid">${infoRow('Email',e.email)}${infoRow('Phone',e.phone)}${infoRow('Department',e.department)}${infoRow('Employment Type',e.employmentType)}${infoRow('Joined',e.joinDate)}${infoRow('Blood Group',e.bloodGroup)}${infoRow('Address',e.address)}${infoRow('Emergency Contact',e.emergencyContact)}</div><div class="preview-actions" style="margin-top:18px">${btn('Edit Contact Details','edit-profile','','')}</div>`;
    return `${card('My Employee Profile','Personal and professional information',`<div class="preview-profile-layout">${cover}${body}</div>`)}${card('Recent Attendance','Your latest check-ins',table(['Date','Check In','Check Out','Status'],data.attendance.filter(a=>a.employeeId===e.id).slice(-5).reverse().map(a=>`<tr><td>${escape(a.date)}</td><td>${escape(a.firstIn)}</td><td>${escape(a.lastOut||'Not yet')}</td><td>${badge(a.status)}</td></tr>`)))}`;
  }
  function scan() {
    const token=data.qrTokens.filter(t=>t.active).at(-1)?.token||'';
    return card('Scan Attendance','Check in or check out with the QR token provided by HR',`<div class="preview-main-grid"><div class="preview-qr-block">${qrSVG(token)}<strong>${escape(token)}</strong><small>Decorative preview. Actual camera scanning is supported in the Next.js version.</small></div><div><div class="preview-note">This standalone demo uses a manual QR token. Enter the active token to record a check-in or check-out. The attendance list and reports will update immediately.</div><form id="scan-form" class="form-stack" style="margin-top:18px"><label class="field"><span>QR token</span><input name="token" value="${escape(token)}" required aria-label="QR token"></label><button type="submit" class="btn">Record Attendance</button></form></div></div>`);
  }
  function leaveEmployee(legacy=false) {
    const e=selfEmployee();if(!e)return '';
    const balances=data.balances.filter(b=>b.employeeId===e.id);
    const bal=stats(...balances.map(b=>stat(leaveTypeName(b.leaveTypeId),b.available+' days','Remaining balance')));
    const mine=data.leaves.filter(l=>l.employeeId===e.id).sort((a,b)=>b.created.localeCompare(a.created));
    return `${legacy?'':bal}${card(legacy?'My Leave Requests':'HRMS Leave Portal','Apply for time off and review requests',table(['Leave Type','From','To','Days','Status'],mine.map(l=>`<tr><td>${escape(leaveTypeName(l.leaveTypeId))}</td><td>${escape(l.start)}</td><td>${escape(l.end)}</td><td>${l.days}</td><td>${badge(l.status)}</td></tr>`)),btn('+ New Leave Request','new-leave','',''))}`;
  }
  function attendancePortal() {
    const e=selfEmployee();if(!e)return '';
    return `${stats(stat('My Attendance',data.attendance.filter(a=>a.employeeId===e.id).length,'Recorded days'),stat('Corrections',data.corrections.filter(c=>c.employeeId===e.id).length,'Requests submitted'),stat('Overtime Requests',data.overtime.filter(c=>c.employeeId===e.id).length,'Requests submitted'))}<div class="preview-actions" style="margin-bottom:16px">${btn('Request Correction','new-correction','','')}${btn('Request Overtime','new-overtime','','outline')}</div>${attendance(true)}${card('Attendance Corrections','Your correction requests',table(['Date','New In','New Out','Status'],data.corrections.filter(c=>c.employeeId===e.id).map(c=>`<tr><td>${escape(c.date)}</td><td>${escape(c.firstIn)}</td><td>${escape(c.lastOut)}</td><td>${badge(c.status)}</td></tr>`)))}${card('Overtime Requests','Your overtime requests',table(['Date','Minutes','Status'],data.overtime.filter(o=>o.employeeId===e.id).map(o=>`<tr><td>${escape(o.date)}</td><td>${escape(o.minutes)}</td><td>${badge(o.status)}</td></tr>`)))}`;
  }
  function salaries() {
    const filtered=data.salaries.filter(s=>s.month===filters.salaryMonth);
    const paid=filtered.reduce((n,s)=>n+Number(s.net||0),0);
    return `${stats(stat('Payroll Records',filtered.length,'Selected month'),stat('Gross Salary',money(filtered.reduce((n,s)=>n+Number(s.basic||0)+Number(s.allowance||0),0)),'Before deductions'),stat('Net Salary',money(paid),'After deductions'),stat('Payment Status',filtered.every(s=>s.paid)?'Paid':'Pending','Current period'))}${card('Salary Statements','Edit and manage payroll records',`<div class="preview-toolbar"><input type="month" aria-label="Salary month" data-filter="salaryMonth" value="${escape(filters.salaryMonth)}"></div>${table(['Employee','Basic','Allowances','Deductions','Net','Status','Action'],filtered.map(s=>`<tr><td><strong>${escape(employeeName(s.employeeId))}</strong></td><td>${money(s.basic)}</td><td>${money(s.allowance)}</td><td>${money(s.deduction)}</td><td><strong>${money(s.net)}</strong></td><td>${badge(s.paid?'Paid':'Pending')}</td><td>${tinyBtn('Edit','edit-salary',s.id)} ${tinyBtn('Delete','delete-salary',s.id,'danger')}</td></tr>`) ,'No salary statements for this month.')}`,btn('+ New Statement','add-salary','',''))}`;
  }
  function accounts() {
    const income=data.accounts.filter(a=>a.type==='Income').reduce((s,a)=>s+Number(a.amount),0);const expense=data.accounts.filter(a=>a.type==='Expense').reduce((s,a)=>s+Number(a.amount),0);
    return `${stats(stat('Income',money(income),'Total recorded'),stat('Expenses',money(expense),'Total recorded'),stat('Net Balance',money(income-expense),'Calculated'),stat('Transactions',data.accounts.length,'Ledger records'))}${card('Company Accounts','Local company income and expense ledger',table(['Date','Type','Category','Description','Amount','Action'],data.accounts.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(a=>`<tr><td>${escape(a.date)}</td><td>${badge(a.type)}</td><td>${escape(a.category)}</td><td>${escape(a.description)}</td><td><strong>${money(a.amount)}</strong></td><td>${tinyBtn('Edit','edit-account',a.id)} ${tinyBtn('Delete','delete-account',a.id,'danger')}</td></tr>`)),btn('+ Add Transaction','add-account','',''))}`;
  }

  function field(label, name, value='', type='text', required=false, opts=null) {
    const content=opts?`<select name="${escape(name)}" ${required?'required':''}>${opts.map(o=>{const v=Array.isArray(o)?o[0]:o;const txt=Array.isArray(o)?o[1]:o;return `<option value="${escape(v)}" ${String(v)===String(value)?'selected':''}>${escape(txt)}</option>`;}).join('')}</select>`:
      type==='textarea'?`<textarea name="${escape(name)}" ${required?'required':''}>${escape(value)}</textarea>`:`<input name="${escape(name)}" type="${escape(type)}" value="${escape(value)}" ${required?'required':''} ${type==='number'?'min="0" step="any"':''}>`;
    return `<label>${escape(label)} ${required?'*':''}${content}</label>`;
  }
  function modalFrame(title, formHTML) {
    return `<div class="preview-modal-backdrop" data-action="close-modal"><section class="preview-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" onclick="event.stopPropagation()"><header class="preview-modal-header"><h2 id="modal-heading">${escape(title)}</h2><button type="button" data-action="close-modal" aria-label="Close dialog">✕</button></header><div class="modal-body">${formHTML}</div></section></div>`;
  }
  function modalForm(type,id,fields,submit='Save Changes') {
    return `<form id="preview-edit-form" data-form="${escape(type)}" data-id="${escape(id||'')}"><div class="form-grid">${fields}</div><div id="modal-error" class="error-text" role="alert"></div><div class="modal-actions"><button class="btn outline" type="button" data-action="close-modal">Cancel</button><button class="btn" type="submit">${escape(submit)}</button></div></form>`;
  }
  function renderModal() {
    const el=document.getElementById('modal-root');if(!el)return;
    if(!modal){el.innerHTML='';return;}
    const {type,id}=modal;
    const e=data.employees.find(x=>x.id===id);
    const le=data.leaves.find(x=>x.id===id);
    let title='', html='';
    if(type==='employee'||type==='add-employee') {
      title=e?'Edit Employee':'Add Employee'; const x=e||{};
      html=modalForm('employee',id,[field('Full Name','name',x.name||'', 'text',true),field('Email','email',x.email||'','email',true),field('Phone','phone',x.phone||''),field('Designation','designation',x.designation||'', 'text',true),field('Department','department',x.department||departments[0],'text',false,departments),field('Employment Type','employmentType',x.employmentType||'Full Time','text',false,['Full Time','Part Time','Contract','Internship']),field('Monthly Salary','salary',x.salary||45000,'number',true),field('Joining Date','joinDate',x.joinDate||lastDate(),'date',true)].join(''),e?'Save Employee':'Create Employee');
    } else if(type==='view-employee'&&e){
      title='Employee Profile';html=`<div class="row">${avatar(e.name,'preview-avatar-card')}<div><strong>${escape(e.name)}</strong><div class="preview-muted">${escape(e.designation)}</div></div></div><div class="preview-info-grid" style="margin:20px 0">${infoRow('Department',e.department)}${infoRow('Email',e.email)}${infoRow('Phone',e.phone)}${infoRow('Monthly Salary',money(e.salary))}${infoRow('Joined',e.joinDate)}${infoRow('Employment Type',e.employmentType)}</div><div class="modal-actions">${btn('Edit Employee','edit-employee',e.id,'')} ${btn('Close','close-modal','','outline')}</div>`;
    } else if(type==='designation'&&e){
      title='Assign Department & Designation';html=modalForm('designation',id,[field('Department','department',e.department,'text',true,departments),field('Designation','designation',e.designation,'text',true)].join(''));
    } else if(type==='add-attendance'){
      title='New Attendance Record';html=modalForm('attendance','',[field('Employee','employeeId',data.employees[0]?.id,'text',true,data.employees.map(e=>[e.id,e.name])),field('Date','date',lastDate(),'date',true),field('Check In','firstIn','09:00','time',true),field('Check Out','lastOut','18:00','time'),field('Status','status','Present','text',true,['Present','Late','Absent'])].join(''),'Create Record');
    } else if(type==='review-leave'&&le){
      title='Review Leave Request';html=`<p><strong>${escape(employeeName(le.employeeId))}</strong> is requesting <strong>${escape(leaveTypeName(le.leaveTypeId))}</strong>.</p><div class="preview-info-grid">${infoRow('Start',le.start)}${infoRow('End',le.end)}${infoRow('Days',le.days)}${infoRow('Reason',le.reason)}</div><div style="margin-top:24px"><div class="preview-actions">${btn('Reject','reject-leave',le.id,'danger')} ${btn('Approve','approve-leave',le.id,'')}</div></div>`;
    } else if(type==='add-qr'){
      title='Generate QR Attendance Token';html=modalForm('qr','',[field('Token','token','AQUA-QR-WEEK-44','text',true),field('Valid From','start',lastDate(),'date',true),field('Valid Until','end','2026-11-02','date',true)].join(''),'Generate Token');
    } else if(type==='notice'){
      const x=data.notices.find(n=>n.id===id)||{};title=x.id?'Edit Notice':'Create Notice';html=modalForm('notice',id,[field('Title','title',x.title||'','text',true),field('Category','category',x.category||'General','text',true,['General','HR','Holiday','Policy','Event','Urgent']),field('Priority','priority',x.priority||'Normal','text',false,['Normal','High']),field('Audience','audience',x.audience||'All','text',false,['All','Employees','HR','Admin']),field('Message','body',x.body||'','textarea',true)].join(''),x.id?'Save Notice':'Publish Notice');
    } else if(type==='leave'){
      title='New Leave Request';html=modalForm('leave','',[field('Leave Type','leaveTypeId',data.leaveTypes[0]?.id,'text',true,data.leaveTypes.filter(x=>x.active).map(x=>[x.id,x.name])),field('Start Date','start','2026-10-28','date',true),field('End Date','end','2026-10-28','date',true),field('Reason','reason','','textarea',true)].join(''),'Submit Request');
    } else if(type==='profile'){
      const x=selfEmployee()||{};title='Update Contact Information';html=modalForm('profile',x.id,[field('Email','email',x.email||'','email',true),field('Phone','phone',x.phone||''),field('Address','address',x.address||'')].join(''),'Save Profile');
    } else if(type==='correction'){
      title='Request Attendance Correction';html=modalForm('correction','',[field('Attendance Date','date','2026-10-26','date',true),field('Corrected In','firstIn','09:00','time',true),field('Corrected Out','lastOut','18:00','time',true),field('Reason','reason','','textarea',true)].join(''),'Submit Correction');
    } else if(type==='overtime'){
      title='Request Overtime';html=modalForm('overtime','',[field('Date','date',lastDate(),'date',true),field('Minutes','minutes',60,'number',true),field('Reason','reason','','textarea',true)].join(''),'Submit Request');
    } else if(type==='salary'){
      const x=data.salaries.find(s=>s.id===id)||{};title=x.id?'Edit Salary Statement':'New Salary Statement';html=modalForm('salary',id,[field('Employee','employeeId',x.employeeId||data.employees[0]?.id,'text',true,data.employees.map(e=>[e.id,e.name])),field('Month','month',x.month||'2026-10','month',true),field('Basic','basic',x.basic||35000,'number',true),field('Allowance','allowance',x.allowance||5000,'number',true),field('Deductions','deduction',x.deduction||0,'number',true),field('Payment Status','paid',String(x.paid??false),'text',false,[['true','Paid'],['false','Pending']])].join(''),'Save Statement');
    } else if(type==='account'){
      const x=data.accounts.find(a=>a.id===id)||{};title=x.id?'Edit Transaction':'Add Transaction';html=modalForm('account',id,[field('Date','date',x.date||lastDate(),'date',true),field('Type','type',x.type||'Expense','text',true,['Income','Expense']),field('Category','category',x.category||'Operations','text',true),field('Description','description',x.description||'','text',true),field('Amount','amount',x.amount||1000,'number',true)].join(''),'Save Transaction');
    } else if(type==='leaveType'){
      const x=data.leaveTypes.find(t=>t.id===id)||{};title=x.id?'Edit Leave Type':'New Leave Type';html=modalForm('leaveType',id,[field('Code','code',x.code||'','text',true),field('Name','name',x.name||'','text',true),field('Annual Entitlement','days',x.days||0,'number',true),field('Paid','paid',String(x.paid??true),'text',false,[['true','Yes'],['false','No']])].join(''));
    } else if(type==='holiday'){
      title='Add Holiday';html=modalForm('holiday','',[field('Holiday Name','name','','text',true),field('Date','date','2026-12-16','date',true),field('Type','type','Public','text',true,['Public','Optional','Company'])].join(''));
    } else if(type==='user'){
      const x=data.users.find(u=>u.id===id)||{};title='Edit User Account';html=modalForm('user',id,[field('Role','role',x.role||'employee','text',true,['admin','hr','employee','accountant']),field('Status','active',String(x.active??true),'text',true,[['true','Active'],['false','Disabled']])].join(''));
    }
    el.innerHTML=modalFrame(title,html);
    setTimeout(()=>el.querySelector('input,select,textarea,button')?.focus(),0);
  }
  function showModal(type,id='') {modal={type,id};renderModal();}
  function closeModal() {modal=null;renderModal();}
  function update() {persist();render();}
  function formError(msg) {const el=document.getElementById('modal-error');if(el)el.textContent=msg;}
  function saveForm(form) {
    const type=form.dataset.form;const id=form.dataset.id;
    const v=Object.fromEntries(new FormData(form).entries());
    const trim=(key)=>String(v[key]??'').trim();
    if(['employee','notice','leave','profile','correction','overtime'].includes(type) && Object.values(v).some(x=>String(x).length>3000)) return formError('Text is too long.');
    let success='Changes saved.';
    if (type==='employee') {
      if(!trim('name')||!trim('designation')||!/^[^@]+@[^@]+\.[^@]+$/.test(trim('email')))return formError('Enter a valid name, designation and email.');
      const dupe=data.employees.some(e=>e.email.toLowerCase()===trim('email').toLowerCase()&&e.id!==id);
      if(dupe)return formError('This email address is already assigned to another employee.');
      if(!(Number(v.salary)>=0))return formError('Salary must be zero or greater.');
      const old=data.employees.find(e=>e.id===id);
      const item={...old,...v,id:id||uid('e'),salary:Number(v.salary),active:old?.active??true};
      if(old) data.employees=data.employees.map(e=>e.id===id?item:e);else data.employees.push(item);
      success=old?'Employee updated.':'Employee created.';
    } else if(type==='designation'){
      const e=data.employees.find(e=>e.id===id);if(!e||!trim('designation'))return formError('Designation is required.');Object.assign(e,{department:v.department,designation:trim('designation')});
    } else if(type==='attendance'){
      if(data.attendance.some(a=>a.employeeId===v.employeeId&&a.date===v.date)) return formError('An attendance record already exists for this employee and date.');
      const late=v.firstIn>'09:15'?Math.max(0,(Number(v.firstIn.slice(0,2))*60+Number(v.firstIn.slice(3)))-540):0;
      data.attendance.push({...v,id:uid('a'),late,status:late>15?'Late':v.status,source:'Manual'});success='Attendance record created.';
    } else if(type==='qr'){
      if(!trim('token')||v.start>v.end)return formError('Token and a valid date range are required.');
      data.qrTokens.forEach(x=>x.active=false);data.qrTokens.push({...v,id:uid('q'),active:true,type:'weekly'});success='Attendance token generated.';
    } else if(type==='notice'){
      if(!trim('title')||!trim('body'))return formError('Title and message are required.');
      const old=data.notices.find(x=>x.id===id);const item={...old,...v,id:id||uid('n'),active:true,created:old?.created||lastDate()};
      if(old)data.notices=data.notices.map(n=>n.id===id?item:n);else data.notices.unshift(item);success='Notice published.';
    } else if(type==='leave'){
      if(v.start>v.end)return formError('End date must be on or after start date.');
      const days=Math.floor((new Date(v.end+'T00:00:00')-new Date(v.start+'T00:00:00'))/86400000)+1;
      if(!Number.isFinite(days)||days<=0||days>365)return formError('Choose valid start and end dates.');
      const empId=selfEmployee()?.id;if(!empId)return formError('No employee profile is linked to this user.');
      const clash=data.leaves.some(l=>l.employeeId===empId&&l.status!=='Rejected'&&v.start<=l.end&&v.end>=l.start);
      if(clash)return formError('This request overlaps an existing leave application.');
      const balance=data.balances.find(b=>b.employeeId===empId&&b.leaveTypeId===v.leaveTypeId);
      if(balance&&days>balance.available)return formError('Requested days exceed the remaining balance.');
      data.leaves.unshift({...v,id:uid('l'),employeeId:empId,days,created:lastDate(),status:'Pending',source:'HRMS',notes:''});success='Leave request submitted.';
    } else if(type==='profile'){
      const e=selfEmployee();if(!e)return formError('Employee record unavailable.');Object.assign(e,{email:trim('email'),phone:trim('phone'),address:trim('address')});success='Contact details updated.';
    } else if(type==='correction'){
      data.corrections.push({...v,id:uid('c'),employeeId:selfEmployee()?.id,status:'Pending',created:lastDate()});success='Correction requested.';
    } else if(type==='overtime'){
      if(!(Number(v.minutes)>0))return formError('Overtime minutes must be greater than zero.');
      data.overtime.push({...v,id:uid('ot'),employeeId:selfEmployee()?.id,minutes:Number(v.minutes),approvedMinutes:0,status:'Pending',created:lastDate()});success='Overtime requested.';
    } else if(type==='salary'){
      const item={...v,id:id||uid('s'),basic:Number(v.basic),allowance:Number(v.allowance),deduction:Number(v.deduction),paid:v.paid==='true'};
      item.net=item.basic+item.allowance-item.deduction;
      if([item.basic,item.allowance,item.deduction].some(x=>!Number.isFinite(x)||x<0)||item.net<0)return formError('Amounts must be non-negative and deductions cannot exceed gross pay.');
      if(id)data.salaries=data.salaries.map(s=>s.id===id?item:s);else data.salaries.push(item);filters.salaryMonth=item.month;success='Salary statement saved.';
    } else if(type==='account'){
      if(!trim('category')||!trim('description')||!(Number(v.amount)>0))return formError('Enter a category, description and a positive amount.');
      const item={...v,id:id||uid('ac'),amount:Number(v.amount)};
      if(id)data.accounts=data.accounts.map(a=>a.id===id?item:a);else data.accounts.push(item);success='Transaction saved.';
    } else if(type==='leaveType'){
      if(!trim('code')||!trim('name'))return formError('Code and name are required.');
      const old=data.leaveTypes.find(t=>t.id===id);const item={...old,...v,id:id||uid('lt'),days:Number(v.days),paid:v.paid==='true',active:true};
      if(id)data.leaveTypes=data.leaveTypes.map(t=>t.id===id?item:t);else data.leaveTypes.push(item);success='Leave policy saved.';
    } else if(type==='holiday'){
      if(!trim('name')||!trim('date'))return formError('Holiday name and date are required.');
      data.holidays.push({...v,id:uid('h'),recurring:false});success='Holiday added.';
    } else if(type==='user'){
      const u=data.users.find(u=>u.id===id);if(!u)return formError('Account unavailable.');
      Object.assign(u,{role:v.role,active:v.active==='true'});success='Account updated.';
    }
    modal=null;update();flash(success);
  }
  function reviewLeave(id,status) {
    const l=data.leaves.find(l=>l.id===id);if(!l||l.status!=='Pending')return;
    if(status==='Approved') {
      const b=data.balances.find(b=>b.employeeId===l.employeeId&&b.leaveTypeId===l.leaveTypeId);
      if(b&&b.available<l.days){flash('Not enough remaining leave balance.');return;}
      if(b)b.available-=l.days;
    }
    l.status=status;l.notes='Reviewed in HTML preview';modal=null;update();flash(`Leave ${status.toLowerCase()}.`);
  }
  function scanAttendance(token) {
    const record=data.qrTokens.find(q=>q.active&&q.token===token);
    if(!record){flash('Invalid QR token. Use the token provided by HR.');return;}
    const id=selfEmployee()?.id;
    if(!id){flash('No employee is linked to this account.');return;}
    const date=lastDate();let item=data.attendance.find(a=>a.employeeId===id&&a.date===date);
    if (!item){data.attendance.push({id:uid('a'),employeeId:id,date,firstIn:'09:05',lastOut:'',status:'Present',late:5,source:'QR'});flash('Attendance checked in successfully.');}
    else if (!item.lastOut){item.lastOut='18:00';flash('Attendance checked out successfully.');}
    else {flash('Check-in and check-out already exist for today.');return;}
    update();
  }
  function downloadCSV() {
    const dataRows=[['Employee','Attendance','Approved leave days','Late minutes']];
    data.employees.forEach(e=>dataRows.push([e.name, data.attendance.filter(a=>a.employeeId===e.id).length, data.leaves.filter(l=>l.employeeId===e.id&&l.status==='Approved').reduce((n,l)=>n+Number(l.days),0),data.attendance.filter(a=>a.employeeId===e.id).reduce((n,a)=>n+Number(a.late||0),0)]));
    const csv=dataRows.map(r=>r.map(c=>'"'+String(c).replaceAll('"','""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='aqua-hrms-preview-report.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    flash('CSV report exported.');
  }

  document.addEventListener('submit', event => {
    const f=event.target;
    if(!f?.id)return;
    if(f.id==='login-form') {event.preventDefault();const v=new FormData(f);signIn(v.get('username'),v.get('password'));}
    else if(f.id==='preview-edit-form'){event.preventDefault();saveForm(f);}
    else if(f.id==='scan-form'){event.preventDefault();scanAttendance(new FormData(f).get('token'));}
  });
  document.addEventListener('click', event => {
    const button=event.target.closest('[data-action]');if(!button)return;
    const a=button.dataset.action,id=button.dataset.id;
    if(a==='demo-login'){demoSignIn(id);return;}
    if(a==='navigate'){tab=id;mobile=false;render();return;}
    if(a==='mobile-open'){mobile=true;render();return;}
    if(a==='mobile-close'){mobile=false;render();return;}
    if(a==='logout'){role=null;modal=null;render();return;}
    if(a==='reset-demo'){if(confirm('Reset all demo data to the bundled starting state?'))reset();return;}
    if(a==='close-modal'){closeModal();return;}
    if(a==='add-employee'){showModal('add-employee');return;}
    if(a==='edit-employee'){showModal('employee',id);return;}
    if(a==='view-employee'){showModal('view-employee',id);return;}
    if(a==='designation'){showModal('designation',id);return;}
    if(a==='delete-employee'){
      const e=data.employees.find(e=>e.id===id);
      if(e&&confirm(`Delete ${e.name}? This also removes linked preview attendance, leave and payroll records.`)){
        data.employees=data.employees.filter(e=>e.id!==id);
        data.attendance=data.attendance.filter(a=>a.employeeId!==id);
        data.leaves=data.leaves.filter(l=>l.employeeId!==id);
        data.balances=data.balances.filter(b=>b.employeeId!==id);
        data.salaries=data.salaries.filter(s=>s.employeeId!==id);
        update();flash('Employee and linked preview records deleted.');
      }
      return;
    }
    if(a==='add-attendance'){showModal('add-attendance');return;}
    if(a==='add-qr'){showModal('add-qr');return;}
    if(a==='review-leave'){showModal('review-leave',id);return;}
    if(a==='approve-leave'||a==='reject-leave'){reviewLeave(id,a==='approve-leave'?'Approved':'Rejected');return;}
    if(a==='add-notice'){showModal('notice');return;}
    if(a==='edit-notice'){showModal('notice',id);return;}
    if(a==='delete-notice'){const n=data.notices.find(n=>n.id===id);if(n&&confirm(`Remove notice "${n.title}"?`)){n.active=false;update();flash('Notice removed.');}return;}
    if(a==='new-leave'){showModal('leave');return;}
    if(a==='edit-profile'){showModal('profile');return;}
    if(a==='new-correction'){showModal('correction');return;}
    if(a==='new-overtime'){showModal('overtime');return;}
    if(a==='add-salary'){showModal('salary');return;}
    if(a==='edit-salary'){showModal('salary',id);return;}
    if(a==='delete-salary'){if(confirm('Delete this salary statement?')){data.salaries=data.salaries.filter(s=>s.id!==id);update();flash('Salary deleted.');}return;}
    if(a==='add-account'){showModal('account');return;}
    if(a==='edit-account'){showModal('account',id);return;}
    if(a==='delete-account'){if(confirm('Delete this transaction?')){data.accounts=data.accounts.filter(x=>x.id!==id);update();flash('Transaction deleted.');}return;}
    if(a==='edit-leavetype'){showModal('leaveType',id);return;}
    if(a==='add-leavetype'){showModal('leaveType');return;}
    if(a==='add-holiday'){showModal('holiday');return;}
    if(a==='edit-user'){showModal('user',id);return;}
    if(a==='export-report'){downloadCSV();return;}
    if(a==='approve-correction'||a==='reject-correction'){
      const c=data.corrections.find(c=>c.id===id);if(c){c.status=a==='approve-correction'?'Approved':'Rejected';if(c.status==='Approved'){
        const match=data.attendance.find(x=>x.employeeId===c.employeeId&&x.date===c.date);
        if(match){match.firstIn=c.firstIn;match.lastOut=c.lastOut;match.late=0;match.status='Present';}
      }update();flash(`Correction ${c.status.toLowerCase()}.`);}return;
    }
    if(a==='approve-overtime'||a==='reject-overtime'){
      const o=data.overtime.find(o=>o.id===id);if(o){o.status=a==='approve-overtime'?'Approved':'Rejected';o.approvedMinutes=o.status==='Approved'?o.minutes:0;update();flash(`Overtime ${o.status.toLowerCase()}.`);}return;
    }
  });
  document.addEventListener('change', event => {
    const el=event.target;
    if(el.dataset.change==='role') {
      role=el.value;currentUserIds[role]=currentUserIds[role]||({admin:'u1',employee:'u3',accountant:'u4'}[role]);
      if(role==='admin'&&currentUserIds.admin==='u2')currentUserIds.admin='u1';
      tab=tabs[role];modal=null;mobile=false;render();flash('Switched preview role.');return;
    }
    if(el.dataset.filter){filters[el.dataset.filter]=el.value;render();}
  });
  document.addEventListener('input', event => {
    const el=event.target;
    if(el.dataset.filter!=='search')return;
    filters.search=el.value;const pos=el.selectionStart;render();
    const replacement=document.getElementById('employee-search');if(replacement){replacement.focus();replacement.setSelectionRange(pos,pos);}
  });
  document.addEventListener('keydown', event => {if(event.key==='Escape'&&modal)closeModal();});
  render();
})();
