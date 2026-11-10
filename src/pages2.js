/* ===== Communication hub ===== */
PAGES.comms=function(el){
  const q=ROUTE.q; let list=S.comms.slice();
  const from=q.from||iso(MD(-30)), to=q.to||iso(TODAY);
  list=list.filter(m=>m.at.slice(0,10)>=from&&m.at.slice(0,10)<=to);
  if(q.ch) list=list.filter(m=>q.ch==='missed'?m.status==='Missed':m.ch===q.ch);
  if(q.dir) list=list.filter(m=>m.dir===q.dir);
  if(q.member) list=list.filter(m=>m.by===q.member);
  if(q.project) list=list.filter(m=>m.booking&&booking(m.booking).project===q.project);
  if(q.t){const t=q.t.toLowerCase();list=list.filter(m=>{const c=cust(m.cust);return (c.name+' '+(m.booking||'')+' '+c.phones.map(p=>p.num).join(' ')+' '+(m.subject||m.summary)).toLowerCase().includes(t);});}
  list.sort((a,b)=>b.at.localeCompare(a.at));
  const n=f=>list.filter(f).length;
  let h=pageHeader('Communication hub','Calls (MCube), WhatsApp (Gallabox) and email in one place — filter by customer, booking, Delight member, channel and date');
  h+=`<div class="note info">Continuity: every conversation is stored against the <b>customer and booking</b>, not the member's inbox. When ownership or cover changes, the new member sees the full history. Matches PMB's existing timeline; Delight filters are the enhancement. ${be('Delight member + booking filters')}</div>`;
  h+=`<div class="card"><div class="stat">${[['Outbound calls',n(m=>m.ch==='call'&&m.dir==='out'),'call'],['Inbound calls',n(m=>m.ch==='call'&&m.dir==='in'),'call'],['Missed',n(m=>m.status==='Missed'),'missed'],['WhatsApp',n(m=>m.ch==='wa'),'wa'],['Email',n(m=>m.ch==='email'),'email']].map(([l,v,k])=>`<div style="cursor:pointer" data-chq="${k}"><span>${l}</span><b>${v}</b></div>`).join('')}</div></div>`;
  h+=`<div class="filters" style="margin-top:14px"><input class="inp" id="ct" placeholder="Customer, phone, BOF…" value="${esc(q.t||'')}"><select class="inp" id="cch">${opts([{v:'call',l:'Calls'},{v:'missed',l:'Missed calls'},{v:'wa',l:'WhatsApp'},{v:'email',l:'Email'}],q.ch||'','All channels')}</select><select class="inp" id="cdir">${opts([{v:'in',l:'Inbound'},{v:'out',l:'Outbound'}],q.dir||'','Both directions')}</select><select class="inp" id="cmem">${memberOpts(q.member||'','All Delight members')}</select><select class="inp" id="cpr">${opts(PROJECTS,q.project||'','All projects')}</select><input class="inp" type="date" id="cf" value="${from}"><input class="inp" type="date" id="cto" value="${to}"></div>`;
  h+=`<div class="tbl-wrap"><table id="cTbl"><tr><th>When</th><th>Channel</th><th>Customer · booking</th><th>Handled by</th><th>Owner</th><th>Summary</th></tr>`+list.map(m=>{const c=cust(m.cust),[cls,ic,lab]=chIcon(m);return `<tr class="click" data-m="${m.id}"><td style="white-space:nowrap">${fdt(m.at)}</td><td><span class="row"><span class="ic ${cls}" style="width:24px;height:24px;font-size:12px">${ic}</span>${lab}</span></td><td><b>${esc(c.name)}</b><div class="sub">${esc(unitLabel(booking(m.booking)))}</div></td><td>${m.by?esc(pname(m.by)):'<span class="tag red">nobody yet</span>'}${m.by&&m.by!==c.owner?' <span class="tag purple">not owner</span>':''}</td><td>${esc(pname(c.owner))}</td><td class="small">${esc(m.subject||m.summary)}</td></tr>`;}).join('')+`</table>${list.length?'':'<div class="empty">No conversations match.</div>'}</div><div class="row" style="margin-top:10px"><button class="btn sm" id="cexp">Export CSV</button><span class="muted small">${list.length} items</span></div>`;
  el.innerHTML=h; const g=s=>el.querySelector(s);
  g('#ct').addEventListener('keydown',e=>{if(e.key==='Enter')setQ('t',e.target.value);});
  [['#cch','ch'],['#cdir','dir'],['#cmem','member'],['#cpr','project'],['#cf','from'],['#cto','to']].forEach(([s,k])=>g(s).onchange=e=>setQ(k,e.target.value));
  el.querySelectorAll('[data-chq]').forEach(b=>b.onclick=()=>setQ('ch',b.dataset.chq));
  el.querySelectorAll('[data-m]').forEach(r=>r.onclick=()=>openMsg(S.comms.find(m=>m.id===r.dataset.m)));
  g('#cexp').onclick=()=>tableCSV(g('#cTbl'),'delight_communication.csv');
};

