# VendorVue Firebase Migration Guide

## ✅ Setup Complete

VendorVue has been successfully converted to use Firebase as the backend. This guide explains the new architecture and how to get started.

---

## 📁 Project Structure

```
vendorvue/
├── frontend/                              # React + Vite app
│   ├── src/
│   │   ├── firebase.js                   # Firebase initialization
│   │   ├── firebaseServices/
│   │   │   ├── authService.js            # Authentication functions
│   │   │   ├── vendorService.js          # Vendor operations
│   │   │   ├── orderService.js           # Order operations
│   │   │   └── storageService.js         # File uploads
│   │   ├── components/                   # React components
│   │   └── pages/                        # Page components
│   ├── .env                              # Firebase config (needs setup)
│   ├── package.json
│   └── vite.config.js
│
├── functions/                             # Cloud Functions (backend logic)
│   ├── index.js                          # Cloud functions code
│   └── package.json
│
├── firestore.rules                        # Firestore security rules
├── storage.rules                          # Storage security rules
├── firestore.indexes.json                 # Database indexes
├── firebase.json                          # Firebase project config
├── .firebaserc                            # Firebase CLI config
└── FIREBASE_MIGRATION_GUIDE.md           # This file
```

---

## 🚀 Getting Started

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Project Name: **VendorVue**
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Scroll to "Your apps" → click **Web** app (or create new)
3. Copy the configuration object

### Step 3: Update Environment Variables

**File**: `frontend/.env`

```env
VITE_FIREBASE_API_KEY=your_api_key_from_config
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Enable Firebase Services

In Firebase Console → **Build** section, enable:

- ✅ **Authentication**
  - Enable: Google, Email/Password, Phone Number
- ✅ **Cloud Firestore**
  - Create database (Production mode)
  - Location: Choose closest to your users
- ✅ **Cloud Storage**
  - Create bucket
  - Default location recommended
- ✅ **Cloud Functions** (for backend logic)

### Step 5: Deploy Firestore Rules

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set project ID in .firebaserc file
# Update the default project ID to your Firebase project ID

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Step 6: Deploy Storage Rules

```bash
firebase deploy --only storage:rules
```

### Step 7: Deploy Cloud Functions

```bash
# Install dependencies
cd functions
npm install

# Deploy functions
firebase deploy --only functions
```

### Step 8: Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173 (Vite)
```

---

## 🔐 Firestore Security Rules

The project includes role-based access control:

### Roles:
- **admin** - Full access to all data
- **vendor** - Can manage own menu items and orders
- **customer** - Can create orders and view own data

### Collections & Rules:

| Collection | Read | Write |
|-----------|------|-------|
| `users` | Self + Auth | Owner only |
| `vendors` | Public | Vendor + Admin |
| `menuItems` | Public | Vendor + Admin |
| `orders` | Owner + Vendor + Admin | Specific |
| `customers` | Self | Self + Admin |
| `supportMessages` | Related users + Admin | Creator + Admin |

---

## 📦 Firebase Services Layer

### Authentication Service (`authService.js`)

```javascript
import {
  signUp,
  login,
  logout,
  getCurrentUser,
  watchAuthState,
  getUserRole,
  createVendorProfile,
  createCustomerProfile
} from '@/firebaseServices/authService';

// Sign up new user
const user = await signUp(
  'user@example.com',
  'password123',
  'John Doe',
  'customer' // role: 'customer', 'vendor', or 'admin'
);

// Login
const user = await login('user@example.com', 'password123');

// Watch auth state changes
const unsubscribe = watchAuthState((user) => {
  if (user) {
    console.log(`Logged in as ${user.email}, role: ${user.role}`);
  } else {
    console.log('Not logged in');
  }
});
```

### Vendor Service (`vendorService.js`)

```javascript
import {
  createVendor,
  getVendor,
  getAllVendors,
  updateVendor,
  addMenuItem,
  getMenuItems,
  watchMenuItems,
  updateMenuItem,
  deleteMenuItem
} from '@/firebaseServices/vendorService';

// Create vendor profile
const vendorId = await createVendor('vendor_uid', {
  name: 'My Restaurant',
  description: 'Delicious food',
  location: { lat: 40.7128, lng: -74.0060 },
  phone: '+1234567890'
});

// Add menu item
const menuItemId = await addMenuItem('vendor_uid', {
  name: 'Burger',
  price: 9.99,
  description: 'Delicious burger',
  imageUrl: 'https://...'
});

// Watch menu items in real-time
const unsubscribe = watchMenuItems('vendor_uid', (items) => {
  console.log('Menu items updated:', items);
});
```

### Order Service (`orderService.js`)

