// Firebase Support Service
// Handles support messages: send messages and retrieve conversation history

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Send a support message
 * @param {string} message - Message content
 * @param {string} userType - 'customer', 'vendor', or 'admin'
 * @param {string} userId - User ID
 * @param {string} userContact - User phone/contact info
 * @returns {Promise<string>} Message ID
 */
export const sendSupportMessage = async (message, userType, userId, userContact) => {
    try {
        const messageDoc = {
            message,
            userType,
            userId,
            userContact,
            createdAt: Timestamp.now(),
            status: 'sent',
        };

        const docRef = await addDoc(collection(db, 'supportMessages'), messageDoc);
        return docRef.id;
    } catch (error) {
        console.error('Error sending support message:', error);
        throw error;
    }
};

/**
 * Get all support messages for a user
 * @param {string} userType - 'customer', 'vendor', or 'admin'
 * @param {string} userContact - User phone/contact info
 * @returns {Promise<Array>} Array of messages
 */
export const getMySupportMessages = async (userType, userContact) => {
    try {
        const q = query(
            collection(db, 'supportMessages'),
            where('userType', '==', userType),
            where('userContact', '==', userContact),
            orderBy('createdAt', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
            });
        });

        return {
            messages,
            success: true,
        };
    } catch (error) {
        console.error('Error fetching support messages:', error);
        throw error;
    }
};

/**
 * Watch support messages in real-time
 * @param {string} userType - 'customer', 'vendor', or 'admin'
 * @param {string} userContact - User phone/contact info
 * @param {Function} callback - Callback function to handle messages
 * @returns {Function} Unsubscribe function
 */
export const watchMyMessages = (userType, userContact, callback) => {
    try {
        const q = query(
            collection(db, 'supportMessages'),
            where('userType', '==', userType),
            where('userContact', '==', userContact),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
                });
            });
            callback(messages);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error watching messages:', error);
        throw error;
    }
};

/**
 * Get all unique conversations (for admin)
 * @returns {Promise<Array>} Array of unique conversations
 */
export const adminGetConversations = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'supportMessages'));
        const conversations = {};

        querySnapshot.forEach((doc) => {
            const { userType, userContact } = doc.data();
            const key = `${userType}:${userContact}`;
            if (!conversations[key]) {
                conversations[key] = {
                    userType,
                    userContact,
                    id: key,
                    lastMessage: doc.data().message,
                    lastMessageTime: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
                };
            }
        });

        return {
            data: {
                conversations: Object.values(conversations).sort((a, b) => b.lastMessageTime - a.lastMessageTime),
            },
        };
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};

/**
 * Get all messages from a specific thread (admin view)
 * @param {string} userType - 'customer' or 'vendor'
 * @param {string} userContact - User contact info
 * @returns {Promise<Object>} Object with messages array
 */
export const adminGetThreadMessages = async (userType, userContact) => {
    try {
        const q = query(
            collection(db, 'supportMessages'),
            where('userType', '==', userType),
            where('userContact', '==', userContact),
            orderBy('createdAt', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
            });
        });

        return {
            data: {
                messages,
            },
        };
    } catch (error) {
        console.error('Error fetching thread messages:', error);
        throw error;
    }
};

/**
 * Admin reply to support message
 * @param {string} threadId - Thread ID (userType:userContact)
 * @param {string} message - Admin reply message
 * @returns {Promise<string>} Message ID
 */
export const adminReplySupport = async (threadId, message) => {
    try {
        const [userType, userContact] = threadId.split(':');
        const messageDoc = {
            message,
            userType: 'admin',
            userId: 'admin',
            userContact: userContact,
            senderType: 'admin',
            createdAt: Timestamp.now(),
            status: 'sent',
        };

        const docRef = await addDoc(collection(db, 'supportMessages'), messageDoc);
        return {
            data: {
                success: true,
                messageId: docRef.id,
            },
        };
    } catch (error) {
        console.error('Error sending admin reply:', error);
        throw error;
    }
};
