# Razorpay checkout

## Temporarily disabled

`lib/checkout-config.ts` sets `RAZORPAY_CHECKOUT_ENABLED` to `false`.
The cart uses **Place Order**, and `/api/checkout` saves a direct pending order,
creates the admin notification, and sends the existing push notification.
These orders have no gateway payment status, so admin can manage their payment
and fulfillment as before. Database prices and dish selection checks still apply.

New Razorpay order creation at `/api/create-order` is disabled. The complete
Razorpay UI, SDK, verification, status, and webhook code remains available;
confirmation of previously started payments can still complete. To restore
online checkout, set `RAZORPAY_CHECKOUT_ENABLED` to `true` and rebuild/redeploy
with the setup below completed.

The following sections describe the enabled Razorpay flow.

Customer checkout saves the order and items with payment pending. The app calculates prices from the database, including selected variants, options, styles, and separately carted add-ons. Existing order/accounting prices are in rupees; Razorpay amounts are in paise (rupees × 100), with a minimum charge of ₹1. Current checkout tax, fee, and order-type rules are preserved.

Orders become `paid_online` only after a captured payment is confirmed by the browser verification endpoint or a signed webhook. A valid Checkout signature alone does not prove capture: the server also fetches the payment and checks its order, amount, currency, and status. Preparing and delivering the order are separate from payment confirmation. A dismissed or failed checkout remains pending and can be retried. Staff see pending orders in admin, but receive the new-order alert only after payment confirmation.

## Setup

1. The `razorpay` SDK is installed. The existing ignored `.env` has the supplied test keys and a generated webhook secret. Preserve your other environment values. For other environments configure:

   ```dotenv
   RAZORPAY_KEY_ID=your_test_or_live_key_id
   RAZORPAY_KEY_SECRET=your_server_key_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=the_same_key_id
   RAZORPAY_WEBHOOK_SECRET=your_separate_webhook_signing_secret
   ```

   Never give either secret a `NEXT_PUBLIC_` prefix. The API secret and webhook secret serve different purposes. Do not commit `.env`; the existing `.env*` Git ignore rule covers it.

2. Apply the additive database migration **before starting/deploying the updated application**:

   ```sh
   npx drizzle-kit migrate
   ```

   The new migration is `drizzle/0024_razorpay_checkout.sql`, with its journal and schema snapshot. It adds nullable columns and unique constraints to the existing order table; historical and counter-created orders keep their original behavior. No application database migration is automatically executed by checkout.

