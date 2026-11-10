/* ===== DEMO DATA — fictional customers, units and phone numbers. Staff names and roles mirror PMB's user list (read 2026-11-10). ===== */
const TODAY = (()=>{const d=new Date();d.setHours(0,0,0,0);return d;})();
function iso(d){const z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;}
function D(off,time){const d=new Date(TODAY);d.setDate(d.getDate()+off);return iso(d)+(time?'T'+time:'');}
function MD(off){const d=new Date(TODAY);d.setDate(d.getDate()+off);return d;}

const PEOPLE = [
  {id:'rekha',  name:'Rekha',          role:'member',  ext:'458', title:'Delight Team'},
  {id:'madhu',  name:'Madhubalan',     role:'member',  ext:'448', title:'Delight Team'},
  {id:'mani',   name:'Manikandan',     role:'member',  ext:'455', title:'Delight Team'},
  {id:'varadh', name:'Varadharaj',     role:'member',  ext:'462', title:'Delight Team'},
  {id:'vignesh',name:'Vigneshwaran',   role:'member',  ext:'502', title:'Delight Team'},
  {id:'backend',name:'Delight Backend',role:'backend', ext:'—',   title:'Delight Backend (new role)'},
  {id:'head',   name:'Delight Head',   role:'head',    ext:'—',   title:'Delight Head (new role)'},
  {id:'crm',    name:'CRM Head / CSMO',role:'crm',     ext:'—',   title:'CRM Head / CSMO'},
  {id:'admin',  name:'Admin',          role:'admin',   ext:'—',   title:'Admin'}
];
const MEMBERS = PEOPLE.filter(p=>p.role==='member').map(p=>p.id);
const ROLE_LABEL = {member:'Delight Member',backend:'Delight Backend',head:'Delight Head',crm:'CRM Head / CSMO',admin:'Admin'};
const RMS = ['Sowmiya D','Hariprabhu','Angel Monesha Rani','Rajalakshmi S','Keerthana G D','Nandhini Monica'];

/* Journey: Delight touchpoints (MoM §1). Not strictly sequential. */
const JOURNEY = [
  {k:'firstmeet',   l:'First Meet',        wh:'Customer Delight Team Meeting'},
  {k:'registration',l:'Registration',      wh:'Sale Deed Registered'},
  {k:'ji',          l:'Joint Inspection',  wh:'Pre Delivery Inspection'},
  {k:'handover',    l:'Handover',          wh:'Possession Letter'},
  {k:'post',        l:'Post-Handover',     wh:'EB / Patta Transfer Applied'}
];
const ACT_TYPES = [
  {k:'firstmeet',l:'First Meet',sla:7,ico:'🤝'},
  {k:'registration',l:'Registration',sla:3,ico:'📝'},
  {k:'ji',l:'Joint Inspection',sla:3,ico:'🔍'},
  {k:'handover',l:'Handover',sla:2,ico:'🔑'},
  {k:'post',l:'Post-Handover',sla:5,ico:'📄'},
  {k:'followup',l:'Follow-up',sla:1,ico:'↻'},
  {k:'birthday',l:'Birthday wish',sla:0,ico:'🎂'},
  {k:'anniversary',l:'Anniversary wish',sla:0,ico:'💐'},
  {k:'event',l:'Community event',sla:0,ico:'🎉'},
  {k:'update',l:'Project update',sla:0,ico:'📣'},
  {k:'referralcall',l:'Referral call',sla:2,ico:'🗣'}
];
const ENGAGE = ['birthday','anniversary','event','update','referralcall'];
const ACT_STATUS = ['Planned','Confirmed','Completed','Rescheduled','No response','Cancelled'];
const REQ_CATS = ['Documentation','Registration','Snag / Quality','Handover','Name transfer / EB-Patta','Payment query (→ RM)','Customization (→ Customization desk)','Portal access','Other'];
const REQ_SOURCES = ['Inbound call','WhatsApp','Email','Customer portal','In person','ERP ticket'];
const REQ_TEAMS = ['Delight Team','RM / CRM','Technical / Site','Legal','Accounts','Customization','Liaison (EB / Patta)'];
const REQ_STATUS = ['Open','In progress','Waiting on internal team','Escalated','Resolved','Closed'];
const REF_STATUS = ['New','Shared with Sales','Contacted','Site visit scheduled','Site visit done','Booked','Dropped'];
const PAY_STATUS = ['Not due','Requested','Verified','Head approved','CSMO approved','Paid','Rejected'];
const PROJECTS = ['DRA POLARIS','DRA ASTRA','DRA iHEART','DRA MARINA 100','DRA VENKAT RICHBURG','DRA SKYLANTIS','DRA TRINITY','DRA BEENA CLOVER','DRA COVE','DRA INARA PHASE 2'];
const WA_TEMPLATES = ['delight_welcome_v2','first_meet_invite','registration_reminder','ji_schedule_confirm','handover_invite','birthday_wish','anniversary_wish','community_event_invite','referral_thanks'];