```javascript
import {
  createOrder,
  getOrder,
  getCustomerOrders,
  getVendorOrders,
  watchCustomerOrders,
  watchVendorOrders,
  watchOrderStatus,
  updateOrderStatus,
  rateOrder,
  ORDER_STATUS
} from '@/firebaseServices/orderService';

// Create new order
const orderId = await createOrder({
  customerId: 'customer_uid',
  vendorId: 'vendor_uid',
  items: [{ name: 'Burger', price: 9.99, qty: 2 }],
  total: 19.98,
  deliveryAddress: '123 Main St'
});

// Update order status
await updateOrderStatus(orderId, ORDER_STATUS.PREPARING);

// Watch order status changes
const unsubscribe = watchOrderStatus(orderId, (order) => {
  console.log(`Order status: ${order.status}`);
});

// Rate order
await rateOrder(orderId, 5, 'Great food!');
```

### Storage Service (`storageService.js`)

```javascript
import {
  uploadMenuImage,
  uploadVendorImage,
  uploadAvatar,
  deleteFile
} from '@/firebaseServices/storageService';

// Upload menu item image
const imageUrl = await uploadMenuImage('vendor_uid', 'menu_item_id', file);

// Upload vendor image
const brandImage = await uploadVendorImage('vendor_uid', file);

// Upload customer avatar
const avatarUrl = await uploadAvatar('customer_uid', file);
```

---

## ☁️ Cloud Functions

### Callable Functions

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Create order through Cloud Function
const createOrder = httpsCallable(functions, 'createOrder');
const result = await createOrder({
  vendorId: 'vendor_uid',
  items: [...],
  total: 100,
  deliveryAddress: '...'
});

// Update order status
const updateOrderStatus = httpsCallable(functions, 'updateOrderStatus');
await updateOrderStatus({
  orderId: 'order_id',
  newStatus: 'preparing'
});

// Verify payment
const verifyPayment = httpsCallable(functions, 'verifyPayment');
await verifyPayment({
  orderId: 'order_id',
  paymentId: 'pay_123456',
  signature: 'signature_...'
});
```

### Automatic Triggers

1. **onOrderCreated** - Notifies vendor when order is placed
2. **onOrderStatusUpdate** - Notifies customer when status changes
3. **archiveOldOrders** - Daily cleanup of old completed orders
4. **cleanupOldNotifications** - Removes notifications older than 30 days

---

## 📱 Using in React Components

### Example: Vendor Dashboard

```javascript
import { useEffect, useState } from 'react';
import { watchVendorOrders } from '@/firebaseServices/orderService';
import { authUtils } from '@/firebaseServices/authService';

