# Lemon Squeezy billing launch

iCloseLeads uses Lemon Squeezy hosted checkout and signed webhooks. Paid checkout remains closed unless every required value is configured. Test-mode checkout is restricted to admin accounts.

## 1. Create the catalog in test mode

Create two subscription products in Lemon Squeezy:

- Pro: monthly and annual variants
- Agency: monthly and annual variants

Record the store ID and all four numeric variant IDs.

## 2. Configure protected environment values

Add these to Vercel for Production, Preview, and Development as appropriate:

```text
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_TEST_MODE=true
```

The API key and webhook secret must remain environment variables. Do not save them in Platform Settings.

Store and variant IDs can be entered in Admin > Platform Settings > Payment Gateway, or supplied as environment variables:

```text
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_SOFTPHONE_MONTHLY_VARIANT_ID=
```

Environment values take precedence over Platform Settings.

## 3. Register the webhook

Use this callback URL:

```text
https://icloseleads.com/api/webhooks/lemonsqueezy
```

Subscribe to these events:

- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_resumed`
- `subscription_expired`
- `subscription_paused`
- `subscription_unpaused`
- `subscription_plan_changed`

Copy the webhook signing secret into `LEMONSQUEEZY_WEBHOOK_SECRET`.

## 4. Prepare the database

Run the protected production migration route once after deployment. It creates `BillingSubscription` idempotently. Confirm the response contains no migration errors.

## 5. Verify test mode

1. Sign in with an admin account.
2. Open Dashboard > Plans and billing.
3. Complete one Pro test checkout and one Agency test checkout.
4. Confirm Lemon Squeezy reports successful webhook delivery.
5. Confirm the subscription rows are stored with `testMode=true`.
6. Open Manage billing and verify the customer portal URL works.
7. Simulate cancel, resume, pause, and expiry events and confirm each webhook returns 200.

Test subscriptions never change production plan access. Non-admin accounts cannot start test checkouts.

## 6. Launch live billing

Only after test QA passes:

1. Create or verify the live products and variants.
2. Replace the API key, signing secret, store ID, and variant IDs with live values.
3. Set `LEMONSQUEEZY_TEST_MODE=false`.
4. Redeploy and run one low-risk live checkout with an internal account.
5. Confirm plan activation, portal access, cancellation grace access, and expiry downgrade.
6. Remove `comingSoon` from paid marketing plans only after the live transaction is reconciled.

Never activate a plan from the checkout redirect. Only a valid signed webhook can change paid access.
