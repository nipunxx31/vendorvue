# VendorVue - Complete Project Structure

## Root Directory: /vendorvue

```
vendorvue/
│
├── package.json                          # Root package configuration
├── package-lock.json                     # Root dependencies lock file
├── README.md                             # Project documentation
├── vercel.json                           # Vercel deployment configuration
│
├── api/                                  # API testing/utilities
│   └── test.js                           # API test file
│
├── backend/                              # Node.js/Express Backend Server
│   ├── package.json                      # Backend dependencies configuration
│   ├── package-lock.json                 # Backend dependencies lock file
│   ├── server.js                         # Main backend server entry point
│   ├── env.example                       # Environment variables template
│   │
│   ├── config/                           # Configuration files
│   │   └── db.js                         # Database connection configuration
│   │
│   ├── models/                           # MongoDB/Database models & schemas
│   │   ├── Admin.js                      # Admin user model
│   │   ├── Customer.js                   # Customer user model
│   │   ├── MenuItem.js                   # Menu items model (for vendors)
│   │   ├── Order.js                      # Orders model
│   │   ├── SupportMessage.js             # Support messages model
│   │   └── Vendor.js                     # Vendor user model
│   │
│   ├── controllers/                      # Business logic controllers
│   │   ├── adminController.js            # Admin operations logic
│   │   ├── customerController.js         # Customer operations logic
│   │   ├── menuController.js             # Menu management logic
│   │   ├── orderController.js            # Order processing logic
│   │   ├── paymentController.js          # Payment processing logic (Razorpay)
│   │   ├── supportController.js          # Support ticket management logic
│   │   └── vendorController.js           # Vendor operations logic
│   │
│   ├── routes/                           # API route endpoints
│   │   ├── adminRoutes.js                # Admin API routes
│   │   ├── customerRoutes.js             # Customer API routes
│   │   ├── menuRoutes.js                 # Menu API routes
│   │   ├── orderRoutes.js                # Order API routes
│   │   ├── paymentRoutes.js              # Payment API routes
│   │   ├── supportRoutes.js              # Support API routes
│   │   └── vendorRoutes.js               # Vendor API routes
│   │
│   ├── middleware/                       # Custom middleware functions
│   │   ├── adminAuth.js                  # Authentication middleware for admins
│   │   └── upload.js                     # File upload handling middleware
│   │
│   └── scripts/                          # Database scripts
│       └── seedAdmin.js                  # Script to seed initial admin user
│
├── frontend/                             # React/Vite Frontend Application
│   ├── package.json                      # Frontend dependencies configuration
│   ├── package-lock.json                 # Frontend dependencies lock file
│   ├── index.html                        # HTML entry point
│   ├── vite.config.js                    # Vite bundler configuration
│   ├── postcss.config.js                 # PostCSS configuration
│   ├── tailwind.config.js                # Tailwind CSS configuration
│   ├── capacitor.config.json             # Capacitor (mobile app) configuration
│   │
│   ├── public/                           # Static assets
│   │   ├── index.html                    # Public HTML file
│   │   ├── logo.png.23 AM                # Logo image asset
│   │   ├── LOGO_SETUP.md                 # Logo setup documentation
│   │   └── videos/                       # Video assets directory
│   │       └── README.md                 # Video documentation
│   │
│   ├── src/                              # React source code
│   │   ├── main.jsx                      # React app entry point
│   │   ├── App.jsx                       # Root React component
│   │   ├── index.css                     # Global styles
│   │   │
│   │   ├── components/                   # Reusable React components
│   │   │   ├── Logo.jsx                  # Logo component
│   │   │   ├── VideoBackground.jsx       # Video background component
│   │   │   └── RazorpayPayment.jsx       # Razorpay payment integration component
│   │   │
│   │   ├── pages/                        # Page components (route views)
│   │   │   ├── LandingPage.jsx           # Main landing page
│   │   │   │
│   │   │   ├── admin/                    # Admin user pages
│   │   │   │   ├── AdminLogin.jsx        # Admin login page
│   │   │   │   ├── AdminDashboard.jsx    # Admin dashboard/main interface
│   │   │   │   └── AdminSupport.jsx      # Admin support management page
│   │   │   │
│   │   │   ├── customer/                 # Customer user pages
│   │   │   │   ├── CustomerLogin.jsx     # Customer login page
│   │   │   │   ├── VendorDiscovery.jsx   # Browse vendors page
│   │   │   │   ├── VendorMenu.jsx        # View vendor menu page
│   │   │   │   ├── Cart.jsx              # Shopping cart page
│   │   │   │   ├── Checkout.jsx          # Checkout/payment page
│   │   │   │   ├── OrderStatus.jsx       # Track order status page
│   │   │   │   ├── OrderHistory.jsx      # View past orders page
│   │   │   │   ├── Wallet.jsx            # Customer wallet/balance page
│   │   │   │   ├── CustomerSettings.jsx  # Customer account settings page
│   │   │   │   └── CustomerSupport.jsx   # Customer support page
│   │   │   │
│   │   │   └── vendor/                   # Vendor user pages
│   │   │       ├── VendorLogin.jsx       # Vendor login page
│   │   │       ├── VendorDashboard.jsx   # Vendor dashboard/main interface
│   │   │       ├── MenuManagement.jsx    # Vendor menu items management page
│   │   │       ├── OrderManagement.jsx   # Vendor order management page
│   │   │       ├── VendorSettings.jsx    # Vendor account settings page
│   │   │       └── VendorSupport.jsx     # Vendor support page
│   │   │
│   │   └── utils/                        # Utility functions
│   │       ├── api.js                    # API call utilities and axios configuration
│   │       └── cart.js                   # Shopping cart logic utilities
│   │
│   └── android/                          # Capacitor Android native build
│       ├── build.gradle                  # Gradle build file
│       ├── settings.gradle               # Gradle settings
│       ├── gradle.properties             # Gradle properties
│       ├── capacitor.settings.gradle     # Capacitor gradle settings
│       ├── variables.gradle              # Gradle variables
│       ├── gradlew                       # Gradle wrapper script
│       ├── gradlew.bat                   # Gradle wrapper batch file
│       │
│       ├── gradle/
│       │   └── wrapper/
│       │       └── gradle-wrapper.properties
│       │
│       └── app/                          # Android application
│           ├── build.gradle              # App gradle configuration
│           ├── capacitor.build.gradle    # Capacitor build config
│           ├── proguard-rules.pro        # ProGuard obfuscation rules
│           └── src/
│               ├── androidTest/          # Android unit tests
│               │   └── java/com/...
│               ├── main/
│               │   ├── AndroidManifest.xml  # Android app manifest
│               │   ├── java/com/...        # Java source code
│               │   └── res/                # Android resources
│               │       ├── drawable/       # Drawable resources
│               │       ├── drawable-land-hdpi/    # Landscape screens
│               │       ├── drawable-land-mdpi/
│               │       ├── drawable-land-xhdpi/
│               │       ├── drawable-land-xxhdpi/
│               │       ├── drawable-land-xxxhdpi/
│               │       ├── drawable-port-hdpi/    # Portrait screens
│               │       ├── drawable-port-mdpi/
│               │       └── ...
│               └── test/                 # Android tests
│                   └── java/com/...
```

