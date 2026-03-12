// Firebase Cloud Functions for VendorVue
// Handle server-side logic: order creation, notifications, payments

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// ==================== ORDER FUNCTIONS ====================

/**
 * Create Order - Callable function
 * Verifies user is a customer and creates order in Firestore
 */
exports.createOrder = functions.https.onCall(async (data, context) => {
    try {
        // Verify user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'Must be logged in to create an order'
            );
        }

        const uid = context.auth.uid;

        // Get user role
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'customer') {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Only customers can create orders'
            );
        }

        // Validate order data
        const { vendorId, items, total, deliveryAddress } = data;

        if (!vendorId || !items || !total || !deliveryAddress) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing required order fields'
            );
        }

        // Create order
        const orderRef = await db.collection('orders').add({
            customerId: uid,
            vendorId,
            items,
            total,
            deliveryAddress,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Trigger notification (optional)
        await notifyVendor({
            orderId: orderRef.id,
            vendorId,
            orderData: { customerId: uid, items, total },
        });

        return {
            success: true,
            orderId: orderRef.id,
            message: 'Order created successfully',
        };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
});

/**
 * Update Order Status - Callable function
 * Vendor or Admin can update order status
 */
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'Must be logged in'
            );
        }

        const uid = context.auth.uid;
        const { orderId, newStatus } = data;

        if (!orderId || !newStatus) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing orderId or newStatus'
            );
        }

        // Get order
        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Order not found');
        }

        const orderData = orderDoc.data();

        // Check permissions
        const userDoc = await db.collection('users').doc(uid).get();
        const userRole = userDoc.data().role;

        const isVendorOwner = orderData.vendorId === uid;
        const isAdmin = userRole === 'admin';

        if (!isVendorOwner && !isAdmin) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'You do not have permission to update this order'
            );
        }

        // Update order status
        await db.collection('orders').doc(orderId).update({
            status: newStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send notification to customer
        await notifyCustomer({
            orderId,
            customerId: orderData.customerId,
            status: newStatus,
        });

        return {
            success: true,
            message: `Order status updated to ${newStatus}`,
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
});

/**
 * Verify Payment - Callable function
 * Verify Razorpay or other payment integration
 */
exports.verifyPayment = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'Must be logged in'
            );
        }

        const uid = context.auth.uid;
        const { orderId, paymentId, signature } = data;

        if (!orderId || !paymentId) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing payment details'
            );
        }

        // TODO: Implement payment verification logic with Razorpay
        // For now, just mark as verified
        await db.collection('paymentVerifications').add({
            userId: uid,
            orderId,
            paymentId,
            signature,
            verified: true,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update order payment status
        await db.collection('orders').doc(orderId).update({
            paymentStatus: 'completed',
            paymentId,
        });

        return {
            success: true,
            message: 'Payment verified successfully',
        };
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
});

// ==================== NOTIFICATION FUNCTIONS ====================

/**
 * Notify Vendor - Called when new order is created
 * Sends notification to vendor about new order
 */
async function notifyVendor({ orderId, vendorId, orderData }) {
    try {
        // Get vendor notification preferences
        const vendorDoc = await db.collection('vendors').doc(vendorId).get();
        if (!vendorDoc.exists) return;

        // Store notification in Firestore
        await db.collection('notifications').add({
            recipientId: vendorId,
            type: 'new_order',
            orderId,
            message: `New order received! Order ID: ${orderId}`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Vendor ${vendorId} notified about order ${orderId}`);
    } catch (error) {
        console.error('Error notifying vendor:', error);
    }
}

/**
 * Notify Customer - Called when order status updates
 * Sends notification to customer about order status change
 */
async function notifyCustomer({ orderId, customerId, status }) {
    try {
        const statusMessages = {
            confirmed: 'Your order has been confirmed!',
            preparing: 'Your order is being prepared',
            ready: 'Your order is ready for pickup!',
            delivered: 'Your order has been delivered',
            cancelled: 'Your order has been cancelled',
        };

        // Store notification in Firestore
        await db.collection('notifications').add({
            recipientId: customerId,
            type: 'order_status_update',
            orderId,
            message: statusMessages[status] || `Order status: ${status}`,
            status,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Customer ${customerId} notified about order ${orderId}`);
    } catch (error) {
        console.error('Error notifying customer:', error);
    }
}

// ==================== TRIGGERING FUNCTIONS ====================

/**
 * Trigger: When order is created
 * Auto-notify vendor
 */
exports.onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap) => {
        const orderData = snap.data();

        console.log(`New order created: ${snap.id}`);

        // Notify vendor
        await notifyVendor({
            orderId: snap.id,
            vendorId: orderData.vendorId,
            orderData,
        });
    });

