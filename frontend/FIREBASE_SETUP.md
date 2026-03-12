# Firebase Configuration for VendorVue

## Environment Variables

Add these to your `.env.development` and `.env.production` files:

```env
# Firebase Configuration
# Get these from Firebase Console → Project Settings → General → Your apps → Config

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

## Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project" or "Add Project"
3. Project Name: "VendorVue"
4. Follow the setup wizard

### 2. Get Configuration
1. In Firebase Console, go to: **Project Settings** (⚙️ icon)
2. Select your web app
3. Copy the config object
4. Fill in the variables from the config

### 3. Enable Firebase Services

In Firebase Console → Build:

- **Authentication** → Enable Google, Phone, Email/Password
- **Firestore Database** → Create database (Test mode for dev)
- **Realtime Database** → Create (optional)
- **Storage** → Enable (for file uploads)

### 4. Add Environment Variables

**Development** (`frontend/.env.development`):
```env
VITE_FIREBASE_API_KEY=abc123...
VITE_FIREBASE_AUTH_DOMAIN=vendorvue-dev.firebaseapp.com
# ... etc
```

**Production** (`frontend/.env.production`):
```env
VITE_FIREBASE_API_KEY=xyz789...
VITE_FIREBASE_AUTH_DOMAIN=vendorvue.firebaseapp.com
# ... etc
```

### 5. Set Firestore Rules (Security)

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write if user is authenticated
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Set Realtime Database Rules (if using)

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Usage Examples

### Authentication (in any component)

```javascript
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Login
const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Logout
const logout = () => signOut(auth);

// Get current user
auth.currentUser; // Returns user object or null
```

### Firestore Database

```javascript
import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Add document
const addOrder = async (orderData) => {
  const docRef = await addDoc(collection(db, 'orders'), orderData);
  return docRef.id;
};

// Query documents
const getVendorOrders = async (vendorId) => {
  const q = query(
    collection(db, 'orders'),
    where('vendorId', '==', vendorId)
  );
  const docs = await getDocs(q);
  return docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Storage (File Uploads)

```javascript
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload file
const uploadImage = async (file, path) => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};
```

### Realtime Database

```javascript
import { realtimeDb } from '@/config/firebase';
import { ref, set, onValue } from 'firebase/database';

// Write data
const updateStatus = async (orderId, status) => {
  await set(ref(realtimeDb, `orders/${orderId}/status`), status);
};

// Real-time listener
const watchOrderStatus = (orderId, callback) => {
  const statusRef = ref(realtimeDb, `orders/${orderId}/status`);
  onValue(statusRef, (snapshot) => {
    callback(snapshot.val());
  });
};
```

## Common Use Cases for VendorVue

### 1. Real-Time Order Notifications
- Use Realtime Database or Firestore
- Watch for order status changes
- Send push notifications

### 2. User Authentication
- Firebase Auth with phone numbers
- Replace backend auth if desired
- Sync with Vercel backend via API

### 3. Media Storage
- Store vendor images in Firebase Storage
- Menu item photos
- User avatars

### 4. User Profiles
- Store customer/vendor profiles in Firestore
- Real-time updates
- Sync with backend MongoDB

## Security Best Practices

1. **Never commit `.env` files** - Use `.gitignore`
2. **Use Firebase Rules** - Configure proper access control
3. **Validate data** - Client-side validation + backend validation
4. **Use emulator** - Test locally before production
5. **Enable anonymization** - For analytics if using
6. **Backup data** - Regular Firestore exports

## Troubleshooting

### "Firebase configuration is invalid"
- Check all env variables are set correctly
- Verify Firebase project is created

### "Permission denied" errors
- Check Firestore/Database rules
- Verify user is authenticated
- Check rule conditions

### "Failed to initialize Firebase"
- Clear browser cache and localStorage
- Check network - ensure Firebase can connect
- Verify API key is correct

## Next Steps

1. ✅ Firebase package installed
2. ⏳ Create Firebase Project in console
3. ⏳ Set environment variables
4. ⏳ Configure Firebase services
5. ⏳ Set security rules
6. ⏳ Test authentication in your app

---

**Resources:**
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)
