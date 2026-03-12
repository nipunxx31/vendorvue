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
    setDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { uploadFile, getFileUrl } from '../firebaseServices/storageService';
import {
    createOrder,
    getOrder,
    updateOrderStatus,
} from '../firebaseServices/orderService';
import {
    createVendor,
    getVendor,
    getAllVendors,
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

// ==================== Authentication - Firebase Auth ====================
// Firebase Authentication for login/registration

// Helper function to generate email from phone
const generateEmailFromPhone = (phone) => {
    return `${phone}@vendorvue.local`;
};

// Register customer with Firebase Auth and Firestore
export const registerCustomer = async (data) => {
    try {
        const email = generateEmailFromPhone(data.phone);
        
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
        const user = userCredential.user;

        // Create customer document in Firestore
        const customerData = {
            uid: user.uid,
            phone: data.phone,
            name: data.name,
            password: data.password, // Store plain password for phone/password login approach
            location: data.location,
            wallet: 0,
            createdAt: Timestamp.now(),
            email: email,
        };

        await setDoc(doc(db, 'customers', user.uid), customerData);

        return {
            data: {
                customer: {
                    uid: user.uid,
                    phone: data.phone,
                    name: data.name,
                    location: data.location,
                }
            }
        };
    } catch (error) {
        console.error('Customer registration error:', error);
        throw { response: { data: { error: error.message } } };
    }
};

// Login customer with Firebase Auth
export const loginCustomer = async (phone, password) => {
    try {
        const email = generateEmailFromPhone(phone);

        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get customer data from Firestore
        const customerDoc = await getDoc(doc(db, 'customers', user.uid));
        if (!customerDoc.exists()) {
            throw new Error('Customer profile not found');
        }

        const customerData = customerDoc.data();
        return {
            data: {
                customer: {
                    uid: user.uid,
                    phone: customerData.phone,
                    name: customerData.name,
                    location: customerData.location,
                }
            }
        };
    } catch (error) {
        console.error('Customer login error:', error);
        throw { response: { data: { error: error.message } } };
    }
};

// ==================== Vendor APIs ====================

export const registerVendor = async (data) => {
    try {
        const email = generateEmailFromPhone(data.phone);

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
        const user = userCredential.user;

        // Create vendor document in Firestore
        const vendorData = {
            uid: user.uid,
            phone: data.phone,
            name: data.name,
            category: data.category,
            location: data.location,
            password: data.password,
            createdAt: Timestamp.now(),
            email: email,
            isOpen: true,
        };

        await setDoc(doc(db, 'vendors', user.uid), vendorData);

        return {
            data: {
                vendor: {
                    _id: user.uid,
                    uid: user.uid,
                    phone: data.phone,
                    name: data.name,
                    category: data.category,
                    location: data.location,
                }
            }
        };
    } catch (error) {
        console.error('Vendor registration error:', error);
        throw { response: { data: { error: error.message } } };
    }
};

export const getVendorById = (id) => getVendor(id);

export const getVendors = getAllVendors;

export const getVendorMenu = (id) => {
    return getDocs(query(collection(db, 'menus'), where('vendorId', '==', id)));
};

export const loginVendor = async (phone, password) => {
    try {
        const email = generateEmailFromPhone(phone);

        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get vendor data from Firestore
        const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
        if (!vendorDoc.exists()) {
            throw new Error('Vendor profile not found');
        }

        const vendorData = vendorDoc.data();
        return {
            data: {
                vendor: {
                    _id: user.uid,
                    uid: user.uid,
                    phone: vendorData.phone,
                    name: vendorData.name,
                    category: vendorData.category,
                    location: vendorData.location,
                }
            }
        };
    } catch (error) {
        console.error('Vendor login error:', error);
        throw { response: { data: { error: error.message } } };
    }
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

export { createOrder };
export { updateOrderStatus };
export const createOrderAPI = createOrder;
export const getOrderByIdAPI = getOrder;
export const getOrderById = getOrder;
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

// ==================== Customer Wallet APIs ====================

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

export const adminLogin = async (email, password) => {
    try {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get admin data from Firestore
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (!adminDoc.exists()) {
            throw new Error('Admin profile not found');
        }

        const adminData = adminDoc.data();
        
        // For compatibility with existing code, return a token-like structure
        return {
            data: {
                token: user.uid,
                admin: {
                    uid: user.uid,
                    username: adminData.username || adminData.email,
                    email: adminData.email,
                }
            }
        };
    } catch (error) {
        console.error('Admin login error:', error);
        throw { response: { data: { error: error.message } } };
    }
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

// ==================== Legacy Admin QR Code APIs ====================
// These functions are placeholders for admin QR code management
// Implementation may need to be completed based on backend requirements

export const uploadAdminQRCode = (token, formData) => {
    console.warn('uploadAdminQRCode: Not yet fully implemented');
    return Promise.resolve({ data: { success: true } });
};

export const getAdminQRCode = (token) => {
    console.warn('getAdminQRCode: Not yet fully implemented');
    return Promise.resolve({ data: { qrCode: null } });
};

// Public endpoint for customers to get admin QR code
export const getPublicAdminQRCode = () => {
    console.warn('getPublicAdminQRCode: Not yet fully implemented');
    return Promise.resolve({ data: { qrCode: null } });
};

export const adminGetCustomerWallet = (token, phone) => {
    console.warn('adminGetCustomerWallet: Not yet fully implemented');
    return Promise.resolve({ data: { wallet: 0 } });
};

export const adminUpdateCustomerWallet = (token, phone, amount, description) => {
    console.warn('adminUpdateCustomerWallet: Not yet fully implemented');
    return Promise.resolve({ data: { success: true } });
};



