// Firebase utility functions for VendorVue
// Common operations for authentication, database, and storage

import { auth, db, storage } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signOut,
    onAuthStateChanged,
    updateProfile,
    deleteUser
} from 'firebase/auth';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    getDoc,
    onSnapshot,
    setDoc,
    writeBatch
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

/* ==================== AUTHENTICATION ==================== */

export const authUtils = {
    // Register with email & password
    registerWithEmail: async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        return userCredential.user;
    },

    // Login with email & password
    loginWithEmail: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    // Logout
    logout: async () => {
        await signOut(auth);
    },

    // Get current user
    getCurrentUser: () => auth.currentUser,

    // Watch auth state changes
    onAuthChange: (callback) => {
        return onAuthStateChanged(auth, callback);
    },

    // Update user profile
    updateUserProfile: async (updates) => {
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, updates);
        }
    },

    // Delete account
    deleteAccount: async () => {
        if (auth.currentUser) {
            await deleteUser(auth.currentUser);
        }
    }
};

/* ==================== FIRESTORE DATABASE ==================== */

export const dbUtils = {
    // Add new document
    addDocument: async (collectionName, data) => {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return docRef.id;
    },

    // Set document (create or overwrite)
    setDocument: async (collectionName, docId, data) => {
        await setDoc(doc(db, collectionName, docId), {
            ...data,
            updatedAt: new Date()
        });
    },

    // Update document
    updateDocument: async (collectionName, docId, data) => {
        await updateDoc(doc(db, collectionName, docId), {
            ...data,
            updatedAt: new Date()
        });
    },

    // Delete document
    deleteDocument: async (collectionName, docId) => {
        await deleteDoc(doc(db, collectionName, docId));
    },

    // Get single document
    getDocument: async (collectionName, docId) => {
        const docSnap = await getDoc(doc(db, collectionName, docId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    },

    // Get all documents in collection
    getCollection: async (collectionName) => {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Query documents with condition
    queryDocuments: async (collectionName, conditions = []) => {
        // conditions: [{ field: 'status', operator: '==', value: 'active' }]
        const constraints = conditions.map(cond => {
            // map operator string to firestore operator
            return where(cond.field, cond.operator, cond.value);
        });

        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Watch collection in real-time
    watchCollection: (collectionName, callback) => {
        const unsubscribe = onSnapshot(
            collection(db, collectionName),
            (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(data);
            },
            (error) => console.error('Watch error:', error)
        );

        return unsubscribe;
    },

    // Watch single document
    watchDocument: (collectionName, docId, callback) => {
        const unsubscribe = onSnapshot(
            doc(db, collectionName, docId),
            (docSnap) => {
                if (docSnap.exists()) {
                    callback({ id: docSnap.id, ...docSnap.data() });
                } else {
                    callback(null);
                }
            },
            (error) => console.error('Watch error:', error)
        );

        return unsubscribe;
    },

    // Batch operations
    batchWrite: async (operations) => {
        const batch = writeBatch(db);

        operations.forEach(op => {
            if (op.type === 'set') {
                batch.set(doc(db, op.collection, op.id), op.data);
            } else if (op.type === 'update') {
                batch.update(doc(db, op.collection, op.id), op.data);
            } else if (op.type === 'delete') {
                batch.delete(doc(db, op.collection, op.id));
            }
        });

        await batch.commit();
    }
};

/* ==================== STORAGE (FILE UPLOADS) ==================== */

export const storageUtils = {
    // Upload file
    uploadFile: async (file, path) => {
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
    },

    // Upload vendor image
    uploadVendorImage: async (vendorId, file) => {
        const path = `vendors/${vendorId}/${file.name}`;
        return storageUtils.uploadFile(file, path);
    },

    // Upload menu item image
    uploadMenuItemImage: async (menuItemId, file) => {
        const path = `menu-items/${menuItemId}/${file.name}`;
        return storageUtils.uploadFile(file, path);
    },

    // Upload customer avatar
    uploadAvatar: async (userId, file) => {
        const path = `avatars/${userId}/${file.name}`;
        return storageUtils.uploadFile(file, path);
    },

    // Delete file
    deleteFile: async (path) => {
        const fileRef = ref(storage, path);
        await deleteObject(fileRef);
    },

    // Get file download URL
    getFileUrl: async (path) => {
        const fileRef = ref(storage, path);
        return getDownloadURL(fileRef);
    }
};

/* ==================== COMMON OPERATIONS FOR VENDORVUE ==================== */

// Vendors collection
export const vendorOps = {
    create: (vendorData) => dbUtils.addDocument('vendors', vendorData),
    update: (vendorId, data) => dbUtils.updateDocument('vendors', vendorId, data),
    get: (vendorId) => dbUtils.getDocument('vendors', vendorId),
    getAll: () => dbUtils.getCollection('vendors'),
    delete: (vendorId) => dbUtils.deleteDocument('vendors', vendorId),
    watch: (vendorId, callback) => dbUtils.watchDocument('vendors', vendorId, callback),
    watchAll: (callback) => dbUtils.watchCollection('vendors', callback)
};

// Customers collection
export const customerOps = {
    create: (customerData) => dbUtils.addDocument('customers', customerData),
    update: (customerId, data) => dbUtils.updateDocument('customers', customerId, data),
    get: (customerId) => dbUtils.getDocument('customers', customerId),
    getAll: () => dbUtils.getCollection('customers'),
    delete: (customerId) => dbUtils.deleteDocument('customers', customerId)
};

// Orders collection
export const orderOps = {
    create: (orderData) => dbUtils.addDocument('orders', orderData),
    update: (orderId, data) => dbUtils.updateDocument('orders', orderId, data),
    get: (orderId) => dbUtils.getDocument('orders', orderId),
    getAll: () => dbUtils.getCollection('orders'),
    delete: (orderId) => dbUtils.deleteDocument('orders', orderId),
    watch: (orderId, callback) => dbUtils.watchDocument('orders', orderId, callback),
    watchAll: (callback) => dbUtils.watchCollection('orders', callback)
};

// Menu items collection
export const menuOps = {
    create: (menuData) => dbUtils.addDocument('menu-items', menuData),
    update: (menuId, data) => dbUtils.updateDocument('menu-items', menuId, data),
    get: (menuId) => dbUtils.getDocument('menu-items', menuId),
    getAll: () => dbUtils.getCollection('menu-items'),
    delete: (menuId) => dbUtils.deleteDocument('menu-items', menuId)
};
