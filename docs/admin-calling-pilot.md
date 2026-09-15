# Admin AI Calling Pilot

## Scope

Private admin workspace: `/admin/softphone` (`/adminsoftphone` redirects there).
No changes to customer softphone routes, number billing, Stripe prices or minute packages.
Lofts Studio is the seller. Initial service knowledge is a short paraphrase of https://lofts.studio/, reviewed September 15, 2026. The administrator must approve it before agent provisioning. Fixed project prices, discounts, delivery promises and guaranteed outcomes are not assumed.

## Interface Contract

Mode: Operate. This is an extension, not a new visual world. FORM is inherited from the incumbent admin interface: existing sidebar and mobile shell, compact title, native labeled controls, a saved-list/detail split on desktop and stacked flow on mobile. There is deliberately no new FORM seed, direction roll, decorative image or identity change. Running controls are shared across views; setup drafts must be saved/verified or discarded before starting. The source of truth for established colors and components is the existing admin shell, not a new theme.

## Implemented

- Australia/Canada category and city search reuses the existing local-leads engine; at most 15 direct business numbers per campaign, plus one owned test contact.
- Business briefs are researched sequentially, with bounded public-website fetching, sources, timestamps, uncertainty and an optional Groq-tailored offer. A failed search or provider response does not manufacture leads or erase previous campaigns.
- Campaigns, consent evidence and attempts persist in separate additive database tables. Customer search allowances and phone ownership are unchanged.
- Admin authorization is checked in both the page layout and every API request, including a fresh database role check. No public agent tokens are issued.
- ElevenLabs keys use the existing encrypted setting store and are excluded from the general settings response. The API returns a connection flag, never the key.
- A managed ElevenLabs conversational agent uses a selected female voice, AI disclosure, approved facts and per-business context. A dedicated Twilio number is required. Customer numbers are excluded from selection; the app does not import/re-route any number.
- Express AI-call consent per number, country/timezone verification, internal/legacy opt-outs, same-day holiday/list review, weekday 10:00-16:00 local window and fresh research gate every dial.
- One concurrent call, three-minute conversation ceiling, ten attempts per rolling 24 hours and seven-day duplicate-number exclusion. All attempts, including failures, consume pilot capacity.
- An atomic database claim precedes the provider request. Timeouts, unknown responses and server failures are held for reconciliation, never automatically retried. Definite rejections pause the campaign too.
- A short-lived, hashed, per-call token allows the voice agent only to suppress its own recipient. It cannot choose another number, send messages, charge a card or access account data.
- Provider results are reconciled through authenticated polling. Summaries and transcripts are available for review; prospect opt-outs are also recovered from transcripts. Audio recording is disabled. Stored call transcripts/summaries are cleared after 30 days on workspace access; consent/suppression/attempt metadata remains for audit and duplicate prevention.

## Supervised Operation

1. Save the ElevenLabs key in Agent setup. Load available female voices and already-connected, dedicated Twilio numbers.
2. Review and approve Lofts Studio facts/pricing limits, choose voice/number, and verify the managed agent.
3. Search a category and city. Research is saved per business, so incomplete research can be resumed individually.
4. Add an owned test contact in the target country, prepare its brief and record the owner's actual AI-test consent. Do not treat a Maps listing as consent.
5. Check the actual recipient timezone, local holiday and applicable calling-list/registration obligations. Approve the supervised run only when calling is permitted.
6. Keep the page open. Each next call waits for the previous provider result. Closing the page stops new dispatches, not a call already sent. Reopening does not automatically restart dialing. Pause affects queued calls; active calls remain bounded by the three-minute ceiling.
7. Review results and handle follow-up personally. For an unconfirmed call, obtain its conversation ID from ElevenLabs and reconcile it. The ID must belong to the exact attempt. If neither provider has a call record, wait at least 15 minutes, verify no call is active in either provider, and record evidence in the controlled hold-release form. It keeps the campaign paused and never automatically retries that number. Never clear a hold by guessing.

## Not Yet Activated / Not Claimed

- Live provider verification, voice audition, interruption/latency testing and a real consenting telephone call require the owner's ElevenLabs account and a dedicated Twilio number. Automated tests use mocks, not real dialing.
- Calendar booking, SMS confirmations, unattended background scheduling and automated CRM outcome promotion are not enabled. The agent may note a meeting request but must never say it booked a meeting or sent a text.
- This is not legal certification or an automated national do-not-call-list washing service. Province/state holidays and jurisdiction-specific registration, disclosure, consent and recording requirements need the operator's review before a campaign.
- No trial prospects, scraped numbers or purchased lists were called during development.

## Primary References

- [ElevenLabs Twilio native integration](https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/native-integration)
- [Outbound calling API](https://elevenlabs.io/docs/eleven-agents/api-reference/twilio/outbound-call)
- [Secret dynamic variables](https://elevenlabs.io/docs/eleven-agents/customization/personalization/dynamic-variables)
- [CRTC synthesized-voice / ADAD rules](https://web.crtc.gc.ca/eng/trules-reglest.htm): Part IV applies even where a call is exempt from National DNCL rules; obtain express consent for the specific caller and number.
- [ACMA telemarketing rules](https://www.acma.gov.au/say-no-to-telemarketers)
- [ACMA consent/list washing](https://www.acma.gov.au/telemarketing-compliance-alerts): a published number is not inferred consent.

## Verification

Focused tests cover authorization/demotion, validation, timezones, consent, call limits, concurrent dispatch, ambiguous results, provider errors and opt-out handling. Browser QA is isolated from real provider actions and checks desktop/mobile queue, setup, consent, failed requests, navigation and no dialing on reload. See the accompanying QA report for executed results and remaining provider-dependent checks.