/**
 * Trigger: When order status changes
 * Auto-notify customer
 */
exports.onOrderStatusUpdate = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();

        // Check if status changed
        if (beforeData.status !== afterData.status) {
            console.log(
                `Order ${change.after.id} status changed from ${beforeData.status} to ${afterData.status}`
            );

            // Notify customer
            await notifyCustomer({
                orderId: change.after.id,
                customerId: afterData.customerId,
                status: afterData.status,
            });
        }
    });

// ==================== UTILITY FUNCTIONS ====================

/**
 * Cleanup: Delete old orders (Archive them)
 * Run daily via Cloud Scheduler
 */
exports.archiveOldOrders = functions.pubsub
    .schedule('every day 02:00')
    .timeZone('America/New_York')
    .onRun(async (context) => {
        try {
            // Get orders older than 90 days
            const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

            const oldOrders = await db
                .collection('orders')
                .where('createdAt', '<', ninetyDaysAgo)
                .where('status', 'in', ['delivered', 'cancelled'])
                .limit(100)
                .get();

            let archived = 0;

            await Promise.all(
                oldOrders.docs.map(async (doc) => {
                    // Move to archive collection
                    await db.collection('archive_orders').doc(doc.id).set(doc.data());
                    // Delete from orders
                    await db.collection('orders').doc(doc.id).delete();
                    archived++;
                })
            );

            console.log(`Archived ${archived} old orders`);
            return null;
        } catch (error) {
            console.error('Error archiving old orders:', error);
        }
    });

/**
 * Cleanup: Delete old notifications (Keep last 30 days)
 * Run daily via Cloud Scheduler
 */
exports.cleanupOldNotifications = functions.pubsub
    .schedule('every day 03:00')
    .timeZone('America/New_York')
    .onRun(async (context) => {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const oldNotifications = await db
                .collection('notifications')
                .where('createdAt', '<', thirtyDaysAgo)
                .limit(100)
                .get();

            let deleted = 0;

            await Promise.all(
                oldNotifications.docs.map(async (doc) => {
                    await doc.ref.delete();
                    deleted++;
                })
            );

            console.log(`Deleted ${deleted} old notifications`);
            return null;
        } catch (error) {
            console.error('Error deleting old notifications:', error);
        }
    });

// ==================== REST API ENDPOINTS ====================

/**
 * REST API: Health check
 */
exports.health = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        res.status(200).json({
            status: 'ok',
            message: 'VendorVue Cloud Functions running',
            timestamp: new Date().toISOString(),
        });
    });
});

/**
 * REST API: Get order details
 */
exports.getOrderRest = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            // Verify token
            const token = req.headers.authorization?.split('Bearer ')[1];
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const decodedToken = await admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            const orderId = req.query.orderId;
            if (!orderId) {
                return res.status(400).json({ error: 'Missing orderId' });
            }

            const orderDoc = await db.collection('orders').doc(orderId).get();
            if (!orderDoc.exists) {
                return res.status(404).json({ error: 'Order not found' });
            }

            const orderData = orderDoc.data();

            // Verify user has access
            if (
                orderData.customerId !== uid &&
                orderData.vendorId !== uid &&
                decodedToken.role !== 'admin'
            ) {
                return res.status(403).json({ error: 'Access denied' });
            }

            res.status(200).json({
                id: orderId,
                ...orderData,
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    });
});