/* ===== Requests & escalations ===== */
PAGES.requests=function(el){
  const q=ROUTE.q, scope=q.scope||defScope(); let list=S.reqs.slice();
  if(scope==='mine') list=list.filter(r=>r.assignee===SES.user);
  if(q.status) list=list.filter(r=>r.status===q.status); else if(!q.showall) list=list.filter(r=>!['Closed'].includes(r.status));
  ['cat','source','team'].forEach(k=>{if(q[k]) list=list.filter(r=>r[k]===q[k]);});
  if(q.level) list=list.filter(r=>r.level>=+q.level);
  list.sort((a,b)=>b.level-a.level||a.due.localeCompare(b.due));
  const all=scope==='mine'?S.reqs.filter(r=>r.assignee===SES.user):S.reqs;
  const open=all.filter(r=>!['Resolved','Closed'].includes(r.status));
  let h=pageHeader('Customer requests & escalations','Queries and complaints from calls, WhatsApp, email, the customer portal or in person — tracked to closure',can('edit')?'<button class="btn pri" id="nr">+ Register request</button>':'');
  h+=`<div class="note">PMB gives <b>one view</b> of customer concerns. It does <b>not</b> replace ERP / customer-portal / Workhall ticketing — those keep their ticket number in “External ref”, and PMB's existing Tickets can be linked. Final workflow pending evaluation (MoM §4). ${be('link to ERP/portal tickets')}</div>`;
  h+=`<div class="grid g5">`+kpi(open.length,'Open','not resolved',`requests?scope=${scope}`)+kpi(open.filter(r=>r.status==='Waiting on internal team').length,'Waiting on internal team','site, legal, accounts…',`requests?scope=${scope}&status=Waiting on internal team`,'amber')+kpi(open.filter(r=>r.status==='Escalated').length,'Escalated','L2 Delight Head / L3 CSMO',`requests?scope=${scope}&status=Escalated`,'red')+kpi(open.filter(r=>dayDiff(r.due)<0).length,'Past due date','SLA breached',`requests?scope=${scope}`,'red')+kpi(all.filter(r=>r.status==='Resolved'||r.status==='Closed').length,'Resolved / closed','',`requests?scope=${scope}&showall=1&status=Resolved`,'grey')+`</div>`;
  h+=`<div class="filters" style="margin-top:14px"><div class="seg">${['mine','all'].map(s=>`<button data-scope="${s}" class="${scope===s?'on':''}">${s==='mine'?'Mine':'Team'}</button>`).join('')}</div><select class="inp" id="rs">${opts(REQ_STATUS,q.status||'','Open statuses')}</select><select class="inp" id="rc">${opts(REQ_CATS,q.cat||'','All categories')}</select><select class="inp" id="rsrc">${opts(REQ_SOURCES,q.source||'','All sources')}</select><select class="inp" id="rt">${opts(REQ_TEAMS,q.team||'','All teams')}</select><select class="inp" id="rl">${opts([{v:'2',l:'L2 and above'},{v:'3',l:'L3 only'}],q.level||'','All levels')}</select></div>`;
  h+=`<div class="tbl-wrap"><table id="rTbl"><tr><th>ID</th><th>Customer · unit</th><th>Request</th><th>Source</th><th>Category</th><th>Team · person</th><th>Level</th><th>Due</th><th>Status</th><th>External ref</th></tr>`+list.map(r=>{const c=cust(r.cust);return `<tr class="click" data-r="${r.id}"><td class="mono">${r.id}</td><td><b>${esc(c.name)}</b><div class="sub">${esc(unitLabel(booking(r.booking)))}</div></td><td style="max-width:260px">${esc(r.title)}</td><td class="small">${esc(r.source)}</td><td class="small">${esc(r.cat)}</td><td class="small">${esc(r.team)}<div class="sub">${esc(pname(r.assignee))}</div></td><td><span class="tag ${r.level===3?'red':r.level===2?'amber':'grey'}">L${r.level}</span></td><td>${fd(r.due)}${dayDiff(r.due)<0&&!['Resolved','Closed'].includes(r.status)?' <span class="tag red">late</span>':''}</td><td>${tagStatus(r.status)}</td><td class="small mono">${esc(r.extRef||'—')}</td></tr>`;}).join('')+`</table>${list.length?'':'<div class="empty">Nothing here.</div>'}</div><div class="row" style="margin-top:10px"><button class="btn sm" id="rexp">Export CSV</button></div>`;
  el.innerHTML=h; const g=s=>el.querySelector(s);
  el.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>setQ('scope',b.dataset.scope));
  [['#rs','status'],['#rc','cat'],['#rsrc','source'],['#rt','team'],['#rl','level']].forEach(([s,k])=>g(s).onchange=e=>setQ(k,e.target.value));
  el.querySelectorAll('[data-r]').forEach(r=>r.onclick=()=>openReq(S.reqs.find(x=>x.id===r.dataset.r)));
  if(g('#nr')) g('#nr').onclick=()=>openNewReq();
  g('#rexp').onclick=()=>tableCSV(g('#rTbl'),'delight_requests.csv');
};
function openNewReq(pre){
  pre=pre||{}; if(!can('edit')){toast('Read-only');return;}
  const o=modal(`<h2>Register customer request</h2><div class="form" style="margin-top:12px"><label class="full">Customer<select class="inp" name="cust">${custOpts(pre.cust||'')}</select></label><label>Booking<select class="inp" name="booking"></select></label><label>Source of communication<select class="inp" name="source">${opts(REQ_SOURCES)}</select></label><label class="full">Request<input class="inp" name="title" placeholder="What does the customer need?"></label><label>Category<select class="inp" name="cat">${opts(REQ_CATS)}</select></label><label>Assigned team<select class="inp" name="team">${opts(REQ_TEAMS)}</select></label><label>Delight owner of follow-up<select class="inp" name="who">${memberOpts(SES.user)}</select></label><label>Due date<input class="inp" type="date" name="due" value="${iso(MD(3))}"></label><label class="full">External ref (ERP / portal / Workhall / PMB ticket)<input class="inp" name="ext" placeholder="e.g. ERP ticket CP-4471"></label></div><p class="muted small">Payment queries route to the RM; customization to the Customization desk — Delight keeps the customer informed.</p><div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="ok">Register</button></div>`);
  const fill=()=>{const c=cust(val(o,'cust'));o.querySelector('[name=booking]').innerHTML=c?opts(c.bookings.map(b=>({v:b.id,l:unitLabel(b)}))):'';if(c&&role()!=='member')o.querySelector('[name=who]').value=effOwner(c);};
  o.querySelector('[name=cust]').onchange=fill; fill();
  o.querySelector('[name=cat]').onchange=e=>{const m={'Payment query (→ RM)':'RM / CRM','Customization (→ Customization desk)':'Customization','Snag / Quality':'Technical / Site','Name transfer / EB-Patta':'Liaison (EB / Patta)','Registration':'Legal'};if(m[e.target.value])o.querySelector('[name=team]').value=m[e.target.value];};
  o.querySelector('#ok').onclick=()=>{const c=cust(val(o,'cust')); if(!c||!val(o,'title')){toast('Customer and request are required');return;}
    const r={id:'DLR-'+(201+S.reqs.length),cust:c.id,booking:val(o,'booking'),cat:val(o,'cat'),source:val(o,'source'),team:val(o,'team'),assignee:val(o,'who'),status:'Open',raised:iso(TODAY),due:val(o,'due'),level:1,title:val(o,'title'),extRef:val(o,'ext'),history:[{at:nowStr(),by:SES.user,text:'Registered from '+val(o,'source')}]};
    S.reqs.unshift(r); audit('Registered '+r.id); save(); o.remove(); toast('Request '+r.id+' registered'); render();};
}
function openReq(r){
  const c=cust(r.cust), ed=can('edit');
  const d=drawer(`<span class="eyebrow work">${r.id} · L${r.level}</span><h2>${esc(r.title)}</h2><p class="muted">${esc(c.name)} · ${esc(unitLabel(booking(r.booking)))} · <a href="#/customer/${c.id}">open 360 →</a></p>
  <dl class="kv"><dt>Source</dt><dd>${esc(r.source)}</dd><dt>Category</dt><dd>${esc(r.cat)}</dd><dt>Team</dt><dd>${esc(r.team)}</dd><dt>Delight follow-up</dt><dd>${esc(pname(r.assignee))}</dd><dt>Raised · due</dt><dd>${fd(r.raised)} · ${fd(r.due)}</dd><dt>Status</dt><dd>${tagStatus(r.status)}</dd><dt>External ref</dt><dd class="mono">${esc(r.extRef||'—')}</dd></dl>
  <h3 style="margin-top:16px">Follow-up history</h3><div class="tl">${r.history.map(x=>`<div class="tl-i"><div class="ic nt">↻</div><div><div class="h"><b>${esc(pname(x.by))}</b><span>${fdt(x.at)}</span></div><div class="b small">${esc(x.text)}</div></div></div>`).join('')}</div>
  ${ed?`<div class="card" style="margin-top:12px"><div class="form"><label>Status<select class="inp" name="st">${opts(REQ_STATUS,r.status)}</select></label><label>Reassign follow-up<select class="inp" name="as">${memberOpts(r.assignee)}</select></label><label>Team<select class="inp" name="tm">${opts(REQ_TEAMS,r.team)}</select></label><label>External ref<input class="inp" name="ext" value="${esc(r.extRef)}"></label><label class="full">Update / resolution note<textarea class="inp" name="nt"></textarea></label></div><div class="row" style="margin-top:10px"><button class="btn pri" id="sv">Save update</button>${r.level<3?`<button class="btn danger" id="esc">Escalate to L${r.level+1} (${r.level===1?'Delight Head':'CRM Head / CSMO'})</button>`:''}</div></div>`:'<div class="note" style="margin-top:12px">Read-only for your role.</div>'}`);
  if(!ed) return;
  d.querySelector('#sv').onclick=()=>{const st=val(d,'st'),nt=val(d,'nt'); const ch=[]; if(st!==r.status) ch.push('Status → '+st); if(val(d,'as')!==r.assignee) ch.push('Follow-up → '+pname(val(d,'as'))); if(val(d,'tm')!==r.team) ch.push('Team → '+val(d,'tm')); if(val(d,'ext')!==r.extRef) ch.push('Ext ref '+val(d,'ext'));
    r.status=st;r.assignee=val(d,'as');r.team=val(d,'tm');r.extRef=val(d,'ext'); r.history.push({at:nowStr(),by:SES.user,text:(ch.join('; ')+(nt?(ch.length?' — ':'')+nt:''))||'Updated'}); if(st==='Resolved'||st==='Closed') r.history.push({at:nowStr(),by:SES.user,text:'Closure communicated to customer'}); save(); closeOv(); toast('Saved'); render();};
  const e=d.querySelector('#esc'); if(e) e.onclick=()=>{r.level++; r.status='Escalated'; r.history.push({at:nowStr(),by:SES.user,text:`Escalated to L${r.level} — ${r.level===2?'Delight Head':'CRM Head / CSMO'}`+(val(d,'nt')?': '+val(d,'nt'):'')});
    if(r.level===3) raiseApproval('Customer exception',r.cust,{reason:r.title+(val(d,'nt')?' — '+val(d,'nt'):'')},r.id); save(); closeOv(); toast('Escalated to L'+r.level); render();};
}

