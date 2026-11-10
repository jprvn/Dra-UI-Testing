/* ===== Dashboard ===== */
function within(a,from,to){const d=dayDiff(a.date);return d>=from&&d<=to;}
const isEng=a=>ENGAGE.includes(a.type);
const openAct=a=>!['Completed','Cancelled'].includes(a.status);
function kpi(v,l,s,go,cls){return `<div class="kpi ${cls||''}" data-go="${go}"><div class="v">${v}</div><div class="l">${l}</div><div class="s">${s}</div></div>`;}

PAGES.dashboard=function(el){
  const r=role(), scope=defScope(), mine=scope==='mine';
  const acts=S.acts.filter(a=>actInScope(a,scope));
  const custs=S.customers.filter(c=>custInScope(c,scope));
  const today=acts.filter(a=>within(a,0,0));
  const next7=t=>acts.filter(a=>a.type===t&&openAct(a)&&within(a,0,7)).length;
  const overdue=acts.filter(a=>openAct(a)&&dayDiff(a.date)<0);
  const fups=acts.filter(a=>openAct(a)&&(a.type==='followup'||(a.next&&dayDiff(a.next)<=0))&&dayDiff(a.date)<=0);
  const reqs=S.reqs.filter(q=>!['Resolved','Closed'].includes(q.status)&&(!mine||q.assignee===SES.user));
  const esc2=reqs.filter(q=>q.status==='Escalated').length;
  const refs=S.refs.filter(f=>(!mine||f.member===SES.user)&&dayDiff(f.date)>=-30);
  const eng=acts.filter(a=>isEng(a)&&within(a,0,0));
  const greet=today.filter(a=>a.type==='birthday'||a.type==='anniversary');
  const hour=new Date().getHours(); const hi=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  const dn=TODAY.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  let h='';
  if(r==='backend'){ return backendDesk(el); }
  const title= mine?`${hi}, ${esc(me().name)}`:(r==='crm'?'Delight — management view':'Delight team console');
  h+=pageHeader(title,dn);
  h+=`<div class="lede">${mine?'You have':'The team has'} <b>${today.filter(a=>openAct(a)).length}</b> activities today, <b>${overdue.length}</b> overdue, <b>${greet.length}</b> birthday / anniversary wishes and <b>${reqs.length}</b> open customer requests${esc2?` (${esc2} escalated)`:''}.</div>`;
  if(mine) h+=`<div class="note info">Scope: <b>my customers</b> (primary owner, temporary cover or an activity assigned to me). The Delight role in PMB can still open <a href="#/customers?scope=all">every customer</a> — history stays visible to the whole team. ${be('Delight owner/cover fields')}</div>`;
  h+=`<div class="grid g5">`+
    kpi(custs.length,'Assigned customers',mine?'owner or covering':'with a Delight owner',`customers?scope=${scope}`)+
    kpi(today.length,'Today\'s activities',`${today.filter(a=>a.status==='Completed').length} done`,`activities?range=today&scope=${scope}`)+
    kpi(next7('firstmeet'),'First Meets','next 7 days',`activities?type=firstmeet&range=next7&scope=${scope}`)+
    kpi(next7('registration'),'Registrations','next 7 days',`activities?type=registration&range=next7&scope=${scope}`)+
    kpi(next7('ji'),'Joint Inspections','next 7 days',`activities?type=ji&range=next7&scope=${scope}`)+
    kpi(next7('handover'),'Handovers','next 7 days',`activities?type=handover&range=next7&scope=${scope}`)+
    kpi(overdue.length+fups.length,'Pending follow-ups',`${overdue.length} overdue activities`,`activities?range=due&scope=${scope}`,overdue.length?'red':'')+
    kpi(reqs.length,'Open requests',`${esc2} escalated`,`requests?scope=${scope}`,reqs.length?'amber':'grey')+
    kpi(`${refs.length}`,'Referrals · 30 days',`${refs.filter(f=>f.status==='Booked').length} booked · ${refs.filter(f=>f.siteVisit&&f.siteVisit.status==='Done').length} site visits`,'referrals')+
    kpi(eng.length,'Engagement today','birthdays · anniversaries · events',`activities?type=engagement&range=today&scope=${scope}`)+
  `</div>`;
  if(['head','crm','admin'].includes(r)){
    const pend=S.apr.filter(a=>a.chain.some(s=>s.status==='Pending'));
    h+=`<div class="sec-t">The team · the lead's console</div><div class="grid g4">`+
      kpi(pend.length,'Approvals pending',`${pendingForMe()} waiting for you`,'approvals',pendingForMe()?'amber':'grey')+
      kpi(S.reqs.filter(q=>q.level>=2&&!['Resolved','Closed'].includes(q.status)).length,'Escalations L2 / L3','Delight Head · CSMO','requests?level=2',S.reqs.some(q=>q.level>=2&&q.status==='Escalated')?'red':'')+
      kpi(S.customers.filter(c=>c.cover&&coverActive(c.cover)).length,'Customers under cover','temporary reassignment','team')+
      kpi(acts.filter(a=>openAct(a)&&dayDiff(a.date)<-atype(a.type).sla).length,'SLA breaches','activities past SLA','activities?range=breach&scope=all',acts.some(a=>openAct(a)&&dayDiff(a.date)<-atype(a.type).sla)?'red':'')+
    `</div>`;
    h+=`<div class="sec-t">Member-wise today</div>`+memberTable();
  }
  h+=`<div class="grid g2" style="margin-top:18px"><div class="card"><h3>Today's schedule</h3>${actMiniList(today.filter(a=>!isEng(a)),true)}</div><div class="card"><h3>Engagement today</h3>${actMiniList(eng,true)||''}<div class="muted small" style="margin-top:8px">Greetings use Gallabox templates <span class="mono">birthday_wish</span> / <span class="mono">anniversary_wish</span>. ${be('Gallabox template send')}</div></div></div>`;
  h+=`<div class="card" style="margin-top:14px"><h3>Next 7 days</h3>${actMiniList(acts.filter(a=>openAct(a)&&within(a,1,7)).sort((a,b)=>a.date.localeCompare(b.date)),false)}</div>`;
  el.innerHTML=h; wireMini(el);
};
function actMiniList(list,quick){
  if(!list.length) return '<div class="empty">Nothing here.</div>';
  return `<div class="tl">`+list.map(a=>{const c=cust(a.cust),b=booking(a.booking),t=atype(a.type),own=c.owner!==a.assignee;
    return `<div class="tl-i" data-cust="${c.id}" style="cursor:pointer"><div class="ic co">${t.ico}</div><div><div class="h"><b>${esc(c.name)}</b><span>${esc(t.l)}</span><span>· ${fd(a.date)} ${esc(a.time||'')}</span>${tagStatus(a.status)}${own?(c.cover&&coverActive(c.cover)&&c.cover.member===a.assignee?`<span class="tag amber" title="Temporary cover">${esc(pname(a.assignee))} covering for ${esc(pname(c.owner))}</span>`:`<span class="tag purple" title="Activity-specific assignment">assigned to ${esc(pname(a.assignee))} · owner ${esc(pname(c.owner))}</span>`):''}</div><div class="b small muted">${esc(unitLabel(b))} · ${esc(a.mode)} · ${esc(a.remarks)}</div>${quick&&openAct(a)&&can('edit')?`<div class="row" style="margin-top:6px">${(a.type==='birthday'||a.type==='anniversary')?`<button class="btn sm" data-wish="${a.id}">Send wish (template)</button>`:''}<button class="btn sm" data-upd="${a.id}">Update status</button></div>`:''}</div></div>`;}).join('')+`</div>`;
}
function wireMini(el){
  el.querySelectorAll('[data-upd]').forEach(b=>b.onclick=e=>{e.stopPropagation();openUpdate(S.acts.find(a=>a.id===b.dataset.upd));});
  el.querySelectorAll('[data-wish]').forEach(b=>b.onclick=e=>{e.stopPropagation();const a=S.acts.find(x=>x.id===b.dataset.wish);const c=cust(a.cust);
    S.comms.push({id:uid('MSG'),cust:c.id,booking:a.booking,ch:'wa',at:nowStr(),by:SES.user,dir:'out',summary:`Template: ${a.type==='birthday'?'birthday_wish':'anniversary_wish'}`,thread:[{me:true,t:a.type==='birthday'?`Dear ${c.name.split(' ')[0]}, warm birthday wishes from all of us at DRA Homes!`:`Dear ${c.name.split(' ')[0]}, happy anniversary from the DRA family!`}]});
    a.status='Completed';a.log.push({at:nowStr(),by:SES.user,text:'Wish sent via WhatsApp template (demo)'});save();toast('Demo: WhatsApp template queued for '+esc(c.name)+' — logged on timeline.');render();});
}
function memberTable(){
  const rows=MEMBERS.map(m=>{const a=S.acts.filter(x=>x.assignee===m);
    return {m,owned:S.customers.filter(c=>c.owner===m).length,cover:S.customers.filter(c=>c.cover&&coverActive(c.cover)&&c.cover.member===m).length,away:S.customers.filter(c=>c.owner===m&&c.cover&&coverActive(c.cover)).length,
      today:a.filter(x=>within(x,0,0)).length,done:a.filter(x=>within(x,0,0)&&x.status==='Completed').length,overdue:a.filter(x=>openAct(x)&&dayDiff(x.date)<0).length,
      comms:S.comms.filter(c=>c.by===m&&dayDiff(c.at)>=-7).length,reqs:S.reqs.filter(q=>q.assignee===m&&!['Resolved','Closed'].includes(q.status)).length,refs:S.refs.filter(f=>f.member===m&&dayDiff(f.date)>=-30).length};});
  return `<div class="tbl-wrap"><table><tr><th>Member</th><th>Owns</th><th>Covering</th><th>Today</th><th>Overdue</th><th>Comms · 7d</th><th>Open requests</th><th>Referrals · 30d</th></tr>`+rows.map(r=>`<tr class="click" data-go="activities?member=${r.m}&scope=all"><td><b>${esc(pname(r.m))}</b>${r.away?` <span class="tag amber">on leave · ${r.away} covered</span>`:''}</td><td>${r.owned}</td><td>${r.cover||'—'}</td><td>${r.done}/${r.today}</td><td>${r.overdue?`<span class="tag red">${r.overdue}</span>`:'0'}</td><td>${r.comms}</td><td>${r.reqs}</td><td>${r.refs}</td></tr>`).join('')+`</table></div>`;
}
function backendDesk(el){
  const toConfirm=S.acts.filter(a=>a.status==='Planned'&&!isEng(a)&&within(a,0,3));
  const greet=S.acts.filter(a=>(a.type==='birthday'||a.type==='anniversary')&&openAct(a)&&within(a,0,0));
  const regCk=S.acts.filter(a=>a.type==='registration'&&openAct(a)&&a.checklist&&Object.values(a.checklist).some(v=>!v));
  const verify=S.apr.filter(a=>a.type==='Referral payout'&&a.chain[0].status==='Pending');
  const toPay=S.refs.filter(f=>f.payout.status==='CSMO approved');
  const gaps=S.customers.filter(c=>!c.anniversary||c.phones.length<2);
  let h=pageHeader('Delight backend desk',TODAY.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})+' · queues that keep the members free for customers');
  h+=`<div class="note">“Delight Backend” is a <b>new role</b>. The duties below are a proposal — Delight Head to confirm. ${be('new role + queues')}</div>`;
  h+=`<div class="grid g3">`+kpi(toConfirm.length,'Appointments to confirm','planned in next 3 days','activities?status=Planned&range=next3&scope=all',toConfirm.length?'amber':'')+kpi(greet.length,'Greetings to send','birthdays & anniversaries today','activities?type=engagement&range=today&scope=all')+kpi(regCk.length,'Registration checklists','documents still pending','activities?type=registration&scope=all',regCk.length?'amber':'')+kpi(verify.length,'Referral payouts to verify','eligibility check','approvals',verify.length?'amber':'grey')+kpi(toPay.length,'Payouts to mark paid','CSMO approved → Accounts','referrals?tab=register&pay=CSMO approved',toPay.length?'red':'grey')+kpi(gaps.length,'Data gaps','no anniversary / single number','customers?gap=1&scope=all','grey')+`</div>`;
  h+=`<div class="grid g2" style="margin-top:18px"><div class="card"><h3>Greetings queue — today</h3>${actMiniList(greet,true)}<div class="row" style="margin-top:10px"><button class="btn pri sm" id="bulkWish" ${greet.length?'':'disabled'}>Send all ${greet.length} via template</button>${be('Gallabox bulk template')}</div></div>
  <div class="card"><h3>Appointments to confirm</h3>${actMiniList(toConfirm,true)}</div></div>`;
  h+=`<div class="card" style="margin-top:14px"><h3>Registration document checklists</h3><div class="tbl-wrap"><table><tr><th>Date</th><th>Customer · unit</th><th>Member</th><th>Pending documents</th></tr>${regCk.map(a=>{const c=cust(a.cust);return `<tr class="click" data-upd2="${a.id}"><td>${fd(a.date)}</td><td><b>${esc(c.name)}</b><div class="sub">${esc(unitLabel(booking(a.booking)))}</div></td><td>${esc(pname(a.assignee))}</td><td>${Object.entries(a.checklist).filter(([k,v])=>!v).map(([k])=>`<span class="tag amber">${esc(k)}</span>`).join(' ')}</td></tr>`;}).join('')}</table></div></div>`;
  el.innerHTML=h; wireMini(el);
  el.querySelectorAll('[data-upd2]').forEach(r=>r.onclick=()=>openUpdate(S.acts.find(a=>a.id===r.dataset.upd2)));
  const bw=el.querySelector('#bulkWish'); if(bw) bw.onclick=()=>{greet.forEach(a=>{const c=cust(a.cust);S.comms.push({id:uid('MSG'),cust:c.id,booking:a.booking,ch:'wa',at:nowStr(),by:SES.user,dir:'out',summary:'Template: '+(a.type==='birthday'?'birthday_wish':'anniversary_wish')+' (bulk)',thread:[{me:true,t:'Warm wishes from the DRA family!'}]});a.status='Completed';a.log.push({at:nowStr(),by:SES.user,text:'Bulk wish sent (demo)'});});save();toast(greet.length+' wishes queued (demo) and logged on each timeline.');render();};
}

