MedicineCalc — rebuilt workspace

I removed previous app files and created a fresh `expo-app` skeleton for a Cockcroft–Gault calculator.

Kept files:
- medcalc-71fb2-firebase-adminsdk-fbsvc-14a7ed45c0.json (service account / admin token)

Next steps:
- In `expo-app/firebase/firebaseConfig.js` add your Firebase Web config for client use.
- Run `cd expo-app && npm install` and then `npm run start` to launch the app.

Additional setup for local-history fallback:

- Install AsyncStorage for local fallback:

```bash
cd expo-app
npx expo install @react-native-async-storage/async-storage
```

After that the app will save results locally when the user is not signed in, and sync/display Firestore history when signed in.

To enable mobile toast notifications run:

```bash
cd expo-app
npm install react-native-toast-message
```

Then restart the app: `npx expo start -c`.

To enable the new mobile UI (bottom tabs) install navigation bottom-tabs and native deps:

```bash
cd expo-app
npx expo install @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```

If you haven't installed `react-native-toast-message` and `@react-native-async-storage/async-storage`, run:

```bash
npm install react-native-toast-message
npx expo install @react-native-async-storage/async-storage
```

After installs, restart Expo: `npx expo start -c`.

If you want, I can now:
- wire Firestore auth/storage using the existing service account (server) and web credentials (client),
- add save-to-Firestore in History and Profile.