/* ===== Referrals ===== */
PAGES.referrals=function(el){
  const q=ROUTE.q, tab=q.tab||'dash';
  let h=pageHeader('Referral management','Referrals from existing customers — capture, hand to Sales, track site visit and booking, control the payout. Requested by the Operations Head.',can('edit')?'<button class="btn pri" id="nf">+ Capture referral</button>':'');
  h+=`<div class="tabs"><button data-tab="dash" class="${tab==='dash'?'on':''}">Performance</button><button data-tab="register" class="${tab==='register'?'on':''}">Referral register</button></div>`;
  if(tab==='dash') h+=refDash(); else h+=refRegister(q);
  el.innerHTML=h; const g=s=>el.querySelector(s);
  el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>go('referrals',{tab:b.dataset.tab}));
  if(g('#nf')) g('#nf').onclick=()=>openNewRef();
  el.querySelectorAll('[data-rf]').forEach(r=>r.onclick=()=>openRef(S.refs.find(x=>x.id===r.dataset.rf)));
  [['#fs','status'],['#fm','member'],['#fp','pay'],['#fpr','interest']].forEach(([s,k])=>{if(g(s)) g(s).onchange=e=>setQ(k,e.target.value);});
  if(g('#fexp')) g('#fexp').onclick=()=>tableCSV(g('#fTbl'),'delight_referrals.csv');
};
function refDash(){
  const R=S.refs, n=s=>R.filter(r=>REF_STATUS.indexOf(r.status)>=REF_STATUS.indexOf(s)&&r.status!=='Dropped').length;
  const booked=R.filter(r=>r.status==='Booked'), sv=R.filter(r=>r.siteVisit&&r.siteVisit.status==='Done').length;
  const paid=R.filter(r=>r.payout.status==='Paid').reduce((s,r)=>s+r.payout.amount,0), pend=R.filter(r=>['Requested','Verified','Head approved','CSMO approved'].includes(r.payout.status));
  let h=`<div class="grid g5">`+kpi(R.length,'Referrals','all time','referrals?tab=register')+kpi(sv,'Site visits done',`${R.filter(r=>r.siteVisit&&r.siteVisit.status==='Scheduled').length} scheduled`,'referrals?tab=register&status=Site visit done')+kpi(booked.length,'Booked',`${Math.round(booked.length/Math.max(1,R.length)*100)}% conversion`,'referrals?tab=register&status=Booked')+kpi(money(booked.reduce((s,r)=>s+r.booking.value,0)/100000).replace('Rs ','Rs ')+' L','Booking value','from referrals','referrals?tab=register&status=Booked')+kpi(pend.length,'Payouts in approval',money(pend.reduce((s,r)=>s+r.payout.amount,0)),'approvals',pend.length?'amber':'grey')+`</div>`;
  h+=`<div class="grid g2" style="margin-top:14px"><div class="card"><h3>Funnel</h3>${['New','Shared with Sales','Contacted','Site visit scheduled','Site visit done','Booked'].map(s=>`<div class="fn-row"><span>${s}</span><div class="bar"><i style="width:${Math.round(n(s)/Math.max(1,R.length)*100)}%"></i></div><b>${n(s)}</b></div>`).join('')}<div class="muted small">Dropped: ${R.filter(r=>r.status==='Dropped').length} · Paid out: ${money(paid)}</div></div>
  <div class="card"><h3>By Delight member</h3><table><tr><th>Member</th><th>Referrals</th><th>Site visits</th><th>Booked</th><th>Conv.</th></tr>${MEMBERS.map(m=>{const x=R.filter(r=>r.member===m),b=x.filter(r=>r.status==='Booked').length;return `<tr><td>${esc(pname(m))}</td><td>${x.length}</td><td>${x.filter(r=>r.siteVisit&&r.siteVisit.status==='Done').length}</td><td>${b}</td><td>${x.length?Math.round(b/x.length*100)+'%':'—'}</td></tr>`;}).join('')}</table></div></div>`;
  const top={}; R.forEach(r=>{top[r.referrer]=(top[r.referrer]||0)+1;});
  h+=`<div class="grid g2" style="margin-top:14px"><div class="card"><h3>Top referring customers</h3>${Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([c,k])=>`<div class="row between" style="padding:5px 0;border-bottom:1px solid #f0efe7;cursor:pointer" data-cust="${c}"><span><b>${esc(cust(c).name)}</b> <span class="muted small">${esc(unitLabel(cust(c).bookings[0]))}</span></span><span class="tag">${k}</span></div>`).join('')}</div>
  <div class="card"><h3>By project of interest</h3>${PROJECTS.filter(p=>R.some(r=>r.interest===p)).map(p=>{const x=R.filter(r=>r.interest===p);return `<div class="fn-row"><span class="small">${esc(p)}</span><div class="bar amber"><i style="width:${x.length/R.length*100*2}%"></i></div><b>${x.length}</b></div>`;}).join('')}</div></div>`;
  return h;
}
function refRegister(q){
  let L=S.refs.slice(); if(q.status) L=L.filter(r=>r.status===q.status); if(q.member) L=L.filter(r=>r.member===q.member); if(q.pay) L=L.filter(r=>r.payout.status===q.pay); if(q.interest) L=L.filter(r=>r.interest===q.interest);
  L.sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="filters"><select class="inp" id="fs">${opts(REF_STATUS,q.status||'','All statuses')}</select><select class="inp" id="fm">${memberOpts(q.member||'','All members')}</select><select class="inp" id="fp">${opts(PAY_STATUS,q.pay||'','Any payout status')}</select><select class="inp" id="fpr">${opts(PROJECTS,q.interest||'','Any project')}</select></div>
  <div class="tbl-wrap"><table id="fTbl"><tr><th>ID</th><th>Date · source</th><th>Referring customer · unit</th><th>Prospect</th><th>Interest</th><th>Delight member</th><th>Status</th><th>Site visit</th><th>Booking</th><th>Payout</th></tr>${L.map(r=>{const c=cust(r.referrer);return `<tr class="click" data-rf="${r.id}"><td class="mono">${r.id}</td><td>${fd(r.date)}<div class="sub">${esc(r.source)}</div></td><td><b>${esc(c.name)}</b><div class="sub">${esc(unitLabel(booking(r.refBooking)))} · ${r.refBooking}</div></td><td>${esc(r.prospect)}<div class="sub">${esc(r.prospectPhone)}</div></td><td class="small">${esc(r.interest)}</td><td>${esc(pname(r.member))}${r.sales?`<div class="sub">${esc(r.sales)}</div>`:''}</td><td>${tagStatus(r.status)}</td><td class="small">${esc(r.siteVisit.status)}${r.siteVisit.date?' · '+fd(r.siteVisit.date):''}</td><td class="small">${r.booking?esc(r.booking.bof)+'<div class="sub">'+fd(r.booking.date)+'</div>':'—'}</td><td>${tagStatus(r.payout.status)}${r.payout.amount?`<div class="sub">${money(r.payout.amount)}</div>`:''}</td></tr>`;}).join('')}</table></div><div class="row" style="margin-top:10px"><button class="btn sm" id="fexp">Export CSV</button><span class="muted small">${L.length} referrals</span></div>`;
}
function openNewRef(pre){
  pre=pre||{}; if(!can('edit')){toast('Read-only');return;}
  const o=modal(`<h2>Capture referral</h2><div class="form" style="margin-top:12px"><label class="full">Referring customer<select class="inp" name="c">${custOpts(pre.referrer||'')}</select></label><label>Referring booking / unit<select class="inp" name="b"></select></label><label>Source<select class="inp" name="src">${opts(['Inbound call','Referral call','WhatsApp','Email','Community event','In person','Customer portal'])}</select></label><label>Prospect name<input class="inp" name="pn"></label><label>Prospect phone<input class="inp" name="pp" placeholder="+91 …"></label><label>Project of interest<select class="inp" name="pi">${opts(PROJECTS)}</select></label><label>Delight member<select class="inp" name="m">${memberOpts(role()==='member'?SES.user:'')}</select></label><label class="full">Notes<input class="inp" name="nt" placeholder="Budget, configuration, timeline…"></label></div><div id="dup"></div><div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="ok">Save referral</button></div>`);
  const fill=()=>{const c=cust(val(o,'c'));o.querySelector('[name=b]').innerHTML=c?opts(c.bookings.map(b=>({v:b.id,l:unitLabel(b)+' · '+b.id}))):'';}; o.querySelector('[name=c]').onchange=fill; fill();
  o.querySelector('[name=pp]').oninput=e=>{const v=e.target.value.replace(/\s/g,''); const d=v.length>6&&S.refs.find(r=>r.prospectPhone.replace(/\s/g,'').includes(v)); o.querySelector('#dup').innerHTML=d?`<div class="note">Possible duplicate: ${esc(d.prospect)} already referred (${d.id}, ${esc(d.status)}). Check with Sales before saving. ${be('dedupe vs sales CRM')}</div>`:'';};
  o.querySelector('#ok').onclick=()=>{const c=cust(val(o,'c')); if(!c||!val(o,'pn')){toast('Referring customer and prospect name are required');return;}
    const r={id:'REF-'+(301+S.refs.length),referrer:c.id,refBooking:val(o,'b'),prospect:val(o,'pn'),prospectPhone:val(o,'pp')||'—',interest:val(o,'pi'),date:iso(TODAY),source:val(o,'src'),member:val(o,'m'),sales:'',status:'New',siteVisit:{status:'Not yet'},booking:null,payout:{status:'Not due',amount:0},history:[{at:nowStr(),by:SES.user,text:'Referral captured'+(val(o,'nt')?': '+val(o,'nt'):'')}]};
    S.refs.unshift(r); audit('Captured '+r.id); save(); o.remove(); toast('Referral '+r.id+' saved'); go('referrals',{tab:'register'});};
}
function openRef(r){
  const c=cust(r.referrer), ed=can('edit');
  const pa=S.apr.find(a=>a.type==='Referral payout'&&a.details.ref===r.id);
  const d=drawer(`<span class="eyebrow work">${r.id}</span><h2>${esc(r.prospect)}</h2><p class="muted">Referred by <a href="#/customer/${c.id}">${esc(c.name)}</a> · ${esc(unitLabel(booking(r.refBooking)))} · ${r.refBooking}</p>
  <dl class="kv"><dt>Prospect phone</dt><dd>${esc(r.prospectPhone)}</dd><dt>Interest</dt><dd>${esc(r.interest)}</dd><dt>Date · source</dt><dd>${fd(r.date)} · ${esc(r.source)}</dd><dt>Delight member</dt><dd>${esc(pname(r.member))}</dd><dt>Sales contact</dt><dd>${esc(r.sales||'— not yet shared')}</dd><dt>Status</dt><dd>${tagStatus(r.status)}</dd><dt>Site visit</dt><dd>${esc(r.siteVisit.status)}${r.siteVisit.date?' · '+fd(r.siteVisit.date):''}</dd><dt>Booking</dt><dd>${r.booking?`${esc(r.booking.bof)} · ${fd(r.booking.date)} · ${money(r.booking.value)}`:'—'}</dd></dl>
  ${ed?`<div class="card" style="margin-top:12px"><h3>Update status ${be('sync with sales system')}</h3><div class="form"><label>Status<select class="inp" name="st">${opts(REF_STATUS,r.status)}</select></label><label>Sales contact<input class="inp" name="sl" value="${esc(r.sales)}"></label><label>Site visit<select class="inp" name="sv">${opts(['Not yet','Scheduled','Done','No show'],r.siteVisit.status)}</select></label><label>Site visit date<input class="inp" type="date" name="svd" value="${r.siteVisit.date||''}"></label><label>Booking no. (if booked)<input class="inp" name="bf" value="${r.booking?esc(r.booking.bof):''}"></label><label>Booking value (Rs)<input class="inp" name="bv" value="${r.booking?r.booking.value:''}"></label></div><button class="btn pri" style="margin-top:10px" id="sv">Save</button></div>`:''}
  <div class="card" style="margin-top:12px"><h3>Payout</h3><dl class="kv"><dt>Status</dt><dd>${tagStatus(r.payout.status)}</dd><dt>Amount</dt><dd>${r.payout.amount?money(r.payout.amount):'—'}</dd><dt>Eligibility</dt><dd>${r.status==='Booked'?'Booked ✓ — rule to confirm (e.g. agreement registered / % collected)':'Not eligible until booked'} ${ui('rule TBC')}</dd>${r.payout.ref?`<dt>Payment ref</dt><dd class="mono">${esc(r.payout.ref)} · ${fd(r.payout.paidOn)}</dd>`:''}</dl>
   ${pa?`<div class="chain">${chainHtml(pa)}</div>`:''}
   <div class="row" style="margin-top:10px">${r.status==='Booked'&&['Not due','Rejected'].includes(r.payout.status)&&ed?'<button class="btn warn" id="rq">Request payout</button>':''}${r.payout.status==='CSMO approved'&&can('markPaid')?'<button class="btn pri" id="pd">Mark paid (Accounts ref)</button>':''}${pa&&canActOn(pa)?'<a class="btn" href="#/approvals">Open in Approvals →</a>':''}</div></div>
  <h3 style="margin-top:14px">History</h3>${r.history.map(x=>`<div class="small"><span class="muted">${fdt(x.at)} · ${esc(pname(x.by))}</span> — ${esc(x.text)}</div>`).join('')}`);
  const sv=d.querySelector('#sv'); if(sv) sv.onclick=()=>{const st=val(d,'st'); const ch=[]; if(st!==r.status) ch.push('Status → '+st); r.status=st; r.sales=val(d,'sl'); r.siteVisit={status:val(d,'sv'),date:val(d,'svd')||null}; if(val(d,'bf')) r.booking={bof:val(d,'bf'),date:r.booking?r.booking.date:iso(TODAY),value:+val(d,'bv')||0}; r.history.push({at:nowStr(),by:SES.user,text:ch.join('; ')||'Updated'}); save(); closeOv(); toast('Saved'); render();};
  const rq=d.querySelector('#rq'); if(rq) rq.onclick=()=>{const amt=prompt('Payout amount (Rs) — policy to be confirmed','50000'); if(!amt) return; r.payout={status:'Requested',amount:+amt||0}; r.history.push({at:nowStr(),by:SES.user,text:'Payout requested'}); const a=raiseApproval('Referral payout',r.referrer,{ref:r.id,amount:+amt||0},r.id); save(); closeOv(); toast('Payout request '+a.id+' → Backend verification → Delight Head → CRM Head / CSMO'); render();};
  const pd=d.querySelector('#pd'); if(pd) pd.onclick=()=>{const ref=prompt('Accounts payment reference (UTR)','DEMO-UTR-'); if(!ref) return; r.payout.status='Paid'; r.payout.ref=ref; r.payout.paidOn=iso(TODAY); r.history.push({at:nowStr(),by:SES.user,text:'Marked paid — '+ref}); audit('Payout paid '+r.id); save(); closeOv(); toast('Marked paid'); render();};
}

/* ===== Approvals ===== */
function chainHtml(a){return `<span class="ch ok">Raised · ${esc(pname(a.by))}</span>`+a.chain.map(s=>`<span class="arrow">→</span><span class="ch ${s.status==='Approved'?'ok':s.status==='Pending'?'wait':s.status==='Rejected'?'no':''}" title="${esc(s.c||'')}">${esc(ROLE_LABEL[s.role])} · ${esc(s.status)}${s.by?' · '+esc(pname(s.by)):''}</span>`).join('');}
PAGES.approvals=function(el){
  const tab=ROUTE.q.tab||'mine'; const r=role();
  const T={mine:a=>canActOn(a),raised:a=>a.by===SES.user,open:a=>a.chain.some(s=>s.status==='Pending'),done:a=>!a.chain.some(s=>s.status==='Pending')};
  const list=S.apr.filter(T[tab]||T.mine).sort((a,b)=>b.raised.localeCompare(a.raised));
  let h=pageHeader('Approvals',`Delight approval types alongside PMB's existing deferment and waiver approvals. ${r==='crm'?'You approve referral payouts and customer exceptions at the final step.':r==='head'?'You approve cover, ownership changes, payouts (2nd step) and exceptions (1st step).':''}`);
  h+=`<div class="grid g4" style="margin-bottom:14px">${[['Temporary cover','Delight Head'],['Ownership change','Delight Head'],['Referral payout','Backend verify → Delight Head → CRM Head / CSMO → Backend marks paid'],['Customer exception','Delight Head → CRM Head / CSMO']].map(([t,c])=>`<div class="card"><b>${t}</b><div class="small muted">${c}</div></div>`).join('')}</div>`;
  h+=`<div class="tabs">${[['mine',`Waiting for me (${S.apr.filter(T.mine).length})`],['raised','Raised by me'],['open','All open'],['done','Completed']].map(([k,l])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div>`;
  h+=list.map(a=>`<div class="card"><div class="row between"><div class="row"><span class="tag ${a.type==='Referral payout'?'purple':a.type==='Customer exception'?'red':'blue'}">${esc(a.type)}</span><span class="mono">${a.id}</span><span class="muted small">raised ${fdt(a.raised)} by ${esc(pname(a.by))}</span></div>${a.cust?`<a class="small" href="#/customer/${a.cust}">${esc(cust(a.cust).name)} →</a>`:''}</div><div style="margin-top:8px">${aprSummary(a)}</div><div class="chain">${chainHtml(a)}</div>${a.chain.filter(s=>s.c).map(s=>`<div class="small muted" style="margin-top:4px">“${esc(s.c)}” — ${esc(pname(s.by))}</div>`).join('')}
   ${canActOn(a)?`<div class="row" style="margin-top:10px"><input class="inp grow" placeholder="Comment (optional)" data-cm="${a.id}"><button class="btn pri sm" data-ok="${a.id}">Approve</button><button class="btn danger sm" data-no="${a.id}">Reject</button></div>`:''}</div>`).join('')||'<div class="card empty">Nothing in this list.</div>';
  el.innerHTML=h;
  el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>go('approvals',{tab:b.dataset.tab}));
  const act=(id,ok)=>{const a=S.apr.find(x=>x.id===id); decide(a,ok,(el.querySelector(`[data-cm="${id}"]`)||{}).value); toast(`${id} ${ok?'approved':'rejected'}`); render();};
  el.querySelectorAll('[data-ok]').forEach(b=>b.onclick=()=>act(b.dataset.ok,true));
  el.querySelectorAll('[data-no]').forEach(b=>b.onclick=()=>act(b.dataset.no,false));
};

