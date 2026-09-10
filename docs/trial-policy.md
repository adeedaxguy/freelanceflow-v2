# Trial and Paid Access

## Current Offer

- A new account gets a free 72-hour trial from its persisted registration timestamp.
- 600 lead results are shared across Local Business Leads, Remote Jobs, and Live Jobs.
- The one-time 300-result share bonus is optional, available only during an active trial, and never extends its deadline.
- Trial outreach remains rate limited to 50 messages per UTC day, 400/month, and 5/minute.
- No payment card is collected for the application trial. There is no automatic charge.
- After expiry, Pro is USD 10/month and Agency is USD 15/month. Annual billing retains the existing checkout terms.
- Pro includes 1,000 results/week. Agency has no normal result cap, subject to provider availability and operational rate limits.
- Phone numbers and calling-minute packages are separately paid subscriptions with their own usage checks.

## Expiry

The application enforces expiry from the database on each new search, AI proposal/reply, outreach preparation/send, campaign/template/follow-up creation, and website-share request.
The website design editor also checks access on the server. The dashboard banner counts down and switches to an upgrade notice.
Unavailable usage data fails closed instead of granting another three days.
The deadline does not restart after sign-in, OAuth, password reset, bonus claims, or returning from a paid plan to free.

Saved leads and exports, existing campaigns/templates/history, account settings, billing, support, standalone calculators, and previously shared website previews remain available.
Existing purchased calling access is not revoked by the prospecting trial.
Existing manually granted paid plans are preserved. Admins retain testing access.

Accounts created before the original trial rollout received a one-time window from 29 August to 1 September 2026.
This change does not grant another rolling trial to those accounts or change existing paid subscriptions.
The stored plan name remains `free` for compatibility; user-facing acquisition copy calls it a free 3-day trial.

## Billing

Trial expiry does not create a Stripe subscription or invoice.
The customer explicitly chooses a paid plan and completes the existing Stripe checkout.
Payment webhook verification and paid access activation are unchanged.
No live card charge, provider credential change, or Twilio purchase is part of this release.

## Verification

Automated checks cover the exact 72-hour boundary, unused and exhausted allowances, bonus credits, expired-account API gates, database failures, persisted versus stale-session plans, paid/admin access, duplicate registration, repeated OAuth login, and the dashboard expiry state.
Run `npm test -- --runInBand`, `npm run type-check`, and `npm run build`.
Browser QA covers current signup/pricing copy and mobile/desktop rendering; time travel tests use a controlled clock, not a real three-day wait.

Historical article URLs are preserved; their shared article header links to the current trial offer.
Public support remains open without authentication.
