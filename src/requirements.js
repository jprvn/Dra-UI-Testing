/* Requirement map. pmb: AV = already available in PMB (seen read-only 2026-11-10), EN = requires enhancement, NEW = new development, PC = pending confirmation.
   be: what the PMB team must build behind the UI (empty = UI/config only). */
const REQS = [
 // Roles & access
 {id:'DLT-01',page:'Access',f:'Delight Team role, scope "Every customer"',p:'Members can see any customer, so cover and continuity work without re-assignment of visibility.',pmb:'AV',ev:'Admin → Users: role "Delight Team — every customer, the post-booking journey, handover" (5 active users).',be:''},
 {id:'DLT-02',page:'Access',f:'New role: Delight Head',p:'Team monitoring, assignment/reassignment, first-level approvals.',pmb:'NEW',ev:'No such role in Admin → Users.',be:'Role + server-side scope + approval rights.'},
 {id:'DLT-03',page:'Access',f:'New role: Delight Backend',p:'Back-office desk: scheduling confirmations, greetings queue, document checklists, referral verification, payout processing, data gaps.',pmb:'NEW',ev:'No such role. Exact duties to be confirmed by Delight Head.',be:'Role + queue screens.'},
 {id:'DLT-04',page:'Access',f:'CRM Head / CSMO: monitoring + second-level approvals',p:'Final approval for referral payouts and customer exceptions.',pmb:'EN',ev:'"CRM Head / CXO" exists but is read-only ("no messaging or edits").',be:'Allow approve/reject actions only, keep everything else read-only.'},
 {id:'DLT-05',page:'Access',f:'Three UI layers: Working · Monitoring · Approvals',p:'Each role lands on the layer it needs (member → working; head → monitoring + approvals; CSMO → monitoring + approvals).',pmb:'NEW',ev:'',be:'Role-based landing page + menu.'},
 // Dashboard
 {id:'DLT-10',page:'Dashboard',f:'Delight dashboard with clickable KPI cards',p:'Assigned customers, today\'s activities, First Meets, Registrations, JIs, Handovers, follow-ups, open requests, referrals, engagement — each opens filtered records.',pmb:'NEW',ev:'PMB Home has the same card pattern for collections/admin.',be:'Aggregation queries on Delight activity data.'},
 {id:'DLT-11',page:'Dashboard',f:'Today\'s queue in the side panel (like Next actions)',p:'Member sees overdue + today items without screen-hopping.',pmb:'EN',ev:'Next actions exists (calls, collections, emails, WhatsApp, Workhall tasks).',be:'Add Delight activity + follow-up items to Next actions.'},
 // Customer 360
 {id:'DLT-20',page:'Customer 360',f:'Customer details, bookings, unit, RM, Workhall stage, timeline',p:'Single view of the customer.',pmb:'AV',ev:'Customer page shows booking, unit, RM, Workhall stage tracker, tasks, payment position and History timeline.',be:''},
 {id:'DLT-21',page:'Customer 360',f:'Delight ownership panel (primary owner, temporary cover, RM read-only)',p:'Shows who owns the relationship without touching RM ownership.',pmb:'NEW',ev:'Only RM is shown today.',be:'Delight owner + cover fields per customer, history of changes.'},
 {id:'DLT-22',page:'Customer 360',f:'Delight journey tracker (First Meet → Registration → JI → Handover → Post-handover)',p:'Delight-specific stage view next to Workhall stages; stages are not strictly sequential.',pmb:'EN',ev:'Workhall stage tracker exists (Booking Form … Handed Over). Stages incl. "Customer Delight Team Meeting", "Pre Delivery Inspection", "EB / Patta Transfer".',be:'Map Workhall stages + Delight activities to the journey.'},
 {id:'DLT-23',page:'Customer 360',f:'Engagement profile (birthday, anniversary, language, preferences)',p:'Drives greetings and engagement.',pmb:'PC',ev:'DOB / anniversary not seen in PMB. Source to be confirmed (ERP booking form? Workhall?).',be:'Source field mapping; editable by Delight if not in ERP.'},
 {id:'DLT-24',page:'Customer 360',f:'Multiple bookings and multiple contact numbers',p:'One customer, several units / co-applicants / NRI numbers.',pmb:'AV',ev:'Customers list shows "2 bookings", "Co-applicant"; "Add number / email" exists.',be:''},
 {id:'DLT-25',page:'Customer 360',f:'Referral history and pending requests on the customer page',p:'Context before calling.',pmb:'NEW',ev:'',be:'Join referrals + requests by customer.'},
 // Communication
 {id:'DLT-30',page:'Communication',f:'Calls (MCube), WhatsApp (Gallabox), email in one timeline',p:'Communication history.',pmb:'AV',ev:'Inboxes → All calls / All WhatsApp / All emails; customer History timeline.',be:''},
 {id:'DLT-31',page:'Communication',f:'Filter by Delight member, booking, channel, date',p:'Head reviews team communication; member picks up a colleague\'s thread.',pmb:'EN',ev:'Inbox filters are RM-centric.',be:'Add Delight member + booking filters.'},
 {id:'DLT-32',page:'Communication',f:'Delight members\' extensions and Gallabox numbers mapped',p:'Delight calls/WhatsApp land on the customer timeline.',pmb:'PC',ev:'Delight users have extensions (448, 455, 458, 462, 502). Transition to standard official WhatsApp numbers discussed (MoM §2).',be:'Gallabox channel per Delight number.'},
 {id:'DLT-33',page:'Communication',f:'Registration WhatsApp groups captured',p:'Groups with customer + internal teams.',pmb:'PC',ev:'MoM §2: feasibility to be evaluated (Gallabox group support).',be:'Depends on Gallabox API for groups.'},
 {id:'DLT-34',page:'Communication',f:'Delight shared mailbox (customerdelight@) synced',p:'Delight emails on the timeline.',pmb:'EN',ev:'customerdelight@ mailbox is synced but was 10 days behind on 24 Oct (finding CP-016).',be:'Fix sync reliability.'},
 {id:'DLT-35',page:'Communication',f:'WhatsApp templates for Delight (welcome, first meet, registration, JI, handover, greetings)',p:'Standard official communication.',pmb:'PC',ev:'Template list to be shared by Delight team (MoM §7.4).',be:'Gallabox template approval + send from PMB.'},
 // Activities
 {id:'DLT-40',page:'Activities',f:'Unified activity tracker (First Meet, Registration, JI, Handover, Post-handover, Follow-up, Engagement)',p:'Replaces Excel trackers for Delight touchpoints.',pmb:'NEW',ev:'Workhall shows some tasks (e.g. "First Meet · Execute First meet") on the customer page.',be:'Activity entity + APIs; read Workhall tasks where they exist (no duplicate).'},
 {id:'DLT-41',page:'Activities',f:'Create, assign, reassign, status update with remarks and next follow-up',p:'Daily working.',pmb:'NEW',ev:'',be:'Activity CRUD + audit log.'},
 {id:'DLT-42',page:'Activities',f:'Registration document checklist',p:'Hospitality + docs readiness.',pmb:'NEW',ev:'Checklist items to be confirmed (MoM §7.2).',be:'Configurable checklist per activity type.'},
 {id:'DLT-43',page:'Activities',f:'JI observations / snag capture with team and closure status',p:'Replaces paper JI sheet.',pmb:'PC',ev:'Today: physical JI sheet; Skylantis uses a separate app. Decide PMB vs ERP/Workhall as system of record.',be:'Snag entity or link to ERP snag ticket.'},
 {id:'DLT-44',page:'Activities',f:'Bulk reassignment for leave / availability',p:'Head moves a member\'s activities for a date range.',pmb:'NEW',ev:'',be:'Bulk update + notifications.'},
 // Requests
 {id:'DLT-50',page:'Requests',f:'Register customer query with source, category, team, person, status',p:'Consolidated visibility of customer concerns.',pmb:'EN',ev:'PMB Tickets exist (types: Collection follow-up, Callback, Document request, Escalation, Other…; statuses incl. Pending approval, Breached).',be:'Add Delight categories + source field to Tickets, or a Delight view over Tickets.'},
 {id:'DLT-51',page:'Requests',f:'External reference to ERP / customer-portal / Workhall ticket',p:'PMB does not replace existing ticketing.',pmb:'PC',ev:'MoM §4: existing ERP/portal ticketing to be evaluated.',be:'Reference field now; read integration later.'},
 {id:'DLT-52',page:'Requests',f:'Escalation levels L1 member → L2 Delight Head → L3 CRM Head / CSMO',p:'Clear escalation path.',pmb:'EN',ev:'Tickets have "Escalation" type; no level.',be:'Level + SLA breach rules.'},
 // Referrals
 {id:'DLT-60',page:'Referrals',f:'Capture referral: referrer customer + booking, prospect, source, Delight member',p:'Requested by Operations Head.',pmb:'NEW',ev:'',be:'Referral entity.'},
 {id:'DLT-61',page:'Referrals',f:'Status, site visit, booking conversion',p:'Track to conversion.',pmb:'PC',ev:'Sales CRM / lead system for prospects to be confirmed (duplicate-lead check).',be:'Hand-off to sales system + status sync.'},
 {id:'DLT-62',page:'Referrals',f:'Payout eligibility and payment status with approvals',p:'Control referral payouts.',pmb:'PC',ev:'Eligibility rule and amount to be confirmed (e.g. agreement registered / % collected).',be:'Approval chain + Accounts confirmation.'},
 {id:'DLT-63',page:'Referrals',f:'Referral performance dashboard',p:'Funnel, by member, by project, by referrer.',pmb:'NEW',ev:'',be:'Aggregations.'},
 // Approvals
 {id:'DLT-70',page:'Approvals',f:'Approval inbox for Delight types (temporary cover, ownership change, referral payout, customer exception)',p:'Approvals layer for Head and CSMO.',pmb:'EN',ev:'Money → Approvals exists for deferments and waivers.',be:'New approval types + multi-step chain.'},
 // Ownership
 {id:'DLT-80',page:'Team monitor',f:'Primary Delight ownership separate from RM ownership',p:'Relationship continuity across stages.',pmb:'NEW',ev:'RM ownership logic must not change.',be:'Separate field; RM logic untouched.'},
 {id:'DLT-81',page:'Team monitor',f:'Temporary cover with dates (auto-expires)',p:'Leave / simultaneous activities.',pmb:'NEW',ev:'',be:'Cover record with from/to; routing of queue items during cover.'},
 {id:'DLT-82',page:'Team monitor',f:'Head view: member workload, overdue, SLA, comms today',p:'Team Head visibility.',pmb:'NEW',ev:'Team & QC → Team exists for RMs.',be:'Aggregations.'},
 // Reports
 {id:'DLT-90',page:'Reports',f:'Daily activities, pending follow-ups, engagement, communication, referrals, member-wise',p:'Tracking.',pmb:'NEW',ev:'',be:'Report queries.'},
 {id:'DLT-91',page:'Reports',f:'Export (CSV / Excel)',p:'Share with management.',pmb:'EN',ev:'',be:'Server-side export with role scope.'},
 // Engagement & backend desk
 {id:'DLT-95',page:'Backend desk',f:'Greetings queue (birthdays / anniversaries) with template send',p:'Daily engagement without manual lists.',pmb:'NEW',ev:'Today done manually each day.',be:'Gallabox template send + log.'},
 {id:'DLT-96',page:'Backend desk',f:'Data gaps list (missing DOB, email, alternate number)',p:'Data quality for engagement.',pmb:'NEW',ev:'',be:'Rules.'},
 {id:'DLT-97',page:'Dashboard',f:'Community events and annual events with RSVP tracking',p:'Post-handover engagement (60–70% occupancy trigger).',pmb:'PC',ev:'Discussed; RSVP capture method to be confirmed.',be:'Event entity + invite list.'}
];
const PMB_LABEL={AV:'Already available',EN:'Requires enhancement',NEW:'New development',PC:'Pending confirmation'};
const PMB_TAG={AV:'',EN:'blue',NEW:'purple',PC:'amber'};
