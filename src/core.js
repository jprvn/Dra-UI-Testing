/* ===== State, persistence, roles, helpers ===== */
const LS_KEY='pmb_delight_proto', LS_SES='pmb_delight_proto_session', LS_DEV='pmb_delight_proto_dev';
let S=null, SES={user:'rekha'};
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function shiftAll(obj,days){ // move every YYYY-MM-DD date so demo "today" stays meaningful on later days
  const re=/^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2})?$/;
  const walk=o=>{ if(Array.isArray(o)) return o.forEach((v,i)=>{ if(typeof v==='string'&&re.test(v)) o[i]=sh(v); else if(v&&typeof v==='object') walk(v);});
    for(const k in o){const v=o[k]; if(k==='anchor'||k==='feedback'||k==='decisions'||k==='audit') continue;
      if((k==='dob'||k==='anniversary')&&typeof v==='string'&&/^\d\d-\d\d$/.test(v)){o[k]=sh(TODAY.getFullYear()+'-'+v).slice(5);continue;}
      if(typeof v==='string'&&re.test(v)) o[k]=sh(v); else if(v&&typeof v==='object') walk(v);} };
  const sh=s=>{const d=new Date(s.slice(0,10)+'T00:00:00');d.setDate(d.getDate()+days);return iso(d)+s.slice(10);};
  walk(obj);
}
function load(){
  const raw=lsGet(LS_KEY); let st=null;
  try{st=raw?JSON.parse(raw):null;}catch(e){st=null;}
  if(!st||st.version!==3){ st=seedData(); }
  else if(st.anchor!==iso(TODAY)){
    const diff=Math.round((TODAY-new Date(st.anchor+'T00:00:00'))/864e5);
    if(diff) shiftAll(st,diff);
    st.anchor=iso(TODAY);
  }
  S=st; save();
  try{SES=JSON.parse(lsGet(LS_SES))||SES;}catch(e){}
  if(lsGet(LS_DEV)==='1') document.body.classList.add('dev');
}
function save(){lsSet(LS_KEY,JSON.stringify(S));}
function resetDemo(){ const fb=S.feedback, dec=S.decisions; S=seedData(); S.feedback=fb; S.decisions=dec; save(); toast('Demo data reset (feedback kept).'); render(); }

const me=()=>PEOPLE.find(p=>p.id===SES.user);
const role=()=>me().role;
function can(a){
  const r=role();
  const M={
    edit:['member','backend','head','admin'],
    assignAny:['backend','head','admin'],
    changeOwner:['head','admin'],
    bulk:['head','backend','admin'],
    verify:['backend','admin'],
    markPaid:['backend','admin'],
    team:['head','crm','admin'],
    settings:['admin'],
    seeAll:['backend','head','crm','admin']
  };
  return (M[a]||[]).includes(r);
}
function layerOf(page){return ({dashboard:['member','backend'].includes(role())?'work':'mon',customers:'work',customer:'work',comms:'work',activities:'work',requests:'work',referrals:'work',team:'mon',reports:'mon',approvals:'apr',settings:'mon',requirements:'proto',feedback:'proto',handover:'proto'})[page]||'work';}
const LAYER_LABEL={work:'Working',mon:'Monitoring',apr:'Approvals',proto:'Prototype review'};

/* helpers */
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pname=id=>id?((PEOPLE.find(p=>p.id===id)||{name:id}).name):'—';
const initials=n=>n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const cust=id=>S.customers.find(c=>c.id===id);
function booking(id){for(const c of S.customers){const b=c.bookings.find(b=>b.id===id); if(b) return b;}return null;}
const atype=k=>ACT_TYPES.find(t=>t.k===k)||{l:k,ico:'•'};
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fd(s){if(!s) return '—'; const d=new Date(s.slice(0,10)+'T00:00:00'); const t=iso(TODAY); const diff=Math.round((d-TODAY)/864e5);
  const base=d.getDate()+' '+MON[d.getMonth()]; if(diff===0) return 'Today'; if(diff===1) return 'Tomorrow'; if(diff===-1) return 'Yesterday'; return base;}
