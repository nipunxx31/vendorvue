// Firebase API Service
// This module provides Firebase-based API calls replacing the old Express backend
// All data operations are now handled through Firebase Firestore and Storage

import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    addDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { uploadFile, getFileUrl } from '../firebaseServices/storageService';
import {
    createOrder,
    getOrderById,
    getCustomerOrders,
    updateOrderStatus,
} from '../firebaseServices/orderService';
import {
    createVendor,
    getVendor,
    getVendors,
    updateVendor,
    deleteVendor,
} from '../firebaseServices/vendorService';
import {
    sendSupportMessage,
    getMySupportMessages,
    adminGetConversations,
    adminGetThreadMessages,
    adminReplySupport,
} from '../firebaseServices/supportService';

// ==================== Image URL Utilities ====================

export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('gs://')) return imagePath;
    return imagePath;
};

// ==================== Authentication - Handled by Firebase Auth ====================
// Use Firebase Authentication directly for login/registration
// See: authService.js for auth operations

// ==================== Vendor APIs ====================

export const registerVendor = (data) => {
    // Use Firebase Auth for registration, then create vendor document
    return createVendor(data.vendorId || data.uid, data);
};

export const getVendorById = (id) => getVendor(id);

export const getVendorMenu = (id) => {
    return getDocs(query(collection(db, 'menus'), where('vendorId', '==', id)));
};

export const loginVendor = (phone, password) => {
    // Use Firebase Auth for login verification
    console.warn('Use Firebase Authentication service for vendor login');
    return Promise.resolve(); // Handled by authService
};

// ==================== Menu APIs ====================

export const getMenuItems = (vendorId) => {
    return getDocs(query(collection(db, 'menus'), where('vendorId', '==', vendorId)));
};