function seedData(){
  let ph=0; const phone=()=>'+91 90000 '+String(10101+(ph++)*37).padStart(5,'0');
  // [name, project, tower, unit, cfg, owner, rm, stageIdx(0-5:5=engagement), extra]
  const raw = [
    ['Karthik Ramanathan','DRA POLARIS','TOWER A','1104','3BHK','rekha',0,1,{spouse:'Divya Karthik',dob:0,ann:120}],
    ['Meenakshi Sundaram','DRA ASTRA','—','605','2BHK','madhu',1,0,{dob:2}],
    ['Arvind Prasad','DRA iHEART','BLOCK B','908','3BHK','varadh',2,2,{spouse:'Lakshmi Prasad',second:['DRA iHEART','BLOCK B','909','2BHK'],ann:0}],
    ['Priya Venkatesh','DRA MARINA 100','CORAL','702','3BHK','rekha',3,3,{nri:'Dubai, UAE',dob:40}],
    ['Suresh Babu K','DRA VENKAT RICHBURG','EBONY','312','2BHK','mani',0,1,{dob:-3}],
    ['Fathima Begum','DRA SKYLANTIS','BLOCK-2','1003','2BHK','vignesh',4,0,{}],
    ['Rahul Krishnan','DRA TRINITY','—','702','3BHK','madhu',1,4,{ann:3}],
    ['Anitha Raghavan','DRA BEENA CLOVER','BLOCK 3','205','2BHK','rekha',4,2,{dob:1}],
    ['Mohammed Irfan','DRA POLARIS','TOWER B','405','2BHK','mani',3,3,{}],
    ['Deepa Natarajan','DRA INARA PHASE 2','VILLAS','Villa-41','4BHK','varadh',3,4,{dob:0}],
    ['Gokul Srinivasan','DRA ASTRA','—','1102','3BHK','vignesh',2,1,{}],
    ['Revathi Chandrasekar','DRA COVE','—','504','3BHK','rekha',5,5,{ann:-1,dob:200}],
    ['Vignesh Kumar S','DRA iHEART','BLOCK A','1406','2BHK','madhu',2,0,{}],
    ['Sangeetha Murali','DRA MARINA 100','CORAL','1201','3BHK','mani',0,2,{dob:5}],
    ['Balaji Thirumalai','DRA SKYLANTIS','BLOCK-1','802','3BHK','varadh',0,1,{}],
    ['Nithya Ganesan','DRA TRINITY','—','1005','2BHK','vignesh',1,3,{nri:'Singapore'}],
    ['Prakash Rao','DRA VENKAT RICHBURG','EBONY','108','2BHK','rekha',0,0,{}],
    ['Kavitha Selvaraj','DRA COVE','—','302','2BHK','madhu',5,5,{ann:0}],
    ['Senthil Kumar P','DRA INARA PHASE 2','VILLAS','Villa-12','4BHK','mani',3,4,{}],
    ['Janani Iyer','DRA POLARIS','TOWER A','1502','3BHK','vignesh',4,2,{dob:9}],
    ['Harish Chandran','DRA ASTRA','—','905','3BHK','varadh',1,1,{}],
    ['Lakshmi Narasimhan','DRA BEENA CLOVER','BLOCK 1','402','2BHK','rekha',4,1,{}],
    ['Ashok Kumar R','DRA COVE','—','707','3BHK','mani',5,5,{dob:-30}],
    ['Sowmya Raghunathan','DRA MARINA 100','CORAL','305','2BHK','varadh',1,0,{}]
  ];
  let bof=1001, cid=0;
  const customers = raw.map(r=>{
    const [name,proj,tower,unit,cfg,owner,rmIdx,stage,x]=r; cid++;
    const id='C'+String(cid).padStart(3,'0');
    const first=name.split(' ')[0].toLowerCase();
    const phones=[{label:'Primary',num:phone()}];
    if(x.spouse) phones.push({label:'Spouse · '+x.spouse.split(' ')[0],num:phone()});
    if(x.nri) phones.push({label:'NRI · '+x.nri,num:'+971 50 000 '+String(1000+cid)});
    if(cid%5===0) phones.push({label:'Office',num:phone()});
    const dobOff = x.dob!==undefined?x.dob:60+cid*11, annOff=x.ann!==undefined?x.ann:null;
    const md=(o)=>{const d=MD(o);return String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
    const mk=(p,t,u,c,i)=>{
      const st = stage===5?5:stage;
      const j={}; JOURNEY.forEach((s,k)=>{ j[s.k]= st===5||k<st?'done':(k===st?'current':'pending'); });
      return {id:'BOF_D'+(bof++),project:p,tower:t,unit:u,cfg:c,bookedOn:D(-(400-stage*70)-i*3),rm:RMS[rmIdx],whStage:st===5?'Handed Over':JOURNEY[st].wh,journey:j,stageIdx:st,value:(6000000+((cid*7919)%60)*100000)};
    };
    const bookings=[mk(proj,tower,unit,cfg,0)];
    if(x.second) bookings.push(mk(x.second[0],x.second[1],x.second[2],x.second[3],1));
    return {id,name,phones,emails:[first+'.demo'+cid+'@example.com'],dob:md(dobOff),dobYear:1975+cid%20,anniversary:annOff===null?null:md(annOff),
      city:x.nri?x.nri:(cid%3?'Chennai':'Coimbatore'),language:cid%4===0?'English':'Tamil, English',nri:!!x.nri,
      owner,cover:null,bookings,prefs:cid%3===0?'Prefers WhatsApp; call after 6 pm':(cid%3===1?'Prefers calls before 11 am':'Email for documents'),
      notes:[] ,coApplicant:x.spouse||null};
  });
  // Temporary cover: Rekha covering for Varadharaj's customer C010 (leave)
  customers[9].cover={member:'rekha',from:D(-1),to:D(4),reason:'Varadharaj on leave (approved)',approval:'APR-0103'};

  /* ---- Activities ---- */
  let aid=500; const acts=[];
  const A=(c,b,type,off,time,status,assignee,remarks,next,extra={})=>{acts.push(Object.assign({id:'ACT-'+(aid++),cust:c.id,booking:b.id,type,date:D(off),time,mode:extra.mode||(type==='firstmeet'&&c.nri?'Virtual':'In person'),assignee,status,remarks,next:next===null?null:(next!==undefined?D(next):null),source:extra.source||'PMB',created:D(Math.min(off,0)-3),checklist:extra.checklist||null,snags:extra.snags||null,log:[{at:D(Math.min(off,0)-3,'10:00'),by:extra.by||c.owner,text:'Created'}]},{}));};
  customers.forEach((c,i)=>{
    const b=c.bookings[0]; const o=c.owner;
    const st=b.stageIdx;
    if(st>0) A(c,b,'firstmeet',-300+i,'11:00','Completed',o,'First meet done at site office. Customer briefed on journey, Delight contact shared.',null);
    if(st>1) A(c,b,'registration',-120+i,'10:30','Completed',o,'Registered at SRO. Hospitality arranged.',null,{checklist:{'ID proofs':true,'Bank NOC':true,'Stamp duty DD':true,'Photos':true,'Witness details':true}});
    if(st>2) A(c,b,'ji',-40+i%5,'15:00','Completed',o,'JI done with site engineer. 4 snags recorded.',null,{snags:[{t:'Bedroom 2 door alignment',team:'Technical / Site',s:'Closed'},{t:'Kitchen tile hairline crack',team:'Technical / Site',s:'Closed'},{t:'Balcony drain slope',team:'Technical / Site',s:'Closed'},{t:'Switch board loose',team:'Technical / Site',s:'Closed'}]});
    if(st>3) A(c,b,'handover',-20+i%4,'11:30','Completed',o,'Keys handed over with welcome kit.',null);
    // current stage activity
    const pattern=[
      ['firstmeet',(i%4)-1,'11:00'],['registration',(i%6)-1,'10:30'],['ji',(i%5)-1,'15:00'],['handover',(i%5),'11:30'],['post',(i%7)-2,'12:00']
    ];
    if(st<5){
      const [t,off,tm]=pattern[st];
      const status= off<0?(i%3===0?'No response':'Confirmed'):(off===0?'Confirmed':(i%2?'Planned':'Confirmed'));
      const assignee = (i===4)?'rekha':(i===13?'varadh':(c.cover?c.cover.member:o));
      const rem={firstmeet:'Welcome WhatsApp sent. Appointment for first meet to be confirmed with customer.',registration:'SRO slot requested. Docs checklist shared on WhatsApp.',ji:'Site ready. Inform site engineer + customer, share JI sheet.',handover:'Possession letter issued. Coordinate keys, welcome kit and EB meter reading.',post:'Name transfer / EB / Patta: liaison file submitted, awaiting update.'}[t];
      const ck = t==='registration'?{'ID proofs':i%2===0,'Bank NOC':i%3!==0,'Stamp duty DD':false,'Photos':true,'Witness details':i%2===1}:null;
      const sn = t==='ji'&&off<0?[{t:'Living room wall dampness',team:'Technical / Site',s:'Open'},{t:'Master bath tap leak',team:'Technical / Site',s:'Open'}]:null;
      A(c,b,t,off,tm,status,assignee,rem,off<0?0:off+2,{checklist:ck,snags:sn,source:t==='firstmeet'&&i%2===0?'Workhall task':'PMB',mode:c.nri&&t!=='ji'?'Virtual':undefined});
    }
    if(i%3===1) A(c,b,'followup',(i%4)-2,'16:00',(i%4)-2<0?'Planned':'Planned',c.cover?c.cover.member:o,'Call back: customer asked for '+['parking allotment status','registration date options','JI sheet copy','EB name transfer status'][i%4]+'.',null);
  });
  // engagement
  customers.forEach(c=>{
    const b=c.bookings[0]; const t=iso(TODAY).slice(5);
    const within=(md)=>{for(let k=-2;k<=7;k++){if(iso(MD(k)).slice(5)===md) return k;}return null;};
    const bd=within(c.dob); if(bd!==null) A(c,b,'birthday',bd,'09:30',bd<0?'Completed':'Planned',c.cover?c.cover.member:c.owner,'Birthday wish (WhatsApp template birthday_wish + call).',null,{mode:'Phone'});
    if(c.anniversary){const an=within(c.anniversary); if(an!==null) A(c,b,'anniversary',an,'09:45',an<0?'Completed':'Planned',c.cover?c.cover.member:c.owner,'Anniversary wish.',null,{mode:'Phone'});}
  });
  ['C001','C009','C020'].forEach((id,k)=>{const c=customers.find(x=>x.id===id);A(c,c.bookings[0],'event',5,'17:00','Planned',c.owner,'DRA POLARIS community meet — invite + RSVP call.',null,{mode:'In person'});});
  ['C012','C018','C023'].forEach(id=>{const c=customers.find(x=>x.id===id);A(c,c.bookings[0],'referralcall',id==='C012'?0:1,'12:00','Planned',c.owner,'New launch: ask for referrals in their circle.',null,{mode:'Phone'});});
  A(customers[2],customers[2].bookings[1],'update',2,'11:00','Planned','varadh','Second booking (909): share construction progress photos.',null,{mode:'Phone'});

  /* ---- Communications ---- */
  let mid=9000; const comms=[];
  const M=(c,b,ch,off,time,by,summary,extra={})=>comms.push(Object.assign({id:'MSG-'+(mid++),cust:c.id,booking:b?b.id:null,ch,at:D(off,time),by,summary},extra));
  customers.forEach((c,i)=>{
    const b=c.bookings[0], o=c.owner, other=MEMBERS[(MEMBERS.indexOf(o)+1)%MEMBERS.length];
    M(c,b,'wa',-60+i,'10:05',o,'Template: delight_welcome_v2 — "Welcome to the DRA family!"',{dir:'out',thread:[{me:true,t:'Dear '+c.name.split(' ')[0]+', welcome to the DRA family! I am '+PEOPLE.find(p=>p.id===o).name+' from the Customer Delight team and will be your point of contact after booking.'},{me:false,t:'Thank you! Happy to connect.'}]});
    M(c,b,'call',-58+i,'11:20',o,'Outbound · First meet appointment fixed',{dir:'out',dur:'04:12',status:'Answered'});
    if(i%2===0) M(c,b,'email',-30+i%9,'15:40',o,'Customer portal access details shared',{dir:'out',subject:'Your DRA customer portal login',body:'Dear '+c.name+',\n\nPlease find your customer portal access below. You can view your payment schedule, documents and raise requests.\n\nRegards,\nCustomer Delight Team'});
    M(c,b,'call',-(i%6)-1,'12:10',null,'Inbound · '+['asked about registration date','asked for JI schedule','enquired about EB name transfer','wanted parking allotment','asked about interiors partner','called to refer a friend'][i%6],{dir:'in',dur:i%5===0?'00:00':'02:'+String(10+i).padStart(2,'0'),status:i%5===0?'Missed':'Answered',by:i%5===0?null:(i%3===0?other:o)});
    if(i%3===0) M(c,b,'wa',-(i%4),'18:30',other,'Coordination while owner on another site visit',{dir:'out',thread:[{me:false,t:'Is my JI confirmed for this week?'},{me:true,t:'Yes, confirmed. '+PEOPLE.find(p=>p.id===o).name+' is at another site today, I am covering. Engineer will be present.'}]});
    if(i%4===1) M(c,b,'email',-(i%5)-2,'11:00',o,'JI coordination: snag list shared',{dir:'out',subject:'Joint Inspection — snag list & next steps',body:'Dear '+c.name+',\n\nAttached is the snag list recorded during the joint inspection. The site team will complete the rectification and we will confirm closure.\n\nRegards,\nCustomer Delight Team'});
    if(i%4===2) M(c,b,'email',-(i%3)-1,'09:12',null,'Inbound · "Need copy of sale deed draft"',{dir:'in',subject:'Sale deed draft copy',body:'Hi, please share the sale deed draft before registration. Thanks.'});
  });
  M(customers[9],customers[9].bookings[0],'call',0,'10:40','rekha','Outbound · Covering for Varadharaj — handover keys timing confirmed',{dir:'out',dur:'03:05',status:'Answered'});

  /* ---- Requests / escalations ---- */
  let rid=201; const reqs=[];
  const R=(cidx,cat,src,team,assignee,status,off,level,title,ext,hist)=>{const c=customers[cidx];reqs.push({id:'DLR-'+(rid++),cust:c.id,booking:c.bookings[0].id,cat,source:src,team,assignee,status,raised:D(off),due:D(off+({'Snag / Quality':5,'Documentation':3}[cat]||4)),level,title,extRef:ext,history:hist.map(h=>({at:D(h[0],h[1]),by:h[2],text:h[3]}))});};
  R(2,'Snag / Quality','In person','Technical / Site','varadh','Waiting on internal team',-6,1,'Living room wall dampness + bath tap leak after JI','ERP ticket CP-4471',[[-6,'15:30','varadh','Raised from JI sheet'],[-4,'11:00','varadh','Site engineer acknowledged, ETA 5 days']]);
  R(3,'Handover','WhatsApp','Delight Team','rekha','In progress',-2,1,'NRI customer wants handover via Power of Attorney holder','',[[-2,'09:00','rekha','Asked customer for POA copy']]);
  R(6,'Name transfer / EB-Patta','Inbound call','Liaison (EB / Patta)','madhu','Escalated',-21,2,'EB name transfer pending 3 weeks after handover','Workhall task WH-88213',[[-21,'10:00','madhu','Liaison file submitted'],[-10,'12:00','madhu','Customer called again, upset'],[-3,'16:00','head','Escalated to Delight Head — liaison follow-up']]);
  R(7,'Snag / Quality','Email','Technical / Site','rekha','Open',-1,1,'Balcony railing paint peeling (pre-JI)','',[[-1,'11:15','rekha','Logged from customer email']]);
  R(4,'Registration','Inbound call','Legal','mani','In progress',-3,1,'Customer wants registration in joint name — legal check','',[[-3,'14:00','mani','Sent to legal for opinion']]);
  R(10,'Payment query (→ RM)','WhatsApp','RM / CRM','varadh','Waiting on internal team',-2,1,'Interest charged on delayed payment — wants waiver','PMB ticket DRA-1192',[[-2,'10:00','varadh','Routed to RM (Sowmiya D) — PMB ticket raised']]);
  R(13,'Customization (→ Customization desk)','In person','Customization','mani','Open',-4,1,'Convert study to pooja room before JI','',[[-4,'17:00','mani','Forwarded to Kalaivani J (Customization)']]);
  R(15,'Documentation','Email','Delight Team','vignesh','Resolved',-9,1,'Needs possession letter copy for bank','',[[-9,'10:00','vignesh','Requested from CRM'],[-7,'15:00','vignesh','Shared on email — customer confirmed']]);
  R(8,'Snag / Quality','Customer portal','Technical / Site','mani','Escalated',-15,3,'Seepage in master bedroom after handover — repeat complaint','ERP ticket CP-4390',[[-15,'09:00','mani','Raised in ERP portal'],[-8,'09:00','mani','Second visit — not fixed'],[-5,'11:00','head','Escalated to CRM Head / CSMO']]);
  R(18,'Name transfer / EB-Patta','Inbound call','Liaison (EB / Patta)','mani','In progress',-6,1,'Patta transfer status','',[[-6,'12:00','mani','Liaison update awaited']]);
  R(11,'Portal access','Email','Delight Team','rekha','Closed',-12,1,'Unable to log in to customer portal','',[[-12,'10:00','rekha','Password reset by IT'],[-11,'10:00','rekha','Closed — customer logged in']]);
  R(19,'Other','WhatsApp','Delight Team','vignesh','Open',0,1,'Wants to know community event date','',[[0,'09:30','vignesh','Will share invite']]);

  /* ---- Referrals ---- */
  let fid=301; const refs=[];
  const F=(cidx,pn,proj,off,src,member,status,sv,conv,pay)=>{const c=customers[cidx];refs.push({id:'REF-'+(fid++),referrer:c.id,refBooking:c.bookings[0].id,prospect:pn,prospectPhone:'+91 90000 '+String(70000+fid*13),interest:proj,date:D(off),source:src,member,sales:status==='New'?'':['Prakash (Sales)','Divya (Sales)','Rohit (Sales)'][fid%3],status,siteVisit:sv,booking:conv,payout:pay,history:[{at:D(off,'11:00'),by:member,text:'Referral captured'}]});};
  F(11,'Vijay Anand','DRA ASTRA',-48,'Inbound call','rekha','Booked',{status:'Done',date:D(-40)},{bof:'BOF_D2101',date:D(-30),value:7850000},{status:'CSMO approved',amount:50000,ref:''});
  F(17,'Shalini Mohan','DRA POLARIS',-35,'Community event','madhu','Booked',{status:'Done',date:D(-28)},{bof:'BOF_D2102',date:D(-14),value:9200000},{status:'Requested',amount:50000,ref:''});
  F(22,'Karthikeyan R','DRA COVE',-60,'WhatsApp','mani','Booked',{status:'Done',date:D(-55)},{bof:'BOF_D2103',date:D(-45),value:6400000},{status:'Paid',amount:50000,ref:'NEFT UTR DEMO99812',paidOn:D(-5)});
  F(6,'Ramesh Iyer','DRA ASTRA',-20,'Inbound call','madhu','Site visit done',{status:'Done',date:D(-12)},null,{status:'Not due',amount:0});
  F(0,'Nirmala Devi','DRA SKYLANTIS',-10,'In person','rekha','Site visit scheduled',{status:'Scheduled',date:D(2)},null,{status:'Not due',amount:0});
  F(9,'Ganesh Babu','DRA INARA PHASE 2',-8,'Referral call','varadh','Contacted',{status:'Not yet'},null,{status:'Not due',amount:0});
  F(11,'Preethi Shankar','DRA MARINA 100',-4,'WhatsApp','rekha','Shared with Sales',{status:'Not yet'},null,{status:'Not due',amount:0});
  F(18,'Arun Prakash','DRA TRINITY',-2,'Inbound call','mani','New',{status:'Not yet'},null,{status:'Not due',amount:0});
  F(3,'Sanjay Menon','DRA MARINA 100',-30,'Email','rekha','Dropped',{status:'Done',date:D(-25)},null,{status:'Not due',amount:0});
  F(15,'Meera Krishnan','DRA POLARIS',-15,'Customer portal','vignesh','Site visit done',{status:'Done',date:D(-6)},null,{status:'Not due',amount:0});
  F(12,'Dinesh Kumar','DRA iHEART',-1,'Inbound call','madhu','New',{status:'Not yet'},null,{status:'Not due',amount:0});
  F(17,'Lavanya S','DRA COVE',-70,'Community event','madhu','Booked',{status:'Done',date:D(-62)},{bof:'BOF_D2099',date:D(-50),value:6900000},{status:'Head approved',amount:50000,ref:''});

  /* ---- Approvals ---- */
  const apr=[];
  const P=(id,type,by,off,cust,details,chain,link)=>apr.push({id,type,by,raised:D(off,'10:00'),cust,details,chain,link});
  P('APR-0103','Temporary cover','varadh',-3,'C010',{member:'rekha',from:D(-1),to:D(4),reason:'Leave — family function'},[{role:'head',status:'Approved',by:'head',at:D(-2,'09:30'),c:'OK, Rekha to cover.'}]);
  P('APR-0110','Temporary cover','mani',-1,null,{member:'vignesh',from:D(2),to:D(5),reason:'Leave — medical',scope:'all Manikandan customers'},[{role:'head',status:'Pending'}]);
  P('APR-0111','Ownership change','madhu',-2,'C013',{from:'madhu',to:'vignesh',reason:'Customer prefers Hindi-speaking contact; Vigneshwaran handles iHEART cluster'},[{role:'head',status:'Pending'}]);
  P('APR-0112','Referral payout','madhu',-6,'C018',{ref:'REF-302',amount:50000},[{role:'backend',status:'Pending'},{role:'head',status:'Waiting'},{role:'crm',status:'Waiting'}],'REF-302');
  P('APR-0105','Referral payout','rekha',-20,'C012',{ref:'REF-301',amount:50000},[{role:'backend',status:'Approved',by:'backend',at:D(-18,'12:00'),c:'Booking BOF_D2101 agreement registered; 10% collected.'},{role:'head',status:'Approved',by:'head',at:D(-15,'10:00')},{role:'crm',status:'Approved',by:'crm',at:D(-3,'17:00')}],'REF-301');
  P('APR-0108','Referral payout','madhu',-12,'C018',{ref:'REF-312',amount:50000},[{role:'backend',status:'Approved',by:'backend',at:D(-10,'12:00'),c:'Eligibility verified'},{role:'head',status:'Approved',by:'head',at:D(-8,'10:00')},{role:'crm',status:'Pending'}],'REF-312');
  P('APR-0109','Customer exception','mani',-5,'C009',{reason:'Repeat seepage complaint after handover — request CSMO-level intervention with Projects team and goodwill gesture (deep cleaning).'},[{role:'head',status:'Approved',by:'head',at:D(-5,'11:00'),c:'Forwarding to CSMO.'},{role:'crm',status:'Pending'}],'DLR-209');

  return {anchor:iso(TODAY),version:3,customers,acts,comms,reqs,refs,apr,feedback:[],decisions:{},audit:[]};
}
