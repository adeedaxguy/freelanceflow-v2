# Retell Admin Calling QA

## Scope

Optional Retell provider for the private Lofts Studio caller. Existing ElevenLabs setups, customer softphones, number routing, Stripe and minute packages are unchanged. No telephone calls or number purchases are part of this QA.

## Executed

- Type-check: passed.
- Full Jest suite: 84 suites / 501 tests passed. Two pre-existing opt-in suites / nine tests skipped.
- Production build: passed. Pre-existing image-lint advisories and the handled local blog DATABASE_URL warning remain; no production database was accessed for the build.
- Isolated browser QA: desktop 1440px and mobile 390px passed. Retell selection preserves the existing number; key input clears after save; provider/voice/number survive reload; unapproved seller facts still block verification. Loading, failed requests, saved searches, consent dates, keyboard navigation, unsaved setup guards and global pause remain covered. No page errors or horizontal overflow. Temporary browser/server processes closed in finally.
- Visual review: desktop and mobile Retell setup screenshots inspected, no blocking layout defects.
- Trial account: signed up with owner-authorized Google account, owner completed MFA. Billing displayed $10.00 credit. Auto-recharge was off; extra-cost burst capacity switched off. No card or purchase added.
- Live deployment: `b3b3e23` completed successfully on Vercel. Retell's webhook-designated API key was saved through the admin form; the live voice-list request succeeded. Selected `cartesia-Emily` and retained the existing +1 650 663 4744 workspace number. Provider, voice and number persisted after reload, and the secret input stayed empty. Temporary credential memory was cleared.
- Live regression check: the manual softphone retained the same number, unlimited admin test minutes and existing call history. Saved AI campaigns remained drafts with consent required and starting disabled. No phone call was placed.

## Safety Coverage

- Signature, raw-body tampering, expired/future timestamp, missing key, malformed/oversized webhook and failed persistence.
- Exact attempt, agent, registration and phone-pair matching; stripped audio URLs; notes retention; out-of-order result handling; transcript opt-outs.
- Per-call SIP/TLS TwiML, recording off, hard time limit and parent hangup.
- Registration before dialing; no dialing on provider rejection; uncertain dispatch holds; no automatic retries; unchanged consent, suppression, concurrency and daily gates.
- Retell terminal state alone cannot release a non-terminal Twilio call. Missing notes hold/pause completed calls pending review.
- Managed provider prompt, model, duration, privacy, webhook and tool verification; female platform/Cartesia voices only; legacy ElevenLabs default preserved.

## Provider-Dependent Checks

Live key connection and voice selection passed after deployment. Agent creation and managed-configuration verification remain pending the owner's approval of the Lofts Studio service brief; the approval checkbox was not selected on the owner's behalf. No agent or call has been created in Retell yet. Mock tests do not establish real SIP audio quality, latency, interruptions, caller-ID display or successful end-to-end telephone delivery. A consenting owned-number pilot is still required before business calling. Retell credits do not cover Twilio PSTN/SIP usage. Retell temporary audio processing is disclosed; iCloseLeads stores written notes only.