3. In the [Razorpay Dashboard](https://dashboard.razorpay.com/), use Test Mode, enable automatic capture, and add a webhook with this URL:

   ```text
   https://your-domain.com/api/razorpay/webhook
   ```

   Copy the value of `RAZORPAY_WEBHOOK_SECRET` from your local `.env` into the webhook's Secret field. Subscribe to **payment.captured** and **order.paid**. The webhook requires a publicly reachable HTTPS URL; localhost is not directly reachable. Use a staging deployment or a tunnel supported by Razorpay. See [webhook setup and validation](https://razorpay.com/docs/webhooks/validate-test/).

4. Copy the same environment values to your hosting environment and restart/rebuild the application. Live payments require matching Live Mode keys and a Live Mode webhook configuration.

## Endpoints

| Endpoint | Input | Result |
| --- | --- | --- |
| `POST /api/create-order` | `X-Checkout-Token` UUID header; customer details and cart, or `{}` to resume | Saved order ID, Razorpay `order_id`, paise `amount`, `currency`, `paymentStatus` |
| `POST /api/checkout` | Same as create-order | Compatibility alias for the same mandatory payment flow |
| `POST /api/verify-payment` | Token header and `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` | `200` when paid; `202` while awaiting capture |
| `GET /api/payment-status` | Token header | Latest persisted payment status; no customer details or secrets |
| `POST /api/razorpay/webhook` | Raw signed Razorpay payload and `X-Razorpay-Signature` | Idempotent confirmation acknowledgement |

Each checkout uses a cryptographically random UUID persisted in browser storage, with only its SHA-256 hash stored in PostgreSQL. Tokens are bearer credentials and must stay out of URLs and logs. Repeating a request for a saved token resumes that order; changing the cart creates a separate checkout. Pending checkouts survive reload and display retry buttons. Polling checks pending payments every five seconds and on focus, including when the browser success callback was lost. Confirmation removes the purchased cart quantities once and preserves additional items.

Payment status is immutable through admin edit actions for these orders. Admins can still change fulfillment status and close the active order. Additional items require a new checkout. Refunds, automatic pending-order expiry, and reconciliation jobs are not part of this integration.

The confirmation transaction locks the order, records the captured payment, and inserts one persistent staff notification. Callback/webhook races and replayed webhook events return the existing paid result. Push sending occurs after the transaction and retains the existing notification system's delivery behavior. Unknown gateway orders from other integrations are acknowledged without changing local data. Database failures return an error so Razorpay can retry delivery.

## Test

```sh
npm run dev
```

Open `/cart`, add dishes, click **Pay & Place Order**, enter your details, and choose **Continue to payment**. The Razorpay modal uses the server-created order and database-calculated charge. Use Razorpay's [documented test payment methods](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) with the supplied test keys.

Check these scenarios:

- Successful payment shows **Payment successful**, sets the order to `paid_online`, records the full amount in `paidOnline`, and alerts staff once.
- Modal dismissal and failed payments keep the cart/order pending. **Retry payment** reuses the same saved order.
- Reload while pending, or close the page after payment authorization. A captured-payment webhook confirms the order; reopening the cart/order history shows the persisted result.
- With auto-capture delayed, the UI remains pending until capture. Preparation/delivery status stays unchanged.
- Additional cart items survive payment for an earlier checkout.

Automated pricing, signature, and cart persistence tests:

```sh
npm run test:payments
```

PostgreSQL integration tests require an explicit dedicated test database URL; they never use the application `DATABASE_URL`. The target database name must start with `razorpay_test`, and the test role needs permission to create/drop temporary test databases. Each run creates a separate database, applies the actual migrations, tests concurrency/replays/rollback, then drops its own database:

```sh
TEST_DATABASE_URL=postgresql://test_user@localhost:5432/razorpay_test npm run test:payments
```

Without that variable, PostgreSQL tests are reported as skipped. No external Razorpay API calls are made by automated tests.

```sh
npx tsc --noEmit --incremental false
npm run build
```

## Changed files

- Setup: `package.json`, `package-lock.json`, ignored `.env`.
- Persistence: `db/schema.ts`, `drizzle/0024_razorpay_checkout.sql`, `drizzle/meta/0024_snapshot.json`, `drizzle/meta/_journal.json`, `store/cart.ts`.
- Payment backend: `lib/payment-validation.ts`, `lib/payment-service.ts`, `lib/razorpay.ts`, `lib/payment-response.ts`, `app/api/create-order/route.ts`, `app/api/verify-payment/route.ts`, `app/api/payment-status/route.ts`, `app/api/razorpay/webhook/route.ts`, `app/api/checkout/route.ts`.
- Customer checkout/history: `lib/razorpay-checkout.ts`, `hooks/use-razorpay-checkout.ts`, `app/(user)/(withNav)/cart/page.tsx`, `components/DialogUserDetails.tsx`, `app/(user)/(withNav)/orders/actions.ts`, `app/(user)/(withNav)/orders/searchPage.tsx`.
- Admin protections: `app/admin/actions/order.ts`, `app/admin/actions/user.ts`, `app/admin/orders/OrderDialogClient.tsx`, `app/admin/orders/PaymentStatusSelect.tsx`, `app/admin/orders/orderpageClient.tsx`.
- Tests and documentation: `tests/payments.test.ts`, `tests/payment-service.test.ts`, `tests/cart-payment.test.ts`, `docs/razorpay-checkout.md`, `docs/fcm-notifications.md`, `README.md`.
