// Firebase Vendor Service
// Handles vendor operations: create vendor, menu items, and vendor profile updates

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create a new vendor
 * @param {string} vendorId - Vendor ID (same as user ID)
 * @param {Object} vendorData - Vendor data
 * @returns {Promise<Object>} Vendor data with ID
 */
export const createVendor = async (vendorId, vendorData) => {
    try {
        const vendor = {
            ...vendorData,
            ownerId: vendorId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isOpen: true,
            rating: 0,
            totalReviews: 0,
            waitingTime: 0,
        };

        await setDoc(doc(db, 'vendors', vendorId), vendor);

        return {
            id: vendorId,
            ...vendor,
        };
    } catch (error) {
        console.error('Error creating vendor:', error);
        throw error;
    }
};

/**
 * Get vendor by ID
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Vendor data
 */
export const getVendor = async (vendorId) => {
    try {
        const vendorDoc = await getDoc(doc(db, 'vendors', vendorId));

        if (vendorDoc.exists()) {
            return {
                id: vendorDoc.id,
                ...vendorDoc.data(),
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting vendor:', error);
        throw error;
    }
};

/**
 * Get all vendors
 * @returns {Promise<Array>} Array of vendors
 */
export const getAllVendors = async () => {
    try {
        const vendorsCollection = collection(db, 'vendors');
        const snapshot = await getDocs(vendorsCollection);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting all vendors:', error);
        throw error;
    }
};

/**
 * Get open vendors only
 * @returns {Promise<Array>} Array of open vendors
 */
export const getOpenVendors = async () => {
    try {
        const q = query(collection(db, 'vendors'), where('isOpen', '==', true));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting open vendors:', error);
        throw error;
    }
};

/**
 * Watch vendor changes in real-time
 * @param {string} vendorId - Vendor ID
 * @param {function} callback - Callback that receives vendor data
 * @returns {function} Unsubscribe function
 */
export const watchVendor = (vendorId, callback) => {
    return onSnapshot(doc(db, 'vendors', vendorId), (doc) => {
        if (doc.exists()) {
            callback({
                id: doc.id,
                ...doc.data(),
            });
        } else {
            callback(null);
        }
    });
};

/**
 * Watch all vendors in real-time
 * @param {function} callback - Callback that receives vendors array
 * @returns {function} Unsubscribe function
 */
export const watchAllVendors = (callback) => {
    return onSnapshot(collection(db, 'vendors'), (snapshot) => {
        const vendors = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(vendors);
    });
};

/**
 * Update vendor information
 * @param {string} vendorId - Vendor ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateVendor = async (vendorId, updateData) => {
    try {
        await updateDoc(doc(db, 'vendors', vendorId), {
            ...updateData,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating vendor:', error);
        throw error;
    }
};

/**
 * Add a new menu item
 * @param {string} vendorId - Vendor ID
 * @param {Object} menuItemData - Menu item data
 * @returns {Promise<string>} Menu item ID
 */
export const addMenuItem = async (vendorId, menuItemData) => {
    try {
        const menuItem = {
            ...menuItemData,
            vendorId,
            available: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'menuItems'), menuItem);
        return docRef.id;
    } catch (error) {
        console.error('Error adding menu item:', error);
        throw error;
    }
};

/**
 * Get menu items for a vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array>} Array of menu items
 */
export const getMenuItems = async (vendorId) => {
    try {
        const q = query(collection(db, 'menuItems'), where('vendorId', '==', vendorId));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting menu items:', error);
        throw error;
    }
};

/**
 * Watch menu items for a vendor in real-time
 * @param {string} vendorId - Vendor ID
 * @param {function} callback - Callback that receives menu items array
 * @returns {function} Unsubscribe function
 */
export const watchMenuItems = (vendorId, callback) => {
    return onSnapshot(
        query(collection(db, 'menuItems'), where('vendorId', '==', vendorId)),
        (snapshot) => {
            const items = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(items);
        }
    );
};

/**
 * Update a menu item
 * @param {string} menuItemId - Menu item ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateMenuItem = async (menuItemId, updateData) => {
    try {
        await updateDoc(doc(db, 'menuItems', menuItemId), {
            ...updateData,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        throw error;
    }
};

/**
 * Delete a menu item
 * @param {string} menuItemId - Menu item ID
 * @returns {Promise<void>}
 */
export const deleteMenuItem = async (menuItemId) => {
    try {
        await deleteDoc(doc(db, 'menuItems', menuItemId));
    } catch (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
};

/**
 * Toggle menu item availability
 * @param {string} menuItemId - Menu item ID
 * @param {boolean} available - Availability status
 * @returns {Promise<void>}
 */
export const toggleMenuItemAvailability = async (menuItemId, available) => {
    try {
        await updateMenuItem(menuItemId, { available });
    } catch (error) {
        console.error('Error toggling availability:', error);
        throw error;
    }
};

/**
 * Delete vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<void>}
 */
export const deleteVendor = async (vendorId) => {
    try {
        const vendorRef = doc(db, 'vendors', vendorId);
        await deleteDoc(vendorRef);
    } catch (error) {
        console.error('Error deleting vendor:', error);
        throw error;
    }
};