export function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Watch auth state
    const unsubAuth = authUtils.watchAuthState((currentUser) => {
      setUser(currentUser);
    });

    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'vendor') return;

    // Watch vendor orders
    const unsubOrders = watchVendorOrders(user.uid, (orders) => {
      setOrders(orders);
    });

    return unsubOrders;
  }, [user]);

  return (
    <div>
      <h1>My Orders ({orders.length})</h1>
      {orders.map((order) => (
        <div key={order.id}>
          <p>Order #{order.id.slice(0, 8)}</p>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example: Customer Order Creation

```javascript
import { useState } from 'react';
import { createOrder } from '@/firebaseServices/orderService';

export function Checkout({ vendorId, items, total }) {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const id = await createOrder({
        customerId: auth.currentUser.uid,
        vendorId,
        items,
        total,
        deliveryAddress: '123 Main St'
      });
      setOrderId(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {orderId ? (
        <p>✓ Order placed! ID: {orderId}</p>
      ) : (
        <button onClick={handlePlaceOrder} disabled={loading}>
          {loading ? 'Placing...' : 'Place Order'}
        </button>
      )}
    </div>
  );
}
```

---

## 📊 Firestore Database Structure

### Users Collection
```
users/
  {userId}/
    - email: string
    - displayName: string
    - role: 'admin' | 'vendor' | 'customer'
    - createdAt: timestamp
    - updatedAt: timestamp
```

### Vendors Collection
```
vendors/
  {vendorId}/                    # Same as ownerId (auth user)
    - name: string
    - description: string
    - ownerId: string
    - location: { lat, lng }
    - phone: string
    - isOpen: boolean
    - rating: number
    - totalReviews: number
    - createdAt: timestamp
    - updatedAt: timestamp
```

### Menu Items Collection
```
menuItems/
  {menuItemId}/
    - vendorId: string          # Reference to vendor
    - name: string
    - price: number
    - description: string
    - imageUrl: string
    - available: boolean
    - createdAt: timestamp
    - updatedAt: timestamp
```

### Orders Collection
```
orders/
  {orderId}/
    - customerId: string        # Reference to customer
    - vendorId: string          # Reference to vendor
    - items: array
      - id: string
      - name: string
      - price: number
      - quantity: number
    - total: number
    - status: string            # pending, confirmed, preparing, ready, delivered, cancelled
    - deliveryAddress: string
    - rating: number            # 1-5 (optional)
    - ratingComment: string     # (optional)
    - paymentId: string         # Razorpay ID
    - createdAt: timestamp
    - updatedAt: timestamp
```

### Customers Collection
```
customers/
  {customerId}/
    - uid: string               # References auth user
    - name: string
    - email: string
    - phone: string
    - wallet: number            # Account balance
    - orderCount: number
    - createdAt: timestamp
    - updatedAt: timestamp
```

---

## 🔄 Migration from Express Backend

### Changes Made:

| Item | Express | Firebase |
|------|---------|----------|
| User Auth | Custom + JWT | Firebase Auth |
| Database | MongoDB | Firestore |
| File Storage | Local/S3 | Firebase Storage |
| API Calls | `/api/...` | Firestore queries |
| Backend Logic | Express routes | Cloud Functions |
| Real-time data | Polling/WebSockets | Firestore listeners |
| Role control | Custom middleware | Firestore rules |

### How to Replace API Calls:

**Before (Express):**
```javascript
import axios from 'axios';

const vendors = await axios.get('/api/vendors');
await axios.post('/api/orders', orderData);
```

**After (Firebase):**
```javascript
import { getAllVendors, createOrder } from '@/firebaseServices';

const vendors = await getAllVendors();
await createOrder(orderData);
```

---

## 🧪 Testing & Development

### Local Emulator Suite

```bash
# Start Firebase Emulators
firebase emulators:start

# This starts:
# - Firestore: localhost:8080
# - Auth: localhost:9099
# - Storage: localhost:9199
# - Functions: localhost:5001
# - UI: localhost:4000 (web interface)
```

### Enable Emulator in Frontend

Uncomment in `frontend/src/firebase.js`:

```javascript
// connectToEmulators(); // Uncomment to use emulators
```

---

## 📈 Scaling & Performance

### Firestore Limits:
- Read/Write: 50,000 per second (per account)
- Storage: 1GB free, then $0.06/GB
- Real-time listeners: Unlimited

### Optimization:

1. **Use Composite Indexes**
   - `firestore.indexes.json` has predefined indexes
   - Deploy: `firebase deploy --only firestore:indexes`

2. **Pagination**
   ```javascript
   // Use limit() for queries
   const q = query(collection(db, 'orders'), limit(25));
   ```

3. **Caching**
   - Firestore SDK auto-caches locally

4. **Batch Operations**
   ```javascript
   const batch = writeBatch(db);
   batch.set(ref1, data1);
   batch.update(ref2, data2);
   await batch.commit();
   ```

---

## 🐛 Debugging

### Check Firestore Data:
1. Firebase Console → Firestore Database
2. View collections and documents

### Check Logs:
```bash
# Cloud Functions logs
firebase functions:log

# Local emulator logs appear in terminal
firebase emulators:start
```

### Check Auth Users:
1. Firebase Console → Authentication
2. View all users and sign-in methods

---

## 🚀 Deployment

### Deploy Everything:
```bash
firebase deploy
```

### Deploy Specific:
```bash
firebase deploy --only hosting          # Frontend
firebase deploy --only functions        # Cloud Functions
firebase deploy --only firestore:rules  # Firestore Rules
firebase deploy --only storage:rules    # Storage Rules
firebase deploy --only firestore:indexes # Indexes
```

### Production Checklist:
- [ ] Firestore rules are restrictive (not test rules)
- [ ] Storage rules are set correctly
- [ ] Cloud Functions are tested
- [ ] Environment variables set correctly
- [ ] Database backups enabled
- [ ] Monitoring & alerts configured

---

## 📚 Documentation & Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Firestore Guide**: https://firebase.google.com/docs/firestore
- **Authentication**: https://firebase.google.com/docs/auth
- **Cloud Functions**: https://firebase.google.com/docs/functions
- **Storage**: https://firebase.google.com/docs/storage

---

## ✨ Next Steps

1. ✅ Create Firebase project
2. ✅ Get Firebase config
3. ✅ Fill in `.env` file
4. ✅ Enable Firebase services
5. ✅ Deploy Firestore & Storage rules
6. ✅ Deploy Cloud Functions
7. ✅ Test in local development
8. ✅ Deploy to production

---

**Status**: ✅ Ready for Development

Your VendorVue Firebase backend is ready to use!