/* ===== Team monitor ===== */
PAGES.team=function(el){
  const head=can('changeOwner');
  let h=pageHeader('Team monitor','Ownership, temporary cover, workload and SLA across the Delight team. RM ownership is shown for reference and is never changed here.');
  h+=memberTable();
  h+=`<div class="sec-t">Leave &amp; availability</div><div class="card"><div class="row between"><div>Plan a member's absence: set a covering member for all their customers and move open activities in that period. ${be('cover routing')}</div>${head?'':'<span class="muted small">Only Delight Head / Admin can apply cover directly; members request it from the customer page.</span>'}</div><div class="row" style="margin-top:10px">${MEMBERS.map(m=>`<button class="btn sm" data-cov="${m}" ${head?'':'disabled'}>${esc(pname(m))} away…</button>`).join('')}</div></div>`;
  const covers=S.customers.filter(c=>c.cover);
  h+=`<div class="sec-t">Active &amp; scheduled cover</div><div class="tbl-wrap"><table><tr><th>Customer</th><th>Owner</th><th>Covered by</th><th>Period</th><th>Reason</th><th>Approval</th></tr>${covers.map(c=>`<tr class="click" data-cust="${c.id}"><td><b>${esc(c.name)}</b></td><td>${esc(pname(c.owner))}</td><td>${esc(pname(c.cover.member))}</td><td>${fd(c.cover.from)} → ${fd(c.cover.to)} ${coverActive(c.cover)?'<span class="tag amber">active</span>':'<span class="tag grey">'+(dayDiff(c.cover.to)<0?'ended':'scheduled')+'</span>'}</td><td class="small">${esc(c.cover.reason)}</td><td class="mono small">${esc(c.cover.approval||'—')}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No cover in place.</td></tr>'}</table></div>`;
  h+=`<div class="sec-t">Ownership register</div><div class="filters"><select class="inp" id="tow">${memberOpts(ROUTE.q.owner||'','All owners')}</select><select class="inp" id="tpr">${opts(PROJECTS,ROUTE.q.project||'','All projects')}</select></div>`;
  let L=S.customers.slice(); if(ROUTE.q.owner) L=L.filter(c=>c.owner===ROUTE.q.owner); if(ROUTE.q.project) L=L.filter(c=>c.bookings.some(b=>b.project===ROUTE.q.project));
  h+=`<div class="tbl-wrap"><table id="owTbl"><tr><th>Customer</th><th>Booking(s)</th><th>Journey</th><th>RM (read-only)</th><th>Primary Delight owner</th><th>Last contact</th></tr>${L.map(c=>{const last=S.comms.filter(m=>m.cust===c.id).sort((a,b)=>b.at.localeCompare(a.at))[0];const b=c.bookings[0];return `<tr><td class="click" data-cust="${c.id}" style="cursor:pointer"><b>${esc(c.name)}</b></td><td class="small">${c.bookings.map(x=>esc(unitLabel(x))).join('<br>')}</td><td>${esc(b.stageIdx===5?'Engagement':JOURNEY[b.stageIdx].l)}</td><td class="small muted">${esc(b.rm)}</td><td>${head?`<select class="inp" data-own="${c.id}">${memberOpts(c.owner)}</select>`:esc(pname(c.owner))}</td><td class="small">${last?fdt(last.at)+' · '+esc(pname(last.by)):'—'}</td></tr>`;}).join('')}</table></div>`;
  const breach=S.acts.filter(a=>openAct(a)&&dayDiff(a.date)<-atype(a.type).sla);
  h+=`<div class="sec-t">SLA breaches (${breach.length})</div><div class="card">${actMiniList(breach,false)}</div>`;
  el.innerHTML=h;
  el.querySelectorAll('[data-cov]').forEach(b=>b.onclick=()=>openCover(b.dataset.cov,null));
  el.querySelector('#tow').onchange=e=>setQ('owner',e.target.value); el.querySelector('#tpr').onchange=e=>setQ('project',e.target.value);
  el.querySelectorAll('[data-own]').forEach(s=>s.onchange=()=>{const c=cust(s.dataset.own); raiseApproval('Ownership change',c.id,{from:c.owner,to:s.value,reason:'Changed by Delight Head in ownership register'}); toast('Owner of '+esc(c.name)+' → '+esc(pname(s.value))+' (logged)'); render();});
};

