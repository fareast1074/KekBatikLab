# KekBatikLab — upgraded PWA + Firebase push setup

This version keeps the original PWA/system splash only (the duplicate in-page splash was removed), refreshes the launcher icons, and fixes Firebase Cloud Functions structure for deployment.

## Files

- `index.html` — app UI and mobile push setup
- `manifest.webmanifest` — PWA metadata
- `icon-192.png`, `icon-512.png` — square launcher icons
- `apple-touch-icon.png` — iOS Home Screen icon
- `favicon-32.png`, `favicon-64.png` — browser icons
- `firebase-messaging-sw.js` — FCM service worker
- `functions/index.js` — sends an admin push when a customer creates an order
- `functions/package.json` — Cloud Functions dependencies
- `firebase.json` — Hosting + Functions configuration
- `.firebaserc` — Firebase project selection

## GitHub Pages

GitHub Pages can host the front-end because FCM Web requires HTTPS. The Firebase Cloud Function is server-side and must be deployed to Firebase; GitHub Pages alone does not run it. Firebase's current Web FCM documentation requires HTTPS, a VAPID public key, and a service worker for web push.

## One-time Firebase setup

1. Firebase Console → Authentication → Sign-in method → enable **Anonymous**.
2. Firebase Console → Project Settings → Cloud Messaging → **Web Push certificates** → generate a key pair if needed.
3. Copy the **Public VAPID key**. Never put a private key in the website.
4. Make sure your GitHub Pages site is served over HTTPS.

## Deploy the Cloud Function

From the project folder:

```bash
firebase login
firebase use salestracker-1b3e2
cd functions
npm install
cd ..
firebase deploy --only functions
```

The function listens for new records at:

`/kekBatikLabApp/orders/{orderId}`

It sends notifications only when `source` is `Customer` (or missing).

## Enable notifications on the admin phone

1. Open the GitHub Pages HTTPS URL.
2. Install/add KekBatikLab to the Home Screen so it behaves like a PWA.
3. Login as Admin.
4. Open **Admin → Settings → Admin Mobile Notifications**.
5. Paste the Firebase **Public VAPID key**.
6. Tap **Enable on This Phone** and allow notifications.
7. Leave the app once enabled; put it in the background.
8. Create a customer order from another browser/device.

On iPhone/iPad, Web Push is supported for Home Screen web apps from iOS/iPadOS 16.4 and later, and permission must be requested from user interaction. Safari itself on iOS is not the same as the installed Home Screen web app for this use case.

## GitHub Pages subpath compatibility

The service worker notification click handler now builds the target URL from the service worker scope instead of `/`, so a repository site such as `https://username.github.io/KekBatikLab/` will not jump to the domain root.

## Test

After enabling notifications, the browser console logs the FCM token. Firebase Console → Messaging → test message can be used to send a test notification to that token while the app is in the background.

## Important security note

The current app still uses anonymous Firebase Authentication plus a client-side Admin password. That is not a strong server-side admin identity. For production, use real Firebase Authentication and tighter Realtime Database Security Rules / custom claims.