function fdt(s){if(!s) return '—'; return fd(s)+(s.length>10?', '+s.slice(11,16):'');}
const dayDiff=s=>Math.round((new Date(s.slice(0,10)+'T00:00:00')-TODAY)/864e5);
const unitLabel=b=>b?`${b.project}${b.tower&&b.tower!=='—'?' · '+b.tower:''} · ${b.unit}`:'—';
const money=n=>'Rs '+Number(n||0).toLocaleString('en-IN');
const nextActId=()=>'ACT-'+(Math.max(0,...S.acts.map(a=>+a.id.split('-')[1]||0))+1);
const uid=p=>p+'-'+Math.random().toString(36).slice(2,7).toUpperCase();
const nowStr=()=>{const d=new Date();return iso(d)+'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
const be=t=>`<span class="be" title="Requires PMB backend work">⚙ ${esc(t)}</span>`;
const ui=t=>`<span class="ui">▣ ${esc(t||'UI demo')}</span>`;
function audit(text){S.audit.unshift({at:nowStr(),by:SES.user,text});S.audit=S.audit.slice(0,300);}
function tagStatus(s){const m={Completed:'',Confirmed:'blue',Planned:'grey','No response':'red',Rescheduled:'amber',Cancelled:'grey',Open:'amber','In progress':'blue','Waiting on internal team':'amber',Escalated:'red',Resolved:'',Closed:'grey',New:'amber','Shared with Sales':'blue',Contacted:'blue','Site visit scheduled':'blue','Site visit done':'purple',Booked:'solid',Dropped:'grey','Not due':'grey',Requested:'amber',Verified:'blue','Head approved':'blue','CSMO approved':'purple',Paid:'',Rejected:'red',Pending:'amber',Approved:'',Waiting:'grey'};return `<span class="tag ${m[s]||'grey'}">${esc(s)}</span>`;}

/* scope: what "mine" means for a Delight member */
function custInScope(c,scope){ if(scope==='all') return true; const u=SES.user; return c.owner===u||(c.cover&&c.cover.member===u&&coverActive(c.cover))||S.acts.some(a=>a.cust===c.id&&a.assignee===u&&a.status!=='Completed'); }
function coverActive(cv){return cv&&dayDiff(cv.from)<=0&&dayDiff(cv.to)>=0;}
function actInScope(a,scope){ if(scope==='all') return true; const c=cust(a.cust); return a.assignee===SES.user||(c.owner===SES.user&&a.assignee===SES.user); }
function defScope(){return ['member'].includes(role())?'mine':'all';}
function effOwner(c){return c.cover&&coverActive(c.cover)?c.cover.member:c.owner;}

/* routing */
let ROUTE={page:'dashboard',id:null,q:{}};
function parseHash(){const h=location.hash.replace(/^#\/?/,''); const [path,qs]=h.split('?'); const [page,id]=(path||'dashboard').split('/'); const q={}; (qs||'').split('&').filter(Boolean).forEach(p=>{const [k,v]=p.split('=');q[decodeURIComponent(k)]=decodeURIComponent(v||'');}); ROUTE={page:page||'dashboard',id:id||null,q};}
function go(page,q,id){const qs=q?Object.entries(q).filter(([k,v])=>v!==''&&v!=null).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&'):''; location.hash='#/'+page+(id?'/'+id:'')+(qs?'?'+qs:'');}
function setQ(k,v){const q=Object.assign({},ROUTE.q);q[k]=v;go(ROUTE.page,q,ROUTE.id);}

/* toasts / modals / drawer */
function toast(m){const t=document.createElement('div');t.className='toast';t.innerHTML=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2600);}
function closeOv(){document.querySelectorAll('.ov,.drawer').forEach(e=>e.remove());}
function modal(html,cls){closeOv();const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="modal ${cls||''}"><button class="x" data-x>✕</button>${html}</div>`;o.addEventListener('click',e=>{if(e.target===o||e.target.closest('[data-x]'))o.remove();});document.body.appendChild(o);return o;}
function drawer(html){closeOv();const ov=document.createElement('div');ov.className='ov';ov.style.background='rgba(18,30,26,.25)';const d=document.createElement('div');d.className='drawer';d.innerHTML=`<button class="x" data-x>✕</button>`+html;ov.addEventListener('click',e=>{if(e.target===ov)closeOv();});d.addEventListener('click',e=>{if(e.target.closest('[data-x]'))closeOv();});document.body.appendChild(ov);document.body.appendChild(d);return d;}
const val=(root,name)=>{const el=root.querySelector(`[name="${name}"]`);return el?(el.type==='checkbox'?el.checked:el.value.trim()):'';};
function opts(list,sel,blank){return (blank!==undefined?`<option value="">${esc(blank)}</option>`:'')+list.map(o=>{const v=typeof o==='object'?o.v:o,l=typeof o==='object'?o.l:o;return `<option value="${esc(v)}" ${String(v)===String(sel)?'selected':''}>${esc(l)}</option>`;}).join('');}
const memberOpts=(sel,blank)=>opts(MEMBERS.map(m=>({v:m,l:pname(m)})),sel,blank);
const custOpts=sel=>opts(S.customers.map(c=>({v:c.id,l:`${c.name} — ${unitLabel(c.bookings[0])}`})),sel,'Select customer…');

/* CSV / download */
function csv(rows){return rows.map(r=>r.map(v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(',')).join('\r\n');}
function download(name,text,type){const b=new Blob([text],{type:type||'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
function tableCSV(tbl,name){const rows=[...tbl.querySelectorAll('tr')].map(tr=>[...tr.children].filter(td=>!td.classList.contains('noexp')).map(td=>td.innerText.replace(/\s+/g,' ').trim()));download(name,'﻿'+csv(rows));toast('Exported '+esc(name));}

/* ===== Shell ===== */
const NAV=[
 {layer:'Working',items:[['dashboard','Dashboard'],['customers','Customer 360'],['activities','Activities'],['comms','Communication'],['requests','Requests & escalations'],['referrals','Referrals']]},
 {layer:'Monitoring',items:[['team','Team monitor'],['reports','Reports']]},
 {layer:'Approvals',items:[['approvals','Approvals']]},
 {layer:'Prototype review',items:[['requirements','Requirement map'],['feedback','Stakeholder feedback'],['handover','Dev handover'],['settings','Delight settings']]}
];
function navAllowed(p){const r=role(); if(p==='team') return can('team'); if(p==='settings') return r==='admin'; return true;}
function pendingForMe(){return S.apr.filter(a=>canActOn(a)).length;}
function myQueue(){
  const scope=defScope();
  const acts=S.acts.filter(a=>a.status!=='Completed'&&a.status!=='Cancelled'&&dayDiff(a.date)<=0&&(scope==='all'?true:a.assignee===SES.user)).sort((a,b)=>a.date.localeCompare(b.date));
  return acts;
}
function renderShell(){
  const p=me();
  document.getElementById('who').innerHTML=`<div class="avatar ${p.role==='member'?'':'g'}">${initials(p.name)}</div><div><b>${esc(p.name)}</b><span>${esc(ROLE_LABEL[p.role])}</span></div>`;
  document.getElementById('ext').innerHTML=p.ext&&p.ext!=='—'?`<span class="dot"></span> ext ${p.ext}`:'<span class="dot" style="background:#999"></span> No extension';
  const sel=document.getElementById('asUser'); sel.innerHTML=PEOPLE.map(x=>`<option value="${x.id}" ${x.id===SES.user?'selected':''}>${esc(x.name)} — ${esc(ROLE_LABEL[x.role])}</option>`).join('');
  document.getElementById('devToggle').checked=document.body.classList.contains('dev');
  document.getElementById('fbCount').textContent=S.feedback.length;
  // side nav
  const pa=pendingForMe(), q=myQueue();
  const openReq=S.reqs.filter(r=>!['Resolved','Closed'].includes(r.status)&&(defScope()==='all'||r.assignee===SES.user)).length;
  let h=`<div class="pillset">${['Work','Money','Team & QC','Inboxes'].map(g=>`<button class="pill dis" data-existing="${g}">${g}</button>`).join('')}<button class="pill on">Delight<span class="new">NEW</span></button><button class="pill dis" data-existing="Admin">Admin</button></div>`;
  h+=`<div class="subnav">`;
  NAV.forEach(g=>{const its=g.items.filter(i=>navAllowed(i[0])); if(!its.length) return; h+=`<div class="lbl">${g.layer}</div>`+its.map(([k,l])=>{let n='';if(k==='approvals'&&pa) n=`<span class="n a">${pa}</span>`; if(k==='activities'&&q.length) n=`<span class="n">${q.length}</span>`; if(k==='requests'&&openReq) n=`<span class="n a">${openReq}</span>`; if(k==='feedback'&&S.feedback.length) n=`<span class="n a">${S.feedback.length}</span>`; const on=ROUTE.page===k||(k==='customers'&&ROUTE.page==='customer'); return `<a class="chip ${on?'on':''}" href="#/${k}">${l}${n}</a>`;}).join('');});
  h+=`</div><h3>${role()==='member'?'My queue':'Team queue'} <a href="#/activities?range=due">Open →</a></h3><div class="muted small" style="margin:-4px 0 8px">${q.length} due or overdue · oldest first</div>`;
  h+=q.slice(0,8).map(a=>{const c=cust(a.cust),b=booking(a.booking),od=dayDiff(a.date)<0;return `<div class="qitem" data-cust="${c.id}"><div class="row between"><span class="row"><span class="tag ${od?'red':'blue'}">${od?'Overdue':'Today'}</span><span class="tag grey">${esc(atype(a.type).l)}</span></span><span class="tiny muted">${fd(a.date)}</span></div><b>${esc(c.name)}</b><div class="meta">${esc(unitLabel(b))} · ${esc(pname(a.assignee))}</div></div>`;}).join('')||'<div class="muted small">Nothing due. 🎉</div>';
  const side=document.getElementById('side'); side.innerHTML=h;
  side.querySelectorAll('[data-existing]').forEach(b=>b.onclick=()=>toast(`“${esc(b.dataset.existing)}” is an existing PMB section — unchanged and not part of this prototype.`));
  side.querySelectorAll('[data-cust]').forEach(b=>b.onclick=()=>go('customer',null,b.dataset.cust));
}
function pageHeader(title,sub,actions){
  const L=layerOf(ROUTE.page);
  return `<div class="ph"><div><span class="eyebrow ${L}">Delight · ${LAYER_LABEL[L]}</span><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div><div class="row">${actions||''}<button class="btn sm" data-fb-page>💬 Comment on this page</button></div></div>`;
}
const PAGES={};
function render(){
  parseHash(); if(!navAllowed(ROUTE.page)){ROUTE.page='dashboard';}
  renderShell();
  const main=document.getElementById('main');
  const fn=PAGES[ROUTE.page]||PAGES.dashboard;
  main.innerHTML=''; fn(main);
  main.querySelectorAll('[data-fb-page]').forEach(b=>b.onclick=()=>openFeedback());
  main.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>{const [p,qs]=el.dataset.go.split('?');const q={};(qs||'').split('&').filter(Boolean).forEach(x=>{const [k,v]=x.split('=');q[k]=v;});go(p,q);}));
  main.querySelectorAll('[data-cust]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('button,input,select,a'))return;go('customer',null,el.dataset.cust);}));
  window.scrollTo(0,0);
}

/* ===== Approvals engine ===== */
function canActOn(a){ const step=a.chain.find(s=>s.status==='Pending'); if(!step) return false; return role()==='admin'||step.role===role(); }
function aprSummary(a){const d=a.details;const c=a.cust?cust(a.cust):null;
  if(a.type==='Temporary cover') return `${pname(a.by)} asks ${pname(d.member)} to cover ${d.scope?esc(d.scope):(c?esc(c.name):'')} from ${fd(d.from)} to ${fd(d.to)} — ${esc(d.reason)}`;
  if(a.type==='Ownership change') return `Move primary Delight owner of ${esc(c.name)} from ${pname(d.from)} to ${pname(d.to)} — ${esc(d.reason)}`;
  if(a.type==='Referral payout'){const r=S.refs.find(x=>x.id===d.ref);return `Referral payout ${money(d.amount)} to ${esc(cust(r.referrer).name)} for referring ${esc(r.prospect)} (${r.booking?esc(r.booking.bof):'—'})`;}
  if(a.type==='Customer exception') return `${esc(c?c.name:'')}: ${esc(d.reason)}`;
  return '';}
function decide(a,ok,comment){
  const step=a.chain.find(s=>s.status==='Pending'); if(!step) return;
  step.status=ok?'Approved':'Rejected'; step.by=SES.user; step.at=nowStr(); step.c=comment||'';
  const nxt=a.chain.find(s=>s.status==='Waiting');
  if(ok&&nxt) nxt.status='Pending';
  if(!ok) a.chain.filter(s=>s.status==='Waiting').forEach(s=>s.status='Skipped');
  const done=!a.chain.some(s=>s.status==='Pending'||s.status==='Waiting');
  if(a.type==='Referral payout'){const r=S.refs.find(x=>x.id===a.details.ref); if(!ok) r.payout.status='Rejected'; else r.payout.status={backend:'Verified',head:'Head approved',crm:'CSMO approved'}[step.role]||r.payout.status; r.history.push({at:nowStr(),by:SES.user,text:`Payout ${ok?'approved':'rejected'} at ${ROLE_LABEL[step.role]} step${comment?': '+comment:''}`});}
  if(done&&ok){
    if(a.type==='Temporary cover'){const d=a.details; const list=a.cust?[cust(a.cust)]:S.customers.filter(c=>c.owner===a.by); list.forEach(c=>c.cover={member:d.member,from:d.from,to:d.to,reason:d.reason,approval:a.id});
      S.acts.filter(x=>list.some(c=>c.id===x.cust)&&x.assignee===a.by&&x.status!=='Completed'&&dayDiff(x.date)>=dayDiff(d.from)&&dayDiff(x.date)<=dayDiff(d.to)).forEach(x=>{x.assignee=d.member;x.log.push({at:nowStr(),by:SES.user,text:`Reassigned to ${pname(d.member)} (temporary cover ${a.id})`});});}
    if(a.type==='Ownership change'){const c=cust(a.cust); c.owner=a.details.to; c.notes.unshift({at:nowStr(),by:SES.user,text:`Primary Delight owner changed ${pname(a.details.from)} → ${pname(a.details.to)} (${a.id})`});}
    if(a.type==='Customer exception'&&a.link){const r=S.reqs.find(x=>x.id===a.link); if(r) r.history.push({at:nowStr(),by:SES.user,text:`Exception approved by CRM Head / CSMO (${a.id})`});}
  }
  audit(`${ok?'Approved':'Rejected'} ${a.id} (${a.type})`);
  save();
}
function raiseApproval(type,cid,details,link){
  const chains={'Temporary cover':['head'],'Ownership change':['head'],'Referral payout':['backend','head','crm'],'Customer exception':['head','crm']};
  const id='APR-'+String(200+S.apr.length).padStart(4,'0');
  const a={id,type,by:SES.user,raised:nowStr(),cust:cid,details,link,chain:chains[type].map((r,i)=>({role:r,status:i===0?'Pending':'Waiting'}))};
  // self-approval when the raiser is the approver of first step
  S.apr.unshift(a); if(a.chain[0].role===role()||(role()==='admin'&&chains[type].length===1)) decide(a,true,'Raised and approved by approver');
  audit(`Raised ${id} (${type})`); save(); return a;
}

/* ===== Feedback ===== */
const PAGE_NAMES={dashboard:'Dashboard',customers:'Customer 360',customer:'Customer 360',activities:'Activities',comms:'Communication',requests:'Requests',referrals:'Referrals',team:'Team monitor',reports:'Reports',approvals:'Approvals',requirements:'Requirement map',feedback:'Stakeholder feedback',handover:'Dev handover',settings:'Delight settings'};
function openFeedback(pre){
  pre=pre||{}; const pg=pre.page||PAGE_NAMES[ROUTE.page]||'General';
  const reqs=REQS.filter(r=>r.page===pg||pg==='General'||pg==='Requirement map');
  const who=lsGet('pmb_delight_fb_name')||'', wr=lsGet('pmb_delight_fb_role')||'';
  const o=modal(`<h2>Feedback / change request</h2><p class="muted small">Saved in this browser. Export from “Stakeholder feedback” to consolidate.</p>
  <div class="form" style="margin-top:12px">
    <label>Your name<input class="inp" name="who" value="${esc(who)}" placeholder="e.g. Delight Head"></label>
    <label>Your role<select class="inp" name="wrole">${opts(['Delight Head','Operations Head','Delight Member','Delight Backend','CRM Head / CSMO','PMB development team','AI & Automation','Other'],wr)}</select></label>
    <label>Page<select class="inp" name="page">${opts(Object.values(PAGE_NAMES).filter((v,i,a)=>a.indexOf(v)===i).concat(['General','Access']),pg)}</select></label>
    <label>Requirement<select class="inp" name="req">${opts(REQS.map(r=>({v:r.id,l:r.id+' · '+r.f.slice(0,60)})),pre.req||'',reqs.length?'— General / not listed —':'— General —')}</select></label>
    <label>Type<select class="inp" name="type">${opts(['Missing functionality','Modification','Comment','Question'],pre.type||'Comment')}</select></label>
    <label>Status<select class="inp" name="status">${opts(['Pending Confirmation','Accepted','Needs Changes'],pre.status||'Pending Confirmation')}</select></label>
    <label class="full">Comment<textarea class="inp" name="comment" placeholder="What is missing, what should change, or what you confirm…"></textarea></label>
  </div><div class="acts"><button class="btn" data-x>Cancel</button><button class="btn pri" id="fbSave">Save feedback</button></div>`);
  o.querySelector('#fbSave').onclick=()=>{
    const f={id:'FB-'+String(S.feedback.length+1).padStart(3,'0')+'-'+Math.random().toString(36).slice(2,5),at:nowStr(),who:val(o,'who')||'Anonymous',wrole:val(o,'wrole'),page:val(o,'page'),req:val(o,'req'),type:val(o,'type'),status:val(o,'status'),comment:val(o,'comment'),asRole:ROLE_LABEL[role()]};
    if(!f.comment){toast('Please add a comment.');return;}
    lsSet('pmb_delight_fb_name',f.who); lsSet('pmb_delight_fb_role',f.wrole);
    S.feedback.push(f); if(f.req) S.decisions[f.req]=f.status; save(); o.remove(); toast('Feedback saved — '+esc(f.id)); render();
  };
}

/* ===== Boot ===== */
function boot(){
  load();
  document.getElementById('asUser').onchange=e=>{SES.user=e.target.value;lsSet(LS_SES,JSON.stringify(SES));toast('Now viewing as '+esc(me().name)+' · '+esc(ROLE_LABEL[role()]));render();};
  document.getElementById('devToggle').onchange=e=>{document.body.classList.toggle('dev',e.target.checked);lsSet(LS_DEV,e.target.checked?'1':'0');};
  document.getElementById('resetBtn').onclick=()=>{if(confirm('Reset all demo records to the original sample data? Stakeholder feedback is kept.')) resetDemo();};
  document.getElementById('fbTop').onclick=()=>openFeedback();
  document.getElementById('fbFab').onclick=()=>openFeedback();
  document.getElementById('newBtn').onclick=()=>openNewActivity();
  document.getElementById('logout').onclick=()=>toast('Prototype — sign-in is handled by PMB.');
  document.getElementById('bell').onclick=()=>go('approvals');
  const gs=document.getElementById('gsearch');
  gs.addEventListener('keydown',e=>{if(e.key==='Enter'){const t=gs.value.trim().toLowerCase(); if(!t) return; const c=S.customers.find(c=>c.name.toLowerCase().includes(t)||c.phones.some(p=>p.num.replace(/\s/g,'').includes(t.replace(/\s/g,'')))||c.bookings.some(b=>(b.id+' '+b.unit+' '+b.project).toLowerCase().includes(t))); if(c){go('customer',null,c.id);gs.value='';} else toast('No demo customer matches “'+esc(t)+'”');}});
  window.addEventListener('hashchange',render);
  render();
  if(lsGet('pmb_delight_notice')!=='1'){const o=modal(`<span class="eyebrow proto">Internal prototype</span><h2>PMB Delight Team module</h2><p>This is an <b>internal DRA Homes prototype</b> for stakeholder review. It is not the PMB platform.</p><ul class="small"><li>All <b>customers, units, booking numbers and phone numbers are fictional</b> demo data.</li><li>It is not connected to PMB, MCube, Gallabox, Workhall or ERP. Calls, WhatsApp and emails are simulated, and nothing is sent.</li><li>Your changes and feedback are saved <b>only in this browser</b>. Export them from “Stakeholder feedback”.</li></ul><div class="acts"><button class="btn pri" id="ack">I understand, open the prototype</button></div>`);o.querySelector('#ack').onclick=()=>{lsSet('pmb_delight_notice','1');o.remove();};}
}