/* ===== Reports ===== */
PAGES.reports=function(el){
  const q=ROUTE.q, tab=q.tab||'daily', from=q.from||iso(MD(-7)), to=q.to||iso(MD(7));
  const mem=role()==='member'?SES.user:(q.member||''), proj=q.project||'';
  const inR=s=>s.slice(0,10)>=from&&s.slice(0,10)<=to;
  const aF=a=>(!mem||a.assignee===mem)&&(!proj||booking(a.booking).project===proj);
  const tabs=[['daily','Daily Delight activities'],['pending','Pending follow-ups'],['engage','Customer engagement'],['comm','Communication activity'],['ref','Referral performance'],['member','Member-wise summary']];
  let h=pageHeader('Reports & tracking',role()==='member'?'Your own activity (members see their scope; the Delight Head sees the team).':'Filters apply to every report. Export or print for review meetings.');
  h+=`<div class="tabs">${tabs.map(([k,l])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div>`;
  h+=`<div class="filters"><label class="small muted">From</label><input class="inp" type="date" id="rf" value="${from}"><label class="small muted">To</label><input class="inp" type="date" id="rto" value="${to}">${role()==='member'?'':`<select class="inp" id="rm">${memberOpts(mem,'All members')}</select>`}<select class="inp" id="rp">${opts(PROJECTS,proj,'All projects')}</select><button class="btn sm" id="rx">Export CSV</button><button class="btn sm" onclick="window.print()">Print</button>${be('server-side export')}</div>`;
  let t='';
  const T=(head,rows)=>`<div class="tbl-wrap"><table id="rep"><tr>${head.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>${rows.length?'':'<div class="empty">No rows for these filters.</div>'}</div>`;
  if(tab==='daily'){const L=S.acts.filter(a=>aF(a)&&inR(a.date)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));t=T(['Date','Time','Member','Activity','Customer','Unit','Status','Remarks'],L.map(a=>[fd(a.date),esc(a.time),esc(pname(a.assignee)),esc(atype(a.type).l),esc(cust(a.cust).name),esc(unitLabel(booking(a.booking))),tagStatus(a.status),esc(a.remarks)]));}
  if(tab==='pending'){const L=S.acts.filter(a=>aF(a)&&openAct(a)&&(dayDiff(a.date)<=0||(a.next&&dayDiff(a.next)<=0))).sort((a,b)=>a.date.localeCompare(b.date));const R=S.reqs.filter(r=>(!mem||r.assignee===mem)&&!['Resolved','Closed'].includes(r.status)&&dayDiff(r.due)<=0);
    t=T(['Due','Days late','Member','Item','Customer','Unit','Status'],L.map(a=>[fd(a.date),Math.max(0,-dayDiff(a.date)),esc(pname(a.assignee)),esc(atype(a.type).l),esc(cust(a.cust).name),esc(unitLabel(booking(a.booking))),tagStatus(a.status)]).concat(R.map(r=>[fd(r.due),Math.max(0,-dayDiff(r.due)),esc(pname(r.assignee)),'Request '+r.id+' · '+esc(r.cat),esc(cust(r.cust).name),esc(unitLabel(booking(r.booking))),tagStatus(r.status)])));}
  if(tab==='engage'){const L=S.acts.filter(a=>aF(a)&&isEng(a)&&inR(a.date));t=T(['Member','Engagement type','Planned','Completed','Pending'],MEMBERS.filter(m=>!mem||m===mem).flatMap(m=>ENGAGE.map(k=>{const x=L.filter(a=>a.assignee===m&&a.type===k);return x.length?[esc(pname(m)),esc(atype(k).l),x.length,x.filter(a=>a.status==='Completed').length,x.filter(openAct).length]:null;}).filter(Boolean)));}
  if(tab==='comm'){const L=S.comms.filter(m=>inR(m.at)&&(!proj||(m.booking&&booking(m.booking).project===proj)));t=T(['Member','Outbound calls','Inbound answered','WhatsApp','Email','Total'],MEMBERS.filter(m=>!mem||m===mem).map(m=>{const x=L.filter(c=>c.by===m);return [esc(pname(m)),x.filter(c=>c.ch==='call'&&c.dir==='out').length,x.filter(c=>c.ch==='call'&&c.dir==='in').length,x.filter(c=>c.ch==='wa').length,x.filter(c=>c.ch==='email').length,x.length];}).concat([['<b>Missed / unhandled</b>','',L.filter(c=>c.status==='Missed').length,'','','']]));}
  if(tab==='ref'){const L=S.refs.filter(r=>(!mem||r.member===mem)&&(!proj||r.interest===proj));t=T(['Member','Referrals','Shared with Sales','Site visits','Booked','Conversion','Payout paid','Payout in approval'],MEMBERS.filter(m=>!mem||m===mem).map(m=>{const x=L.filter(r=>r.member===m),b=x.filter(r=>r.status==='Booked').length;return [esc(pname(m)),x.length,x.filter(r=>r.status!=='New').length,x.filter(r=>r.siteVisit.status==='Done').length,b,x.length?Math.round(b/x.length*100)+'%':'—',money(x.filter(r=>r.payout.status==='Paid').reduce((s,r)=>s+r.payout.amount,0)),x.filter(r=>['Requested','Verified','Head approved','CSMO approved'].includes(r.payout.status)).length];}));}
  if(tab==='member'){t=T(['Member','Customers owned','Activities in period','Completed','Overdue now','Comms in period','Requests open','Referrals'],MEMBERS.filter(m=>!mem||m===mem).map(m=>{const a=S.acts.filter(x=>x.assignee===m&&inR(x.date)&&(!proj||booking(x.booking).project===proj));return [esc(pname(m)),S.customers.filter(c=>c.owner===m).length,a.length,a.filter(x=>x.status==='Completed').length,S.acts.filter(x=>x.assignee===m&&openAct(x)&&dayDiff(x.date)<0).length,S.comms.filter(c=>c.by===m&&inR(c.at)).length,S.reqs.filter(r=>r.assignee===m&&!['Resolved','Closed'].includes(r.status)).length,S.refs.filter(r=>r.member===m).length];}));}
  h+=t; el.innerHTML=h; const g=s=>el.querySelector(s);
  el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setQ('tab',b.dataset.tab));
  g('#rf').onchange=e=>setQ('from',e.target.value); g('#rto').onchange=e=>setQ('to',e.target.value); if(g('#rm')) g('#rm').onchange=e=>setQ('member',e.target.value); g('#rp').onchange=e=>setQ('project',e.target.value);
  g('#rx').onclick=()=>tableCSV(g('#rep'),'delight_report_'+tab+'_'+from+'_'+to+'.csv');
};

