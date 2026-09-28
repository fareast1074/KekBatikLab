KekBatikLab — Firebase Push Notification FIX
=============================================

This package fixes the project structure and the Firebase Cloud Messaging setup.
The previous ZIP had `public/` and `functions/` referenced by firebase.json but the
files were sitting in the project root, so Hosting/Cloud Functions could not be
deployed from that package as configured.

FINAL STRUCTURE
---------------
public/index.html
public/firebase-messaging-sw.js
public/manifest.webmanifest
public/icon-192.png
public/icon-512.png
functions/index.js
functions/package.json
firebase.json
.firebaserc

database-rules-push-snippet.json

ONE-TIME FIREBASE SETUP
-----------------------
1. Firebase Console → Security → Authentication → Sign-in method → Anonymous → Enable.
2. Firebase Console → Project Settings → Cloud Messaging → Web Push certificates.
   Create/generate a key pair if needed and copy the PUBLIC VAPID key.
3. Firebase Console → Cloud Messaging / APIs: make sure Firebase Cloud Messaging API
   is enabled for project salestracker-1b3e2.
4. Open the deployed site over HTTPS.

DEPLOY
------
From this project folder:

  npm install -g firebase-tools
  firebase login
  firebase use salestracker-1b3e2
  cd functions
  npm install
  cd ..
  firebase deploy --only auth,hosting,functions

PHONE
-----
1. Open the HTTPS site on the admin phone.
2. Sign in as Admin.
3. Settings → Admin Mobile Notifications.
4. Paste the PUBLIC VAPID key.
5. Tap Enable on This Phone.
6. Accept browser notification permission.
7. Keep the web app installed/opened at least once so the service worker is registered.
8. Put the browser/app in the background.
9. Place a customer order from another browser/device.

VERIFY REGISTRATION
-------------------
Realtime Database should contain:
/kekBatikLabApp/admin_push_devices/<anonymous-auth-uid>

The child must include a long `token`, `enabled: true`, and `updatedAt`.

TEST THE PHONE BEFORE TESTING ORDERS
------------------------------------
Firebase Console → Messaging → create a notification → Send test message →
enter the FCM registration token shown in the browser's local storage/app console.
The target browser must have permission granted and should be in the background.

IMPORTANT
---------
Web FCM requires HTTPS and a browser with Push API support. Firebase documents that
`firebase-messaging-sw.js` must be available at the root of the web origin and that a
VAPID public key is required by `getToken()`.

The Cloud Function listens for newly-created records at:
/kekBatikLabApp/orders/{orderId}

It only sends when `source` is `Customer` (or when source is missing, the code defaults
to Customer).

If the function deploys but does not trigger, check the Realtime Database instance
location and function region. Firebase recommends matching the function region to the
Realtime Database instance region.

SECURITY NOTE
-------------
The current app uses anonymous Firebase Auth plus a client-side Admin password. This is
not a strong server-side admin identity. For a production deployment, replace the client
password with real Firebase Authentication and restrict admin data/device registration
with stronger Security Rules / custom claims.