export const addMenuItem = (data) => {
    return addDoc(collection(db, 'menus'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
};

export const toggleStock = (id) => {
    const menuRef = doc(db, 'menus', id);
    return getDoc(menuRef).then((snap) => {
        if (snap.exists()) {
            return updateDoc(menuRef, {
                isAvailable: !snap.data().isAvailable,
                updatedAt: Timestamp.now(),
            });
        }
    });
};

export const deleteMenuItem = (id) => deleteDoc(doc(db, 'menus', id));

// ==================== Order APIs ====================

export const createOrderAPI = createOrder;
export const getOrderByIdAPI = getOrderById;
export const getOrderByNumber = (number) => {
    return getDocs(
        query(collection(db, 'orders'), where('orderNumber', '==', number))
    );
};
export const getVendorOrders = (vendorId, status) => {
    if (status) {
        return getDocs(
            query(collection(db, 'orders'), where('vendorId', '==', vendorId), where('status', '==', status))
        );
    }
    return getDocs(query(collection(db, 'orders'), where('vendorId', '==', vendorId)));
};
export const getVendorStats = (vendorId) => {
    return getDocs(query(collection(db, 'orders'), where('vendorId', '==', vendorId)));
};
export const updateOrderStatusAPI = updateOrderStatus;

export const verifyOTP = (id, otp) => {
    const orderRef = doc(db, 'orders', id);
    return getDoc(orderRef).then((snap) => {
        if (snap.exists() && snap.data().verificationOTP === otp) {
            return updateDoc(orderRef, {
                verificationOTPVerified: true,
                updatedAt: Timestamp.now(),
            });
        }
    });
};

export const submitRating = (id, rating, ratingComment) => {
    return updateDoc(doc(db, 'orders', id), {
        rating,
        ratingComment,
        updatedAt: Timestamp.now(),
    });
};

// ==================== Customer APIs ====================

export const registerCustomer = (data) => {
    // Use Firebase Auth for registration
    return addDoc(collection(db, 'customers'), {
        ...data,
        createdAt: Timestamp.now(),
    });
};

export const loginCustomer = (phone, password) => {
    // Use Firebase Auth for login
    console.warn('Use Firebase Authentication service for customer login');
    return Promise.resolve();
};

export const getCustomerWallet = (phone) => {
    return getDocs(query(collection(db, 'customers'), where('phone', '==', phone))).then((snap) => {
        if (snap.docs.length > 0) {
            return { data: { wallet: snap.docs[0].data().wallet || 0 } };
        }
        return { data: { wallet: 0 } };
    });
};

export const addToWallet = (phone, amount, transactionId) => {
    return getDocs(query(collection(db, 'customers'), where('phone', '==', phone))).then((snap) => {
        if (snap.docs.length > 0) {
            const docRef = snap.docs[0].ref;
            const currentWallet = snap.docs[0].data().wallet || 0;
            return updateDoc(docRef, {
                wallet: currentWallet + amount,
                lastWalletUpdate: Timestamp.now(),
            });
        }
    });
};

export const getCustomerOrders = (phone) => {
    return getDocs(query(collection(db, 'orders'), where('customerPhone', '==', phone)));
};

export const updateCustomerLocation = (phone, location) => {
    return getDocs(query(collection(db, 'customers'), where('phone', '==', phone))).then((snap) => {
        if (snap.docs.length > 0) {
            return updateDoc(snap.docs[0].ref, {
                location,
                updatedAt: Timestamp.now(),
            });
        }
    });
};

// ==================== Vendor Profile APIs ====================

export const updateVendorLocation = (id, location) => {
    return updateVendor(id, { location, updatedAt: Timestamp.now() });
};

export const updateVendorProfile = (id, data) => {
    return updateVendor(id, { ...data, updatedAt: Timestamp.now() });
};

export const updateVendorWaitingTime = (id, waitingTime) => {
    return updateVendor(id, { waitingTime, updatedAt: Timestamp.now() });
};

export const updateVendorIsOpen = (id, isOpen) => {
    return updateVendor(id, { isOpen, updatedAt: Timestamp.now() });
};

// ==================== File Upload APIs ====================

export const uploadVendorImage = (id, formData) => {
    const file = formData.get('image');
    if (!file) return Promise.reject(new Error('No file provided'));
    return uploadFile(`vendors/${id}`, file).then((url) => {
        return updateVendor(id, { imageUrl: url });
    });
};

export const uploadVendorQRCode = (id, formData) => {
    const file = formData.get('qrcode');
    if (!file) return Promise.reject(new Error('No file provided'));
    return uploadFile(`vendors/${id}/qrcodes`, file);
};

export const uploadMenuItemImage = (id, formData) => {
    const file = formData.get('image');
    if (!file) return Promise.reject(new Error('No file provided'));
    return uploadFile(`menus/${id}`, file).then((url) => {
        return updateDoc(doc(db, 'menus', id), { imageUrl: url });
    });
};

// ==================== Admin APIs ====================

export const adminLogin = (username, password) => {
    // Use Firebase Auth with custom claims for admin role
    console.warn('Use Firebase Authentication service for admin login');
    return Promise.resolve();
};

export const adminGetVendors = (token) => {
    return getDocs(collection(db, 'vendors'));
};

export const adminGetCustomers = (token) => {
    return getDocs(collection(db, 'customers'));
};

export const adminDeleteVendor = (token, id) => deleteVendor(id);

export const adminDeleteCustomer = (token, id) => {
    return deleteDoc(doc(db, 'customers', id));
};

// ==================== Support APIs ====================

export const sendSupportMessageAPI = sendSupportMessage;
export const getMySupportMessagesAPI = getMySupportMessages;
export { adminGetConversations, adminGetThreadMessages, adminReplySupport } from '../firebaseServices/supportService';

// ==================== Utility Functions ====================

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const getGoogleMapsDirectionsUrl = (lat1, lon1, lat2, lon2) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${lat1},${lon1}&destination=${lat2},${lon2}`;
};

// Re-export commonly used functions for backward compatibility
export {
    createOrder,
    getOrderById,
    getCustomerOrders,
    updateOrderStatus,
    getVendors,
    getVendor,
    updateVendor,
    deleteVendor,
};


export const uploadAdminQRCode = (token, formData) =>
  adminApi.post('/qrcode', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });

export const getAdminQRCode = (token) =>
  adminApi.get('/qrcode', { headers: { Authorization: `Bearer ${token}` } });

// Public endpoint for customers to get admin QR code
export const getPublicAdminQRCode = () => api.get('/admin/qrcode/public');

export const adminGetCustomerWallet = (token, phone) =>
  adminApi.get(`/customers/${phone}/wallet`, { headers: { Authorization: `Bearer ${token}` } });

export const adminUpdateCustomerWallet = (token, phone, amount, description) =>
  adminApi.patch(`/customers/${phone}/wallet`, { amount, description }, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Support Message APIs
export const sendSupportMessage = (message, senderType, senderId, senderPhone) =>
  api.post('/support/message', { message, senderType, senderId, senderPhone });

export const getMySupportMessages = (senderType, senderId) =>
  api.get(`/support/messages/${senderType}/${senderId}`);

export const adminGetConversations = (token) =>
  adminApi.get('/support/conversations', { headers: { Authorization: `Bearer ${token}` } });

export const adminGetThreadMessages = (token, threadId) =>
  adminApi.get(`/support/messages/${threadId}`, { headers: { Authorization: `Bearer ${token}` } });

export const adminReplySupport = (token, threadId, message) =>
  adminApi.post('/support/reply', { threadId, message }, { headers: { Authorization: `Bearer ${token}` } });

// Utility function for Haversine distance calculation
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Google Maps directions URL helper
export const getGoogleMapsDirectionsUrl = (lat, lng, address) => {
  if (address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

export default api;