/* ===== Settings (admin) ===== */
PAGES.settings=function(el){
  let h=pageHeader('Delight settings','Configuration the PMB team would expose to Admin (read-only in the prototype).');
  h+=`<div class="grid g2"><div class="card"><h3>Activity types &amp; SLA</h3><table><tr><th>Type</th><th>SLA (days late before breach)</th></tr>${ACT_TYPES.map(t=>`<tr><td>${t.ico} ${esc(t.l)}</td><td>${t.sla}</td></tr>`).join('')}</table></div>
  <div class="card"><h3>WhatsApp templates (Gallabox) ${ui('names TBC')}</h3>${WA_TEMPLATES.map(t=>`<div class="mono" style="padding:3px 0">${t}</div>`).join('')}<div class="muted small">Actual template list to come from the Delight team (MoM §7.4).</div></div></div>`;
  h+=`<div class="card" style="margin-top:14px"><h3>Role access matrix</h3><div class="tbl-wrap"><table><tr><th>Capability</th><th>Delight Member</th><th>Delight Backend</th><th>Delight Head</th><th>CRM Head / CSMO</th><th>Admin</th></tr>${[
   ['Landing layer','Working','Working (desk)','Monitoring + Approvals','Monitoring + Approvals','All'],
   ['See customers','Every customer (default: mine)','Every customer','Every customer','Every customer (read)','Everything'],
   ['Create / update activities','Own + any customer','Any','Any','—','Any'],
   ['Activity-specific reassignment','Own activities','Any','Any','—','Any'],
   ['Temporary cover / owner change','Request','Request','Approve / apply','—','Apply'],
   ['Register / update requests','Yes','Yes','Yes','—','Yes'],
   ['Escalate','L1 → L2','L1 → L2','L2 → L3','Receives L3','Any'],
   ['Capture referral / request payout','Yes','Yes','Yes','—','Yes'],
   ['Payout chain','—','Verify · mark paid','Approve (step 2)','Approve (final)','Any step'],
   ['Reports','Own','Team','Team','Team','Team'],
   ['Settings','—','—','—','—','Yes']].map(r=>`<tr>${r.map((c,i)=>i?`<td class="small">${esc(c)}</td>`:`<td><b>${esc(c)}</b></td>`).join('')}</tr>`).join('')}</table></div></div>`;
  el.innerHTML=h;
};

