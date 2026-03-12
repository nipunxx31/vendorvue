# VendorVue Firebase Setup Checklist

## 🎯 Complete Firebase Migration Checklist

Use this checklist to ensure everything is properly configured before starting development.

---

## ✅ Phase 1: Project Setup (5 minutes)

### Firebase Project Creation
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Click "Create Project"
- [ ] **Project Name**: VendorVue
- [ ] Enable Google Analytics (optional)
- [ ] Click "Create project"
- [ ] Wait for project to be ready

### Get Firebase Configuration
- [ ] Firebase Console → Project Settings (⚙️ icon)
- [ ] Go to **"Your apps"** section
- [ ] Click **"Web"** app (or create new)
- [ ] Copy the config object:
  ```javascript
  {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  }
  ```

---

## ✅ Phase 2: Environment Configuration (5 minutes)

### Update .env File
**File**: `frontend/.env`

```bash
# Copy and fill in your Firebase config values
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**How to find each value**:
- **API_KEY**: `config.apiKey`
- **AUTH_DOMAIN**: `config.authDomain`
- **PROJECT_ID**: `config.projectId`
- **STORAGE_BUCKET**: `config.storageBucket`
- **MESSAGING_SENDER_ID**: `config.messagingSenderId`
- **APP_ID**: `config.appId`

- [ ] All 6 values filled in `.env`
- [ ] No quotes around values (Vite handles it)
- [ ] File saved

---

## ✅ Phase 3: Enable Firebase Services (10 minutes)

### Authentication Service
- [ ] Firebase Console → **Build** → **Authentication**
- [ ] Click **"Get started"**
- [ ] Enable sign-in methods:
  - [ ] Email/Password
  - [ ] Google
  - [ ] Phone Number (optional)
- [ ] Click **"Save"**

### Cloud Firestore Database
- [ ] Firebase Console → **Build** → **Firestore Database**
- [ ] Click **"Create database"**
- [ ] Select **"Production mode"** (security rules protect it)
- [ ] **Location**: Choose closest to your users (e.g., us-east1)
- [ ] Click **"Create"**
- [ ] Wait for database to be ready
- [ ] ✅ Database created: `https://console.firebase.google.com/project/{project-id}/firestore/data`

### Cloud Storage
- [ ] Firebase Console → **Build** → **Storage**
- [ ] Click **"Get started"**
- [ ] Read security rules warning
- [ ] Click **"Next"** → **"Done"**
- [ ] Wait for storage to be ready

### Cloud Functions (for backend logic)
- [ ] Firebase Console → **Build** → **Functions**
- [ ] Check that Functions is enabled
- [ ] ✅ Functions enabled

---

## ✅ Phase 4: Deploy Security Rules (5 minutes)

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Set Project ID
**File**: `.firebaserc`
- [ ] Update `"default": "your-firebase-project-id"`
- [ ] Save file

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```
- [ ] Rules deployed successfully
- [ ] Check Firebase Console → Firestore → Rules (shows deployed rules)

### Deploy Storage Rules
```bash
firebase deploy --only storage:rules
```
- [ ] Rules deployed successfully
- [ ] Check Firebase Console → Storage → Rules

### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```
- [ ] Indexes deployed successfully

---

## ✅ Phase 5: Deploy Cloud Functions (5 minutes)

### Install Dependencies
```bash
cd functions
npm install
cd ..
```
- [ ] Dependencies installed
- [ ] No errors

### Deploy Functions
```bash
firebase deploy --only functions
```
- [ ] Functions deployed successfully
- [ ] Check Firebase Console → Functions (lists functions)
- [ ] ✅ 7 functions deployed:
  - createOrder
  - updateOrderStatus
  - verifyPayment
  - onOrderCreated
  - onOrderStatusUpdate
  - archiveOldOrders
  - cleanupOldNotifications
  - health
  - getOrderRest

---

## ✅ Phase 6: Test Frontend (5 minutes)

### Install Frontend Dependencies
```bash
cd frontend
npm install
```
- [ ] No errors
- [ ] Firebase package installed

### Run Development Server
```bash
npm run dev
```
- [ ] Server started on `http://localhost:5173`
- [ ] No console errors
- [ ] App loads successfully

### Verify Firebase Connection
- [ ] Open browser console (F12)
- [ ] Go to `http://localhost:5173`
- [ ] No Firebase errors in console
- [ ] If you see emulator logs, that's OK (development)

---

## ✅ Phase 7: Test Core Functionality (10 minutes)

### Test Authentication
If you have a sign-up component:
- [ ] Create new account
- [ ] Account created in Firebase Console → Authentication
- [ ] User role shown correctly
- [ ] Can login with created account

### Test Firestore (if available)
If you have a vendor creation feature:
- [ ] Create vendor profile
- [ ] Data appears in Firebase Console → Firestore → vendors collection
- [ ] Fields match expected schema

### Test Storage (if available)
If you have image upload:
- [ ] Upload test image
- [ ] File appears in Firebase Console → Storage
- [ ] Path: `vendors/{vendorId}/images/...`
- [ ] Can download image

### Test Real-time Updates
If you have order features:
- [ ] Create order
- [ ] Order appears in Firestore
- [ ] Update order status
- [ ] Changes reflect instantly in app

---