---

## PROJECT OVERVIEW

### **Root Config Files**
- `package.json` - Root workspace configuration
- `vercel.json` - Deployment settings for Vercel hosting
- `README.md` - Project documentation

---

## **BACKEND (Node.js/Express) - `/backend`**

### Purpose
RESTful API server handling all business logic, database operations, and authentication.

### **Models (Database Schemas)**
- `Admin.js` - Admin user with management permissions
- `Customer.js` - Customer user with cart and order history
- `Vendor.js` - Vendor user with menu items and order management
- `MenuItem.js` - Food/service items created by vendors
- `Order.js` - Customer orders with status tracking
- `SupportMessage.js` - Support tickets/messages

### **Controllers (Business Logic)**
- `adminController.js` - Admin user management and system operations
- `customerController.js` - Customer profile, preferences, operations
- `vendorController.js` - Vendor profile, business operations
- `menuController.js` - CRUD operations for menu items
- `orderController.js` - Order creation, updates, status management
- `paymentController.js` - Razorpay payment integration and processing
- `supportController.js` - Support ticket creation, management, resolution

### **Routes (API Endpoints)**
- `adminRoutes.js` - /api/admin/* endpoints
- `customerRoutes.js` - /api/customer/* endpoints
- `vendorRoutes.js` - /api/vendor/* endpoints
- `menuRoutes.js` - /api/menu/* endpoints
- `orderRoutes.js` - /api/order/* endpoints
- `paymentRoutes.js` - /api/payment/* endpoints
- `supportRoutes.js` - /api/support/* endpoints

### **Middleware**
- `adminAuth.js` - JWT authentication and admin verification
- `upload.js` - Multer file upload handling for images/documents

### **Configuration**
- `db.js` - MongoDB connection setup
- `env.example` - Template for environment variables (.env)

### **Other**
- `server.js` - Express server initialization and start
- `scripts/seedAdmin.js` - Database seed script for initial admin user

---

## **FRONTEND (React/Vite) - `/frontend`**

### Purpose
Mobile-responsive web and native app interface for Admins, Customers, and Vendors.

### **Configuration Files**
- `vite.config.js` - Vite build tool configuration
- `tailwind.config.js` - Tailwind CSS customization
- `postcss.config.js` - PostCSS processing
- `capacitor.config.json` - Mobile app (iOS/Android) configuration

### **React Components (`/src/components`)**
- `Logo.jsx` - Logo/branding component
- `VideoBackground.jsx` - Video bg animation component
- `RazorpayPayment.jsx` - Payment integration UI component

### **Pages - Landing (`/src/pages`)**
- `LandingPage.jsx` - Main public landing page

### **Pages - Admin Module (`/src/pages/admin`)**
- `AdminLogin.jsx` - Admin authentication
- `AdminDashboard.jsx` - Admin control center
- `AdminSupport.jsx` - Support ticket management interface

### **Pages - Customer Module (`/src/pages/customer`)**
- `CustomerLogin.jsx` - Customer authentication
- `VendorDiscovery.jsx` - Search and browse vendors
- `VendorMenu.jsx` - View vendor details and menu
- `Cart.jsx` - Shopping cart management
- `Checkout.jsx` - Final purchase and payment
- `OrderStatus.jsx` - Real-time order tracking
- `OrderHistory.jsx` - Past orders view
- `Wallet.jsx` - Account balance/wallet
- `CustomerSettings.jsx` - Profile and preferences
- `CustomerSupport.jsx` - Customer support interface

### **Pages - Vendor Module (`/src/pages/vendor`)**
- `VendorLogin.jsx` - Vendor authentication
- `VendorDashboard.jsx` - Vendor business center
- `MenuManagement.jsx` - Add/edit/delete menu items
- `OrderManagement.jsx` - View and fulfill customer orders
- `VendorSettings.jsx` - Business profile and settings
- `VendorSupport.jsx` - Vendor support interface

### **Utilities (`/src/utils`)**
- `api.js` - Axios configuration and API call wrappers
- `cart.js` - Local cart state management utilities

### **Assets (`/public`)**
- `logo.png.23 AM` - Logo image
- Static videos and media files

### **Android Native (`/frontend/android`)**
- Capacitor Android native build configuration
- Gradle build files and Android manifest
- Native Android resources (drawables, layouts, etc.)

---

## **API Utilities - `/api`**

### Purpose
Standalone testing utilities for API endpoints.

- `test.js` - API testing file (manual tests, postman-like calls)

---

## **PROJECT ARCHITECTURE SUMMARY**

```
Client Request Flow:
Frontend (React/Vite) → API Calls → Backend (Express/Node.js)
                                      ↓
                                   Controllers
                                      ↓
                                   Models (MongoDB)
                                      ↓
                          Returns JSON Response
                                      ↑
Frontend (React) ← Displays Data ← Backend
```

### **Key Features Mapped**

| Feature | Backend | Frontend |
|---------|---------|----------|
| Authentication | adminAuth.js, controllers | LoginPages |
| Orders | orderController.js, Order.js, orderRoutes.js | Cart.jsx, Checkout.jsx, OrderStatus.jsx |
| Menu Management | menuController.js, MenuItem.js, menuRoutes.js | MenuManagement.jsx, VendorMenu.jsx |
| Payments | paymentController.js, paymentRoutes.js | RazorpayPayment.jsx, Checkout.jsx |
| Support | supportController.js, SupportMessage.js, supportRoutes.js | *Support.jsx pages |
| User Profiles | adminController.js, vendorController.js, customerController.js | *Settings.jsx, *Dashboard.jsx |

---

## **Data Flow Example: New Order**

1. Customer clicks "Order" → Checkout.jsx
2. Frontend sends POST /api/order/ → orderRoutes.js
3. orderController.js validates and processes
4. Order.js model saves to MongoDB
5. orderController returns order details
6. Frontend updates OrderStatus.jsx
7. Vendor sees order in OrderManagement.jsx via orderController
8. Payment processes via paymentController.js → RazorpayPayment.jsx

---

## **Technology Stack**

**Backend:**
- Node.js
- Express.js
- MongoDB
- Razorpay (Payments)

**Frontend:**
- React
- Vite
- Tailwind CSS
- Capacitor (Mobile)

**Mobile:**
- Android via Capacitor
- Gradle build system