/* ===== Customer list + 360 ===== */
PAGES.customers=function(el){ customerPage(el,null); };
PAGES.customer=function(el){ customerPage(el,ROUTE.id); };
function customerPage(el,id){
  const q=ROUTE.q, scope=q.scope||defScope();
  let list=S.customers.filter(c=>custInScope(c,scope));
  if(q.project) list=list.filter(c=>c.bookings.some(b=>b.project===q.project));
  if(q.stage) list=list.filter(c=>c.bookings.some(b=>(b.stageIdx===5?'engagement':JOURNEY[b.stageIdx].k)===q.stage));
  if(q.owner) list=list.filter(c=>c.owner===q.owner);
  if(q.gap) list=list.filter(c=>!c.anniversary||c.phones.length<2);
  if(q.t){const t=q.t.toLowerCase();list=list.filter(c=>(c.name+' '+c.phones.map(p=>p.num).join(' ')+' '+c.bookings.map(b=>b.id+' '+b.unit+' '+b.project).join(' ')).toLowerCase().includes(t));}
  const sel=id?cust(id):null;
  let h=pageHeader('Customer 360°',`${list.length} customers · ${scope==='mine'?'my customers':'all Delight customers'} · RM ownership is read-only here`);
  h+=`<div class="split"><div><div class="filters"><input class="inp grow" id="cq" placeholder="Search name, phone, unit, BOF…" value="${esc(q.t||'')}"><div class="seg">${['mine','all'].map(s=>`<button data-scope="${s}" class="${scope===s?'on':''}">${s==='mine'?'Mine':'All'}</button>`).join('')}</div></div>
  <div class="filters"><select class="inp" id="cproj">${opts(PROJECTS,q.project||'','All projects')}</select><select class="inp" id="cstage">${opts(JOURNEY.map(j=>({v:j.k,l:j.l})).concat([{v:'engagement',l:'Engagement (handed over)'}]),q.stage||'','All journey stages')}</select><select class="inp" id="cown">${memberOpts(q.owner||'','Any owner')}</select></div>
  ${q.gap?'<div class="note">Showing data gaps: missing anniversary or only one contact number. <a href="#/customers?scope=all">Clear</a></div>':''}
  <div class="clist">${list.map(c=>{const b=c.bookings[0];const cv=c.cover&&coverActive(c.cover);return `<div class="citem ${sel&&sel.id===c.id?'on':''}" data-open="${c.id}"><div class="avatar g">${initials(c.name)}</div><div style="min-width:0;flex:1"><div class="row"><b>${esc(c.name)}</b>${c.bookings.length>1?`<span class="tag">${c.bookings.length} bookings</span>`:''}${c.nri?'<span class="tag blue">NRI</span>':''}${cv?'<span class="tag amber">cover</span>':''}</div><div class="meta">${esc(unitLabel(b))} · ${esc(b.stageIdx===5?'Engagement':JOURNEY[b.stageIdx].l)} · ${esc(pname(effOwner(c)))}</div></div></div>`;}).join('')||'<div class="empty">No customers match.</div>'}</div></div>
  <div id="c360">${sel?c360(sel):`<div class="card empty" style="padding:80px 20px"><h2>Open a customer</h2><p>Pick a name on the left to see bookings, Delight ownership, journey, activities, requests, referrals and every conversation.</p></div>`}</div></div>`;
  el.innerHTML=h;
  const cq=el.querySelector('#cq'); cq.addEventListener('keydown',e=>{if(e.key==='Enter')setQ('t',cq.value);});
  el.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>setQ('scope',b.dataset.scope));
  el.querySelector('#cproj').onchange=e=>setQ('project',e.target.value);
  el.querySelector('#cstage').onchange=e=>setQ('stage',e.target.value);
  el.querySelector('#cown').onchange=e=>setQ('owner',e.target.value);
  el.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>go('customer',ROUTE.q,b.dataset.open));
  if(sel) wire360(el,sel);
}
function c360(c){
  const tf=ROUTE.q.ch||'all', bk=ROUTE.q.b||c.bookings[0].id, b=c.bookings.find(x=>x.id===bk)||c.bookings[0];
  const comms=S.comms.filter(m=>m.cust===c.id).sort((a,b)=>b.at.localeCompare(a.at));
  const cnt=ch=>comms.filter(m=>m.ch===ch).length;
  const acts=S.acts.filter(a=>a.cust===c.id);
  const up=acts.filter(openAct).sort((a,b)=>a.date.localeCompare(b.date));
  const reqs=S.reqs.filter(r=>r.cust===c.id);
  const refs=S.refs.filter(r=>r.referrer===c.id);
  const cv=c.cover&&coverActive(c.cover);
  const stageName=b.stageIdx===5?'Handed over — engagement':JOURNEY[b.stageIdx].l;
  const nextA=up[0];
  let h=`<div class="card"><div class="row between" style="align-items:flex-start"><div class="row" style="align-items:flex-start;gap:12px"><div class="avatar g" style="width:46px;height:46px;font-size:15px">${initials(c.name)}</div><div><h2>${esc(c.name)}</h2>
    <div class="small">${c.phones.map(p=>`<div>${esc(p.num)} <span class="muted">· ${esc(p.label)}</span></div>`).join('')}</div><div class="small muted">${c.emails.map(esc).join(', ')} · ${esc(c.city)}</div>${c.coApplicant?`<div class="small">Co-applicant: ${esc(c.coApplicant)}</div>`:''}<button class="btn sm" style="margin-top:6px" data-addnum>+ Add number / email</button></div></div>
    <div class="row"><button class="btn sm" data-dial>📞 Call</button><button class="btn sm" data-wa>WhatsApp ${cnt('wa')}</button><button class="btn sm" data-tl="email">Email ${cnt('email')}</button><button class="btn sm warn" data-newreq>Request</button></div></div>
    <div class="row small muted" style="margin-top:8px"><span>Calls ${cnt('call')}</span>·<span>WhatsApp ${cnt('wa')}</span>·<span>Email ${cnt('email')}</span>·<span>Requests ${reqs.length}</span>·<span>Referrals given ${refs.length}</span></div></div>`;
  h+=`<div class="cheat" style="margin-top:14px"><div class="k">✦ CHEAT SHEET</div><p>${esc(c.name)} — ${esc(unitLabel(b))} · ${esc(stageName)} · Delight: ${esc(pname(effOwner(c)))}${cv?' (covering for '+esc(pname(c.owner))+')':''} · RM: ${esc(b.rm)}${nextA?` · next: ${esc(atype(nextA.type).l)} ${fd(nextA.date)}`:''}${reqs.some(r=>!['Resolved','Closed'].includes(r.status))?' · has open requests':''}. ${esc(c.prefs)}.</p></div>`;
  h+=`<div class="grid g2" style="margin-top:14px"><div class="card"><h3>Delight ownership ${be('owner + cover fields')}</h3><div class="own"><dl class="kv"><dt>Primary owner</dt><dd><b>${esc(pname(c.owner))}</b></dd><dt>Temporary cover</dt><dd>${c.cover?`${esc(pname(c.cover.member))} · ${fd(c.cover.from)} → ${fd(c.cover.to)} ${cv?'<span class="tag amber">active</span>':'<span class="tag grey">'+(dayDiff(c.cover.to)<0?'expired':'scheduled')+'</span>'}<div class="sub muted small">${esc(c.cover.reason)}</div>`:'—'}</dd><dt>Relationship Manager</dt><dd>${esc(b.rm)} <span class="tag grey" title="RM ownership logic unchanged">from Workhall · read-only</span></dd><dt>This booking's activities</dt><dd>${[...new Set(acts.filter(a=>a.booking===b.id).map(a=>a.assignee))].map(pname).map(esc).join(', ')||'—'}</dd></dl></div>
    <div class="row" style="margin-top:10px">${can('changeOwner')?'<button class="btn sm" data-own>Change owner</button><button class="btn sm" data-cover>Set temporary cover</button>':(can('edit')?'<button class="btn sm" data-own>Request owner change</button><button class="btn sm" data-cover>Request temporary cover</button>':'')}</div></div>
    <div class="card"><h3>Engagement profile ${ui('fields to confirm')}</h3><dl class="kv"><dt>Birthday</dt><dd>${esc(fmtMD(c.dob))}</dd><dt>Anniversary</dt><dd>${c.anniversary?esc(fmtMD(c.anniversary)):'<span class="tag amber">missing</span>'}</dd><dt>Language</dt><dd>${esc(c.language)}</dd><dt>Preference</dt><dd>${esc(c.prefs)}</dd><dt>NRI</dt><dd>${c.nri?'Yes — '+esc(c.city):'No'}</dd></dl><div class="muted small" style="margin-top:6px">Source of DOB / anniversary to be confirmed (ERP booking form?). ${be('field mapping')}</div></div></div>`;
  // bookings
  h+=`<div class="card" style="margin-top:14px">${c.bookings.length>1?`<div class="tabs">${c.bookings.map(x=>`<button data-bk="${x.id}" class="${x.id===b.id?'on':''}">${esc(x.project)} · ${esc(x.unit)}</button>`).join('')}</div>`:''}
    <div class="row between"><h3 style="margin:0">${esc(b.project)}${b.tower!=='—'?' · '+esc(b.tower):''} <span class="muted small" style="font-family:var(--sans)">Unit ${esc(b.unit)} · ${esc(b.cfg)}</span></h3><span class="mono muted">${esc(b.id)}</span></div>
    <div class="row small muted" style="margin:6px 0"><span class="tag">Workhall · synced 6h ago</span> Booked ${fd(b.bookedOn)} · RM: ${esc(b.rm)} · Workhall stage: <b>${esc(b.whStage)}</b></div>
    <div class="small" style="margin-top:10px;font-weight:600">Delight journey <span class="muted" style="font-weight:400">— touchpoints are not strictly sequential</span></div>
    <div class="steps">${JOURNEY.map(j=>`<div class="st ${b.journey[j.k]==='done'?'done':b.journey[j.k]==='current'?'cur':''}"><i></i>${j.l}</div>`).join('')}<div class="st ${b.stageIdx===5?'cur':''}"><i></i>Engagement</div></div></div>`;
  // upcoming, requests, referrals
  h+=`<div class="grid g3" style="margin-top:14px"><div class="card"><div class="row between"><h3 style="margin:0">Upcoming activities</h3>${can('edit')?'<button class="btn sm" data-newact>+ New</button>':''}</div>${up.length?up.map(a=>`<div style="padding:8px 0;border-bottom:1px solid #f0efe7"><div class="row between"><b class="small">${atype(a.type).ico} ${esc(atype(a.type).l)}</b>${tagStatus(a.status)}</div><div class="small muted">${fdt(a.date+'T'+(a.time||''))} · ${esc(pname(a.assignee))}${a.assignee!==c.owner?' <span class="tag purple">activity-specific</span>':''}</div>${can('edit')?`<button class="btn sm" style="margin-top:4px" data-upd="${a.id}">Update</button> <button class="btn sm" data-rea="${a.id}">Reassign</button>`:''}</div>`).join(''):'<div class="empty">None scheduled.</div>'}</div>
    <div class="card"><div class="row between"><h3 style="margin:0">Requests</h3></div>${reqs.length?reqs.map(r=>`<div style="padding:8px 0;border-bottom:1px solid #f0efe7;cursor:pointer" data-req="${r.id}"><div class="row between"><span class="mono small">${r.id}</span>${tagStatus(r.status)}</div><div class="small"><b>${esc(r.title)}</b></div><div class="small muted">${esc(r.cat)} · ${esc(r.team)} · L${r.level}${r.extRef?' · '+esc(r.extRef):''}</div></div>`).join(''):'<div class="empty">No requests.</div>'}</div>
    <div class="card"><h3>Referral history</h3>${refs.length?refs.map(r=>`<div style="padding:8px 0;border-bottom:1px solid #f0efe7;cursor:pointer" data-ref="${r.id}"><div class="row between"><b class="small">${esc(r.prospect)}</b>${tagStatus(r.status)}</div><div class="small muted">${esc(r.interest)} · ${fd(r.date)} · payout ${esc(r.payout.status)}</div></div>`).join(''):'<div class="empty">No referrals yet.</div>'}${can('edit')?'<button class="btn sm" data-newref>+ Capture referral</button>':''}</div></div>`;
  // timeline
  const tl=comms.filter(m=>tf==='all'||m.ch===tf).map(m=>({k:'m',at:m.at,m})).concat(tf==='all'||tf==='note'?c.notes.map(n=>({k:'n',at:n.at,n})):[]).concat(tf==='all'?acts.flatMap(a=>a.log.filter(l=>l.text!=='Created').map(l=>({k:'a',at:l.at,a,l}))):[]).sort((x,y)=>y.at.localeCompare(x.at));
  h+=`<div class="card" style="margin-top:14px"><div class="row between"><h3 style="margin:0">History <span class="muted small" style="font-family:var(--sans)">calls · WhatsApp · email · notes · activity updates, one timeline — visible to every Delight member</span></h3></div>
    <div class="row" style="margin:10px 0">${[['all','All'],['call','Calls'],['wa','WhatsApp'],['email','Email'],['note','Notes']].map(([k,l])=>`<button class="chip ${tf===k?'on':''}" data-tl="${k}">${l}</button>`).join('')}</div>
    ${can('edit')?`<div class="row" style="margin-bottom:8px"><input class="inp grow" id="noteTxt" placeholder="Internal note — only the team sees this"><button class="btn sm pri" id="noteSave">Save note</button></div>`:''}
    <div class="tl">${tl.map(x=>tlItem(x)).join('')||'<div class="empty">No communications recorded yet.</div>'}</div></div>`;
  return h;
}
function fmtMD(md){if(!md) return '—';const [m,d]=md.split('-');return Number(d)+' '+MON[Number(m)-1];}
function chIcon(m){if(m.ch==='wa') return ['wa','💬','WhatsApp'];if(m.ch==='email') return ['em','✉','Email'];if(m.dir==='in') return [m.status==='Missed'?'mc':'ci','☎',m.status==='Missed'?'Missed call':'Inbound call'];return ['co','☎','Outbound call'];}
function tlItem(x){
  if(x.k==='n') return `<div class="tl-i"><div class="ic nt">✎</div><div><div class="h"><b>Note</b><span>${esc(pname(x.n.by))}</span><span>· ${fdt(x.n.at)}</span></div><div class="b">${esc(x.n.text)}</div></div></div>`;
  if(x.k==='a') return `<div class="tl-i"><div class="ic">${atype(x.a.type).ico}</div><div><div class="h"><b>${esc(atype(x.a.type).l)}</b><span>${esc(pname(x.l.by))}</span><span>· ${fdt(x.l.at)}</span></div><div class="b small">${esc(x.l.text)}</div></div></div>`;
  const m=x.m,[cls,ic,lab]=chIcon(m);
  return `<div class="tl-i" data-msg="${m.id}" style="cursor:pointer"><div class="ic ${cls}">${ic}</div><div><div class="h"><b>${lab}</b><span>${m.by?'by '+esc(pname(m.by)):'unanswered / not yet handled'}</span><span>· ${fdt(m.at)}</span>${m.dur?`<span class="mono">${m.dur}</span>`:''}${m.booking?`<span class="mono tiny">${m.booking}</span>`:''}</div><div class="b small">${esc(m.subject||m.summary)}</div></div></div>`;
}
function wire360(el,c){
  el.querySelectorAll('[data-tl]').forEach(b=>b.onclick=()=>setQ('ch',b.dataset.tl));
  el.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>setQ('b',b.dataset.bk));
  el.querySelectorAll('[data-msg]').forEach(b=>b.onclick=()=>openMsg(S.comms.find(m=>m.id===b.dataset.msg)));
  el.querySelectorAll('[data-upd]').forEach(b=>b.onclick=()=>openUpdate(S.acts.find(a=>a.id===b.dataset.upd)));
  el.querySelectorAll('[data-rea]').forEach(b=>b.onclick=()=>openReassign([S.acts.find(a=>a.id===b.dataset.rea)]));
  el.querySelectorAll('[data-req]').forEach(b=>b.onclick=()=>openReq(S.reqs.find(r=>r.id===b.dataset.req)));
  el.querySelectorAll('[data-ref]').forEach(b=>b.onclick=()=>openRef(S.refs.find(r=>r.id===b.dataset.ref)));
  const q=s=>el.querySelector(s);
  if(q('[data-newact]')) q('[data-newact]').onclick=()=>openNewActivity({cust:c.id});
  if(q('[data-newref]')) q('[data-newref]').onclick=()=>openNewRef({referrer:c.id});
  if(q('[data-newreq]')) q('[data-newreq]').onclick=()=>openNewReq({cust:c.id});
  if(q('[data-own]')) q('[data-own]').onclick=()=>openOwner(c);
  if(q('[data-cover]')) q('[data-cover]').onclick=()=>openCover(c.owner,c);
  q('[data-dial]').onclick=()=>toast(`Demo: PMB would dial ${esc(c.phones[0].num)} through MCube from ext ${esc(me().ext)}. Call lands on this timeline.`);
  q('[data-wa]').onclick=()=>openWA(c);
  q('[data-addnum]').onclick=()=>{const o=modal(`<h2>Add number / email</h2><div class="form" style="margin-top:10px"><label>Label<input class="inp" name="l" placeholder="e.g. Son · USA"></label><label>Number or email<input class="inp" name="n"></label></div><div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="ok">Add</button></div>`);o.querySelector('#ok').onclick=()=>{const n=val(o,'n');if(!n) return; if(n.includes('@')) c.emails.push(n); else c.phones.push({label:val(o,'l')||'Other',num:n}); save();o.remove();render();};};
  const ns=q('#noteSave'); if(ns) ns.onclick=()=>{const t=q('#noteTxt').value.trim(); if(!t) return; c.notes.unshift({at:nowStr(),by:SES.user,text:t}); save(); toast('Note saved'); render();};
}
function openMsg(m){
  const c=cust(m.cust),[cls,ic,lab]=chIcon(m);
  let body='';
  if(m.ch==='wa') body=(m.thread||[]).map(t=>`<div class="bubble ${t.me?'me':''}">${esc(t.t)}</div>`).join('')+`<div class="muted small">Gallabox conversation · official number ${be('Gallabox')}</div>`;
  else if(m.ch==='email') body=`<div class="card"><div class="small muted">Subject</div><b>${esc(m.subject||'')}</b><pre style="white-space:pre-wrap;font:inherit;margin-top:10px">${esc(m.body||m.summary)}</pre></div><div class="muted small" style="margin-top:6px">From customerdelight@ shared mailbox ${be('M365 sync')}</div>`;
  else body=`<dl class="kv"><dt>Direction</dt><dd>${m.dir==='in'?'Inbound':'Outbound'}</dd><dt>Status</dt><dd>${esc(m.status||'Answered')}</dd><dt>Duration</dt><dd class="mono">${esc(m.dur||'—')}</dd><dt>Handled by</dt><dd>${esc(pname(m.by))}</dd></dl><div class="card" style="margin-top:10px">▶ Recording · MCube ${be('MCube recording link')}</div>`;
  drawer(`<span class="eyebrow work">${lab}</span><h2>${esc(c.name)}</h2><p class="muted">${fdt(m.at)} · ${esc(unitLabel(booking(m.booking)))}</p>${body}<div class="note info" style="margin-top:14px">Continuity: any Delight member opening this customer sees this conversation, even if ${esc(pname(m.by))} handled it.</div>`);
}
function openWA(c){
  const o=modal(`<h2>WhatsApp ${esc(c.name)}</h2><p class="muted small">Outside the 24-hour window only approved templates can be sent (PMB already enforces this for RMs).</p><div class="form" style="margin-top:10px"><label class="full">Template<select class="inp" name="t">${opts(WA_TEMPLATES)}</select></label><label class="full">Number<select class="inp" name="n">${opts(c.phones.map(p=>({v:p.num,l:p.num+' · '+p.label})))}</select></label></div><div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="ok">Send (demo)</button></div>`);
  o.querySelector('#ok').onclick=()=>{S.comms.push({id:uid('MSG'),cust:c.id,booking:c.bookings[0].id,ch:'wa',at:nowStr(),by:SES.user,dir:'out',summary:'Template: '+val(o,'t'),thread:[{me:true,t:'['+val(o,'t')+'] sent to '+val(o,'n')}]});save();o.remove();toast('Demo only — nothing was sent. Logged on the timeline.');render();};
}

