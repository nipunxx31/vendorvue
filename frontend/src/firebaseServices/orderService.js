// Firebase Order Service
// Handles order operations: create, read, update, and watch orders

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    onSnapshot,
    orderBy,
    limit,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Order statuses
 */
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    PICKED_UP: 'picked_up',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<string>} Order ID
 */
export const createOrder = async (orderData) => {
    try {
        const order = {
            ...orderData,
            status: ORDER_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'orders'), order);
        return docRef.id;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
export const getOrder = async (orderId) => {
    try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));

        if (orderDoc.exists()) {
            return {
                id: orderDoc.id,
                ...orderDoc.data(),
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
};

/**
 * Get customer orders
 * @param {string} customerId - Customer ID
 * @returns {Promise<Array>} Array of orders
 */
export const getCustomerOrders = async (customerId) => {
    try {
        const q = query(
            collection(db, 'orders'),
            where('customerId', '==', customerId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting customer orders:', error);
        throw error;
    }
};

/**
 * Get vendor orders
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array>} Array of orders
 */
export const getVendorOrders = async (vendorId) => {
    try {
        const q = query(
            collection(db, 'orders'),
            where('vendorId', '==', vendorId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting vendor orders:', error);
        throw error;
    }
};

/**
 * Get vendor orders with status filter
 * @param {string} vendorId - Vendor ID
 * @param {string} status - Order status
 * @returns {Promise<Array>} Array of filtered orders
 */
export const getVendorOrdersByStatus = async (vendorId, status) => {
    try {
        const q = query(
            collection(db, 'orders'),
            where('vendorId', '==', vendorId),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting filtered orders:', error);
        throw error;
    }
};

/**
 * Watch customer orders in real-time
 * @param {string} customerId - Customer ID
 * @param {function} callback - Callback that receives orders array
 * @returns {function} Unsubscribe function
 */
export const watchCustomerOrders = (customerId, callback) => {
    return onSnapshot(
        query(
            collection(db, 'orders'),
            where('customerId', '==', customerId),
            orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(orders);
        }
    );
};

/**
 * Watch vendor orders in real-time
 * @param {string} vendorId - Vendor ID
 * @param {function} callback - Callback that receives orders array
 * @returns {function} Unsubscribe function
 */
export const watchVendorOrders = (vendorId, callback) => {
    return onSnapshot(
        query(
            collection(db, 'orders'),
            where('vendorId', '==', vendorId),
            orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(orders);
        }
    );
};

/**
 * Watch order status changes
 * @param {string} orderId - Order ID
 * @param {function} callback - Callback that receives order data
 * @returns {function} Unsubscribe function
 */
export const watchOrderStatus = (orderId, callback) => {
    return onSnapshot(doc(db, 'orders', orderId), (doc) => {
        if (doc.exists()) {
            callback({
                id: doc.id,
                ...doc.data(),
            });
        }
    });
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, status) => {
    try {
        await updateDoc(doc(db, 'orders', orderId), {
            status,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

/**
 * Update order information
 * @param {string} orderId - Order ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateOrder = async (orderId, updateData) => {
    try {
        await updateDoc(doc(db, 'orders', orderId), {
            ...updateData,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

/**
 * Add rating to order
 * @param {string} orderId - Order ID
 * @param {number} rating - Rating (1-5)
 * @param {string} comment - Review comment
 * @returns {Promise<void>}
 */
export const rateOrder = async (orderId, rating, comment = '') => {
    try {
        await updateOrder(orderId, {
            rating,
            ratingComment: comment,
            rated: true,
            ratedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error rating order:', error);
        throw error;
    }
};

/**
 * Get recent orders for dashboard
 * @param {number} limitNum - Number of orders to fetch (default: 10)
 * @returns {Promise<Array>} Array of recent orders
 */
export const getRecentOrders = async (limitNum = 10) => {
    try {
        const q = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(limitNum)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting recent orders:', error);
        throw error;
    }
};

/**
 * Get order statistics for vendor/admin
 * @param {string} vendorId - Vendor ID (optional)
 * @returns {Promise<Object>} Order statistics
 */
export const getOrderStats = async (vendorId = null) => {
    try {
        let queries = {};

        const statuses = Object.values(ORDER_STATUS);

        for (const status of statuses) {
            let q;
            if (vendorId) {
                q = query(
                    collection(db, 'orders'),
                    where('vendorId', '==', vendorId),
                    where('status', '==', status)
                );
            } else {
                q = query(collection(db, 'orders'), where('status', '==', status));
            }
            const snapshot = await getDocs(q);
            queries[status] = snapshot.size;
        }

        return {
            ...queries,
            total: Object.values(queries).reduce((a, b) => a + b, 0),
        };
    } catch (error) {
        console.error('Error getting order stats:', error);
        throw error;
    }
};
