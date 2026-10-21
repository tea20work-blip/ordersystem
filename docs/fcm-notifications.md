# Admin order notifications

Customer checkout orders are saved with payment pending. Their notification is created only when a captured Razorpay payment is confirmed by browser verification or a signed webhook; the payment update and alert commit in one transaction. Counter-created orders still create their order, items, and alert in one transaction. Lending repayments do not trigger order alerts. See [Razorpay checkout setup](razorpay-checkout.md).

The shared admin layout shows every undismissed alert on every admin page except login. Alerts have no expiry and survive page changes and reloads. Clicking × dismisses that alert for all admins. The panel checks the database every five seconds and on focus; foreground FCM messages trigger an immediate check. A notification beeps once when first detected in the open panel after sound is enabled. Existing alerts on initial page load do not beep.

## Firebase setup

1. Open https://console.firebase.google.com and create/select a project.
2. Open **Project settings → General → Your apps**, register a **Web** app, and copy the Firebase configuration into the public variables below.
3. Open **Project settings → Cloud Messaging → Web configuration → Web Push certificates → Generate key pair**. Copy the **public** key into `NEXT_PUBLIC_FIREBASE_VAPID_KEY`. Ensure Firebase Cloud Messaging API (V1) is enabled; older projects may also need the FCM Registration API enabled in Google Cloud.
4. Open **Project settings → Service accounts → Firebase Admin SDK → Generate new private key**. From the downloaded JSON, copy `project_id`, `client_email`, and `private_key` into the server variables. Keep these credentials private; the private key must never have a `NEXT_PUBLIC_` prefix.
5. Add these values to `.env` (and your production environment):

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=your_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_web_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_public_web_push_key

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
APP_URL=https://your-domain.com
```

6. Apply the database migration **before starting the updated app**:

```sh
npx drizzle-kit migrate
```

The new migration is `drizzle/0023_admin_notifications.sql`. Use the existing project's normal migration workflow if it applies migrations differently. Restart the development server, or rebuild/redeploy production after setting environment values.
7. Log into `/admin`, click **Enable notifications & sound**, and allow browser notifications. The app generates an FCM device token and saves it in the database automatically. Each admin browser/device registers its own token. The token is refreshed when an admin page mounts with notification permission already granted.
8. Click **FCM token** in the header to copy the token for Firebase Console **Messaging → create notification → Send test message**. Put the browser in the background to check the native push. Place a real order to test the persistent panel alert and beep; Firebase Console test messages do not create an order/database alert.

## Browser behavior

Use HTTPS in production (localhost is suitable for development). After each full reload, click the enable/test button to unlock sound; browser autoplay restrictions prevent reliably enabling sound automatically. Navigation between admin pages keeps the layout and audio context mounted.

Background pushes use a dedicated Firebase worker scoped to `/admin/`, leaving the existing root worker intact. Clicking a push opens `/admin/orders`. Native browser/OS notification duration and sound follow browser/OS policies; only the in-panel alerts are guaranteed to remain until dismissed. Push delivery is best effort; delivery errors are logged and invalid device tokens removed. Database alerts still work with Firebase unset or a missed push.

FCM **device tokens do not go in `.env`**. The `.env` values configure Firebase and server credentials; recipient tokens are generated in each browser and persisted in `admin_push_token`.

References:
- https://firebase.google.com/docs/cloud-messaging/web/get-started
- https://firebase.google.com/docs/cloud-messaging/web/receive-messages
- https://firebase.google.com/docs/admin/setup
