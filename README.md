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
