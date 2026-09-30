# KekBatikLab

KekBatikLab with Firebase Hosting, Realtime Database, Authentication and Web Push notifications.

## GitHub

Upload the contents of this folder to your GitHub repository. Do not upload `node_modules/` or any Firebase service-account/private-key JSON files.

## Firebase deploy

```bash
firebase login
firebase use salestracker-1b3e2
cd functions
npm install
cd ..
firebase deploy --only hosting,functions
```

For anonymous sign-in and web push, enable Anonymous Authentication and create a Web Push VAPID key in Firebase Console.

## Project structure

- `public/` — website and Firebase Messaging service worker
- `functions/` — Cloud Function that sends an admin push notification for customer orders
- `firebase.json` — Firebase Hosting/Functions configuration
- `.firebaserc` — Firebase project selection


## Reverted UI
The app UI has been restored to the original KekBatikLab design. Push notification backend improvements are retained.

## Product order schedule

Admin > Orders > Order Capacity Settings > Product Order Schedule lets each product use one of three modes:

- **Every day** — the product can be ordered on any valid working day.
- **Specific days** — add one or more dates; customers can order that product only on those dates.
- **Closed** — the product stays unavailable until it is manually reopened.

The customer product selector updates automatically when the selected order date changes. Dates with no available products are blocked in the customer order calendar.
## Product availability calendar
The Order Calendar now shows each scheduled product and its remaining boxes for each upcoming working day. Product-specific daily limits are calculated separately; products without a custom limit use the shared daily limit. Full products are marked FULL, unlimited products show Unlimited, and customers only see orderable products in the product selector.