/* ===== Requirement map ===== */
PAGES.requirements=function(el){
  const q=ROUTE.q; let L=REQS.slice(); if(q.st) L=L.filter(r=>r.pmb===q.st); if(q.pg) L=L.filter(r=>r.page===q.pg);
  const fbc=id=>S.feedback.filter(f=>f.req===id).length;
  const cnt=k=>REQS.filter(r=>r.pmb===k).length;
  let h=pageHeader('Requirement map','Each proposed function, why it is needed, and what PMB already has (checked read-only in PMB on 10 Nov 2026). Stakeholders can record a decision per line.','<button class="btn sm" id="rqx">Export CSV</button>');
  h+=`<div class="grid g4">${['AV','EN','NEW','PC'].map(k=>`<div class="kpi" data-go="requirements?st=${k}"><div class="v">${cnt(k)}</div><div class="l">${PMB_LABEL[k]}</div><div class="s">${{AV:'use as is',EN:'extend existing PMB feature',NEW:'build in PMB',PC:'needs a decision or a document'}[k]}</div></div>`).join('')}</div>`;
  h+=`<div class="filters" style="margin-top:14px"><select class="inp" id="qst">${opts(Object.keys(PMB_LABEL).map(k=>({v:k,l:PMB_LABEL[k]})),q.st||'','All PMB statuses')}</select><select class="inp" id="qpg">${opts([...new Set(REQS.map(r=>r.page))],q.pg||'','All areas')}</select></div>`;
  h+=`<div class="tbl-wrap"><table id="rqTbl"><tr><th>ID</th><th>Area</th><th>Functionality</th><th>Purpose</th><th>PMB status</th><th>Evidence / note</th><th>Backend work</th><th>Feedback</th><th>Decision</th></tr>${L.map(r=>`<tr><td class="mono">${r.id}</td><td class="small">${esc(r.page)}</td><td><b>${esc(r.f)}</b></td><td class="small">${esc(r.p)}</td><td><span class="tag ${PMB_TAG[r.pmb]}">${PMB_LABEL[r.pmb]}</span></td><td class="small muted">${esc(r.ev)}</td><td class="small">${esc(r.be||'—')}</td><td>${fbc(r.id)?`<a href="#/feedback?req=${r.id}">${fbc(r.id)} 💬</a>`:'—'} <button class="btn sm noexp" data-fbr="${r.id}">+</button></td><td><select class="inp" data-dec="${r.id}">${opts(['Accepted','Needs Changes','Pending Confirmation'],S.decisions[r.id]||'','—')}</select></td></tr>`).join('')}</table></div>`;
  el.innerHTML=h; const g=s=>el.querySelector(s);
  g('#qst').onchange=e=>setQ('st',e.target.value); g('#qpg').onchange=e=>setQ('pg',e.target.value);
  el.querySelectorAll('[data-dec]').forEach(s=>s.onchange=()=>{S.decisions[s.dataset.dec]=s.value; save(); toast(s.dataset.dec+' → '+(s.value||'—'));});
  el.querySelectorAll('[data-fbr]').forEach(b=>b.onclick=()=>{const r=REQS.find(x=>x.id===b.dataset.fbr);openFeedback({page:r.page,req:r.id});});
  g('#rqx').onclick=()=>{download('delight_requirement_map.csv','﻿'+csv([['ID','Area','Functionality','Purpose','PMB status','Evidence','Backend work','Decision','Feedback count']].concat(REQS.map(r=>[r.id,r.page,r.f,r.p,PMB_LABEL[r.pmb],r.ev,r.be,S.decisions[r.id]||'',fbc(r.id)]))));};
};

