# PMB Delight Team module: interactive prototype

Built 2026-11-10. It is a navigable demo of the CRM Delight Team module for PMB (DRA Comms Platform, `drap.powersmy.biz`), styled to match PMB's look. Its purpose is to collect stakeholder feedback before the requirements go to the PMB team. It contains demo data only and connects to no live system.

## Open it

Double-click `PMB_Delight_Module_Prototype.html`. It opens in Edge or Chrome as a single file with no install. Fonts load from Google Fonts when online, and the page falls back to system fonts offline.

Demo changes and feedback persist in that browser's localStorage. **Reset demo data** in the yellow bar restores the sample records and keeps feedback.

## Demo script (about 15 minutes)

1. **View as → Rekha (Delight Member).** Dashboard (Working layer): KPI cards open filtered records, plus My queue, Today's schedule and Engagement today. Click **Send wish**.
2. **Customer 360 → Arvind Prasad.** Two bookings (909 tab), spouse number, ownership panel (owner, cover, RM read-only), journey tracker and a timeline that shows which member handled each item.
3. **Deepa Natarajan.** Rekha is covering for Varadharaj on leave (temporary cover), and history is unchanged.
4. **Activities.** The week strip, **New activity** (assign to someone else = activity-specific assignment), **Update** of a Registration (checklist) and a Joint Inspection (snags), and **Reassign** (activity only / temporary cover / owner change, the last two going for approval).
5. **Requests.** DLR-203 shows an L2 escalation. The external-ref column shows that PMB links ERP and Workhall tickets rather than replacing them.
6. **Referrals.** Performance tab, then the register. In REF-301, **Request payout** is available after booking.
7. **View as → Delight Backend.** Backend desk (greetings queue, appointments to confirm, checklists, payout verification, data gaps).
8. **View as → Delight Head.** Team console (member-wise), **Team monitor** (leave cover for a whole member, ownership register, SLA breaches), and **Approvals** (approve APR-0110 cover, APR-0111 owner change).
9. **View as → CRM Head / CSMO.** Final approval of referral payouts and customer exceptions (APR-0108, APR-0109). Everything else is read-only.
10. **Requirement map / Stakeholder feedback / Dev handover.** Record decisions, export CSV or JSON, and turn on **Dev notes** to see what needs PMB backend work.

## Consolidating feedback

Each browser keeps its own feedback. After demos, export JSON from **Stakeholder feedback** on each machine, then use **Import JSON** on one machine to merge (duplicates are skipped).

## Source

`src/` holds the source: `styles.css`, `data.js` (demo data), `requirements.js` (requirement map), `core.js`, `pages1.js` and `pages2.js`. Rebuild with `python -I build.py`. `serve.py` is an optional local preview server on 127.0.0.1:8765.

## Basis

- PMB was inspected read-only on 2026-11-10 (Home, Customers / Customer 360, Tickets, Next actions, Admin → Users and role definitions). Staff names and the existing "Delight Team" role come from PMB. Customers, units, BOF numbers and phone numbers are fictional.
- Delight workflow comes from the discussion minutes (Jeya Praveen V to the Delight Head) and the meeting transcript.
- Roles follow the user's instruction: Delight Head, Delight Member, Delight Backend, CRM Head / CSMO, Admin. The UI has three layers: Working, Monitoring and Approvals.

## Open questions (shown as "Pending confirmation" in the app)

- What does the Delight Backend role do? The prototype proposes duties for the Delight Head to confirm.
- Where do DOB and anniversary come from: ERP booking form or Workhall?
- What is the referral payout eligibility rule and amount, and which sales system receives referrals?
- Should JI snags be recorded in PMB or in ERP/Workhall? (Skylantis uses a separate app.)
- Can Gallabox registration WhatsApp groups be captured, and what is the official Delight number transition?
- What is the final ticketing workflow between ERP/customer portal tickets and PMB Tickets?
