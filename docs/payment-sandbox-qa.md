# Payment Sandbox QA

Verified 2026-09-11. No live card charges, phone purchases, or calls were made.
Production checkout was never switched to test mode. No $1 offer was created.

## Provider Checks

Stripe's test catalogue was empty. The existing checkout helper created isolated
test-mode equivalents of these packages using their application prices:

| Package | Price | Result |
| --- | --- | --- |
| Pro monthly | $10/month | Paid |
| Pro annual | $100/year | Paid |
| Agency monthly | $15/month | Paid |
| Agency annual | $150/year | Paid |
| Starter calls, 100 minutes | $4/month | Paid |
| Growth calls, 300 minutes | $8/month | Paid |
| Scale calls, 1,000 minutes | $22/month | Paid |
| Phone number (Twilio magic-number fixture) | $2.15/month | Paid, no real provisioning |

All eight hosted checkouts were completed in the in-app browser with Stripe test
cards. Stripe API reads confirmed paid status, currency, amount, interval, and
subscription metadata. Additional browser checks passed: card decline followed by
successful retry; failed then successful 3D Secure authentication; cancellation
back to iCloseLeads and reopening checkout. All eight test subscriptions were
cancelled after verification; their payment records remain in Stripe test mode.

Twilio test credentials passed eight API checks: number purchase success,
unavailable and invalid numbers, call creation success, and invalid, unroutable,
permission-restricted and blocked call destinations. The live admin number search
also returned an available San Francisco number at $2.15/month without purchase.

## Fixes and Coverage

- Number-checkout retries now update only unsettled purchases atomically. They
  cannot reset active, expired, test-paid or currently provisioning numbers.
- Late minute-checkout events no longer overwrite a later package/cancellation.
- Expired/failed checkout notifications cannot invalidate settled numbers.
- Immediate card and authentication failures now log `payment_intent.payment_failed`.
- The existing live Stripe webhook was expanded from three to seven events, keeping
  its URL, signing secret, API version and original events unchanged. Added:
  `payment_intent.payment_failed`, `invoice.payment_failed`,
  `checkout.session.expired`, and `checkout.session.async_payment_failed`.

261 normal tests passed, including dialing blocked with no minutes, remaining-time
limits, admin allowance, invalid callbacks and call-duration recording. Provider
tests are opt-in and skip during normal runs. Real Stripe responses and two real
test failure events passed through the actual webhook handler with local signatures
and a mocked database. Test payments never changed a real plan or provisioned a number.
Type-check and the production build passed. The local build used the blog fallback
without a production database connection and reported existing image lint warnings.

## Repeat Safely

Use the Console's existing **test** credentials only. Set
`STRIPE_SANDBOX_SECRET_KEY`, a unique `STRIPE_SANDBOX_RUN_ID`, and
`STRIPE_SANDBOX_PHASE=prepare`, then run:

```sh
npm test -- --runInBand --runTestsByPath src/lib/payments.sandbox.test.ts
```

Complete the generated `reports/stripe-sandbox-checkouts.json` links using Stripe
test cards (include decline and authentication-failure checks). Run the same command
with phase `verify`, then `cleanup`. No credentials are written to reports.

For Twilio, set `TWILIO_SANDBOX_ACCOUNT_SID` and `TWILIO_SANDBOX_AUTH_TOKEN` from
**Test credentials**, then run `src/lib/telephony.sandbox.test.ts` the same way.
The test fails closed before POST requests if ordinary account access is possible.

## Limits

This does not prove a real paid user's database activation or live webhook delivery:
the replay uses an isolated mocked database and a local signing secret. Initial
card declines may have no user/customer metadata; the audit still preserves the
Stripe payment ID, reason, amount and test/live flag without inventing attribution.
Twilio test credentials cannot search inventory, create subaccounts, execute TwiML,
send status callbacks, or verify browser audio. Real call quality and a production
paid-number activation remain separate acceptance checks.

References: [Stripe testing](https://docs.stripe.com/testing),
[Twilio test credentials](https://www.twilio.com/docs/iam/test-credentials).
