# Existing Admin Outgoing Number QA

## Scope

The private AI calling pilot now supports the signed-in administrator's existing active Twilio softphone number. Customer number selection, normal softphone routing, Stripe and calling packages are unchanged. No additional package dependencies or database migrations are required.

## Verification

- Full Jest regression: 82 suites passed, 468 tests passed; 2 existing opt-in suites / 9 tests skipped.
- Type checking passed.
- Production build passed, with existing image warnings and the handled local blog-data warning when DATABASE_URL is absent.
- Desktop 1440px and mobile 390px browser checks passed: an existing number appears without ElevenLabs, selection saves and survives reload, and selecting it does not enable calls without voice configuration.
- Existing UI checks passed: consent validation, draft preservation on errors, search-result persistence, loading state, keyboard tabs, country/timezone changes, unsaved-setup call blocking, global pause controls and no horizontal overflow.
- Automated provider checks use mocks. They cover admin ownership filters, changed or suspended numbers, Twilio account/number matching, no number-routing writes, per-call TwiML, recording off, 180-second limit and automatic retries disabled.
- Additional checks cover atomic dispatch, failed registration without dialing, pausing during registration, definite and ambiguous Twilio failures, unanswered calls, terminal Twilio state before next dispatch, exact AI conversation matching, opt-outs and reviewed hold recovery that refuses active Twilio calls.
- Reconciliation and the next dial use separate request budgets.
- Production verification exposed and corrected a workspace-status mismatch: eligible telephony workspaces use READY, not the purchase/subscription status ACTIVE. The regression fixtures now follow the existing telephony contract.

## Activation Boundary

Live voice quality, phone delivery, account permissions and end-to-end conversation retrieval remain unverified until the owner connects ElevenLabs and approves an expressly consenting recipient. No real calls, SMS, number purchases or phone-routing changes were made during this implementation.

The feature remains a supervised pilot. Calendar booking, SMS and unattended background campaigns are not enabled.
