# Admin Calling QA - September 15, 2026

## Executed

- Full regression suite: 81 suites passed, 440 tests passed, 9 existing opt-in tests skipped.
- Production build: passed. Existing image lint warnings and a handled local blog-data warning remain; this local shell has no production DATABASE_URL.
- Type checking: passed.
- Focused admin-calling coverage includes access denial and admin demotion; country/timezone/consent validation; duplicate/concurrent-call prevention; three-minute/ten-call configuration; failed and ambiguous provider replies; explicit hold recovery; opt-outs; protected phone exclusion; modified provider configuration; and honest research fallbacks.
- Browser checks at 1440px and 390px: queue and setup render; no horizontal overflow or page errors; voice activation remains disabled without configuration; keys use a password field; country changes select the corresponding timezone; keyboard tabs work; consent errors stay inside the dialog; errors preserve consent text and existing search results; campaigns survive reload; opening/reloading never initiates calls.
- Static UI detector: no findings on the new workspace.
- Review follow-up: simulated active-run checks passed on desktop/mobile. Pause remains available on Agent setup; setup edits are disabled during a run; unsaved terms block Start until discarded or saved/verified; recorded consent date and timezone remain visible when reopened. These simulated calls never reach a real provider.
- Independent interface review disposition: **ship**. All five findings resolved: shared run controls, unsaved-setup clarity, consent date/timezone preservation, inherited-form documentation, and title/status treatment. This verdict does not certify live telephony operation.
- Browser QA used an isolated local admin identity, intercepted provider requests and clearly labeled test business fixtures. It did not contact or call a real business. Temporary QA browsers and servers were stopped.

## Remaining Activation Checks

- Authenticate the owner's ElevenLabs account, choose a licensed female voice and an already-connected dedicated Twilio number. Customer softphone numbers must not be imported or rerouted.
- Verify the managed provider configuration against the actual account, regional dialing permissions, phone registration and account balance.
- Conduct a real, expressly consenting owned-number test in the target country during the permitted local window. Listen for naturalness, interruptions, latency, pronunciation, unknown-question handling, refusal/opt-out handling and the three-minute limit.
- Verify actual provider call status, transcript retrieval and suppression before approving any business campaign.
- Calendar booking, SMS confirmation and unattended scheduling are intentionally not enabled; the agent is instructed to record a meeting request, not claim completion.

## Boundaries

Normal customer softphone, Stripe payment configuration, subscription prices, trial limits and existing discovery routes were not changed. The unrelated in-progress blog edits were preserved and excluded from this feature's commit.

See [Admin calling pilot](admin-calling-pilot.md) for operating limits, country-specific references and recovery procedure.
