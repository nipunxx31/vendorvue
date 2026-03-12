// Firebase Storage Service
// Handles file uploads: vendor images, menu item images, avatars, QR codes

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    listAll,
} from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Upload vendor image
 * @param {string} vendorId - Vendor ID
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL
 */
export const uploadVendorImage = async (vendorId, file) => {
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `vendors/${vendorId}/images/${fileName}`);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading vendor image:', error);
        throw error;
    }
};

/**
 * Upload menu item image
 * @param {string} vendorId - Vendor ID
 * @param {string} menuItemId - Menu item ID
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL
 */
export const uploadMenuImage = async (vendorId, menuItemId, file) => {
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(
            storage,
            `vendors/${vendorId}/menuImages/${fileName}`
        );

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading menu image:', error);
        throw error;
    }
};

/**
 * Upload vendor QR code
 * @param {string} vendorId - Vendor ID
 * @param {File} file - QR code image file
 * @returns {Promise<string>} Download URL
 */
export const uploadVendorQRCode = async (vendorId, file) => {
    try {
        const fileName = `qrcode_${Date.now()}.${file.name.split('.').pop()}`;
        const storageRef = ref(storage, `vendors/${vendorId}/qrcodes/${fileName}`);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading QR code:', error);
        throw error;
    }
};

/**
 * Upload customer avatar
 * @param {string} customerId - Customer ID
 * @param {File} file - Avatar image file
 * @returns {Promise<string>} Download URL
 */
export const uploadAvatar = async (customerId, file) => {
    try {
        const fileName = `avatar_${Date.now()}.${file.name.split('.').pop()}`;
        const storageRef = ref(storage, `customers/${customerId}/avatars/${fileName}`);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
};

/**
 * Upload support message attachment
 * @param {string} userId - User ID
 * @param {File} file - Attachment file
 * @returns {Promise<string>} Download URL
 */
export const uploadSupportAttachment = async (userId, file) => {
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(
            storage,
            `support/${userId}/attachments/${fileName}`
        );

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading support attachment:', error);
        throw error;
    }
};

/**
 * Delete file from storage
 * @param {string} filePath - Full file path in storage
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
    try {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

/**
 * Delete vendor image by URL
 * @param {string} imageURL - Image download URL
 * @returns {Promise<void>}
 */
export const deleteImageByURL = async (imageURL) => {
    try {
        // Extract the file path from the download URL
        const urlParams = new URL(imageURL).searchParams;
        const filePath = decodeURIComponent(urlParams.get('path')); // This is a simplified approach

        // Alternatively, pass the full path directly
        // For production, you should store the file path in Firestore
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};

/**
 * List all files in a directory
 * @param {string} path - Directory path in storage
 * @returns {Promise<Array>} Array of file names
 */
export const listFilesInDirectory = async (path) => {
    try {
        const dirRef = ref(storage, path);
        const result = await listAll(dirRef);

        return result.items.map((item) => item.name);
    } catch (error) {
        console.error('Error listing files:', error);
        throw error;
    }
};

/**
 * Get download URL for a file path
 * @param {string} filePath - File path in storage
 * @returns {Promise<string>} Download URL
 */
export const getFileDownloadURL = async (filePath) => {
    try {
        const fileRef = ref(storage, filePath);
        const downloadURL = await getDownloadURL(fileRef);
        return downloadURL;
    } catch (error) {
        console.error('Error getting download URL:', error);
        throw error;
    }
};

/**
 * Upload multiple images at once
 * @param {string} vendorId - Vendor ID
 * @param {FileList} files - Multiple files
 * @param {string} type - Image type: 'menu' or 'gallery'
 * @returns {Promise<Array>} Array of download URLs
 */
export const uploadMultipleImages = async (vendorId, files, type = 'menu') => {
    try {
        const uploadPromises = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `${Date.now()}_${i}_${file.name}`;
            const storageRef = ref(
                storage,
                `vendors/${vendorId}/${type}/${fileName}`
            );

            uploadPromises.push(
                uploadBytes(storageRef, file).then(() =>
                    getDownloadURL(storageRef)
                )
            );
        }

        const downloadURLs = await Promise.all(uploadPromises);
        return downloadURLs;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
};

/**
 * Generic upload file function
 * @param {string} path - Storage path
 * @param {File} file - File to upload
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (path, file) => {
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `${path}/${fileName}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Get file download URL
 * @param {string} filePath - Storage file path
 * @returns {Promise<string>} Download URL
 */
export const getFileUrl = async (filePath) => {
    try {
        const storageRef = ref(storage, filePath);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error('Error getting file URL:', error);
        throw error;
    }
};
