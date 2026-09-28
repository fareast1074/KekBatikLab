KekBatikLab - Admin Mobile Order Notifications
==============================================

WHAT THIS UPGRADE DOES
----------------------
1. Customer places an order in the existing Orders page.
2. The order is saved to Realtime Database at:
   /kekBatikLabApp/orders/{orderId}
3. Firebase Cloud Function notifyAdminNewOrder runs only for source = Customer.
4. The function sends a Firebase Cloud Messaging (FCM) push message to every registered Admin phone.
5. The phone shows: customer, quantity, product and requested date.
6. Tapping the notification opens KekBatikLab and prompts Admin login, then opens Orders.

FILES
-----
public/index.html               Upgraded KekBatikLab app
public/firebase-messaging-sw.js Background mobile/browser notification handler
public/manifest.webmanifest     PWA/mobile installation metadata
public/icon-192.png             Mobile/PWA icon
public/icon-512.png             Mobile/PWA icon
functions/index.js              New-order Realtime Database trigger + FCM sender
functions/package.json          Cloud Function dependencies
firebase.json                   Hosting + Functions deployment config
.firebaserc.example             Example Firebase project alias

database-rules-push-snippet.json
  Example rule fragment for the notification-device area only. Do NOT replace your
  full database rules with this small file; merge it into your existing rules.


AUTHENTICATION FIX
-------------------
The app uses Firebase Anonymous Authentication for its Realtime Database session and
push-device registration. Before testing, enable it in Firebase Console:

1. Firebase Console -> Security -> Authentication -> Sign-in method.
2. Enable the Anonymous provider and save.
3. Authentication -> Settings -> Authorized domains: make sure your live website domain
   is listed. The default Firebase Hosting domains are normally already associated with
   the project; custom domains may need to be added.
4. This package includes an auth section in firebase.json. After `firebase login` and
   selecting the project, you can deploy the auth configuration with:

   firebase deploy --only auth

The web app now waits for a real `auth.currentUser` before registering a push token and
shows a specific error when Anonymous Authentication is disabled, the domain is not
authorized, or Firebase cannot be reached.

ONE-TIME FIREBASE SETUP
-----------------------
A. Firebase Console -> Project Settings -> Cloud Messaging.
   Under Web Push certificates, create/generate a Web Push key pair if one does not exist.
   Copy the PUBLIC VAPID key.

B. Ensure Firebase Cloud Messaging API is enabled for project:
   salestracker-1b3e2

C. Cloud Functions deployment requires the Firebase project to use the Blaze plan.
   Actual light usage can remain within no-cost quotas, but billing must be attached.
   Set a billing budget/alert in Google Cloud/Firebase.

D. Deploy from this folder using Firebase CLI:

   npm install -g firebase-tools
   firebase login
   firebase use salestracker-1b3e2
   cd functions
   npm install
   cd ..
   firebase deploy --only hosting,functions

   If firebase use says there is no project alias, copy .firebaserc.example to .firebaserc
   or run:

   firebase use --add

PHONE SETUP
-----------
1. Open the deployed HTTPS KekBatikLab URL on the Admin phone.
2. Optional but recommended: add/install the site to the phone Home Screen.
3. Sign in as Admin.
4. Go to Settings -> Admin Mobile Notifications.
5. Paste the PUBLIC VAPID key from Firebase Console.
6. Tap "Enable on This Phone".
7. Allow notifications when the phone/browser asks.
8. Place a test order from Customer mode using a DIFFERENT browser/device.
9. The Admin phone should receive "New Order Received".

IMPORTANT SECURITY NOTE
-----------------------
The existing application uses anonymous Firebase Authentication plus a client-side Admin
password. That is not a strong server-side Admin identity. The included push-device rule
limits each anonymous user to its own device record, but a determined user who modifies
client code could still attempt to register a device as a notification recipient if your
other database rules are permissive.

For a public production shop, the stronger design is to replace the current Admin password
with Firebase Authentication (for example Admin email/password) and protect
/admin_push_devices with Admin-only Firebase Security Rules or custom claims.

HTTPS REQUIREMENT
-----------------
FCM web push uses service workers, so the live page must be served using HTTPS. Opening
index.html directly from file:// will not provide reliable background push notifications.

TESTING CHECKLIST
-----------------
[ ] Website is HTTPS
[ ] Cloud Messaging API enabled
[ ] VAPID public key pasted into Admin Settings
[ ] Admin phone browser permission = Allow
[ ] /kekBatikLabApp/admin_push_devices contains the Admin device entry
[ ] notifyAdminNewOrder deployed successfully
[ ] Test order source is Customer, not Admin
[ ] Phone receives notification with browser/app in background
