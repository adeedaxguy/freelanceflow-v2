# Admin Calling Interface

Route: `/admin/softphone` (AI Calling); `/adminsoftphone` redirects here.
Mode: Operate. Ordinary admin extension inheriting existing form, tokens and mobile shell; no new identity or direction seed.
Review handoff: ship; all five material findings resolved. Live calling readiness remains a separate boundary.

## Inherited Form

- Compact title and admin/supervised-pilot label above Campaigns and Agent setup tabs; flat, border-separated work areas with restrained rounding.
- Existing background, surface, border, foreground and primary tokens carry light/dark themes; the incumbent admin primary color marks actions/selection, green readiness, amber missing requirements and red errors/suppression. Native labeled fields, focus rings and Lucide icons retain the admin control language.
- Desktop pairs saved campaigns with a queue, then a contact list with its brief/results; setup separates service knowledge from voice connection. Mobile stacks these areas, with saved campaigns in a horizontally scrolling row.
- The existing sidebar supplies AI Calling under Communication, logo and theme toggle; below the desktop breakpoint it becomes a fixed top bar and dismissible drawer with background scroll locked.

## Task Flow

1. Save the ElevenLabs key, load female voices and dedicated Twilio numbers, approve Lofts Studio facts/offer limits, select the voice/number and verify the agent.
2. Find and research an Australia/Canada category and city; review saved business evidence, recipient timezone and per-number express AI-call consent. Prepare an owned, consenting test contact before business calling.
3. Review today's holidays and calling-list requirements, approve a supervised run, keep the page open, then inspect summaries/transcripts and handle follow-up personally.

## Meaningful States

- **Global pause:** a sticky active-campaign strip stays above both tabs and targets the running campaign. Pause stops subsequent dispatches; a dispatched call may finish. Setup is locked during a run. Reopening never starts dialing automatically; pause before explicitly restarting.
- **Unsaved setup:** a shared draft warning covers profile, voice, number and entered-key changes. Starting is blocked until changes are saved and verified or discarded; background refresh preserves drafts. Discard restores saved setup and clears the entered key.
- **Consent dates:** new consent starts with a blank date. Review displays the recorded date in the labeled operator timezone and preserves the original timestamp when unchanged. Evidence, express AI-call consent and recipient country/timezone confirmation remain explicit; errors stay inside the dialog.
- **Unknown provider recovery:** dispatching/uncertain attempts expose conversation-ID reconciliation for the exact attempt. With no confirmed ID, controlled hold release requires at least 15 minutes, evidence and confirmation that neither ElevenLabs nor Twilio has an active call; release keeps the campaign paused and never automatically retries the number.
- **Loading and results:** initial loading has status feedback and failed loading offers Retry; busy work and notices are announced, errors are dismissible, and empty searches retain saved campaigns. Contacts distinguish pending research, missing/recorded consent, call status and do-not-call suppression.

## Boundaries

- Private admin surface: page and API authorization include a fresh database role check. Credentials stay in encrypted settings; the UI receives connection state. Customer softphone routes, numbers, billing and allowances retain their existing behavior.
- Agent configured is setup state. Live provider verification, voice/latency checks and a consenting test call still require the owner's ElevenLabs account and a separate dedicated Twilio number. Every dial remains gated by consent, fresh research, suppression, local-time checks and pilot limits: one concurrent call, three minutes, ten attempts per rolling 24 hours and seven-day duplicate exclusion.
- Calendar booking, SMS, unattended scheduling and automatic CRM promotion are unavailable; audio recording is disabled. Operator review of applicable calling obligations remains required; this surface does not certify legal compliance.

Sources: [Product context](../PRODUCT.md), [design guidance](../DESIGN.md), [implemented form and states](../src/components/admin/AdminCallingClient.tsx), [admin navigation and mobile shell](../src/components/AdminSidebar.tsx), [pilot workflow and boundaries](admin-calling-pilot.md).