/* ===== Stakeholder feedback ===== */
PAGES.feedback=function(el){
  const q=ROUTE.q; let L=S.feedback.slice().reverse(); if(q.req) L=L.filter(f=>f.req===q.req); if(q.st) L=L.filter(f=>f.status===q.st); if(q.pg) L=L.filter(f=>f.page===q.pg);
  const c=s=>S.feedback.filter(f=>f.status===s).length;
  let h=pageHeader('Stakeholder feedback','Comments and decisions captured during demonstrations. Each browser keeps its own copy — export, then import into one browser to consolidate.','<button class="btn pri sm" id="fadd">+ Add feedback</button>');
  h+=`<div class="grid g4">${kpi(S.feedback.length,'Comments','all pages','feedback')}${kpi(c('Accepted'),'Accepted','','feedback?st=Accepted')}${kpi(c('Needs Changes'),'Needs changes','','feedback?st=Needs Changes',c('Needs Changes')?'amber':'')}${kpi(c('Pending Confirmation'),'Pending confirmation','','feedback?st=Pending Confirmation')}</div>`;
  h+=`<div class="filters" style="margin-top:14px"><select class="inp" id="fst">${opts(['Accepted','Needs Changes','Pending Confirmation'],q.st||'','All statuses')}</select><select class="inp" id="fpg">${opts([...new Set(S.feedback.map(f=>f.page))],q.pg||'','All pages')}</select>${q.req?`<span class="tag">${esc(q.req)} <a href="#/feedback">✕</a></span>`:''}<span class="grow"></span><button class="btn sm" id="fj">Export JSON</button><button class="btn sm" id="fc">Export CSV</button><label class="btn sm">Import JSON<input type="file" id="fi" accept=".json" style="display:none"></label></div>`;
  h+=`<div class="tbl-wrap"><table><tr><th>When</th><th>Who</th><th>Page</th><th>Requirement</th><th>Type</th><th>Comment</th><th>Status</th><th></th></tr>${L.map(f=>`<tr><td class="small">${fdt(f.at)}</td><td><b>${esc(f.who)}</b><div class="sub">${esc(f.wrole)}</div></td><td>${esc(f.page)}</td><td class="mono small">${esc(f.req||'—')}</td><td class="small">${esc(f.type)}</td><td style="max-width:360px">${esc(f.comment)}</td><td><select class="inp" data-fs="${f.id}">${opts(['Accepted','Needs Changes','Pending Confirmation'],f.status)}</select></td><td><button class="btn sm danger" data-fd="${f.id}">✕</button></td></tr>`).join('')}</table>${L.length?'':'<div class="empty">No feedback yet — use “💬 Comment on this page” or the Feedback button.</div>'}</div>`;
  const byReq={}; S.feedback.forEach(f=>{if(f.req){byReq[f.req]=byReq[f.req]||[];byReq[f.req].push(f);}});
  h+=`<div class="sec-t">Consolidated by requirement</div><div class="tbl-wrap"><table><tr><th>Requirement</th><th>Comments</th><th>Latest status</th><th>Decision on map</th></tr>${Object.entries(byReq).map(([id,fs])=>{const r=REQS.find(x=>x.id===id);return `<tr><td><span class="mono">${id}</span> ${esc(r?r.f:'')}</td><td>${fs.length}</td><td>${(s=>`<span class="tag ${s==='Accepted'?'':s==='Needs Changes'?'red':'amber'}">${esc(s)}</span>`)(fs[fs.length-1].status)}</td><td>${esc(S.decisions[id]||'—')}</td></tr>`;}).join('')||'<tr><td colspan="4" class="empty">—</td></tr>'}</table></div>`;
  el.innerHTML=h; const g=s=>el.querySelector(s);
  g('#fadd').onclick=()=>openFeedback({page:'General'});
  g('#fst').onchange=e=>setQ('st',e.target.value); g('#fpg').onchange=e=>setQ('pg',e.target.value);
  el.querySelectorAll('[data-fs]').forEach(s=>s.onchange=()=>{const f=S.feedback.find(x=>x.id===s.dataset.fs);f.status=s.value;if(f.req)S.decisions[f.req]=s.value;save();toast('Updated');});
  el.querySelectorAll('[data-fd]').forEach(b=>b.onclick=()=>{if(!confirm('Delete this feedback item?'))return;S.feedback=S.feedback.filter(x=>x.id!==b.dataset.fd);save();render();});
  g('#fj').onclick=()=>download('delight_feedback_'+iso(TODAY)+'.json',JSON.stringify({exported:nowStr(),feedback:S.feedback,decisions:S.decisions},null,2),'application/json');
  g('#fc').onclick=()=>download('delight_feedback_'+iso(TODAY)+'.csv','﻿'+csv([['ID','When','Who','Role','Page','Requirement','Type','Status','Comment','Viewed as']].concat(S.feedback.map(f=>[f.id,f.at,f.who,f.wrole,f.page,f.req,f.type,f.status,f.comment,f.asRole]))));
  g('#fi').onchange=e=>{const file=e.target.files[0]; if(!file) return; const rd=new FileReader(); rd.onload=()=>{try{const d=JSON.parse(rd.result); const items=d.feedback||d; let n=0; items.forEach(f=>{if(!S.feedback.some(x=>x.id===f.id)){S.feedback.push(f);n++;}}); if(d.decisions) Object.assign(S.decisions,d.decisions); save(); toast(n+' feedback items imported'); render();}catch(err){toast('Not a valid feedback export');}}; rd.readAsText(file);};
};

/* ===== Dev handover ===== */
PAGES.handover=function(el){
  const ui_=REQS.filter(r=>!r.be), bk=REQS.filter(r=>r.be), pc=REQS.filter(r=>r.pmb==='PC');
  let h=pageHeader('PMB development handover','How to read this prototype as a functional reference once feedback is final.','<button class="btn sm" id="hx">Download handover pack (JSON)</button>');
  h+=`<div class="card"><h3>Reading the prototype</h3><ul class="small"><li>Turn on <b>Dev notes</b> in the yellow bar: <span class="be" style="display:inline-block">⚙ backend</span> marks behaviour that needs PMB server work; <span class="ui" style="display:inline-block">▣ UI demo</span> marks placeholder content whose rules are still to be confirmed.</li><li>Everything runs in the browser with <b>demo data</b> stored in localStorage. No PMB, MCube, Gallabox, Workhall or ERP API is called. “Call”, “WhatsApp” and “Send wish” only write a demo timeline entry.</li><li>Use <b>View as</b> to switch between Delight Member, Delight Backend, Delight Head, CRM Head / CSMO and Admin. PMB must enforce scope on the server (as it does today: “Scope is enforced by the server on every request”).</li><li>Do not change RM ownership logic. Delight ownership is a separate field.</li></ul></div>`;
  h+=`<div class="grid g2" style="margin-top:14px"><div class="card"><h3>New data PMB needs</h3><table><tr><th>Entity</th><th>Key fields</th></tr>${[
   ['Delight ownership','customer, primary_owner, changed_by, changed_at, approval_id'],
   ['Temporary cover','customer | member scope, covering_member, from, to, reason, approval_id'],
   ['Delight activity','customer, booking, type, date/time, mode, assignee, status, remarks, next_follow_up, source (PMB / Workhall task id), log[]'],
   ['Checklist item','activity, item, done, by, at (configurable per type)'],
   ['JI observation','activity, text, team, status, ERP ticket ref'],
   ['Customer request (or Ticket extension)','customer, booking, source, category, team, assignee, level, due, status, external_ref, history[]'],
   ['Referral','referrer customer + booking, prospect name/phone, interest, source, member, sales contact, status, site visit, booking ref/value'],
   ['Referral payout','referral, amount, status, approval chain, payment ref/date'],
   ['Approval (extend existing)','type, raised_by, customer, details, steps[role,status,by,at,comment]'],
   ['Engagement profile','DOB, anniversary, language, preferences (source TBC)']].map(r=>`<tr><td><b>${r[0]}</b></td><td class="small mono">${r[1]}</td></tr>`).join('')}</table></div>
   <div class="card"><h3>Integrations touched</h3><table><tr><th>System</th><th>Use</th></tr>${[['MCube','Delight extensions 448, 455, 458, 462, 502 → calls on customer timeline (exists)'],['Gallabox','Delight templates, official numbers, registration groups (TBC)'],['Microsoft 365','customerdelight@ shared mailbox (sync reliability — finding CP-016)'],['Workhall','Read Delight tasks (e.g. “First Meet · Execute First meet”) and stages; do not duplicate'],['ERP / customer portal','Ticket references; snag tickets; DOB source (TBC)'],['Sales CRM','Referral hand-off and status (TBC)']].map(r=>`<tr><td><b>${r[0]}</b></td><td class="small">${r[1]}</td></tr>`).join('')}</table></div></div>`;
  h+=`<div class="grid g2" style="margin-top:14px"><div class="card"><h3>Needs backend (${bk.length})</h3>${bk.map(r=>`<div class="small" style="padding:3px 0"><span class="mono">${r.id}</span> ${esc(r.f)} — <span class="muted">${esc(r.be)}</span></div>`).join('')}</div><div class="card"><h3>Pending confirmation (${pc.length})</h3>${pc.map(r=>`<div class="small" style="padding:3px 0"><span class="mono">${r.id}</span> ${esc(r.f)} — <span class="muted">${esc(r.ev)}</span></div>`).join('')}<h3 style="margin-top:12px">Already in PMB (${ui_.length})</h3>${ui_.map(r=>`<div class="small" style="padding:3px 0"><span class="mono">${r.id}</span> ${esc(r.f)}</div>`).join('')}</div></div>`;
  el.innerHTML=h;
  el.querySelector('#hx').onclick=()=>download('delight_handover_pack_'+iso(TODAY)+'.json',JSON.stringify({generated:nowStr(),note:'Functional reference — PMB Delight Team module prototype. Demo data only.',requirements:REQS.map(r=>Object.assign({},r,{pmb_status:PMB_LABEL[r.pmb],decision:S.decisions[r.id]||null,feedback:S.feedback.filter(f=>f.req===r.id)})),general_feedback:S.feedback.filter(f=>!f.req),roles:ROLE_LABEL,activity_types:ACT_TYPES,request_categories:REQ_CATS,referral_statuses:REF_STATUS,payout_statuses:PAY_STATUS},null,2),'application/json');
};