/* ===== Activities ===== */
PAGES.activities=function(el){
  const q=ROUTE.q, scope=q.scope||defScope(), range=q.range||'next7';
  let list=S.acts.filter(a=>actInScope(a,scope));
  if(q.type) list=list.filter(a=>q.type==='engagement'?isEng(a):a.type===q.type);
  if(q.status) list=list.filter(a=>a.status===q.status);
  if(q.member) list=list.filter(a=>a.assignee===q.member);
  if(q.project) list=list.filter(a=>booking(a.booking).project===q.project);
  if(q.t){const t=q.t.toLowerCase();list=list.filter(a=>(cust(a.cust).name+' '+unitLabel(booking(a.booking))+' '+a.remarks).toLowerCase().includes(t));}
  const base=list;
  const R={today:a=>within(a,0,0),next3:a=>within(a,0,3),next7:a=>within(a,0,7),due:a=>openAct(a)&&dayDiff(a.date)<=0,overdue:a=>openAct(a)&&dayDiff(a.date)<0,breach:a=>openAct(a)&&dayDiff(a.date)<-atype(a.type).sla,past:a=>dayDiff(a.date)<0,all:()=>true};
  if(q.day) list=list.filter(a=>a.date===q.day); else list=list.filter(R[range]||R.all);
  list.sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
  const bulk=can('bulk');
  let h=pageHeader('Activity management','First Meets, Registrations, Joint Inspections, Handovers, Post-handover, Follow-ups and Engagement in one tracker',can('edit')?'<button class="btn pri" id="newAct">+ New activity</button>':'');
  h+=`<div class="week">${[0,1,2,3,4,5,6].map(i=>{const d=iso(MD(i)),n=base.filter(a=>a.date===d).length,dt=MD(i);return `<div class="day ${q.day===d?'on':''} ${i===0?'today':''}" data-day="${d}"><div class="dn">${dt.toLocaleDateString('en-IN',{weekday:'short'})} ${dt.getDate()} ${MON[dt.getMonth()]}</div><b>${n}</b> <span class="tiny muted">activities</span></div>`;}).join('')}</div>`;
  h+=`<div class="filters"><div class="seg">${['mine','all'].map(s=>`<button data-scope="${s}" class="${scope===s?'on':''}">${s==='mine'?'Mine':'Team'}</button>`).join('')}</div>
    <select class="inp" id="frange">${opts([{v:'today',l:'Today'},{v:'due',l:'Due & overdue'},{v:'overdue',l:'Overdue only'},{v:'breach',l:'Past SLA'},{v:'next3',l:'Next 3 days'},{v:'next7',l:'Next 7 days'},{v:'past',l:'Past'},{v:'all',l:'All dates'}],q.day?'':range)}</select>
    <select class="inp" id="ftype">${opts(ACT_TYPES.map(t=>({v:t.k,l:t.l})).concat([{v:'engagement',l:'All engagement'}]),q.type||'','All activity types')}</select>
    <select class="inp" id="fstatus">${opts(ACT_STATUS,q.status||'','All statuses')}</select>
    <select class="inp" id="fmember">${memberOpts(q.member||'','All members')}</select>
    <select class="inp" id="fproj">${opts(PROJECTS,q.project||'','All projects')}</select>
    <input class="inp" id="ft" placeholder="Search…" value="${esc(q.t||'')}">
    ${q.day?`<button class="btn sm" data-clrday>Clear day ✕</button>`:''}</div>`;
  h+=bulk?`<div class="row" style="margin-bottom:8px"><button class="btn sm" id="bulkRe" disabled>Reassign selected</button><span class="muted small" id="selN">0 selected</span>${be('bulk update')}</div>`:'';
  h+=`<div class="tbl-wrap"><table id="actTbl"><tr>${bulk?'<th class="noexp"><input type="checkbox" id="selAll"></th>':''}<th>Date</th><th>Customer · unit</th><th>Activity</th><th>Assigned</th><th>Status</th><th>Remarks</th><th>Next follow-up</th><th class="noexp"></th></tr>`+
   list.map(a=>{const c=cust(a.cust),b=booking(a.booking),od=openAct(a)&&dayDiff(a.date)<0,br=openAct(a)&&dayDiff(a.date)<-atype(a.type).sla;
    return `<tr>${bulk?`<td class="noexp"><input type="checkbox" class="sel" value="${a.id}"></td>`:''}<td style="white-space:nowrap"><b>${fd(a.date)}</b><div class="sub">${esc(a.time||'')} · ${esc(a.mode)}</div>${od?`<span class="tag ${br?'red':'amber'}">${br?'past SLA':'overdue'}</span>`:''}</td>
    <td class="click" data-cust="${c.id}" style="cursor:pointer"><b>${esc(c.name)}</b><div class="sub">${esc(unitLabel(b))}</div></td>
    <td>${atype(a.type).ico} ${esc(atype(a.type).l)}${a.source!=='PMB'?`<div class="sub"><span class="tag grey">${esc(a.source)}</span></div>`:''}</td>
    <td>${esc(pname(a.assignee))}${a.assignee!==c.owner?`<div class="sub">owner: ${esc(pname(c.owner))}</div>`:''}${c.cover&&coverActive(c.cover)&&a.assignee===c.cover.member?'<span class="tag amber">cover</span>':''}</td>
    <td>${tagStatus(a.status)}</td><td style="max-width:280px" class="small">${esc(a.remarks)}${a.checklist?`<div class="sub">Checklist ${Object.values(a.checklist).filter(Boolean).length}/${Object.keys(a.checklist).length}</div>`:''}${a.snags?`<div class="sub">Snags open: ${a.snags.filter(s=>s.s!=='Closed').length}/${a.snags.length}</div>`:''}</td>
    <td>${a.next?fd(a.next):'—'}</td><td class="noexp" style="white-space:nowrap">${can('edit')?`<button class="btn sm" data-upd="${a.id}">Update</button> <button class="btn sm" data-rea="${a.id}">Reassign</button>`:`<button class="btn sm" data-view="${a.id}">View</button>`}</td></tr>`;}).join('')+`</table>${list.length?'':'<div class="empty">No activities for these filters.</div>'}</div>
    <div class="row" style="margin-top:10px"><button class="btn sm" id="expAct">Export CSV</button><span class="muted small">${list.length} activities</span></div>`;
  el.innerHTML=h;
  const g=s=>el.querySelector(s);
  el.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>setQ('scope',b.dataset.scope));
  el.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>setQ('day',q.day===b.dataset.day?'':b.dataset.day));
  if(g('[data-clrday]')) g('[data-clrday]').onclick=()=>setQ('day','');
  g('#frange').onchange=e=>{const qq=Object.assign({},q,{range:e.target.value,day:''});go('activities',qq);};
  g('#ftype').onchange=e=>setQ('type',e.target.value); g('#fstatus').onchange=e=>setQ('status',e.target.value);
  g('#fmember').onchange=e=>setQ('member',e.target.value); g('#fproj').onchange=e=>setQ('project',e.target.value);
  g('#ft').addEventListener('keydown',e=>{if(e.key==='Enter')setQ('t',e.target.value);});
  if(g('#newAct')) g('#newAct').onclick=()=>openNewActivity();
  el.querySelectorAll('[data-upd],[data-view]').forEach(b=>b.onclick=()=>openUpdate(S.acts.find(a=>a.id===(b.dataset.upd||b.dataset.view))));
  el.querySelectorAll('[data-rea]').forEach(b=>b.onclick=()=>openReassign([S.acts.find(a=>a.id===b.dataset.rea)]));
  g('#expAct').onclick=()=>tableCSV(g('#actTbl'),'delight_activities.csv');
  if(bulk){const upd=()=>{const n=el.querySelectorAll('.sel:checked').length;g('#selN').textContent=n+' selected';g('#bulkRe').disabled=!n;};
    el.querySelectorAll('.sel').forEach(c=>c.onchange=upd); g('#selAll').onchange=e=>{el.querySelectorAll('.sel').forEach(c=>c.checked=e.target.checked);upd();};
    g('#bulkRe').onclick=()=>openReassign([...el.querySelectorAll('.sel:checked')].map(c=>S.acts.find(a=>a.id===c.value)));}
};
function openNewActivity(pre){
  pre=pre||{}; if(!can('edit')){toast('Read-only for '+esc(ROLE_LABEL[role()]));return;}
  const o=modal(`<h2>New activity</h2><div class="form" style="margin-top:12px">
  <label class="full">Customer<select class="inp" name="cust">${custOpts(pre.cust||'')}</select></label>
  <label>Booking<select class="inp" name="booking"></select></label>
  <label>Activity type<select class="inp" name="type">${opts(ACT_TYPES.map(t=>({v:t.k,l:t.l})),pre.type||'followup')}</select></label>
  <label>Date<input class="inp" type="date" name="date" value="${iso(MD(1))}"></label><label>Time<input class="inp" type="time" name="time" value="11:00"></label>
  <label>Mode<select class="inp" name="mode">${opts(['In person','Virtual','Phone','At SRO','At site'])}</select></label>
  <label>Assign to<select class="inp" name="assignee"></select></label>
  <label class="full">Remarks<textarea class="inp" name="remarks"></textarea></label>
  <label>Next follow-up<input class="inp" type="date" name="next"></label></div>
  <p class="muted small">Default assignee is the customer's primary owner (or active cover). Assigning to someone else creates an <b>activity-specific</b> assignment; ownership is unchanged.</p>
  <div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="ok">Create</button></div>`);
  const fill=()=>{const c=cust(val(o,'cust'));o.querySelector('[name=booking]').innerHTML=c?opts(c.bookings.map(b=>({v:b.id,l:unitLabel(b)+' · '+b.id}))):'';
    const def=c?effOwner(c):SES.user; const allowed=can('assignAny')?MEMBERS:MEMBERS; o.querySelector('[name=assignee]').innerHTML=opts(allowed.map(m=>({v:m,l:pname(m)+(c&&m===c.owner?' (owner)':'')})),role()==='member'&&!c?SES.user:def);};
  o.querySelector('[name=cust]').onchange=fill; fill();
  o.querySelector('#ok').onclick=()=>{const c=cust(val(o,'cust')); if(!c){toast('Pick a customer');return;}
    const t=val(o,'type'); const a={id:nextActId(),cust:c.id,booking:val(o,'booking'),type:t,date:val(o,'date'),time:val(o,'time'),mode:val(o,'mode'),assignee:val(o,'assignee'),status:'Planned',remarks:val(o,'remarks')||'—',next:val(o,'next')||null,source:'PMB',created:iso(TODAY),checklist:t==='registration'?{'ID proofs':false,'Bank NOC':false,'Stamp duty DD':false,'Photos':false,'Witness details':false}:null,snags:t==='ji'?[]:null,log:[{at:nowStr(),by:SES.user,text:'Created'+(val(o,'assignee')!==c.owner?` · activity-specific assignment to ${pname(val(o,'assignee'))}`:'')}]};
    S.acts.push(a); audit('Created '+a.id); save(); o.remove(); toast('Activity '+a.id+' created'); render();};
}
function openUpdate(a){
  const c=cust(a.cust), ro=!can('edit');
  const o=modal(`<span class="eyebrow work">${atype(a.type).ico} ${esc(atype(a.type).l)} · ${a.id}</span><h2>${esc(c.name)}</h2><p class="muted small">${esc(unitLabel(booking(a.booking)))} · ${fd(a.date)} ${esc(a.time||'')} · ${esc(a.mode)} · assigned ${esc(pname(a.assignee))} · owner ${esc(pname(c.owner))}</p>
  <div class="form" style="margin-top:12px"><label>Status<select class="inp" name="status" ${ro?'disabled':''}>${opts(ACT_STATUS,a.status)}</select></label><label>Reschedule date<input class="inp" type="date" name="date" value="${a.date}" ${ro?'disabled':''}></label>
  <label class="full">Remarks / outcome<textarea class="inp" name="remarks" ${ro?'disabled':''}>${esc(a.remarks)}</textarea></label><label>Next follow-up<input class="inp" type="date" name="next" value="${a.next||''}" ${ro?'disabled':''}></label></div>
  ${a.checklist?`<div class="card" style="margin-top:12px"><h3>Registration checklist ${be('configurable checklist')}</h3>${Object.entries(a.checklist).map(([k,v])=>`<label class="ck"><input type="checkbox" data-ck="${esc(k)}" ${v?'checked':''} ${ro?'disabled':''}> ${esc(k)}</label>`).join('')}<div class="muted small">Items to be confirmed by Delight team (MoM §7.2). Hospitality arrangements tracked in remarks.</div></div>`:''}
  ${a.snags?`<div class="card" style="margin-top:12px"><h3>JI observations / snags ${be('snag record or ERP link')}</h3><div id="snags">${a.snags.map((s,i)=>`<div class="row" style="padding:4px 0"><input type="checkbox" data-sn="${i}" ${s.s==='Closed'?'checked':''} ${ro?'disabled':''}><span class="grow">${esc(s.t)}</span><span class="tag grey">${esc(s.team)}</span></div>`).join('')||'<div class="muted small">No snags recorded.</div>'}</div>${ro?'':`<div class="row" style="margin-top:8px"><input class="inp grow" id="snT" placeholder="New observation"><select class="inp" id="snTeam">${opts(REQ_TEAMS.slice(2),'Technical / Site')}</select><button class="btn sm" id="snAdd">Add</button></div>`}<div class="muted small" style="margin-top:6px">Tick = rectified &amp; closure communicated. System of record (PMB vs ERP/Workhall) pending confirmation.</div></div>`:''}
  <div class="card" style="margin-top:12px"><h3>Log</h3>${a.log.map(l=>`<div class="small"><span class="muted">${fdt(l.at)} · ${esc(pname(l.by))}</span> — ${esc(l.text)}</div>`).join('')}</div>
  <div class="acts"><button class="btn" data-x>Close</button>${ro?'':'<button class="btn pri" id="ok">Save update</button>'}</div>`);
  const sa=o.querySelector('#snAdd'); if(sa) sa.onclick=()=>{const t=o.querySelector('#snT').value.trim(); if(!t) return; a.snags.push({t,team:o.querySelector('#snTeam').value,s:'Open'}); save(); openUpdate(a);};
  const ok=o.querySelector('#ok'); if(ok) ok.onclick=()=>{
    const st=val(o,'status'), nd=val(o,'date'); const ch=[];
    if(st!==a.status) ch.push(`status ${a.status} → ${st}`); if(nd!==a.date){ch.push(`rescheduled ${fd(a.date)} → ${fd(nd)}`); if(st===a.status&&st!=='Completed') a.status='Rescheduled';}
    if(st!==a.status) a.status=st; a.date=nd; a.remarks=val(o,'remarks'); a.next=val(o,'next')||null;
    o.querySelectorAll('[data-ck]').forEach(x=>a.checklist[x.dataset.ck]=x.checked);
    o.querySelectorAll('[data-sn]').forEach(x=>a.snags[+x.dataset.sn].s=x.checked?'Closed':'Open');
    a.log.push({at:nowStr(),by:SES.user,text:(ch.join('; ')||'updated')+(a.remarks?' — '+a.remarks:'')});
    if(a.status==='Completed'){const b=booking(a.booking),k=JOURNEY.findIndex(j=>j.k===a.type); if(k>=0&&b.journey[a.type]!=='done'){b.journey[a.type]='done'; const nx=JOURNEY[k+1]; if(nx&&b.journey[nx.k]==='pending') b.journey[nx.k]='current'; if(k+1>b.stageIdx) b.stageIdx=Math.min(k+1,5);}}
    if(a.next&&a.status==='Completed'&&!S.acts.some(x=>x.cust===a.cust&&x.type==='followup'&&x.date===a.next)) S.acts.push({id:nextActId(),cust:a.cust,booking:a.booking,type:'followup',date:a.next,time:'11:00',mode:'Phone',assignee:a.assignee,status:'Planned',remarks:'Follow-up from '+atype(a.type).l+' ('+a.id+')',next:null,source:'PMB',created:iso(TODAY),log:[{at:nowStr(),by:SES.user,text:'Auto-created from '+a.id}]});
    audit('Updated '+a.id); save(); o.remove(); toast('Saved'); render();};
}
function openReassign(list){
  list=list.filter(Boolean); if(!list.length) return; const one=list.length===1?list[0]:null; const c=one?cust(one.cust):null;
  const isHead=can('changeOwner');
  const o=modal(`<h2>Reassign ${one?esc(atype(one.type).l)+' · '+esc(c.name):list.length+' activities'}</h2>
  <div class="form" style="margin-top:12px"><label class="full">What should change?<select class="inp" name="kind">
    <option value="act">This activity only (activity-specific assignment)</option>
    ${one?`<option value="cover">Temporary cover for this customer (dates)${isHead?'':' — needs Delight Head approval'}</option><option value="owner">Change primary Delight owner${isHead?'':' — needs Delight Head approval'}</option>`:''}</select></label>
  <label>Assign to<select class="inp" name="to">${memberOpts(one&&one.assignee!==c.owner?c.owner:'')}</select></label><label>Reason<input class="inp" name="reason" placeholder="Leave, simultaneous visit, language…"></label>
  <label class="cv">Cover from<input class="inp" type="date" name="from" value="${iso(TODAY)}"></label><label class="cv">Cover to<input class="inp" type="date" name="till" value="${iso(MD(3))}"></label></div>
  <p class="muted small">History and conversations stay with the customer — nothing is lost when work moves. RM ownership is not affected.</p>
  <div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="ok">Confirm</button></div>`);
  const kindSel=o.querySelector('[name=kind]'); const tog=()=>o.querySelectorAll('.cv').forEach(x=>x.style.display=kindSel.value==='cover'?'':'none'); kindSel.onchange=tog; tog();
  o.querySelector('#ok').onclick=()=>{const to=val(o,'to'),why=val(o,'reason')||'—',k=val(o,'kind');
    if(k==='act'){ if(role()==='member'&&list.some(a=>a.assignee!==SES.user&&cust(a.cust).owner!==SES.user)){toast('Members can hand over only their own activities. Ask Delight Head or Backend.');return;}
      list.forEach(a=>{a.log.push({at:nowStr(),by:SES.user,text:`Reassigned ${pname(a.assignee)} → ${pname(to)} (${why})`});a.assignee=to;}); audit(`Reassigned ${list.length} activities to ${pname(to)}`); save(); o.remove(); toast(list.length+' activity(ies) now with '+esc(pname(to))); render(); return;}
    if(k==='cover'){const a=raiseApproval('Temporary cover',c.id,{member:to,from:val(o,'from'),to:val(o,'till'),reason:why}); o.remove(); toast(a.chain.every(s=>s.status==='Approved')?'Cover applied':'Sent to Delight Head for approval — '+a.id); render(); return;}
    if(k==='owner'){const a=raiseApproval('Ownership change',c.id,{from:c.owner,to,reason:why}); o.remove(); toast(a.chain.every(s=>s.status==='Approved')?'Owner changed':'Sent to Delight Head for approval — '+a.id); render();}
  };
}
function openOwner(c){
  const o=modal(`<h2>${can('changeOwner')?'Change':'Request change of'} primary Delight owner</h2><p class="muted">${esc(c.name)} · current owner <b>${esc(pname(c.owner))}</b></p><div class="form"><label>New owner<select class="inp" name="to">${memberOpts('')}</select></label><label>Reason<input class="inp" name="r"></label></div><div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="ok">${can('changeOwner')?'Change owner':'Send for approval'}</button></div>`);
  o.querySelector('#ok').onclick=()=>{const to=val(o,'to'); if(to===c.owner){toast('Same owner');return;} const a=raiseApproval('Ownership change',c.id,{from:c.owner,to,reason:val(o,'r')||'—'}); o.remove(); toast(a.chain.every(s=>s.status==='Approved')?'Owner changed — logged on customer':'Sent for approval — '+a.id); render();};
}
function openCover(member,c){
  const o=modal(`<h2>${can('changeOwner')?'Set':'Request'} temporary cover</h2><p class="muted">${c?esc(c.name)+' · owner '+esc(pname(c.owner)):'All customers of '+esc(pname(member))}</p>
  <div class="form"><label>Covering member<select class="inp" name="m">${memberOpts(MEMBERS.find(x=>x!==member))}</select></label><label>Reason<input class="inp" name="r" placeholder="Leave / site visit / training"></label><label>From<input class="inp" type="date" name="f" value="${iso(TODAY)}"></label><label>To<input class="inp" type="date" name="t" value="${iso(MD(3))}"></label>${c?'':`<label class="full ck"><input type="checkbox" name="acts" checked> Move open activities in this period to the covering member</label>`}</div>
  <p class="muted small">Cover ends automatically on the end date; ownership never changes.</p><div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="ok">${can('changeOwner')?'Apply cover':'Send for approval'}</button></div>`);
  o.querySelector('#ok').onclick=()=>{const d={member:val(o,'m'),from:val(o,'f'),to:val(o,'t'),reason:val(o,'r')||'—'}; if(!c) d.scope='all '+pname(member)+' customers';
    let a; if(c) a=raiseApproval('Temporary cover',c.id,d); else {const prev=SES.user; a={id:'APR-'+String(200+S.apr.length).padStart(4,'0'),type:'Temporary cover',by:member,raised:nowStr(),cust:null,details:d,chain:[{role:'head',status:'Pending'}]}; S.apr.unshift(a); if(can('changeOwner')) decide(a,true,'Applied by '+pname(prev)); save();}
    o.remove(); toast(a.chain.every(s=>s.status==='Approved')?'Cover applied':'Sent to Delight Head — '+a.id); render();};
}
