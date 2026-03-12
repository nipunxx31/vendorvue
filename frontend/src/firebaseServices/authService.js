// Firebase Authentication Service
// Handles user signup, login, role assignment, and user document creation

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @param {string} role - User role: 'customer', 'vendor', or 'admin'
 * @returns {Promise<Object>} User object
 */
export const signUp = async (email, password, displayName, role = 'customer') => {
    try {
        // Create authentication user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName });

        // Create user document in Firestore with role
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName,
            role,
            uid: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return {
            uid: user.uid,
            email: user.email,
            displayName,
            role,
        };
    } catch (error) {
        console.error('Sign up error:', error);
        throw new Error(error.message);
    }
};

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object with role
 */
export const login = async (email, password) => {
    try {
        // Enable offline persistence
        await setPersistence(auth, browserLocalPersistence);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: userData?.role || 'customer',
        };
    } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.message);
    }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error(error.message);
    }
};

/**
 * Get current user with role information
 * @returns {Promise<Object|null>} Current user object or null
 */
export const getCurrentUser = async () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {
                if (user) {
                    try {
                        // Get user role from Firestore
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        const userData = userDoc.data();

                        resolve({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            role: userData?.role || 'customer',
                        });
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    resolve(null);
                }
                unsubscribe();
            },
            reject
        );
    });
};

/**
 * Watch auth state changes in real-time
 * @param {function} callback - Callback function that receives user object
 * @returns {function} Unsubscribe function
 */
export const watchAuthState = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.data();

                callback({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    role: userData?.role || 'customer',
                });
            } catch (error) {
                console.error('Error getting user data:', error);
                callback(null);
            }
        } else {
            callback(null);
        }
    });
};

/**
 * Get user role
 * @param {string} uid - User ID
 * @returns {Promise<string>} User role
 */
export const getUserRole = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.data()?.role || 'customer';
    } catch (error) {
        console.error('Error getting user role:', error);
        throw error;
    }
};

/**
 * Update user role (admin only)
 * @param {string} uid - User ID
 * @param {string} newRole - New role
 * @returns {Promise<void>}
 */
export const updateUserRole = async (uid, newRole) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            role: newRole,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

/**
 * Create vendor profile for a user
 * @param {string} uid - User ID
 * @param {Object} vendorData - Vendor data
 * @returns {Promise<string>} Vendor ID
 */
export const createVendorProfile = async (uid, vendorData) => {
    try {
        // Update user role to vendor
        await updateUserRole(uid, 'vendor');

        // Create vendor document
        const vendorDoc = {
            ...vendorData,
            ownerId: uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOpen: true,
            rating: 0,
            reviews: 0,
        };

        await setDoc(doc(db, 'vendors', uid), vendorDoc);
        return uid;
    } catch (error) {
        console.error('Error creating vendor profile:', error);
        throw error;
    }
};

/**
 * Create customer profile for a user
 * @param {string} uid - User ID
 * @param {Object} customerData - Customer data
 * @returns {Promise<string>} Customer ID
 */
export const createCustomerProfile = async (uid, customerData) => {
    try {
        const customerDoc = {
            ...customerData,
            uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wallet: 0,
            orderCount: 0,
        };

        await setDoc(doc(db, 'customers', uid), customerDoc);
        return uid;
    } catch (error) {
        console.error('Error creating customer profile:', error);
        throw error;
    }
};