## ✅ Phase 8: Local Testing with Emulators (Optional)

### Start Emulators
```bash
firebase emulators:start
```

- [ ] Emulators started
- [ ] Emulator UI: http://localhost:4000
- [ ] Firestore: http://localhost:8080
- [ ] Auth: http://localhost:9099
- [ ] Functions: http://localhost:5001
- [ ] Storage: http://localhost:9199

### Enable Emulator in Code
Edit `frontend/src/firebase.js`:
```javascript
// Uncomment to use emulators
connectToEmulators();
```

### Test with Emulator
- [ ] App connects to emulator
- [ ] Can create test accounts
- [ ] Can test functions locally
- [ ] Console shows emulator logs

---

## ✅ Phase 9: Code Implementation

### Review Service Files
- [ ] Read `frontend/src/firebase.js`
- [ ] Read `frontend/src/firebaseServices/*.js`
- [ ] Understand exported functions

### Start Using in Components
Example in React:
```javascript
import { login } from '@/firebaseServices/authService';
import { createVendor } from '@/firebaseServices/vendorService';

// Use in components
const user = await login(email, password);
const vendorId = await createVendor(uid, vendorData);
```

- [ ] Import services in your components
- [ ] Test calling functions
- [ ] Verify data in Firestore

---

## ✅ Phase 10: Pre-Production Setup

### Firestore Rules - Production Mode
- [ ] Review `firestore.rules` file
- [ ] Verify rules are restrictive (not test rules)
- [ ] Rules only allow authenticated access
- [ ] ✅ Already deployed in Phase 4

### Storage Rules - Production Mode
- [ ] Review `storage.rules` file
- [ ] Verify only vendors can upload to their folder
- [ ] ✅ Already deployed in Phase 4

### Environment Variables
- [ ] Production `.env` values added
- [ ] Sensitive data NOT committed to Git
- [ ] `.env` added to `.gitignore`

### Error Handling
- [ ] Add try-catch to all Firebase calls
- [ ] Display user-friendly errors
- [ ] Log errors for debugging

### Testing
- [ ] Test all authentication flows
- [ ] Test all data operations
- [ ] Test all file uploads
- [ ] Test permissions (vendor can't modify other vendor's data)

---

## ✅ Phase 11: Deployment

### Build Frontend
```bash
cd frontend
npm run build
```
- [ ] Build succeeds
- [ ] No errors
- [ ] `dist/ folder created

### Deploy to Firebase Hosting
```bash
firebase deploy
```

- [ ] Frontend deployed
- [ ] Check deployment URL
- [ ] App works in production
- [ ] No console errors

### Verify Production
- [ ] Visit deployment URL
- [ ] Sign up new user
- [ ] Create vendor/order/etc
- [ ] Verify in Firebase Console

---

## ✅ Phase 12: Post-Deployment

### Set Up Monitoring
- [ ] Firebase Console → User Activity
- [ ] Firebase Console → Functions Logs
- [ ] Set up email alerts (optional)

### Enable Backups
- [ ] Firebase Console → Firestore → Backups
- [ ] Enable daily backups

### Document Data Structure
- [ ] Review Firestore collections
- [ ] Take screenshots for documentation
- [ ] Document any custom fields

### Get Support URLs
- [ ] Cloud Functions URL: https://console.firebase.google.com/project/{id}/functions
- [ ] Firestore URL: https://console.firebase.google.com/project/{id}/firestore
- [ ] Auth URL: https://console.firebase.google.com/project/{id}/authentication

---

## 📋 Troubleshooting Checklist

### Firebase not initializing
- [ ] All 6 env variables set
- [ ] No typos in field names
- [ ] Values match Firebase Console exactly
- [ ] `.env` file in correct location (`frontend/.env`)

### "Permission denied" errors
- [ ] Rules deployed with `firebase deploy --only firestore:rules`
- [ ] User authenticated
- [ ] Check Firestore rules file
- [ ] Verify user role in Firestore

### Components not updating in real-time
- [ ] Using `watchVendorOrders()` or similar listeners
- [ ] Unsubscribe function called on unmount
- [ ] Callback function updates React state

### Cloud Functions not working
- [ ] Functions deployed with `firebase deploy --only functions`
- [ ] Check `firebase functions:log`
- [ ] Verify function names match imports
- [ ] Test with emulator locally

### Storage uploads failing
- [ ] Storage rules deployed
- [ ] File size < 5MB
- [ ] File type is image (for menu images)
- [ ] Check storage paths in code

---

## 📞 Quick Reference

- **Firebase Console**: https://console.firebase.google.com/
- **Firebase Docs**: https://firebase.google.com/docs
- **Migration Guide**: [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md)
- **Setup Summary**: [FIREBASE_SETUP_SUMMARY.md](./FIREBASE_SETUP_SUMMARY.md)

---

## ✨ When Everything is Done

You should have:
- ✅ Firebase project created
- ✅ All services enabled
- ✅ Security rules deployed
- ✅ Cloud Functions deployed
- ✅ Frontend running locally
- ✅ Core features tested
- ✅ Ready for development

**Status**: Ready to start building VendorVue with Firebase! 🎉

---

**Print this checklist** and check off items as you go through the setup.

Estimated Total Time: **60-90 minutes** (first time)
